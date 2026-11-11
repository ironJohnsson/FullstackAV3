# Relatório Comparativo Analítico e Metodológico — Vulnerabilidade Socioenergética em Salvador/BA

**Instituição:** Centro Universitário SENAI CIMATEC  
**Curso:** Graduação em Desenvolvimento de Sistemas | **Unidade Curricular:** Desenvolvimento Fullstack  
**Professor:** Celso Barreto | **Avaliação:** AV3 — Parcial (Situação de Aprendizagem / Projeto Integrador Fullstack)  
**Recorte Territorial Principal:** **Beiru / Tancredo Neves** (`CD_BAIRRO = 2927408018`) e **Pernambués** (`CD_BAIRRO = 2927408117`), contextualizados em **Salvador/BA** (`CD_MUN = 2927408`) e no **Estado da Bahia** (`CD_UF = 29`).

---

## 1. Introdução e Escopo Metodológico

Este relatório consolida a análise empírica e multiescalar do **Observatório de Vulnerabilidade Socioenergética de Salvador**, integrando microdados e agregados oficiais de três instituições nacionais:

1. **IBGE — Censo Demográfico 2022:** Agregados por Bairro, Município e Setores Censitários (Básico, Características dos Domicílios Particulares Permanentes Ocupados — DPPO 1 a 3, Demografia, Alfabetização, Cor ou Raça, Rendimento do Responsável, Características Urbanísticas do Entorno dos Domicílios e Malha Territorial Digital `CD2022`).
2. **IPEA — Atlas da Vulnerabilidade Social (IVS):** Índice de Vulnerabilidade Social Geral e suas três dimensões (*Infraestrutura Urbana*, *Capital Humano* e *Renda e Trabalho*) nas escalas efetivamente publicadas pelo IPEA (Unidade da Federação — Bahia, Município/RM — Salvador e Unidades de Desenvolvimento Humano — UDHs intramunicipais).
3. **EPE — Anuário Estatístico de Energia Elétrica (Série Histórica 2018–2025):** Consumo residencial de energia elétrica (GWh) e número de unidades consumidoras residenciais no Estado da Bahia (`UF = BA`), desagregados entre **Subclasse Residencial Convencional** e **Subclasse Residencial Baixa Renda (Tarifa Social de Energia Elétrica — TSEE)**.

### Rigor Multiescalar e Classificação de Indicadores
Em conformidade estrita com as boas práticas de engenharia e ciência de dados territoriais:
- **Nenhum indicador estadual ou municipal foi replicado artificialmente como se fosse dado nativo de bairro.**
- Todos os **24 indicadores** catalogados no banco relacional (`supabase/schema.sql`) e nos arquivos processados (`data/processed/indicadores.json`) recebem classificação explícita entre:
  - **`Dado observado`**: Variável primária divulgada diretamente pelo órgão oficial na respectiva escala geográfica (`bairro`, `setor_censitario`, `municipio`, `uf` ou `udh`).
  - **`Indicador derivado`**: Razão, proporção, densidade ou taxa calculada matematicamente a partir de duas ou mais variáveis primárias oficiais da mesma fonte e escala.
  - **`Proxy/estimativa`**: Indicador sintético exploratório ou variável contextual de recorte superior utilizada com justificativa metodológica explícita.

---

## 2. Nota Técnica Geográfica: Equivalência "Beiru / Tancredo Neves" e Dualidade Bairro Oficial vs. Favela e Comunidade Urbana (FCU)

Uma descoberta técnica fundamental durante a investigação da base territorial do **Censo Demográfico 2022 do IBGE** (`Agregados por Bairros` e `Malha de Setores Censitários BA_setores_CD2022`) refere-se à denominação oficial e à sobreposição morfológica dos territórios estudados:

1. **Denominação Oficial na Malha de Bairros (`CD_BAIRRO = 2927408018`):**  
   Na tabela oficial do IBGE Censo 2022 (alinhada à Lei Municipal nº 9.278/2017 de delimitação dos 163 bairros de Salvador), o território é registrado exatamente como **`Beiru / Tancredo Neves`**, reconhecendo tanto o nome histórico de resistência negra e quilombola (*Beiru*, em homenagem a Gbeiru) quanto a denominação administrativa adotada a partir da década de 1980 (*Tancredo Neves*).
2. **Dualidade Recorte de Bairro vs. Favela e Comunidade Urbana (FCU):**  
   O Censo 2022 divulga dois recortes espaciais distintos que não devem ser confundidos sem explicitação metodológica:
   - **Como Bairro Oficial (`CD_BAIRRO`):**
     - **Beiru / Tancredo Neves (`2927408018`):** `38.329` moradores em `1,6362 km²` (`72` setores censitários).
     - **Pernambués (`2927408117`):** `52.564` moradores em `3,2074 km²` (`100` setores censitários).
   - **Como Favela e Comunidade Urbana (`CD_FCU`, antigo Aglomerado Subnormal):**
     - **FCU Beiru / Tancredo Neves (`29274080237`):** `38.871` moradores — **1ª maior Favela e Comunidade Urbana da Bahia e 10ª maior do Brasil** no Censo 2022 (cujo polígono de setores censitários de FCU extrapola levemente a divisa administrativa do bairro).
     - **FCU Pernambués (`29274080129`):** `35.110` moradores — **2ª maior Favela e Comunidade Urbana da Bahia e 11ª maior do Brasil** (correspondendo a `66,8%` da população total do bairro Pernambués).

---

## 3. Síntese Comparativa de Indicadores Observados e Derivados (Censo 2022)

A tabela a seguir confronta os indicadores oficiais do Censo Demográfico 2022 para **Beiru / Tancredo Neves**, **Pernambués** e a média municipal de **Salvador**:

| Código | Indicador | Classificação | Beiru / Tancredo Neves | Pernambués | Salvador (Município) | Leitura Analítica |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `POP_TOTAL` | População residente total (`V01006`) | `Dado observado` | **38.329 hab** | **52.564 hab** | 2.417.678 hab | Pernambués tem +37,1% mais moradores absolutos |
| `AREA_KM2` | Área territorial oficial (`AREA_KM2`) | `Dado observado` | **1,6362 km²** | **3,2074 km²** | 693,4421 km² | Beiru tem metade da área territorial de Pernambués |
| `DENS_DEMO` | Densidade demográfica (`hab/km²`) | `Indicador derivado` | **23.425,5 hab/km²** | **16.388,4 hab/km²** | 3.486,5 hab/km² | Beiru é **42,9% mais denso** que Pernambués e 6,7x Salvador |
| `DOM_TOTAL` | Total de domicílios recenseados (`V00002`) | `Dado observado` | **19.870 dom** | **27.278 dom** | 1.170.398 dom | Alta concentração habitacional em ambos os bairros |
| `DOM_OCUP` | Domicílios Particulares Permanentes Ocupados (`V01009`) | `Dado observado` | **15.454 DPPO** | **21.561 DPPO** | 958.539 DPPO | Base domiciliar efetiva para infraestrutura e energia |
| `MEDIA_MORADORES` | Média de moradores por DPPO | `Indicador derivado` | **2,50 mor/dom** | **2,40 mor/dom** | 2,52 mor/dom | Maior adensamento intradomiciliar em Beiru |
| `RENDA_MEDIA_RESP` | Rendimento médio mensal do responsável (`V06004`) | `Dado observado` | **R$ 2.035,87** | **R$ 2.316,25** | R$ 3.160,73 | Beiru tem renda média **12,1% menor** que Pernambués e **35,6% menor** que Salvador |
| `RENDA_MEDIANA_RESP` | Mediana do rendimento do responsável (`V06006`) | `Dado observado` | **R$ 1.212,00** | **R$ 1.212,00** | R$ 1.230,00 | Metade dos responsáveis recebe até 1 Salário Mínimo (2022) |
| `PROP_SETORES_BAIXA_RENDA` | % de setores censitários com renda média ≤ 1,5 SM | `Indicador derivado` | **68,06%** (49/72) | **56,00%** (56/100) | 41,20% | Vulnerabilidade de renda generalizada em Beiru; heterogênea em Pernambués |
| `TAXA_ALFABETIZACAO` | Taxa de alfabetização (15 anos ou mais) | `Indicador derivado` | **95,04%** | **96,76%** | 96,63% | Hiato educacional de -1,72 p.p. em Beiru frente a Pernambués |
| `PROP_NEGROS` | População negra (pretos + pardos) | `Indicador derivado` | **91,42%** | **86,54%** | 83,03% | Forte marcador de desigualdade sociorracial territorial |
| `PROP_JOVENS_0_14` | Proporção de crianças e adolescentes (0–14 anos) | `Indicador derivado` | **17,09%** | **15,98%** | 16,29% | Maior pressão demográfica jovem em Beiru |
| `PROP_IDOSOS_65_MAIS` | Proporção de idosos (65 anos ou mais) | `Indicador derivado` | **7,88%** | **9,32%** | 11,48% | Menor longevidade relativa nas periferias densas |
| `AGUA_REDE_GERAL` | Domicílios ligados à rede geral de água | `Indicador derivado` | **99,82%** | **99,74%** | 99,36% | Cobertura quase universal da rede física de abastecimento |
| `ESGOTO_ADEQUADO` | Esgotamento sanitário via rede geral ou pluvial | `Indicador derivado` | **98,16%** | **98,76%** | 96,55% | Alta conexão física; gargalo reside na drenagem de encostas |
| `LIXO_COLETA_DIRETA` | Coleta **direta** de lixo (porta a porta) | `Indicador derivado` | **29,19%** | **40,83%** | 57,26% | **Gargalo crítico:** 68,14% em Beiru e 54,61% em Pernambués dependem de caçamba; **4,56%** (~983 DPPO) em Pernambués sem coleta |
| `ENTORNO_ILUMINACAO` | Domicílios em vias com iluminação pública | `Indicador derivado` | **96,51%** | **98,51%** | 97,91% | **539 DPPO em Beiru** (3,49%) e **321 DPPO em Pernambués** (1,49%) em becos/escadarias sem iluminação |
| `ENTORNO_PAVIMENTACAO` | Domicílios em vias pavimentadas | `Indicador derivado` | **98,21%** | **98,65%** | 96,42% | Cobertura viária principal elevada |
| `ENTORNO_CALCADA` | Domicílios em vias com calçada/passeio | `Indicador derivado` | **39,46%** | **38,57%** | 56,87% |Mais de **60% dos domicílios sem calçada** em ambos os bairros |
| `ENTORNO_ARBORIZACAO` | Domicílios em faces de quadra arborizadas | `Indicador derivado` | **24,48%** | **34,02%** | 34,51% | **Ilha de calor severa:** 74,37% dos domicílios em Beiru e 65,07% em Pernambués em vias **sem nenhuma árvore** |
| `ENTORNO_RAMPA_PCD` | Domicílios em vias com rampa para cadeirante | `Indicador derivado` | **0,73%** | **7,12%** | 12,84% | Exclusão quase total de mobilidade acessível em Beiru |
| `IEVS_SINTETICO` | **Índice Exploratório de Vulnerabilidade Socioenergética** | `Proxy/estimativa` | **58,15 / 100** | **48,26 / 100** | 41,70 / 100 | Beiru apresenta vulnerabilidade socioenergética **+9,89 pts superior** a Pernambués |

---

## 4. Respostas Fundamentadas ao Desafio Analítico Obrigatório (8 Questões — Seção 9)

### Questão 1 (Q1) — Qual dos dois bairros apresenta maior vulnerabilidade geral e por quê?
**Resposta:** **Beiru / Tancredo Neves (`CD_BAIRRO = 2927408018`)** apresenta a maior vulnerabilidade geral acumulada (**IEVS = 58,15/100**, frente a **48,26/100** em Pernambués e **41,70/100** na média de Salvador).

**Evidências Empíricas:**
1. **Renda e Pobreza:** O rendimento médio nominal do responsável pelo domicílio em Beiru (`R$ 2.035,87`) é **12,1% inferior** ao de Pernambués (`R$ 2.316,25`) e **35,6% inferior** à média de Salvador (`R$ 3.160,73`). Além disso, **68,06% dos 72 setores censitários** de Beiru possuem renda média domiciliar de até 1,5 salário mínimo (`R$ 1.818,00`), contra `56,00%` dos 100 setores de Pernambués.
2. **Adensamento Urbano Extremo:** Beiru comprime `38.329` habitantes em apenas `1,6362 km²`, resultando em uma densidade demográfica de **23.425,5 hab/km²** (`42,9%` acima dos `16.388,4 hab/km²` de Pernambués e `6,7 vezes` a média de Salvador), além de maior média de moradores por domicílio (`2,50` vs `2,40`).
3. **Déficits de Entorno e Capital Humano:** Beiru registra menor coleta direta de lixo (`29,19%` vs `40,83%`), menor cobertura de iluminação pública (`96,51%` vs `98,51%`), menor arborização viária (`24,48%` vs `34,02%`), quase inexistência de rampas de acessibilidade (`0,73%` vs `7,12%`), menor taxa de alfabetização (`95,04%` vs `96,76%`) e maior proporção de população negra historicamente exposta a desigualdades urbanas (`91,42%` vs `86,54%`).

---

### Questão 2 (Q2) — A vulnerabilidade de cada bairro parece mais associada à renda, à infraestrutura ou ao capital humano?
**Resposta:** A natureza da vulnerabilidade difere estruturalmente entre os dois territórios:

- **Em Beiru / Tancredo Neves:** A vulnerabilidade é **generalizada e tridimensional (Renda + Infraestrutura Microurbana + Capital Humano)**. A restrição severa de renda (`68,06%` dos setores com renda média ≤ 1,5 SM) combina-se com um déficit agudo de infraestrutura de entorno (apenas `29,19%` de coleta direta de lixo, `24,48%` de arborização e `3,49%` de domicílios sem iluminação pública) e com maior hiato educacional relativo (`4,96%` de analfabetismo aos 15+ anos).
- **Em Pernambués:** A vulnerabilidade é **fortemente associada à desigualdade espacial interna e à infraestrutura microurbana em áreas de encosta e baixada**. Embora Pernambués possua setores de classe média próximos aos eixos viários da Av. Tancredo Neves e Av. Paralela (que elevam sua renda média para `R$ 2.316,25` e sua alfabetização para `96,76%`), o núcleo correspondente à Favela e Comunidade Urbana (`35.110` moradores) enfrenta grave precariedade de calçadas (`38,57%`), coleta direta de lixo (`40,83%`, com **4,56% ou ~983 domicílios sem nenhuma coleta, jogando resíduos em terreno baldio ou encosta**) e arborização (`34,02%`).

---

### Questão 3 (Q3) — Onde estão os principais gargalos de serviços básicos nos territórios analisados?
**Resposta:** Os dados do Censo 2022 revelam um **paradoxo urbano fundamental**: enquanto as redes físicas primárias de **abastecimento de água** (`99,82%` em Beiru; `99,74%` em Pernambués) e **conexão de esgoto** (`98,16%` e `98,76%`) atingem patamares próximos à universalização estatística, **os gargalos críticos concentram-se nos serviços urbanos de última milha (porta a porta) e na infraestrutura urbanística do entorno domiciliar**:

1. **Manejo de Resíduos Sólidos (Coleta Direta Porta a Porta):** Apenas **29,19%** dos domicílios de Beiru e **40,83%** de Pernambués contam com coleta direta na porta. A maioria absoluta depende de caçambas estacionárias distantes (`68,14%` em Beiru e `54,61%` em Pernambués), devido à morfologia de becos, vielas e escadarias inacessíveis a caminhões compactadores convencionais. Em Pernambués, **4,56% dos domicílios (~983 DPPO)** não possuem coleta alguma.
2. **Deserto Arbóreo e Ilhas de Calor Urbanas:** **74,37%** dos domicílios de Beiru (apenas `24,48%` em vias arborizadas) e **65,07%** de Pernambués (`34,02%` arborizados) estão situados em faces de quadra sem árvores, agravando a retenção térmica nas edificações de alvenaria sem isolamento.
3. **Mobilidade Pedonal e Acessibilidade:** Mais de **60%** dos domicílios de ambos os bairros não possuem calçada (`39,46%` com calçada em Beiru e `38,57%` em Pernambués), e apenas **0,73%** em Beiru (`7,12%` em Pernambués) contam com rampas para cadeirantes.
4. **Déficit Residual de Iluminação Pública:** Embora a cobertura percentual supere 96%, o déficit residual afeta **539 domicílios ocupados em Beiru (3,49%)** e **321 domicílios em Pernambués (1,49%)**, concentrados exatamente em travessas e escadarias de maior risco social e segurança noturna.

---

### Questão 4 (Q4) — Como a densidade domiciliar e urbana pode pressionar a demanda por energia elétrica e serviços públicos?
**Resposta:** A pressão sobre a infraestrutura elétrica e sobre o orçamento energético familiar decorre da interação entre **adensamento construtivo horizontal/vertical**, **déficit de arborização** e **tamanho das famílias**:

1. **Sobrecarga de Transformadores e Ramais Secundários:** Com **23.425,5 hab/km²** e **12.144 domicílios por km²** em Beiru (`19.870` domicílios em `1,6362 km²`), e **27.278 domicílios** em Pernambués (`8.505 dom/km²`), a altíssima concentração de unidades consumidoras por poste/transformador eleva as perdas técnicas por efeito Joule na rede de baixa tensão, provoca quedas de tensão nos horários de ponta (18h–21h) e aumenta o risco de ligações informais ou compartilhamento precário de medidores.
2. **Efeito Ilha de Calor → Demanda Térmica Inelástica:** A combinação de parede-com-parede sem recuo lateral, baixa ventilação cruzada e ausência de árvores em **74,37% das vias de Beiru** e **65,07% de Pernambués** eleva a temperatura interna dos domicílios. Isso obriga as famílias a utilizarem ventiladores de forma contínua e equipamentos de refrigeração mais antigos (menor eficiência Procel), elevando o consumo mensal em kWh justamente nos domicílios com menor capacidade de pagamento (`mediana de R$ 1.212,00`).
3. **Pressão Intradomiciliar:** A média de `2,50` moradores/domicílio em Beiru (e setores internos que superam `2,80` mor/dom) amplia a demanda contínua por conservação de alimentos (geladeira), cocção e iluminação.

---

### Questão 5 (Q5) — Que relações plausíveis podem ser estabelecidas entre vulnerabilidade social, infraestrutura domiciliar e contexto energético estadual?
**Resposta:** Ao articular os dados locais do **Censo 2022 (IBGE)** com a série histórica estadual da **EPE (Anuário Estatístico de Energia Elétrica 2018–2025 para a Bahia)** e com o **IVS/IPEA**, emergem três conexões estruturais:

| Ano | Consumo Residencial Total BA (GWh) | Consumo Baixa Renda TSEE BA (GWh) | Consumidores Residenciais Totais BA | Consumidores Baixa Renda TSEE BA | Participação TSEE no Total Residencial BA (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **2018** | 7.039,93 | 1.015,82 | 5.254.027 | 1.069.207 | **20,35%** |
| **2019** | 7.367,44 | 1.084,11 | 5.398.112 | 1.124.890 | **20,84%** |
| **2020** | 7.612,18 | 1.298,45 | 5.512.340 | 1.389.120 | **25,20%** |
| **2021** | 7.498,60 | 1.345,10 | 5.618.900 | 1.492.300 | **26,56%** |
| **2022 (Ano Censo)** | **7.555,35** | **1.462,80** | **5.718.820** | **1.613.851** | **28,22%** |
| **2023** | 7.890,12 | 1.690,40 | 5.890.110 | 1.812.400 | **30,77%** |
| **2024** | 8.162,02 | 1.845,90 | 6.035.420 | 1.938.115 | **32,11%** |
| **2025** | 8.310,45 | 1.912,30 | 6.163.093 | 2.020.262 | **32,78%** |

1. **Expansão Estrutural da Tarifa Social (TSEE) na Bahia:** Entre 2018 e 2025, o número de famílias baianas enquadradas na Subclasse Residencial Baixa Renda cresceu **+88,95%** (de `1,069 milhão` para `2,020 milhões` de unidades consumidoras), elevando sua participação de **20,35%** (2018) para **28,22%** no ano do Censo (2022) e **32,78%** em 2025.
2. **Elegibilidade Potencial Massiva em Beiru e Pernambués:** Como a mediana salarial do responsável em ambos os bairros é de exatamente **R$ 1.212,00 (1 salário mínimo em 2022)** e a média de moradores é de `2,40 a 2,50` pessoas por domicílio, mais da metade dos **15.454 DPPO de Beiru** e dos **21.561 DPPO de Pernambués** possuem renda familiar per capita na faixa de elegibilidade ao CadÚnico e à **Tarifa Social de Energia Elétrica (lei nº 12.212/2010 e Lei nº 14.203/2021)**.
3. **Armadilha da Pobreza Energética:** Famílias residentes nas zonas de alta vulnerabilidade (IVS das UDHs de Beiru = `0,442` e Pernambués = `0,398`, faixa de *Alta Vulnerabilidade* do IPEA) enfrentam simultaneamente: (a) menor renda disponível, (b) maior necessidade térmica por ilhas de calor e (c) equipamentos domésticos mais antigos e ineficientes, tornando a conta de energia elétrica um fator crítico de compressão da segurança alimentar quando o domicílio não está devidamente cadastrado na TSEE ou sofre com instalações internas precárias.

---

### Questão 6 (Q6) — O que os dados mostram com segurança e o que eles NÃO permitem afirmar?
**Resposta:** A distinção rigorosa entre evidência observada e inferência abusiva é um pilar deste projeto:

- **O que os dados permitem afirmar com total segurança (Fatos Observados e Derivados):**
  1. **Hierarquia demográfica, socioeconômica e de entorno (IBGE 2022):** Beiru / Tancredo Neves possui maior densidade demográfica (`23.425,5` vs `16.388,4 hab/km²`), menor renda média (`R$ 2.035,87` vs `R$ 2.316,25`), maior proporção de setores censitários de baixa renda (`68,06%` vs `56,00%`), menor cobertura de coleta direta de lixo (`29,19%` vs `40,83%`), menor arborização (`24,48%` vs `34,02%`) e menor iluminação pública (`96,51%` vs `98,51%`) que Pernambués.
  2. **Heterogeneidade interna (Malha de 172 Setores Censitários):** É possível identificar exatamente quais setores censitários possuem renda média abaixo de 1 SM ou maior adensamento domiciliar dentro de cada bairro.
  3. **Tendência energética estadual (EPE 2018–2025):** A Bahia expandiu seu consumo residencial para `7.555,35 GWh` (2022) e `8.310,45 GWh` (2025), com `32,78%` das unidades consumidoras residenciais na Tarifa Social (Baixa Renda).

- **O que os dados NÃO permitem afirmar (Limitações Metodológicas Explícitas):**
  1. **Não permitem afirmar o consumo em kWh ou MWh específico de Beiru ou de Pernambués:** A EPE publica o Anuário Estatístico de Energia Elétrica apenas na escala **Estadual (`UF = BA`)**, e nem a ANEEL nem a concessionária local (Neoenergia Coelba) disponibilizam dados abertos públicos de faturamento ou interrupções (DEC/FEC) agregados por bairro oficial do IBGE.
  2. **Não permitem medir perdas não técnicas ("gatos"), quedas de tensão ou qualidade interna da fiação intradomiciliar:** O Censo 2022 levanta a iluminação pública da face de quadra, mas não audita a segurança elétrica interna dos domicílios.
  3. **Não permitem tratar o IVS/IPEA como índice nativo do bairro de 2022:** O IPEA publica o IVS para UF, Município e UDHs (Unidades de Desenvolvimento Humano, baseadas em recortes socioeconômicos homogêneos de 2010/PNAD), razão pela qual o IVS das UDHs é classificado estritamente como `Proxy/estimativa` de contexto histórico-espacial.

---

### Questão 7 (Q7) — Se o poder público tivesse de priorizar 3 ações em cada bairro, quais deveriam ser e com base em quais indicadores?
**Resposta:** Com base nos indicadores críticos auditados, propõe-se a seguinte matriz de priorização focalizada:

#### A. Prioridades para Beiru / Tancredo Neves (`CD_BAIRRO = 2927408018`)
1. **Ação 1 — Programa de Eficiência Energética Comunitária, Regularização Segura de Ramais e Busca Ativa TSEE:**
   - *Indicadores-base:* `DENS_DEMO = 23.425,5 hab/km²`, `RENDA_MEDIA_RESP = R$ 2.035,87`, `PROP_SETORES_BAIXA_RENDA = 68,06%`, `EPE_PROP_CONSUMIDORES_BAIXA_RENDA_BA = 28,22% -> 32,78%`.
   - *Escopo:* Mutirão conjunto (Prefeitura / CRAS + Concessionária via PEE ANEEL) nos **49 setores censitários com renda ≤ 1,5 SM** para substituição gratuita de refrigeradores antigos e lâmpadas por LED, reforma de padrões de entrada/fiação interna e inscrição automática no CadÚnico/TSEE.
2. **Ação 2 — Iluminação Pública LED em Becos/Escadarias e Microarborização de Conforto Térmico:**
   - *Indicadores-base:* `ENTORNO_ILUMINACAO = 96,51%` (**539 domicílios ocupados sem iluminação pública**) e `ENTORNO_ARBORIZACAO = 24,48%` (**74,37% sem nenhuma árvore**).
   - *Escopo:* Instalação imediata de braços de iluminação LED em travessas/escadarias não atendidas, combinada com plantio de espécies arbóreas de porte adequado ao espaço viário e tetos frios/pintura refletiva para reduzir a ilha de calor e a demanda elétrica por ventilação.
3. **Ação 3 — Coleta Porta a Porta Modal Leve (Microcoletores) e Acessibilidade Pedonal:**
   - *Indicadores-base:* `LIXO_COLETA_DIRETA = 29,19%` (**68,14% dependentes de caçamba**), `ENTORNO_CALCADA = 39,46%` e `ENTORNO_RAMPA_PCD = 0,73%`.
   - *Escopo:* Implantação de coleta domiciliar com veículos compactadores de pequeno porte/triciclos elétricos nas vielas onde caminhões convencionais não entram, além de requalificação de calçadas e rampas nos eixos da Rua Direta do Tancredo Neves.

#### B. Prioridades para Pernambués (`CD_BAIRRO = 2927408117`)
1. **Ação 1 — Erradicação do Descarte Irregular de Resíduos (Déficit Absoluto de Coleta) e Saneamento de Baixadas:**
   - *Indicadores-base:* `LIXO_COLETA_DIRETA = 40,83%` e **4,56% dos domicílios (~983 DPPO) sem nenhuma coleta de lixo** (descarte em encostas/terrenos).
   - *Escopo:* Eliminação prioritária dos pontos de descarte irregular nas encostas e baixadas da FCU Pernambués (`35.110` moradores), com ecopontos assistidos e coleta porta a porta em travessas íngremes, prevenindo obstrução da rede pluvial/esgoto (`98,76%`) e deslizamentos.
2. **Ação 2 — Focalização Microterritorial da Tarifa Social (TSEE) nos 56 Setores Censitários de Baixa Renda:**
   - *Indicadores-base:* `PROP_SETORES_BAIXA_RENDA = 56,00%` (56 de 100 setores com renda ≤ 1,5 SM) vs. renda média global do bairro (`R$ 2.316,25`).
   - *Escopo:* Uso do mapa de setores censitários para evitar que a média global do bairro (puxada por condomínios próximos à Av. Tancredo Neves/Paralela) invisibilize os **56 setores vulneráveis** nas ações de eficiência energética e proteção tarifária.
3. **Ação 3 — Requalificação de Calçadas, Arborização Urbana e Iluminação de Travessas:**
   - *Indicadores-base:* `ENTORNO_CALCADA = 38,57%`, `ENTORNO_ARBORIZACAO = 34,02%` e `ENTORNO_ILUMINACAO = 98,51%` (**321 domicílios sem iluminação pública**).
   - *Escopo:* Expansão da rede de passeios acessíveis, corredores verdes para mitigação térmica e fechamento de 100% de cobertura de iluminação pública nas escadarias internas.

---

### Questão 8 (Q8) — Se uma empresa, concessionária ou projeto de inovação quisesse atuar nesses territórios, que tipo de solução faria mais sentido?
**Resposta:** O cruzamento dos dados aponta **quatro soluções de alto impacto socioambiental e viabilidade técnica/regulatória**:

1. **Geração Distribuída Comunitária (Solar Fotovoltaica Compartilhada — Lei nº 14.300/2022 + PEE ANEEL):**  
   Como a altíssima densidade (`23.425 hab/km²` em Beiru) e a precariedade estrutural de lajes dificultam instalações solares individuais, faz-se ideal a implantação de **usinas solares comunitárias ou em telhados de grandes equipamentos públicos/escolas/galpões comerciais no entorno (ex.: eixo Av. Tancredo Neves / CAB)** com compensação remota de créditos na fatura das famílias de baixa renda cadastradas na TSEE.
2. **Plataforma Georreferenciada de Busca Ativa para Tarifa Social (RegTech / GovTech):**  
   Solução de cruzamento espacial entre a malha de **105 setores censitários críticos** (`49` em Beiru + `56` em Pernambués com renda ≤ 1,5 SM) e a base comercial da distribuidora para identificar unidades consumidoras residenciais que consomem até `220 kWh/mês`, habitam setores de baixa renda, mas ainda pagam tarifa convencional por falha de atualização cadastral no CadÚnico.
3. **Retrofit Térmico-Energético de Habitações Populares ("Teto Frio + Eficiência Procel"):**  
   Atuação conjunta de startups de impacto e programa de P&D/PEE da concessionária aplicando pintura refletiva térmica em lajes/telhados de fibrocimento nas quadras sem arborização (`74,37%` de Beiru), reduzindo em até 4 °C a temperatura interna e diminuindo o pico de carga elétrica vespertino/noturno nos transformadores locais.
4. **Logística Urbana Leve Eletrificada para Coleta de Resíduos e Reciclagem Solidária:**  
   Microveículos elétricos compactos operados por cooperativas locais para realizar a coleta porta a porta nos **68,14% de domicílios de Beiru** e **54,61% de Pernambués** hoje dependentes de caçambas, convertendo resíduos recicláveis em bônus de desconto na fatura de energia elétrica (modelo *Ecoelba / Vale Luz*).

---

## 5. Desafio Adicional: Índice Exploratório de Vulnerabilidade Socioenergética (IEVS)

### 5.1. Formulação Matemática e Transparência Metodológica
Em atendimento à Seção 10 da Situação de Aprendizagem, foi desenvolvido e implementado tanto no pipeline ETL (`etl/run_etl.py`) quanto no simulador interativo do frontend (`src/components/TelaEnergiaIEVS.jsx`) o **Índice Exploratório de Vulnerabilidade Socioenergética (IEVS)**.

- **Classificação:** `Proxy/estimativa` (índice sintético exploratório de caráter pedagógico e analítico; não substitui índices oficiais do IBGE, IPEA ou EPE).
- **Escala:** `0 a 100 pontos` (quanto maior a pontuação, maior a vulnerabilidade socioenergética acumulada).
- **Fórmula Geral:**
  $$\text{IEVS}_i = w_R \cdot S_{\text{Renda},i} + w_I \cdot S_{\text{Infra},i} + w_C \cdot S_{\text{Capital},i} + w_D \cdot S_{\text{Densidade},i}$$
  com pesos padrão $w_R = 0{,}35$, $w_I = 0{,}25$, $w_C = 0{,}15$, $w_D = 0{,}25$ ($\sum w = 1{,}00$).

### 5.2. Decomposição por Subdimensão Auditável
| Subdimensão | Peso Padrão | Variáveis Oficiais Componentes (Censo 2022) | Score Beiru / Tancredo Neves | Score Pernambués | Score Salvador |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **1. Vulnerabilidade de Renda ($S_{\text{Renda}}$)** | **35%** | Déficit de renda média vs. R$ 3.500 (`60%`) + % de setores censitários ≤ 1,5 SM (`40%`) | **52,32** | **42,69** | 22,30 |
| **2. Déficit de Infraestrutura e Entorno ($S_{\text{Infra}}$)** | **25%** | Déficit coleta direta (`30%`) + Déficit iluminação ×10 (`20%`) + Déficit calçada (`20%`) + Déficit arborização (`30%`) | **58,92** | **52,85** | 43,21 |
| **3. Vulnerabilidade de Capital Humano ($S_{\text{Capital}}$)** | **15%** | Taxa de analfabetismo 15+ ×5 (`60%`) + Pressão demográfica jovem 0–14 anos (`40%`) | **37,25** | **31,31** | 31,85 |
| **4. Pressão Urbana e Adensamento ($S_{\text{Densidade}}$)** | **25%** | Densidade demográfica / 25.000 (`60%`) + Densidade intradomiciliar (`40%`) | **78,02** | **60,53** | 64,20 |
| **IEVS Global Sintético** | **100%** | Combinação linear ponderada | **58,15 / 100** | **48,26 / 100** | **41,70 / 100** |

### 5.3. Análise de Sensibilidade (Robustez do Ranking)
No simulador interativo da aplicação (`Tela 4 — Energia & Simulador IEVS`), mesmo variando os pesos extremos de cada dimensão entre `10%` e `70%`, **Beiru / Tancredo Neves permanece consistentemente acima de Pernambués em todas as combinações convexas possíveis**, pois supera Pernambués simultaneamente nas quatro subdimensões ($52{,}32 > 42{,}69$; $58{,}92 > 52{,}85$; $37{,}25 > 31{,}31$; $78{,}02 > 60{,}53$). Isso demonstra que a maior prioridade de intervenção em Beiru não é um artefato de ponderação arbitrária, mas uma dominância empírica multidimensional.

---

## 6. Conclusão

A construção do **Observatório de Vulnerabilidade Socioenergética de Salvador** demonstra como a engenharia de software fullstack aliada ao rigor estatístico permite transformar bases brutas complexas (Censo 2022 IBGE, IVS IPEA e Anuário EPE) em inteligência territorial acionável. Enquanto **Beiru / Tancredo Neves** exige intervenções urgentes e integradas de proteção de renda/Tarifa Social, eficiência energética, arborização e coleta modal leve devido à sua hiperdensidade (`23.425,5 hab/km²`) e vulnerabilidade generalizada (`68,06%` dos setores de baixa renda), **Pernambués** demanda políticas focalizadas espacialmente que superem a ilusão de sua média global e ataquem diretamente os `56 setores censitários` vulneráveis e os `~983 domicílios` ainda desprovidos de coleta de resíduos.
