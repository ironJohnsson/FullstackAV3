# Observatório de Vulnerabilidade Socioenergética de Salvador/BA

> **Projeto Integrador Fullstack (AV3 — Parcial)**  
> **Instituição:** Centro Universitário SENAI CIMATEC | **Curso:** Graduação em Desenvolvimento de Sistemas  
> **Unidade Curricular:** Desenvolvimento Fullstack | **Professor:** Celso Barreto

Aplicação web analítica fullstack para investigação multiescalar da vulnerabilidade social, infraestrutura domiciliar/urbana e contexto socioenergético nos bairros **Beiru / Tancredo Neves** (`CD_BAIRRO = 2927408018`) e **Pernambués** (`CD_BAIRRO = 2927408117`), contextualizados em **Salvador/BA** (`CD_MUN = 2927408`) e no **Estado da Bahia** (`CD_UF = 29`).

---

## Sumário Executivo dos Achados Oficiais

| Indicador Oficial (IBGE Censo 2022 / EPE / IPEA) | Classificação | Beiru / Tancredo Neves | Pernambués | Salvador (Município) |
| :--- | :---: | :---: | :---: | :---: |
| **População Residente (`POP_TOTAL`)** | `Dado observado` | **38.329 hab** | **52.564 hab** | 2.417.678 hab |
| **Área Territorial (`AREA_KM2`)** | `Dado observado` | **1,6362 km²** | **3,2074 km²** | 693,4421 km² |
| **Densidade Demográfica (`DENS_DEMO`)** | `Indicador derivado` | **23.425,5 hab/km²** | **16.388,4 hab/km²** | 3.486,5 hab/km² |
| **Domicílios Particulares Ocupados (`DOM_OCUP`)** | `Dado observado` | **15.454 DPPO** | **21.561 DPPO** | 958.539 DPPO |
| **Renda Média do Responsável (`RENDA_MEDIA_RESP`)** | `Dado observado` | **R$ 2.035,87** | **R$ 2.316,25** | R$ 3.160,73 |
| **Renda Mediana do Responsável (`RENDA_MEDIANA_RESP`)** | `Dado observado` | **R$ 1.212,00** | **R$ 1.212,00** | R$ 1.230,00 |
| **Setores Censitários Baixa Renda (≤ 1,5 SM)** | `Indicador derivado` | **85,92%** (61/71 válidos) | **72,00%** (72/100) | 48,60% |
| **Taxa de Alfabetização 15+ anos (`TAXA_ALFABETIZACAO`)** | `Indicador derivado` | **95,04%** | **96,76%** | 96,63% |
| **População Negra (`PROP_NEGROS`)** | `Indicador derivado` | **91,42%** | **86,54%** | 83,03% |
| **Coleta Direta de Lixo Porta a Porta (`LIXO_COLETA_DIRETA`)** | `Indicador derivado` | **29,19%** | **40,83%** | 57,26% |
| **Iluminação Pública no Entorno (`ENTORNO_ILUMINACAO`)** | `Indicador derivado` | **96,51%** (528 sem) | **98,51%** (320 sem) | 98,22% |
| **Vias com Calçada (`ENTORNO_CALCADA`)** | `Indicador derivado` | **39,46%** | **38,57%** | 56,87% |
| **Vias Arborizadas (`ENTORNO_ARBORIZACAO`)** | `Indicador derivado` | **24,48%** (74,4% sem) | **34,02%** (65,1% sem) | 34,51% |
| **IEVS — Índice Exploratório Socioenergético** | `Proxy/estimativa` | **66,17 / 100** | **52,98 / 100** | 38,62 / 100 |

> **Nota Metodológica sobre Escalas:** Dados estaduais da **EPE** (Consumo Residencial na Bahia = `7.555,35 GWh` em 2022 e `8.048,81 GWh` em 2025; Consumidores na Tarifa Social Baixa Renda = `28,22%` em 2022 e `32,78%` em 2025) e do **IPEA/IVS** (Bahia, Salvador e UDHs) são armazenados e visualizados estritamente em suas escalas geográficas reais (`uf`, `municipio`, `udh`), **nunca sendo replicados artificialmente como dados nativos de bairro**.

---

## Arquitetura do Projeto e Estrutura de Pastas

```text
FullstackAV3/
├── data/
│   └── processed/                  # Dados auditados gerados pelo pipeline ETL (JSON, CSV e GeoJSON)
│       ├── territories.json/.csv   # 7 recortes territoriais (UF, Município, 2 Bairros, 2 UDHs)
│       ├── fontes.json/.csv        # 7 fontes oficiais catalogadas (IBGE, EPE, IPEA)
│       ├── indicadores.json/.csv   # 24 indicadores classificados (Observado, Derivado, Proxy)
│       ├── observacoes.json/.csv   # 85 observações multiescalares vinculadas por FKs
│       ├── analyses.json/.csv      # 8 respostas analíticas estruturadas + IEVS
│       ├── epe_bahia_series.json   # Série histórica EPE Bahia 2018-2025 (Convencional vs Baixa Renda)
│       ├── setores_censitarios.json# 172 setores censitários (72 Beiru + 100 Pernambués)
│       ├── geojson_bairros.json    # Polígonos oficiais IBGE CD2022 dos bairros
│       ├── geojson_setores.json    # Polígonos oficiais IBGE CD2022 dos 172 setores censitários
│       └── observatorio_bundle.json# Bundle integrado para hidratação imediata no frontend
├── docs/
│   ├── BACKLOG.md                          # Etapa 1: Backlog estruturado das 8 etapas e sprints
│   ├── CATALOGO_INDICADORES.md             # Etapa 2: Dicionário completo dos 24 indicadores
│   ├── RELATORIO_QUALIDADE_ETL.md          # Etapa 3: Auditoria do pipeline ETL e notas técnicas
│   └── RELATORIO_COMPARATIVO_ANALITICO.md  # Etapa 8: Relatório analítico (8 questões + IEVS)
├── etl/
│   ├── run_etl.py                  # Pipeline ETL completo em Python (IBGE + EPE + IPEA + Shapefiles)
│   ├── load_supabase.py            # Script de carga direta via REST API no Supabase PostgreSQL
│   └── requirements.txt            # Dependências Python do ETL (pyshp, openpyxl, requests)
├── supabase/
│   ├── schema.sql                  # DDL PostgreSQL/Supabase (5 tabelas, FKs, Views, RLS Policies)
│   ├── seed.sql                    # Carga transacional completa com todos os dados oficiais
│   └── queries.sql                 # 5 consultas analíticas SQL prontas para validação
├── src/
│   ├── components/
│   │   ├── TelaVisaoGeral.jsx      # Tela 1: KPIs executivos, radar sintético, tese central e achados
│   │   ├── TelaComparativo.jsx     # Tela 2: Comparação direta Beiru vs Pernambués vs Salvador
│   │   ├── TelaMapa.jsx            # Tela 3: Mapa interativo Leaflet (Bairros + 172 Setores Censitários)
│   │   ├── TelaEnergiaIEVS.jsx     # Tela 4: Série EPE Bahia 2018-2025 + Simulador Interativo IEVS
│   │   ├── TelaMetodologiaAnalise.jsx # Tela 5: 8 Questões Analíticas + Catálogo + Arquitetura SQL
│   │   └── SupabaseModal.jsx       # Modal interativo para conexão live e teste de latência Supabase
│   ├── lib/
│   │   └── supabaseClient.js       # Cliente @supabase/supabase-js com suporte a .env e Runtime UI
│   ├── services/
│   │   └── observatorioService.js  # Camada de dados híbrida (Supabase PostgreSQL Live + Fallback JSON)
│   ├── utils/
│   │   └── formatters.js           # Formatação numérica pt-BR, cores de badges e escalas
│   ├── App.jsx                     # Shell principal, navegação entre as 5 telas e filtros globais
│   ├── main.jsx                    # Entrypoint React 19
│   └── styles.css                  # Design System completo escuro/analítico responsivo
├── .env.example                    # Template de variáveis de ambiente (Supabase)
├── vercel.json                     # Configuração de deploy SPA na Vercel
├── vite.config.js                  # Configuração Vite com code-splitting otimizado (manualChunks)
└── package.json                    # Scripts de desenvolvimento, build e ETL
```

---

## Funcionalidades Implementadas nas 5 Telas do Dashboard

1. **Tela 1 — Visão Geral (`TelaVisaoGeral.jsx`):**
   - Cards executivos comparativos com filtros de escala e classificação (`Dado observado`, `Indicador derivado`, `Proxy/estimativa`).
   - Gráfico de barras horizontais de densidade demográfica e renda + Radar multidimensional normalizado + Card de equivalência geográfica *Beiru / Tancredo Neves* e recorte FCU.
2. **Tela 2 — Comparativo entre Bairros (`TelaComparativo.jsx`):**
   - Filtro por dimensão (`Demografia`, `Renda & Trabalho`, `Capital Humano`, `Infraestrutura & Entorno`, `Energia & Síntese`) e busca textual.
   - Gráficos comparativos lado a lado (Infraestrutura de Rede vs. Gargalos de Entorno, Destino do Lixo, Distribuição de Setores Censitários de Baixa Renda) e tabela auditável com diferença percentual automática.
3. **Tela 3 — Mapa e Contexto Territorial (`TelaMapa.jsx`):**
   - Mapa interativo **Leaflet** com alternância entre a **Malha de 172 Setores Censitários (`72` em Beiru + `100` em Pernambués)** e a **Malha Oficial de Bairros (`CD2022`)**, com sincronização automática ao tema claro/escuro.
   - Colorização coroplética dinâmica por **Índice Exploratório Socioenergético (IEVS 0–100)**, **Renda Média do Responsável (`V06004`)** ou **Densidade Demográfica (`hab/km²`)**, com popups e painel lateral de inspeção.
4. **Tela 4 — Energia (EPE Bahia) & Simulador IEVS (`TelaEnergiaIEVS.jsx`):**
   - Gráfico combinado (Barras + Linha) da evolução do consumo residencial na Bahia (2018–2025) e gráfico de área da expansão da **Tarifa Social Baixa Renda (TSEE)** de `20,35%` (2018) para `32,78%` (2025).
   - **Simulador Interativo do IEVS (Desafio Adicional):** Controles deslizantes (*sliders*) para ajustar em tempo real os pesos de *Renda (40%)*, *Habitação & Saneamento (30%)* e *Urbana & Térmica (30%)*, recalculando instantaneamente o score e a matriz de sensibilidade para Beiru, Pernambués e Salvador.
5. **Tela 5 — Metodologia, Catálogo & Desafio Analítico (`TelaMetodologiaAnalise.jsx`):**
   - Respostas completas e fundamentadas às **8 questões do Desafio Analítico Obrigatório** + Matriz de Priorização (3 ações por bairro + 4 soluções de inovação).
   - Catálogo interativo dos **24 indicadores** com fórmulas, arquivos-fonte e limitações + Explorador do modelo relacional PostgreSQL/Supabase (`schema.sql`, `seed.sql` e `queries.sql`) com botão de cópia rápida.

---

## Como Executar o Projeto Localmente

### 1. Pré-requisitos
- **Node.js** `>= 18.x` e **npm**
- **Python** `>= 3.10` (opcional, apenas se desejar reexecutar o pipeline ETL a partir dos arquivos brutos em `etl/raw_cache/`)

### 2. Instalação e Execução do Frontend (React + Vite)
```bash
# 1. Instalar dependências Node
npm install --legacy-peer-deps

# 2. Iniciar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# 3. Gerar build otimizado de produção em dist/
npm run build

# 4. Visualizar build de produção localmente
npm run preview
```

### 3. Configuração do Banco de Dados no Supabase (Etapa 4)
A aplicação possui arquitetura híbrida: funciona imediatamente com o bundle oficial pré-carregado (`src/data/observatorio_bundle.json`) e conecta-se em tempo real ao **Supabase PostgreSQL** assim que as credenciais são fornecidas:

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor** do Supabase, execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql) para criar as 5 tabelas (`territories`, `fontes`, `indicadores`, `observacoes`, `analyses`), índices, views (`vw_observacoes_detalhadas`, `vw_comparativo_bairros`) e políticas RLS de leitura pública.
3. Em seguida, execute [`supabase/seed.sql`](./supabase/seed.sql) no SQL Editor (ou rode `python etl/load_supabase.py` com `SUPABASE_SERVICE_ROLE_KEY`) para popular todas as observações oficiais.
4. Configure suas credenciais de duas formas (à sua escolha):
   - **Via arquivo `.env`** na raiz do projeto (copie `.env.example` para `.env`):
     ```env
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
     ```
   - **Ou diretamente na interface do Dashboard:** clique no botão **"Conectar Supabase"** no topo direito da aplicação e informe a URL e a Anon Key. O badge superior mudará para **"Supabase PostgreSQL Live"**.

### 4. Reexecução do Pipeline ETL em Python (Etapa 3)
```bash
pip install -r etl/requirements.txt
npm run etl
```
O comando `npm run etl` executa `etl/run_etl.py`, que processa os arquivos oficiais do IBGE Censo 2022, EPE e IPEA, regenera todos os arquivos em `data/processed/`, atualiza `supabase/seed.sql` e sincroniza `src/data/observatorio_bundle.json`.

---

## Deploy na Vercel (Etapa 7)

O repositório já inclui [`vercel.json`](./vercel.json) pré-configurado para deploy imediato na **Vercel**:
1. Importe o repositório `https://github.com/ironJohnsson/FullstackAV3.git` na Vercel.
2. O preset `vite` será detectado automaticamente (`Build Command: npm run build`, `Output Directory: dist`, `Install Command: npm install --legacy-peer-deps`).
3. Adicione as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel da Vercel (opcional, pois o fallback oficial e o conector em tela já estão ativos).

---

## Fluxo Git e Branches (Etapa 1)

O repositório segue o fluxo estruturado com branches temáticas:
- `main`: Branch principal de produção (release estável).
- `develop`: Branch de integração contínua das etapas.
- `feature/etl-dados`: Investigação das bases oficiais, catálogo de indicadores e pipeline ETL em Python (Etapas 2 e 3).
- `feature/supabase-schema`: Modelagem relacional PostgreSQL, DDL, Seed e Queries analíticas (Etapa 4).
- `feature/dashboard-frontend`: Aplicação React + Vite + Recharts + Leaflet + Simulador IEVS (Etapas 5 e 6).
- `feature/analise-relatorio`: Configuração Vercel, Relatório Comparativo Analítico e Documentação (Etapas 7 e 8).
