"""
Testes de integridade dos dados processados pelo ETL.

Cada teste verifica uma regra da Situação de Aprendizagem (modelo do banco,
classificação obrigatória, cuidado com escalas geográficas, IEVS exploratório)
sobre os arquivos em data/processed/, que são a base do seed do Supabase e do
espelho usado pelo frontend.
"""
import re

import pytest

BEIRU = "2927408018"
PERNAMBUES = "2927408117"
SALVADOR = "2927408"
BAHIA = "29"

CLASSIFICACOES = {"Dado observado", "Indicador derivado", "Proxy/estimativa"}
DIMENSOES = {"Demográfica", "Econômica", "Social", "Habitacional", "Urbana", "Energética", "Socioenergética"}
TIPOS_TERRITORIO = {"PAIS", "ESTADO", "MUNICIPIO", "BAIRRO", "UDH", "SETOR_CENSITARIO"}


# ---------------------------------------------------------------------------
# Modelo relacional (Seção 8)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("table", ["territories", "fontes", "indicadores", "observacoes", "analyses"])
def test_ids_sao_unicos(table, request):
    rows = request.getfixturevalue(table)
    ids = [r["id"] for r in rows]
    assert rows, f"tabela {table} vazia"
    assert len(ids) == len(set(ids)), f"ids duplicados em {table}"


def test_territorios_tem_tipo_valido_e_pai_existente(territories, terr_by_id):
    for t in territories:
        assert t["tipo"] in TIPOS_TERRITORIO, t
        if t["territorio_pai_id"] is not None:
            assert t["territorio_pai_id"] in terr_by_id, f"pai inexistente: {t}"


def test_territorios_obrigatorios_presentes(territories):
    codigos = {t["codigo_ibge"]: t["tipo"] for t in territories}
    assert codigos.get(BEIRU) == "BAIRRO"
    assert codigos.get(PERNAMBUES) == "BAIRRO"
    assert codigos.get(SALVADOR) == "MUNICIPIO"
    assert codigos.get(BAHIA) == "ESTADO"


def test_observacoes_referenciam_chaves_existentes(observacoes, terr_by_id, ind_by_id, fonte_by_id):
    for o in observacoes:
        assert o["territorio_id"] in terr_by_id, o
        assert o["indicador_id"] in ind_by_id, o
        assert o["fonte_id"] in fonte_by_id, o


def test_observacoes_preservam_territorio_fonte_e_periodo(observacoes):
    chaves = [(o["territorio_id"], o["indicador_id"], o["fonte_id"], o["ano"]) for o in observacoes]
    assert len(chaves) == len(set(chaves)), "observação duplicada (território, indicador, fonte, ano)"
    for o in observacoes:
        assert 1990 <= o["ano"] <= 2035, o
        assert isinstance(o["valor"], (int, float)), o
        assert o["escala_registro"], o


# ---------------------------------------------------------------------------
# Catálogo e classificação obrigatória (Seções 4 e Etapa 2)
# ---------------------------------------------------------------------------

def test_catalogo_tem_ao_menos_12_indicadores(indicadores):
    assert len(indicadores) >= 12


def test_indicadores_tem_classificacao_e_dimensao_validas(indicadores):
    for ind in indicadores:
        assert ind["classificacao"] in CLASSIFICACOES, ind["codigo"]
        assert ind["dimensao"] in DIMENSOES, ind["codigo"]


@pytest.mark.parametrize("campo", ["descricao", "unidade", "escala_geografica", "formula", "metodologia", "limitacoes"])
def test_indicadores_documentam_origem_formula_e_limitacoes(indicadores, campo):
    vazios = [ind["codigo"] for ind in indicadores if not str(ind.get(campo) or "").strip()]
    assert not vazios, f"indicadores sem '{campo}': {vazios}"


def test_codigos_de_indicadores_sao_unicos(indicadores):
    codigos = [i["codigo"] for i in indicadores]
    assert len(codigos) == len(set(codigos))


def test_todas_as_fontes_obrigatorias_estao_catalogadas(fontes):
    instituicoes = {f["instituicao"] for f in fontes}
    assert {"IBGE", "IPEA", "EPE"} <= instituicoes
    for f in fontes:
        assert f["url"].startswith("http"), f
        assert re.match(r"^\d{4}-\d{2}-\d{2}$", f["data_acesso"]), f


def test_proxies_declaram_que_nao_comprovam_pobreza_energetica(indicadores):
    for ind in indicadores:
        if ind["classificacao"] == "Proxy/estimativa":
            texto = ind["limitacoes"].lower()
            assert "não" in texto, f"proxy {ind['codigo']} sem ressalva nas limitações"


def test_ievs_nao_e_apresentado_como_indice_oficial(indicadores):
    ievs = next(i for i in indicadores if i["codigo"] == "IEVS_EXPLORATORIO")
    assert ievs["classificacao"] == "Proxy/estimativa"
    assert "não constitui índice oficial" in ievs["limitacoes"].lower()


# ---------------------------------------------------------------------------
# Cuidado metodológico com escalas geográficas (Seção 3)
# ---------------------------------------------------------------------------

def test_dados_da_epe_ficam_somente_na_escala_estadual(observacoes, terr_by_id, fonte_by_id):
    """'Não atribuir valores da Bahia diretamente aos bairros.'"""
    epe = [o for o in observacoes if fonte_by_id[o["fonte_id"]]["instituicao"] == "EPE"]
    assert epe, "nenhuma observação da EPE encontrada"
    for o in epe:
        terr = terr_by_id[o["territorio_id"]]
        assert terr["tipo"] == "ESTADO" and terr["codigo_ibge"] == BAHIA, (
            f"valor estadual da EPE atribuído a {terr['nome']} ({terr['tipo']})"
        )


def test_indicadores_estaduais_nao_aparecem_em_bairros(observacoes, terr_by_id, ind_by_id):
    for o in observacoes:
        ind = ind_by_id[o["indicador_id"]]
        if ind["escala_geografica"].lower().startswith("estadual"):
            assert terr_by_id[o["territorio_id"]]["tipo"] == "ESTADO", ind["codigo"]


def test_ivs_do_ipea_somente_nas_escalas_publicadas(observacoes, terr_by_id, ind_by_id):
    ivs = [o for o in observacoes if ind_by_id[o["indicador_id"]]["codigo"] == "IVS_GERAL_IPEA"]
    assert ivs
    for o in ivs:
        assert terr_by_id[o["territorio_id"]]["tipo"] in {"ESTADO", "MUNICIPIO", "UDH"}, o
        assert 0 <= o["valor"] <= 1, o


def test_bairros_e_municipio_tem_os_mesmos_indicadores_censitarios(observacoes, terr_by_id, fonte_by_id):
    """Indicadores do Censo (e derivados) comparáveis nas três escalas; o IVS do IPEA
    só existe para Salvador em 2022 e por isso fica fora desta comparação."""
    por_territorio = {}
    for o in observacoes:
        codigo = terr_by_id[o["territorio_id"]]["codigo_ibge"]
        if o["ano"] == 2022 and fonte_by_id[o["fonte_id"]]["instituicao"] != "IPEA":
            por_territorio.setdefault(codigo, set()).add(o["indicador_id"])
    assert por_territorio[BEIRU] == por_territorio[PERNAMBUES] == por_territorio[SALVADOR]


# ---------------------------------------------------------------------------
# Faixas de valores
# ---------------------------------------------------------------------------

def test_percentuais_e_indices_dentro_da_faixa(observacoes, ind_by_id):
    for o in observacoes:
        unidade = ind_by_id[o["indicador_id"]]["unidade"]
        if unidade == "%" or "0 a 100" in unidade:
            assert 0 <= o["valor"] <= 100, (ind_by_id[o["indicador_id"]]["codigo"], o["valor"])
        if unidade in {"habitantes", "domicílios", "hab/km²", "R$", "GWh"}:
            assert o["valor"] > 0, (ind_by_id[o["indicador_id"]]["codigo"], o["valor"])


def test_perfis_tem_valores_consistentes(bundle):
    for codigo, p in bundle["perfis_territoriais"].items():
        assert p["DOM_OCUPADOS"] <= p["DOM_TOTAIS"], codigo
        # Os agregados por setor do IBGE suprimem células pequenas ("X"); como as faixas
        # etárias são divididas pela população total (V0001), a soma fica um pouco abaixo
        # de 100% (Salvador: 99,78%). Tolerância de 0,5 p.p. documenta esse limite.
        soma_faixas = p["PERC_POP_0_14"] + p["PERC_POP_15_59"] + p["PERC_POP_60_MAIS"]
        assert 99.5 <= soma_faixas <= 100.01, (codigo, soma_faixas)
        assert abs(p["PERC_POP_NEGRA"] - (p["PERC_POP_PRETA"] + p["PERC_POP_PARDA"])) < 0.05, codigo
        assert abs(p["DENSIDADE_DEMOGRAFICA"] - p["POP_RESIDENTE"] / p["AREA_KM2"]) < 1, codigo
        assert p["RENDA_MEDIANA_RESP"] <= p["RENDA_MEDIA_RESP"], codigo


# ---------------------------------------------------------------------------
# Coerência entre artefatos (bundle do frontend, tabelas e seed do Supabase)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("table", ["territories", "fontes", "indicadores", "observacoes", "analyses"])
def test_bundle_do_frontend_igual_as_tabelas(table, bundle, request):
    assert bundle[table] == request.getfixturevalue(table)


def test_perfis_coincidem_com_observacoes_de_2022(bundle, observacoes, terr_by_id, ind_by_id, fonte_by_id):
    """Os perfis alimentam os KPIs; precisam bater com a tabela observacoes (e o Supabase).
    O IVS do IPEA não faz parte dos perfis censitários."""
    for o in observacoes:
        codigo = terr_by_id[o["territorio_id"]]["codigo_ibge"]
        if o["ano"] != 2022 or codigo not in bundle["perfis_territoriais"]:
            continue
        if fonte_by_id[o["fonte_id"]]["instituicao"] == "IPEA":
            continue
        perfil = bundle["perfis_territoriais"][codigo]
        ind = ind_by_id[o["indicador_id"]]["codigo"]
        assert abs(perfil[ind] - o["valor"]) < 1e-6, (codigo, ind)


def test_seed_sql_contem_todas_as_observacoes(base_dir, observacoes):
    with open(f"{base_dir}/supabase/seed.sql", encoding="utf-8") as f:
        seed = f.read()
    inserts = re.findall(r"INSERT INTO observacoes .*?VALUES \((\d+), (\d+), (\d+), (\d+), (\d+), ([\d.]+),", seed)
    assert len(inserts) == len(observacoes)
    por_id = {int(r[0]): float(r[5]) for r in inserts}
    for o in observacoes:
        assert abs(por_id[o["id"]] - o["valor"]) < 1e-6, o["id"]


# ---------------------------------------------------------------------------
# IEVS exploratório e teste de sensibilidade (Seção 9)
# ---------------------------------------------------------------------------

def test_ievs_e_a_media_ponderada_dos_subindices(bundle):
    for codigo, p in bundle["perfis_territoriais"].items():
        esperado = 0.40 * p["IEVS_SUB_RENDA"] + 0.30 * p["IEVS_SUB_HABITACAO"] + 0.30 * p["IEVS_SUB_URBANA"]
        assert abs(p["IEVS_EXPLORATORIO"] - esperado) < 0.02, codigo
        for sub in ("IEVS_SUB_RENDA", "IEVS_SUB_HABITACAO", "IEVS_SUB_URBANA", "IEVS_EXPLORATORIO"):
            assert 0 <= p[sub] <= 100, (codigo, sub)


def test_cenarios_de_sensibilidade_sao_recalculaveis(bundle):
    perfis = bundle["perfis_territoriais"]
    cenarios = bundle["ievs_sensibilidade"]
    assert len(cenarios) >= 3, "teste de sensibilidade precisa de vários cenários de pesos"
    chaves = {"beiru_tancredo_neves": BEIRU, "pernambues": PERNAMBUES, "salvador": SALVADOR}
    for c in cenarios:
        w = c["pesos"]
        assert abs(w["renda"] + w["habitacao"] + w["urbana"] - 1) < 1e-3, c["id"]
        for chave, codigo in chaves.items():
            p = perfis[codigo]
            esperado = (
                w["renda"] * p["IEVS_SUB_RENDA"]
                + w["habitacao"] * p["IEVS_SUB_HABITACAO"]
                + w["urbana"] * p["IEVS_SUB_URBANA"]
            )
            assert abs(c["scores"][chave] - esperado) < 0.02, (c["id"], chave)
        diff = c["scores"]["beiru_tancredo_neves"] - c["scores"]["pernambues"]
        assert abs(c["scores"]["diferenca_beiru_pernambues"] - diff) < 0.02, c["id"]


# ---------------------------------------------------------------------------
# Desafio analítico (Seção 9) e malha setorial (Tela 3)
# ---------------------------------------------------------------------------

def test_as_8_questoes_obrigatorias_estao_respondidas(analyses):
    assert sorted(a["questao_numero"] for a in analyses) == list(range(1, 9))
    for a in analyses:
        assert len(a["descricao"]) > 200, a["questao_numero"]


def test_respostas_nao_tem_marcadores_sem_substituir(analyses):
    for a in analyses:
        assert not re.search(r"\{[A-Z_]+\}", a["descricao"]), a["questao_numero"]


def test_malha_setorial_cobre_os_dois_bairros(bundle, geojson_setores):
    feats = geojson_setores["features"]
    resumo = bundle["resumo_setores"]
    assert len(feats) == resumo["total_setores"]
    por_bairro = {}
    for f in feats:
        por_bairro[f["properties"]["cd_bairro"]] = por_bairro.get(f["properties"]["cd_bairro"], 0) + 1
        assert f["geometry"]["type"] in {"Polygon", "MultiPolygon"}
    assert por_bairro[BEIRU] == resumo["beiru_total_setores"]
    assert por_bairro[PERNAMBUES] == resumo["pernambues_total_setores"]
