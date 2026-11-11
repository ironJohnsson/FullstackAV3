-- =============================================================================
-- ESQUEMA RELACIONAL POSTGRESQL / SUPABASE (Etapa 4)
-- Observatório de Vulnerabilidade Socioenergética de Salvador — SENAI CIMATEC
-- =============================================================================

-- Limpeza segura caso reexecutado
DROP VIEW IF EXISTS vw_comparativo_bairros CASCADE;
DROP VIEW IF EXISTS vw_observacoes_detalhadas CASCADE;
DROP TABLE IF EXISTS observacoes CASCADE;
DROP TABLE IF EXISTS analyses CASCADE;
DROP TABLE IF EXISTS indicadores CASCADE;
DROP TABLE IF EXISTS fontes CASCADE;
DROP TABLE IF EXISTS territories CASCADE;

-- 1. TABELA: territories
-- Hierarquia territorial: País (Brasil) -> Estado (Bahia) -> Município (Salvador) -> Bairros / UDHs
CREATE TABLE territories (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(160) NOT NULL,
    codigo_ibge VARCHAR(40) UNIQUE NOT NULL,
    tipo VARCHAR(40) NOT NULL CHECK (tipo IN ('PAIS', 'ESTADO', 'MUNICIPIO', 'BAIRRO', 'UDH', 'SETOR_CENSITARIO')),
    territorio_pai_id INTEGER REFERENCES territories(id) ON DELETE SET NULL,
    area_km2 NUMERIC(14, 4),
    escala_descricao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA: fontes
-- Catálogo rastreável de fontes oficiais (IBGE, IPEA, EPE)
CREATE TABLE fontes (
    id SERIAL PRIMARY KEY,
    instituicao VARCHAR(100) NOT NULL,
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    data_acesso DATE NOT NULL DEFAULT CURRENT_DATE,
    escala_nativa VARCHAR(120) NOT NULL,
    ano_referencia VARCHAR(40)
);

-- 3. TABELA: indicadores
-- Dicionário metodológico com classificação obrigatória (Dado observado, Indicador derivado, Proxy/estimativa)
CREATE TABLE indicadores (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(80) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    unidade VARCHAR(50) NOT NULL,
    dimensao VARCHAR(60) NOT NULL CHECK (dimensao IN (
        'Demográfica', 'Econômica', 'Social', 'Habitacional', 'Urbana', 'Energética', 'Socioenergética'
    )),
    classificacao VARCHAR(40) NOT NULL CHECK (classificacao IN (
        'Dado observado', 'Indicador derivado', 'Proxy/estimativa'
    )),
    escala_geografica VARCHAR(120) NOT NULL,
    ano_referencia INTEGER NOT NULL DEFAULT 2022,
    variaveis_origem TEXT,
    formula TEXT,
    metodologia TEXT NOT NULL,
    limitacoes TEXT NOT NULL
);

-- 4. TABELA: observacoes
-- Fatos observados/calculados preservando território, indicador, fonte, ano e escala
CREATE TABLE observacoes (
    id SERIAL PRIMARY KEY,
    territorio_id INTEGER NOT NULL REFERENCES territories(id) ON DELETE CASCADE,
    indicador_id INTEGER NOT NULL REFERENCES indicadores(id) ON DELETE CASCADE,
    fonte_id INTEGER NOT NULL REFERENCES fontes(id) ON DELETE RESTRICT,
    ano INTEGER NOT NULL CHECK (ano BETWEEN 1990 AND 2035),
    valor NUMERIC(18, 4) NOT NULL,
    escala_registro VARCHAR(100) NOT NULL,
    UNIQUE (territorio_id, indicador_id, fonte_id, ano)
);

-- 5. TABELA: analyses
-- Sínteses analíticas fundamentadas (Desafio Analítico Obrigatório - 8 Questões)
CREATE TABLE analyses (
    id SERIAL PRIMARY KEY,
    questao_numero INTEGER UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    dimensao_foco VARCHAR(60) NOT NULL,
    descricao TEXT NOT NULL,
    data_criacao DATE NOT NULL DEFAULT CURRENT_DATE
);

-- =============================================================================
-- ÍNDICES DE PERFORMANCE PARA FILTROS DO DASHBOARD
-- =============================================================================
CREATE INDEX idx_observacoes_territorio ON observacoes(territorio_id);
CREATE INDEX idx_observacoes_indicador ON observacoes(indicador_id);
CREATE INDEX idx_observacoes_fonte ON observacoes(fonte_id);
CREATE INDEX idx_observacoes_ano ON observacoes(ano);
CREATE INDEX idx_indicadores_dimensao ON indicadores(dimensao);
CREATE INDEX idx_indicadores_classificacao ON indicadores(classificacao);
CREATE INDEX idx_territories_tipo ON territories(tipo);
CREATE INDEX idx_territories_pai ON territories(territorio_pai_id);

-- =============================================================================
-- VIEWS ANALÍTICAS PARA CONSULTAS DIRETAS DO FRONTEND E RELATÓRIOS
-- =============================================================================

-- View 1: Observações desnormalizadas com metadados de território, indicador e fonte
CREATE OR REPLACE VIEW vw_observacoes_detalhadas WITH (security_invoker = true) AS
SELECT
    o.id AS observacao_id,
    o.ano,
    o.valor,
    o.escala_registro,
    t.id AS territorio_id,
    t.nome AS territorio_nome,
    t.codigo_ibge,
    t.tipo AS territorio_tipo,
    i.id AS indicador_id,
    i.codigo AS indicador_codigo,
    i.nome AS indicador_nome,
    i.unidade,
    i.dimensao,
    i.classificacao,
    i.formula,
    i.metodologia,
    i.limitacoes,
    f.id AS fonte_id,
    f.instituicao AS fonte_instituicao,
    f.titulo AS fonte_titulo,
    f.url AS fonte_url
FROM observacoes o
JOIN territories t ON t.id = o.territorio_id
JOIN indicadores i ON i.id = o.indicador_id
JOIN fontes f ON f.id = o.fonte_id;

-- View 2: Comparativo lado a lado Beiru/Tancredo Neves vs Pernambués vs Salvador (Ano 2022)
CREATE OR REPLACE VIEW vw_comparativo_bairros WITH (security_invoker = true) AS
SELECT
    i.id AS indicador_id,
    i.codigo,
    i.nome AS indicador,
    i.dimensao,
    i.classificacao,
    i.unidade,
    f.instituicao AS fonte,
    MAX(CASE WHEN t.codigo_ibge = '2927408018' THEN o.valor END) AS valor_beiru_tancredo_neves,
    MAX(CASE WHEN t.codigo_ibge = '2927408117' THEN o.valor END) AS valor_pernambues,
    MAX(CASE WHEN t.codigo_ibge = '2927408' THEN o.valor END) AS valor_salvador,
    ROUND(
        MAX(CASE WHEN t.codigo_ibge = '2927408018' THEN o.valor END) -
        MAX(CASE WHEN t.codigo_ibge = '2927408117' THEN o.valor END), 2
    ) AS diff_absoluta_beiru_vs_pernambues,
    CASE
        WHEN MAX(CASE WHEN t.codigo_ibge = '2927408117' THEN o.valor END) <> 0 THEN
            ROUND(
                ((MAX(CASE WHEN t.codigo_ibge = '2927408018' THEN o.valor END) -
                  MAX(CASE WHEN t.codigo_ibge = '2927408117' THEN o.valor END)) /
                  MAX(CASE WHEN t.codigo_ibge = '2927408117' THEN o.valor END)) * 100.0, 2
            )
        ELSE NULL
    END AS diff_percentual_beiru_vs_pernambues
FROM indicadores i
JOIN observacoes o ON o.indicador_id = i.id AND o.ano = 2022
JOIN territories t ON t.id = o.territorio_id
JOIN fontes f ON f.id = o.fonte_id
WHERE t.codigo_ibge IN ('2927408018', '2927408117', '2927408')
GROUP BY i.id, i.codigo, i.nome, i.dimensao, i.classificacao, i.unidade, f.instituicao
ORDER BY i.id;

-- =============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS) E GRANTS DATA API
-- Permite leitura pública (anon / authenticated) no dashboard e restringe escrita
-- =============================================================================
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fontes ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE observacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON territories, fontes, indicadores, observacoes, analyses TO anon, authenticated;
GRANT SELECT ON vw_observacoes_detalhadas, vw_comparativo_bairros TO anon, authenticated;

CREATE POLICY "Leitura publica territories" ON territories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Leitura publica fontes" ON fontes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Leitura publica indicadores" ON indicadores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Leitura publica observacoes" ON observacoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Leitura publica analyses" ON analyses FOR SELECT TO anon, authenticated USING (true);
