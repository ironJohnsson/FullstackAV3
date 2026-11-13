# Relatório de Qualidade de Dados e Auditoria ETL (Etapa 3)

**Data de Execução do Pipeline:** `2026-11-12 22:13:26`  
**Script Principal:** `etl/run_etl.py`  
**Status da Validação:** ✅ 100% Aprovado (0 violações de chave estrangeira, 0 inferências ecológicas indevidas)

---

## 1. Volume de Registros Brutos Inspecionados e Filtrados

| Base Oficial | Escopo Nacional / Estadual Lido | Registros Alvo Extraídos | Status de Integridade |
| :--- | :---: | :---: | :---: |
| IBGE Censo 2022 — Agregados por Bairro (8 temas) | 17,576 bairros/tema | 2 bairros foco + 11 vizinhos | ✅ Validado (`2927408018`, `2927408117`) |
| IBGE Censo 2022 — Agregados por Município (8 temas) | 5,570 municípios/tema | 1 município (`Salvador - 2927408`) | ✅ Validado |
| IBGE Censo 2022 — Agregados por Setor Censitário | 468,099 setores do Brasil | **172 setores** (72 Beiru + 100 Pernambués) | ✅ Validado |
| IBGE Malha Territorial CD2022 (`BA_bairros` + `BA_setores`) | 170 bairros de Salvador + setores BA | 13 polígonos de bairro + 172 polígonos de setor | ✅ Validado (SIRGAS 2000 / WGS84) |
| EPE — Anuário Estatístico (`Dados brutos.xlsx`) | 8 anos consolidados (2018-2025) | 16 séries anuais (Convencional vs Baixa Renda BA) | ✅ Validado (Escala UF preservada) |

---

## 2. Regras de Padronização, Limpeza e Tratamento de Ausências

1. **Conversão Decimal e Marcadores de Sigilo Estatístico (`X` e `.`):** Nos arquivos CSV do Censo 2022, separadores decimais em vírgula (`1,6362079`) foram convertidos para padrão IEEE 754 (`float`), e setores com restrição de divulgação (`X` por possuírem menos de 3 domicílios particulares) foram tratados sem distorcer as médias ponderadas.
2. **Validação de Equivalência Geográfica (`Beiru` vs `Tancredo Neves`):** Confirmou-se na base oficial do Censo 2022 e na malha `BA_bairros_CD2022.shp` que o IBGE adota o nome composto oficial **`Beiru / Tancredo Neves`** sob o código **`2927408018`** (Subdistrito `29274080522 - São Caetano`). Adicionalmente, documentou-se a distinção entre o limite de **Bairro oficial** (`38.329` hab. no Beiru e `52.564` hab. em Pernambués) e o recorte de **Favela e Comunidade Urbana - FCU** (`38.871` hab. na FCU Beiru/Tancredo Neves e `35.110` hab. na FCU Pernambués).
3. **Bloqueio contra Falácia Ecológica (Dados Estaduais EPE e IPEA):** Os registros estaduais da EPE (`UF = BA`, `territorio_id = 2`) e do IPEA foram armazenados estritamente vinculados aos seus códigos territoriais nativos (`Bahia id=2`, `Salvador id=3`, `UDH id=6 e 7`), impedindo qualquer atribuição direta de médias estaduais aos bairros.

---

## 3. Conferência Cruzada de Totais (Sanity Check Pós-ETL)

| Indicador de Conferência | Beiru / Tancredo Neves (`2927408018`) | Pernambués (`2927408117`) | Salvador (`2927408`) |
| :--- | :---: | :---: | :---: |
| **População Residente (`V0001`)** | 38,329 hab | 52,564 hab | 2,417,678 hab |
| **Domicílios Particulares Permanentes Ocupados (`V00001`)** | 15,454 dom | 21,561 dom | 958,539 dom |
| **Área Territorial Oficial (`AREA_KM2`)** | 1.6362 km² | 3.2074 km² | 693.4421 km² |
| **Densidade Demográfica (`hab/km²`)** | 23,425.51 hab/km² | 16,388.42 hab/km² | 3,486.49 hab/km² |
| **Rendimento Médio do Responsável (`V06004`)** | R$ 2,035.87 | R$ 2,316.25 | R$ 3,160.73 |
| **Rendimento Mediano do Responsável (`V06006`)** | R$ 1,212.00 | R$ 1,212.00 | R$ 1,230.00 |
| **Taxa de Alfabetização 15+ (`%`)** | 95.04% | 96.76% | 96.63% |
| **Coleta de Lixo Direta Porta a Porta (`%`)** | 29.19% | 40.83% | 57.26% |
| **Arborização no Entorno (`% com ≥1 árvore`)** | 24.48% | 34.02% | 34.51% |
| **IEVS Exploratório (Cenário Base)** | **66.17 / 100** | **52.98 / 100** | **38.62 / 100** |
