# Backlog do Projeto Integrador — Observatório de Vulnerabilidade Socioenergética de Salvador

**Unidade Curricular:** Desenvolvimento Fullstack — SENAI CIMATEC  
**Docente:** Prof. Celso Barreto  
**Avaliação:** AV3 - Parcial (Situação de Aprendizagem — Projeto Integrador)  
**Territórios Investigados:** Beiru / Tancredo Neves (`CD_BAIRRO: 2927408018`) e Pernambués (`CD_BAIRRO: 2927408117`) — Salvador/BA (`CD_MUN: 2927408`) e Estado da Bahia (`CD_UF: 29`)  
**Fontes Obrigatórias:** IBGE (Censo Demográfico 2022), IPEA (Atlas da Vulnerabilidade Social - IVS) e EPE (Anuário Estatístico de Energia Elétrica)

---

## Quadro Kanban / Sprints (8 Etapas — 10 Horas)

| Etapa | Título | Branch Git | Entregáveis Principais | Critério de Aceite | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Etapa 1** | Planejamento e Git/GitHub | `main`, `develop` | Estrutura do repositório, `.gitignore`, `.env.example`, `docs/BACKLOG.md`, `README.md` | Branches `main`, `develop` e `feature/*` configuradas com histórico semântico | ✅ Concluído |
| **Etapa 2** | Investigação das Bases Oficiais | `feature/etl-dados` | `docs/CATALOGO_INDICADORES.md`, verificação de códigos IBGE/IPEA/EPE e equivalência geográfica Beiru/Tancredo Neves | Ao menos 12 indicadores catalogados (24 implementados) com classificação (`Observado`, `Derivado`, `Proxy`), escala e limitações | ✅ Concluído |
| **Etapa 3** | Pipeline ETL Reproduzível | `feature/etl-dados` | `etl/run_etl.py`, `etl/load_supabase.py`, `data/processed/*.json/*.csv`, `docs/RELATORIO_QUALIDADE_ETL.md` | Extração e validação dos CSVs/XLSXs/Shapefiles oficiais do Censo 2022, IPEA e EPE sem inferência ecológica indevida | ✅ Concluído |
| **Etapa 4** | Modelagem PostgreSQL / Supabase | `feature/supabase-schema` | `supabase/schema.sql`, `supabase/seed.sql`, `supabase/queries.sql` | 5 tabelas (`territories`, `fontes`, `indicadores`, `observacoes`, `analyses`), RLS configurado, views e queries analíticas | ✅ Concluído |
| **Etapa 5** | Arquitetura Frontend React + Vite | `feature/dashboard-frontend` | App React + Vite, cliente Supabase (`@supabase/supabase-js`), filtros globais e design system responsivo | Conexão segura ao Supabase via `anon` key com fallback resiliente e indicadores de escala/fonte visíveis | ✅ Concluído |
| **Etapa 6** | Visualizações (Recharts) e Mapa (Leaflet) | `feature/dashboard-frontend` | 5 Telas Obrigatórias + Simulador IEVS + Mapa com limites oficiais de Bairros e 172 Setores Censitários | Mínimo de 6 visualizações funcionais (10+ gráficos e mapa temático multicamadas implementados) | ✅ Concluído |
| **Etapa 7** | Configuração de Deploy Contínuo (Vercel) | `feature/analise-relatorio` | `vercel.json`, build de produção validado (`npm run build`) e integração GitHub → Vercel | Build estático/SPA otimizado sem erros e variáveis de ambiente documentadas | ✅ Concluído |
| **Etapa 8** | Análise Territorial Crítica e Relatório | `feature/analise-relatorio` | `docs/RELATORIO_COMPARATIVO_ANALITICO.md` + Tela 5 integrada com as 8 respostas do Desafio Analítico e IEVS | Respostas fundamentadas nas evidências empíricas e explicitação rigorosa das limitações metodológicas | ✅ Concluído |

---

## Rastreabilidade com os Critérios de Avaliação (Seção 10)

1. **Git/GitHub e colaboração (10%):** Uso de branches (`main`, `develop`, `feature/etl-dados`, `feature/supabase-schema`, `feature/dashboard-frontend`, `feature/analise-relatorio`), commits semânticos e documentação técnica completa.
2. **Seleção, rastreabilidade e tratamento de dados (20%):** 24 indicadores extraídos diretamente dos agregados por bairro e setor censitário do Censo 2022 (IBGE), Atlas IVS (IPEA) e Anuário Estatístico de Energia Elétrica (EPE), preservando escala geográfica nativa (`Bairro`, `Setor Censitário`, `Município`, `UDH`, `UF`).
3. **Modelagem e Supabase (15%):** Esquema relacional normalizado em PostgreSQL com chaves estrangeiras, restrições de integridade, RLS e views analíticas.
4. **Interface e funcionalidades (20%):** 5 telas obrigatórias interativas, filtros por bairro/dimensão/fonte/ano/classificação, mapa Leaflet com 172 setores censitários reais e simulador de sensibilidade do IEVS.
5. **Análise territorial e interpretação crítica (20%):** Discussão aprofundada das 8 questões obrigatórias, distinção entre malha de Bairro (`2927408018`) e Favela/Comunidade Urbana (`38.871` vs `38.329` hab), e análise do IEVS exploratório.
6. **Deploy e testes (10%):** Configuração `vercel.json`, testes de build e validação de integridade do ETL.
7. **Documentação e apresentação (5%):** `README.md`, Catálogo de Indicadores, Relatório de Qualidade ETL e Relatório Analítico Comparativo.
