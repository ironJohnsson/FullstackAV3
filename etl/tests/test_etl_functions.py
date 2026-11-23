"""Testes unitários de funções do pipeline (sem rede e sem arquivos brutos)."""
import pytest

import run_etl


@pytest.mark.parametrize(
    "entrada, esperado",
    [
        ("123", 123.0),
        ("1234,56", 1234.56),
        ("0.5", 0.5),
        ("X", 0.0),  # valor sigiloso no IBGE
        (".", 0.0),
        ("", 0.0),
        (None, 0.0),
        ("texto", 0.0),
    ],
)
def test_fval_converte_valores_do_ibge(entrada, esperado):
    assert run_etl.fval(entrada) == esperado


def test_fval_respeita_default():
    assert run_etl.fval("X", default=-1) == -1


@pytest.mark.parametrize(
    "valor, casas, esperado",
    [(57.327, 2, "57,33"), (1234567.891, 2, "1.234.567,89"), (40.19, 2, "40,19"), (1000, 0, "1.000")],
)
def test_fmt_br_usa_padrao_brasileiro(valor, casas, esperado):
    assert run_etl.fmt_br(valor, casas) == esperado


def test_sql_str_escapa_aspas_e_nulos():
    assert run_etl.sql_str(None) == "NULL"
    assert run_etl.sql_str(12.5) == "12.5"
    assert run_etl.sql_str("Pernambués") == "'Pernambués'"
    assert run_etl.sql_str("d'água") == "'d''água'"


def _perfil(renda, hab, urb):
    return {"IEVS_SUB_RENDA": renda, "IEVS_SUB_HABITACAO": hab, "IEVS_SUB_URBANA": urb}


def test_sensibilidade_identifica_territorio_mais_vulneravel():
    perfis = {
        "2927408018": _perfil(80, 50, 60),
        "2927408117": _perfil(40, 40, 40),
        "2927408": _perfil(30, 30, 30),
    }
    cenarios = run_etl.build_ievs_sensitivity(perfis)
    base = next(c for c in cenarios if c["id"] == "base_equilibrado")
    assert base["scores"]["beiru_tancredo_neves"] == pytest.approx(0.4 * 80 + 0.3 * 50 + 0.3 * 60)
    assert base["scores"]["territorio_mais_vulneravel"] == "Beiru / Tancredo Neves"

    perfis["2927408117"] = _perfil(95, 95, 95)
    cenarios = run_etl.build_ievs_sensitivity(perfis)
    assert all(c["scores"]["territorio_mais_vulneravel"] == "Pernambués" for c in cenarios)
    assert all(c["scores"]["diferenca_beiru_pernambues"] < 0 for c in cenarios)


def test_respostas_analiticas_usam_valores_calculados():
    perfis = {
        "2927408018": {"IEVS_EXPLORATORIO": 61.5},
        "2927408117": {"IEVS_EXPLORATORIO": 50.25},
        "2927408": {"PERC_SETORES_BAIXA_RENDA": 57.33},
    }
    analyses = run_etl.build_analyses(perfis)
    texto = " ".join(a["descricao"] for a in analyses)
    assert "57,33% dos setores de Salvador" in texto
    assert "61,50 no Beiru" in texto and "50,25 em Pernambués" in texto
    assert "{" not in texto


def test_indicadores_construidos_pelo_pipeline_sao_validos():
    indicadores = run_etl.build_indicadores()
    assert len(indicadores) >= 12
    assert len({i["codigo"] for i in indicadores}) == len(indicadores)
    assert all(i["classificacao"] in {"Dado observado", "Indicador derivado", "Proxy/estimativa"} for i in indicadores)
