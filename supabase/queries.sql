-- =============================================================================
-- CONSULTAS SQL ANALÍTICAS OBRIGATÓRIAS (Etapa 4)
-- Observatório de Vulnerabilidade Socioenergética de Salvador — SENAI CIMATEC
-- Filtragem por bairro, ano, fonte e dimensão, preservando a escala geográfica
-- =============================================================================

-- 1. Consulta filtrada por Bairro, Dimensão, Fonte e Ano (Requisito Seção 8)
SELECT
    territorio_nome AS bairro,
    codigo_ibge,
    dimensao,
    indicador_nome AS indicador,
    valor,
    unidade,
    classificacao,
    fonte_instituicao AS fonte,
    ano,
    escala_registro
FROM vw_observacoes_detalhadas
WHERE territorio_tipo = 'BAIRRO'
  AND ano = 2022
  AND dimensao IN ('Demográfica', 'Econômica', 'Habitacional', 'Urbana', 'Socioenergética')
ORDER BY dimensao, indicador_id, territorio_nome;

-- 2. Comparativo Territorial Direto (Beiru/Tancredo Neves vs Pernambués vs Salvador)
-- Calcula diferenças absolutas e percentuais sem misturar dados estaduais
SELECT
    dimensao,
    indicador,
    classificacao,
    unidade,
    valor_beiru_tancredo_neves AS beiru_tancredo_neves,
    valor_pernambues AS pernambues,
    valor_salvador AS salvador_ref,
    diff_absoluta_beiru_vs_pernambues AS delta_abs,
    diff_percentual_beiru_vs_pernambues AS delta_pct
FROM vw_comparativo_bairros
ORDER BY indicador_id;

-- 3. Consulta Exclusiva de Contextualização Energética Estadual (EPE - UF Bahia)
-- Demonstra que dados estaduais da EPE NÃO são replicados como observações de bairro
SELECT
    ano,
    territorio_nome AS estado,
    indicador_nome,
    valor,
    unidade,
    escala_registro,
    fonte_instituicao
FROM vw_observacoes_detalhadas
WHERE fonte_instituicao = 'EPE'
  AND codigo_ibge = '29' -- Estritamente UF Bahia
ORDER BY ano ASC, indicador_id ASC;

-- 4. Consulta de Contextualização Social IPEA (Atlas IVS nas escalas publicadas: UF, RM/Município e UDH)
SELECT
    territorio_nome,
    territorio_tipo,
    ano,
    indicador_nome,
    valor AS ivs_geral,
    escala_registro
FROM vw_observacoes_detalhadas
WHERE fonte_instituicao = 'IPEA'
ORDER BY ano DESC, territorio_id ASC;

-- 5. Auditoria de Qualidade: Contagem de Indicadores por Dimensão e Classificação Metodológica
SELECT
    dimensao,
    classificacao,
    COUNT(*) AS total_indicadores
FROM indicadores
GROUP BY dimensao, classificacao
ORDER BY dimensao, classificacao;
