# Catálogo Oficial de Indicadores — Observatório de Vulnerabilidade Socioenergética de Salvador

**Entrega da Etapa 2 — Investigação das Bases Oficiais (IBGE, IPEA e EPE)**  
**Total de Indicadores Catalogados e Verificados:** 24 indicadores (Requisito mínimo: 12 indicadores)  
**Cobertura Dimensional:** Demográfica, Econômica, Social, Habitacional, Urbana, Energética e Socioenergética.

---

## 1. Síntese Metodológica de Classificação e Escala

- **Dado observado:** Valor publicado diretamente pela fonte oficial (IBGE, IPEA ou EPE) para o respectivo recorte territorial e período.
- **Indicador derivado:** Cálculo matemático direto (razão, percentual, densidade ou taxa) sobre variáveis oficiais, com fórmula explícita e reprodutível.
- **Proxy/estimativa:** Aproximação analítica de fenômeno socioenergético não medido diretamente na escala de bairro, acompanhada de justificativa teórica e limitações.
- **Equivalência Geográfica Beiru / Tancredo Neves:** Na malha oficial de bairros do Censo Demográfico 2022 (conforme a Lei Municipal de Salvador nº 9.278/2017), o território é identificado sob o código único **`CD_BAIRRO = 2927408018`** e denominação oficial **`Beiru / Tancredo Neves`** (Subdistrito de São Caetano). Já o bairro **`Pernambués`** possui o código oficial **`CD_BAIRRO = 2927408117`**.

---

## 2. Tabela Resumo dos 24 Indicadores Verificados

| ID | Código | Indicador | Dimensão | Classificação | Fonte | Escala Nativa | Ano | Unidade |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| 1 | `POP_RESIDENTE` | **População Residente** | Demográfica | `Dado observado` | IBGE Censo 2022 Básico | Bairro / Setor / Município | 2022 | habitantes |
| 2 | `DOM_OCUPADOS` | **Domicílios Particulares Permanentes Ocupados (DPPO)** | Demográfica | `Dado observado` | IBGE Censo 2022 Domicílios 1 | Bairro / Setor / Município | 2022 | domicílios |
| 3 | `DENSIDADE_DEMOGRAFICA` | **Densidade Demográfica** | Demográfica | `Indicador derivado` | IBGE Censo 2022 Básico | Bairro / Setor / Município | 2022 | hab/km² |
| 4 | `MEDIA_MORADORES_DOM` | **Média de Moradores por Domicílio Ocupado** | Demográfica | `Dado observado` | IBGE Censo 2022 Básico | Bairro / Setor / Município | 2022 | moradores/dom |
| 5 | `RAZAO_DEPENDENCIA_ETARIA` | **Razão de Dependência Demográfica** | Demográfica | `Indicador derivado` | IBGE Censo 2022 Demografia | Bairro / Município | 2022 | % |
| 6 | `PERC_POP_NEGRA` | **Proporção de População Negra (Preta e Parda)** | Demográfica | `Indicador derivado` | IBGE Censo 2022 Cor ou Raça | Bairro / Município | 2022 | % |
| 7 | `RENDA_MEDIA_RESP` | **Rendimento Nominal Médio Mensal do Responsável** | Econômica | `Dado observado` | IBGE Censo 2022 Rendimento do Responsável | Bairro / Setor / Município | 2022 | R$ |
| 8 | `RENDA_MEDIANA_RESP` | **Rendimento Nominal Mediano Mensal do Responsável** | Econômica | `Dado observado` | IBGE Censo 2022 Rendimento do Responsável | Bairro / Setor / Município | 2022 | R$ |
| 9 | `PERC_SETORES_BAIXA_RENDA` | **Concentração de Setores Censitários de Baixa Renda (≤ 1,5 SM)** | Econômica | `Indicador derivado` | IBGE Censo 2022 Setores Renda | Bairro (agregado de Setores Censitários) | 2022 | % |
| 10 | `TAXA_ALFABETIZACAO_15MAIS` | **Taxa de Alfabetização (15 anos ou mais)** | Social | `Indicador derivado` | IBGE Censo 2022 Alfabetização | Bairro / Município | 2022 | % |
| 11 | `IVS_GERAL_IPEA` | **Índice de Vulnerabilidade Social Geral (IVS - IPEA)** | Social | `Dado observado` | IPEA Atlas da Vulnerabilidade Social | UDH / Município / UF (Escalas publicadas pelo IPEA) | 2022 | índice (0 a 1) |
| 12 | `ACESSO_AGUA_REDE` | **Abastecimento de Água via Rede Geral** | Habitacional | `Indicador derivado` | IBGE Censo 2022 Domicílios 2 | Bairro / Município | 2022 | % |
| 13 | `ESGOTO_REDE_ADEQUADO` | **Esgotamento Sanitário Adequado (Rede Geral ou Fossa Ligada)** | Habitacional | `Indicador derivado` | IBGE Censo 2022 Domicílios 2 | Bairro / Município | 2022 | % |
| 14 | `COLETA_LIXO_DIRETA` | **Coleta de Lixo Direta (Porta a Porta)** | Habitacional | `Indicador derivado` | IBGE Censo 2022 Domicílios 2 | Bairro / Município | 2022 | % |
| 15 | `ADENSAMENTO_DOMICILIAR_6MAIS` | **Domicílios com Adensamento Elevado (6 ou mais moradores)** | Habitacional | `Indicador derivado` | IBGE Censo 2022 Domicílios 1 | Bairro / Município | 2022 | % |
| 16 | `ENTORNO_ILUMINACAO_PUBLICA` | **Cobertura de Iluminação Pública no Entorno** | Urbana | `Indicador derivado` | IBGE Censo 2022 Entorno Domicílios | Bairro / Município | 2022 | % |
| 17 | `ENTORNO_PAVIMENTACAO` | **Vias Pavimentadas no Entorno Domiciliar** | Urbana | `Indicador derivado` | IBGE Censo 2022 Entorno Domicílios | Bairro / Município | 2022 | % |
| 18 | `ENTORNO_CALCADA` | **Presença de Calçada / Passeio Público** | Urbana | `Indicador derivado` | IBGE Censo 2022 Entorno Domicílios | Bairro / Município | 2022 | % |
| 19 | `ENTORNO_ARBORIZACAO` | **Arborização Viária no Entorno (1 ou mais árvores)** | Urbana | `Indicador derivado` | IBGE Censo 2022 Entorno Domicílios | Bairro / Município | 2022 | % |
| 20 | `EPE_CONSUMO_RES_TOTAL_BA` | **Consumo Residencial de Energia Elétrica na Bahia** | Energética | `Dado observado` | EPE Dados Abertos Anuário Estatístico | Estadual (UF - Bahia) | 2022 | GWh |
| 21 | `EPE_PERC_CONSUMIDORES_BAIXA_RENDA_BA` | **Participação da Subclasse Residencial Baixa Renda (Tarifa Social) na Bahia** | Energética | `Indicador derivado` | EPE Dados Abertos | Estadual (UF - Bahia) | 2022 | % |
| 22 | `PROXY_RISCO_TERMICO_URBANO` | **Índice Proxy de Exposição ao Desconforto Térmico Urbano** | Socioenergética | `Proxy/estimativa` | IBGE Censo 2022 | Bairro / Município | 2022 | índice (0 a 100) |
| 23 | `PROXY_COMPROMETIMENTO_RENDA_ENERGIA` | **Proxy de Pressão Tarifária Potencial sobre a Renda Mediana** | Socioenergética | `Proxy/estimativa` | IBGE Censo 2022 (V06004, V06006, V0005) + Parâmetro Contextual EPE Bahia (Consumo médio ~110,1 kWh/mês ajustado pelo porte domiciliar) | Bairro / Município (Cruzamento Multiescalar Contextual) | 2022 | % da renda mediana |
| 24 | `IEVS_EXPLORATORIO` | **Índice Exploratório de Vulnerabilidade Socioenergética (IEVS)** | Socioenergética | `Proxy/estimativa` | Subíndices normalizados (0-100) | Bairro / Setor Censitário / Município | 2022 | índice (0 a 100) |

---

## 3. Fichas Técnicas Detalhadas (Fórmulas, Variáveis e Limitações)

### 1. População Residente (`POP_RESIDENTE`)
- **Dimensão:** Demográfica | **Classificação:** `Dado observado` | **Unidade:** `habitantes`
- **Escala Geográfica:** Bairro / Setor / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Básico: V0001`
- **Fórmula de Cálculo:** `V0001 (valor direto publicado pelo IBGE)`
- **Metodologia:** Contagem direta da população residente na data de referência do Censo 2022 dentro dos limites oficiais da Lei Municipal nº 9.278/2017.
- **Limitações e Cuidados Interpretativos:** Difere ligeiramente do recorte de Favelas e Comunidades Urbanas (FCU), pois a FCU Beiru/Tancredo Neves (38.871 hab.) ultrapassa trechos de borda da poligonal do bairro oficial (38.329 hab.), enquanto em Pernambués a FCU (35.110 hab.) corresponde a 66,8% do bairro oficial (52.564 hab.).

### 2. Domicílios Particulares Permanentes Ocupados (DPPO) (`DOM_OCUPADOS`)
- **Dimensão:** Demográfica | **Classificação:** `Dado observado` | **Unidade:** `domicílios`
- **Escala Geográfica:** Bairro / Setor / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Domicílios 1: V00001 (e Básico V0002 / V0007)`
- **Fórmula de Cálculo:** `V00001 (valor direto publicado pelo IBGE)`
- **Metodologia:** Contabiliza as unidades domiciliares permanentes com moradores na data de referência, servindo de denominador oficial para taxas de saneamento e tipologia habitacional.
- **Limitações e Cuidados Interpretativos:** Não detalha a qualidade das instalações elétricas internas nem a subdivisão informal de medidores ('gatos' ou relógios compartilhados em casas de laje).

### 3. Densidade Demográfica (`DENSIDADE_DEMOGRAFICA`)
- **Dimensão:** Demográfica | **Classificação:** `Indicador derivado` | **Unidade:** `hab/km²`
- **Escala Geográfica:** Bairro / Setor / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Básico: V0001 e AREA_KM2`
- **Fórmula de Cálculo:** `V0001 / AREA_KM2`
- **Metodologia:** Razão direta entre moradores residentes (V0001) e área da poligonal oficial (AREA_KM2) calculada pelo IBGE na malha CD2022.
- **Limitações e Cuidados Interpretativos:** Trata a área do bairro como homogênea; áreas verdes ou vias expressas nas bordas de Pernambués diluem a densidade média em relação ao núcleo hiperadensado das encostas.

### 4. Média de Moradores por Domicílio Ocupado (`MEDIA_MORADORES_DOM`)
- **Dimensão:** Demográfica | **Classificação:** `Dado observado` | **Unidade:** `moradores/dom`
- **Escala Geográfica:** Bairro / Setor / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Básico: V0005`
- **Fórmula de Cálculo:** `V0005 (Publicado pelo IBGE: Total de moradores / DPPO + DPIO)`
- **Metodologia:** Quociente oficial publicado pelo IBGE entre moradores residentes em domicílios particulares ocupados e o total desses domicílios.
- **Limitações e Cuidados Interpretativos:** A média esconde os extremos de adensamento familiar (domicílios com 6 ou mais pessoas), razão pela qual complementamos com o indicador de adensamento elevado.

### 5. Razão de Dependência Demográfica (`RAZAO_DEPENDENCIA_ETARIA`)
- **Dimensão:** Demográfica | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Demografia: V01031 a V01041`
- **Fórmula de Cálculo:** `((V01031 + V01032 + V01033 + V01040 + V01041) / (V01034 + V01035 + V01036 + V01037 + V01038 + V01039)) * 100`
- **Metodologia:** Soma dos contingentes infantis/juvenis (0-14 anos) e idosos (60+ anos) dividida pelo contingente adulto (15-59 anos).
- **Limitações e Cuidados Interpretativos:** Baseia-se exclusivamente em recortes etários, não capturando desemprego ou permanência prolongada no domicílio por cuidados domésticos (que eleva o consumo residencial diurno de energia).

### 6. Proporção de População Negra (Preta e Parda) (`PERC_POP_NEGRA`)
- **Dimensão:** Demográfica | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Cor ou Raça: V01318 (Preta), V01320 (Parda), V0001 (População)`
- **Fórmula de Cálculo:** `((V01318 + V01320) / V0001) * 100`
- **Metodologia:** Agregação das categorias censitárias Preta e Parda sobre o total populacional do território.
- **Limitações e Cuidados Interpretativos:** Evidencia a dimensão racial da segregação socioespacial em Salvador, mas deve ser cruzada com indicadores de renda e infraestrutura para análise interseccional.

### 7. Rendimento Nominal Médio Mensal do Responsável (`RENDA_MEDIA_RESP`)
- **Dimensão:** Econômica | **Classificação:** `Dado observado` | **Unidade:** `R$`
- **Escala Geográfica:** Bairro / Setor / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Rendimento do Responsável: V06004`
- **Fórmula de Cálculo:** `V06004 (valor direto publicado pelo IBGE em R$ correntes de 2022)`
- **Metodologia:** Média aritmética dos rendimentos brutos nominais mensais dos responsáveis pelos domicílios particulares permanentes ocupados.
- **Limitações e Cuidados Interpretativos:** Sensível a valores extremos (outliers): em Pernambués, condomínios de classe média nas bordas elevam a média (R$ 2.316,25), embora a mediana seja idêntica à de Beiru/Tancredo Neves (R$ 1.212,00).

### 8. Rendimento Nominal Mediano Mensal do Responsável (`RENDA_MEDIANA_RESP`)
- **Dimensão:** Econômica | **Classificação:** `Dado observado` | **Unidade:** `R$`
- **Escala Geográfica:** Bairro / Setor / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Rendimento do Responsável: V06006`
- **Fórmula de Cálculo:** `V06006 (valor direto publicado pelo IBGE em R$ correntes de 2022)`
- **Metodologia:** Valor central que divide a distribuição de rendimentos dos responsáveis em duas partes iguais (50% ganham até esse valor).
- **Limitações e Cuidados Interpretativos:** Considera apenas o rendimento do responsável pelo domicílio (e não a renda domiciliar per capita completa com todos os moradores), mas comprova concentração de baixa renda (R$ 1.212 = 1 salário mínimo de 2022).

### 9. Concentração de Setores Censitários de Baixa Renda (≤ 1,5 SM) (`PERC_SETORES_BAIXA_RENDA`)
- **Dimensão:** Econômica | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro (agregado de Setores Censitários) | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Setores Renda: V06004 por CD_SETOR`
- **Fórmula de Cálculo:** `(Count(Setores com V06004 <= 1818.00) / Total_Setores_Bairro) * 100`
- **Metodologia:** Agregação espacial dos 72 setores de Beiru/Tancredo Neves e 100 setores de Pernambués para medir a extensão territorial da baixa renda.
- **Limitações e Cuidados Interpretativos:** Mede a concentração ecológica por setor censitário; famílias de baixa renda também podem residir em setores com média superior a 1,5 SM.

### 10. Taxa de Alfabetização (15 anos ou mais) (`TAXA_ALFABETIZACAO_15MAIS`)
- **Dimensão:** Social | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Alfabetização: V00900 (alfabetizados 15+) e V00901 (não alfabetizados 15+)`
- **Fórmula de Cálculo:** `(V00900 / (V00900 + V00901)) * 100`
- **Metodologia:** Razão entre pessoas de 15+ anos alfabetizadas e o total de moradores nessa faixa etária.
- **Limitações e Cuidados Interpretativos:** Não mede o analfabetismo funcional nem o grau de letramento digital/financeiro necessário para acessar tarifas sociais (como cadastro na TSEE ou leitura de faturas de energia).

### 11. Índice de Vulnerabilidade Social Geral (IVS - IPEA) (`IVS_GERAL_IPEA`)
- **Dimensão:** Social | **Classificação:** `Dado observado` | **Unidade:** `índice (0 a 1)`
- **Escala Geográfica:** UDH / Município / UF (Escalas publicadas pelo IPEA) | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IPEA Atlas da Vulnerabilidade Social: IVS Geral, IVS Infraestrutura, IVS Capital Humano, IVS Renda e Trabalho`
- **Fórmula de Cálculo:** `(IVS_Infraestrutura + IVS_Capital_Humano + IVS_Renda_Trabalho) / 3`
- **Metodologia:** Média aritmética dos três subíndices normalizados de 0 (menor vulnerabilidade) a 1 (maior vulnerabilidade). Valores acima de 0,400 indicam Alta Vulnerabilidade.
- **Limitações e Cuidados Interpretativos:** Cuidado metodológico essencial: na escala intramunicipal (UDHs), a última malha publicada pelo IPEA/FJP baseia-se no ciclo censitário de 2010; já as atualizações de 2021-2022 do IPEA via PNAD Contínua têm cobertura apenas estadual (UF Bahia = 0,255) e metropolitana.

### 12. Abastecimento de Água via Rede Geral (`ACESSO_AGUA_REDE`)
- **Dimensão:** Habitacional | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Domicílios 2: V00111 e Domicílios 1: V00001`
- **Fórmula de Cálculo:** `(V00111 / V00001) * 100`
- **Metodologia:** Proporção de DPPO cuja forma principal de abastecimento de água é a rede geral de distribuição.
- **Limitações e Cuidados Interpretativos:** Mede a existência de conexão física à rede, mas não capta a intermitência do fornecimento (manobras de racionamento em áreas altas como cumeadas do Beiru, que exigem bombeamento elétrico residencial).

### 13. Esgotamento Sanitário Adequado (Rede Geral ou Fossa Ligada) (`ESGOTO_REDE_ADEQUADO`)
- **Dimensão:** Habitacional | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Domicílios 2: V00309, V00310 e V00001`
- **Fórmula de Cálculo:** `((V00309 + V00310) / V00001) * 100`
- **Metodologia:** Soma dos DPPO atendidos por rede coletora geral/pluvial ou fossa séptica ligada à rede sobre o total de DPPO.
- **Limitações e Cuidados Interpretativos:** A agregação de rede geral e pluvial pelo questionário básico não distingue ligações clandestinas em galerias de águas pluviais de redes coletoras com tratamento secundário.

### 14. Coleta de Lixo Direta (Porta a Porta) (`COLETA_LIXO_DIRETA`)
- **Dimensão:** Habitacional | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Domicílios 2: V00397 e V00001`
- **Fórmula de Cálculo:** `(V00397 / V00001) * 100`
- **Metodologia:** Proporção de DPPO com coleta domiciliar direta (excluindo depósito em caçamba comunitária V00398).
- **Limitações e Cuidados Interpretativos:** Indicador crucial de morfologia urbana: embora a coleta total (direta + caçamba) supere 95%, apenas 29,19% em Beiru/Tancredo Neves e 40,83% em Pernambués têm coleta porta a porta devido à inacessibilidade viária de becos e escadarias.

### 15. Domicílios com Adensamento Elevado (6 ou mais moradores) (`ADENSAMENTO_DOMICILIAR_6MAIS`)
- **Dimensão:** Habitacional | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Domicílios 1: V00022, V00023, V00024, V00025, V00026 e V00001`
- **Fórmula de Cálculo:** `((V00022 + V00023 + V00024 + V00025 + V00026) / V00001) * 100`
- **Metodologia:** Soma dos domicílios ocupados com 6, 7, 8, 9 e 10+ moradores dividida pelo total de DPPO.
- **Limitações e Cuidados Interpretativos:** Não considera a área útil (m²) nem o número de dormitórios (divulgado apenas na Amostra), mas identifica famílias numerosas com maior pressão sobre o consumo elétrico básico (geladeira, banho quente, ventilação).

### 16. Cobertura de Iluminação Pública no Entorno (`ENTORNO_ILUMINACAO_PUBLICA`)
- **Dimensão:** Urbana | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Entorno Domicílios: V05012 e V05000`
- **Fórmula de Cálculo:** `(V05012 / V05000) * 100`
- **Metodologia:** Observação direta pelo recenseador da existência de ao menos um ponto de iluminação pública na face de quadra do domicílio.
- **Limitações e Cuidados Interpretativos:** Conforme destacado na orientação metodológica, iluminação pública na rua NÃO mede a continuidade, a regularidade contratual nem a qualidade do fornecimento elétrico residencial interno (DEC/FEC).

### 17. Vias Pavimentadas no Entorno Domiciliar (`ENTORNO_PAVIMENTACAO`)
- **Dimensão:** Urbana | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Entorno Domicílios: V05006 e V05000`
- **Fórmula de Cálculo:** `(V05006 / V05000) * 100`
- **Metodologia:** Proporção de DPPO em setores de entorno cuja face de quadra possui revestimento de pavimentação.
- **Limitações e Cuidados Interpretativos:** Inclui pavimentação de concreto em escadarias/becos de pedestres, não significando necessariamente acesso para veículos de manutenção da rede elétrica ou coleta direta.

### 18. Presença de Calçada / Passeio Público (`ENTORNO_CALCADA`)
- **Dimensão:** Urbana | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Entorno Domicílios: V05021 e V05000`
- **Fórmula de Cálculo:** `(V05021 / V05000) * 100`
- **Metodologia:** Razão entre domicílios em face com calçada (V05021) e o total de domicílios avaliados na pesquisa de entorno (V05000).
- **Limitações e Cuidados Interpretativos:** Evidencia forte déficit de urbanização: mais de 60% dos domicílios em Beiru/Tancredo Neves (39,46% com calçada) e Pernambués (38,57%) não possuem calçada padronizada.

### 19. Arborização Viária no Entorno (1 ou mais árvores) (`ENTORNO_ARBORIZACAO`)
- **Dimensão:** Urbana | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 Entorno Domicílios: V05031, V05032, V05033 e V05000`
- **Fórmula de Cálculo:** `((V05031 + V05032 + V05033) / V05000) * 100`
- **Metodologia:** Soma dos domicílios em faces com qualquer faixa de arborização dividida pelo universo do entorno (V05000). Complementarmente, V05030/V05000 mede o déficit arbóreo (74,37% sem árvores no Beiru vs 65,07% em Pernambués).
- **Limitações e Cuidados Interpretativos:** Contabiliza apenas árvores em áreas públicas da face da quadra, mas é o principal indicador oficial de microclima urbano e sombreamento das edificações.

### 20. Consumo Residencial de Energia Elétrica na Bahia (`EPE_CONSUMO_RES_TOTAL_BA`)
- **Dimensão:** Energética | **Classificação:** `Dado observado` | **Unidade:** `GWh`
- **Escala Geográfica:** Estadual (UF - Bahia) | **Ano de Referência:** 2022
- **Variáveis de Origem:** `EPE Dados Abertos Anuário Estatístico: UF='BA', Setor='Residencial', Coluna 'Consumo' (MWh / 1000)`
- **Fórmula de Cálculo:** `Soma(Consumo_MWh_Mensal_BA) / 1000`
- **Metodologia:** Consolidação anual dos dados mensais de consumo residencial cativo na Bahia publicados pela EPE (série 2018-2025).
- **Limitações e Cuidados Interpretativos:** RESTRIÇÃO METODOLÓGICA ESTRITA: Indicador disponível apenas em escala estadual (UF Bahia). Nunca deve ser atribuído diretamente aos bairros como se fosse consumo local.

### 21. Participação da Subclasse Residencial Baixa Renda (Tarifa Social) na Bahia (`EPE_PERC_CONSUMIDORES_BAIXA_RENDA_BA`)
- **Dimensão:** Energética | **Classificação:** `Indicador derivado` | **Unidade:** `%`
- **Escala Geográfica:** Estadual (UF - Bahia) | **Ano de Referência:** 2022
- **Variáveis de Origem:** `EPE Dados Abertos: Consumidores UF='BA', Setor N2='Baixa Renda' vs Total Residencial`
- **Fórmula de Cálculo:** `(Consumidores_Baixa_Renda_BA / Consumidores_Residenciais_Totais_BA) * 100`
- **Metodologia:** Razão entre a média anual de unidades consumidoras residenciais Baixa Renda e o total de unidades consumidoras residenciais na Bahia.
- **Limitações e Cuidados Interpretativos:** Escala estadual (UF Bahia). Contextualiza a importância estrutural da Tarifa Social na Bahia (28,22% em 2022, subindo para 32,78% em 2025), mas não informa a taxa de cobertura específica dentro de cada bairro soteropolitano.

### 22. Índice Proxy de Exposição ao Desconforto Térmico Urbano (`PROXY_RISCO_TERMICO_URBANO`)
- **Dimensão:** Socioenergética | **Classificação:** `Proxy/estimativa` | **Unidade:** `índice (0 a 100)`
- **Escala Geográfica:** Bairro / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022: Déficit de Arborização (V05030/V05000) e Densidade Demográfica (V0001/AREA_KM2)`
- **Fórmula de Cálculo:** `0.60 * Perc_Sem_Arvores + 0.40 * Min(100, (Densidade_Hab_Km2 / 25000) * 100)`
- **Metodologia:** Combinação ponderada entre a ausência de sombreamento arbóreo na quadra (60%) e a compacidade construtiva/populacional relativa a 25.000 hab/km² (40%).
- **Limitações e Cuidados Interpretativos:** Trata-se de uma proxy ambiental/urbana: não mede a temperatura interna das edificações nem o padrão construtivo do telhado (fibrocimento/laje sem isolamento térmico).

### 23. Proxy de Pressão Tarifária Potencial sobre a Renda Mediana (`PROXY_COMPROMETIMENTO_RENDA_ENERGIA`)
- **Dimensão:** Socioenergética | **Classificação:** `Proxy/estimativa` | **Unidade:** `% da renda mediana`
- **Escala Geográfica:** Bairro / Município (Cruzamento Multiescalar Contextual) | **Ano de Referência:** 2022
- **Variáveis de Origem:** `IBGE Censo 2022 (V06004, V06006, V0005) + Parâmetro Contextual EPE Bahia (Consumo médio ~110,1 kWh/mês ajustado pelo porte domiciliar)`
- **Fórmula de Cálculo:** `((Consumo_Ref_kWh * Tarifa_Media_Ref_R$_kWh * Fator_Pressao_Local) / Renda_Referencia_Local) * 100`
- **Metodologia:** Avalia a vulnerabilidade econômica ao custo da energia elétrica caso a família não usufrua integralmente do desconto da Tarifa Social (TSEE) ou sofra acréscimo de consumo por equipamentos ineficientes (geladeiras antigas/ventiladores em uso contínuo).
- **Limitações e Cuidados Interpretativos:** PROXY EXPLORATÓRIA: Como a EPE não divulga consumo por bairro e o Censo 2022 não coleta valor da conta de luz, este indicador estima a sensibilidade orçamentária a partir da renda local observada e de parâmetros médios estaduais, não comprovando pobreza energética individual.

### 24. Índice Exploratório de Vulnerabilidade Socioenergética (IEVS) (`IEVS_EXPLORATORIO`)
- **Dimensão:** Socioenergética | **Classificação:** `Proxy/estimativa` | **Unidade:** `índice (0 a 100)`
- **Escala Geográfica:** Bairro / Setor Censitário / Município | **Ano de Referência:** 2022
- **Variáveis de Origem:** `Subíndices normalizados (0-100): Déficit de Renda (I_Renda), Vulnerabilidade Habitacional/Acesso (I_Hab) e Risco Urbano-Térmico (I_Urb)`
- **Fórmula de Cálculo:** `IEVS = w_renda * I_Renda + w_hab * I_Hab + w_urb * I_Urb (Pesos base: 0.40, 0.30, 0.30)`
- **Metodologia:** Normalização min-max padronizada (0 = menor vulnerabilidade, 100 = maior vulnerabilidade) sobre variáveis oficiais do Censo 2022, acompanhada de teste de sensibilidade sob 4 cenários de pesos.
- **Limitações e Cuidados Interpretativos:** AVISO OBRIGATÓRIO: O IEVS é um instrumento analítico exploratório para priorização territorial e NÃO constitui índice oficial nem medida validada direta de pobreza energética domiciliar.
