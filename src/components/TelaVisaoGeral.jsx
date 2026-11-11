import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Home,
  DollarSign,
  TreePine,
  Zap,
  GraduationCap,
  MapPin,
  Info,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  formatNumber,
  formatCurrency,
  formatValueByUnit,
  getClassificacaoBadgeStyle,
  getDimensaoColor,
} from '../utils/formatters';
import { queryObservacoesDetalhadas } from '../services/observatorioService';

const TERRITORY_OPTIONS = [
  { code: '2927408018', label: 'Beiru / Tancredo Neves (Bairro Oficial - IBGE 2927408018)' },
  { code: '2927408117', label: 'Pernambués (Bairro Oficial - IBGE 2927408117)' },
  { code: '2927408', label: 'Salvador (Referência Municipal - IBGE 2927408)' },
];

const RACE_COLORS = ['#0ea5e9', '#6366f1', '#94a3b8'];

export default function TelaVisaoGeral({ data, selectedBairro, setSelectedBairro, onNavigateTab }) {
  const [dimFilter, setDimFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [fonteFilter, setFonteFilter] = useState('ALL');

  const activeCode = selectedBairro === 'BOTH' ? '2927408018' : selectedBairro;
  const perfil = data.perfisTerritoriais[activeCode] || data.perfisTerritoriais['2927408018'];
  const beiru = data.perfisTerritoriais['2927408018'];
  const pern = data.perfisTerritoriais['2927408117'];
  const ssa = data.perfisTerritoriais['2927408'];

  const filteredObs = useMemo(() => {
    return queryObservacoesDetalhadas(data, {
      territorioCodigo: activeCode,
      dimensao: dimFilter,
      classificacao: classFilter,
      fonteInstituicao: fonteFilter,
    });
  }, [data, activeCode, dimFilter, classFilter, fonteFilter]);

  const infraChartData = useMemo(() => {
    return [
      {
        indicador: 'Água Rede Geral',
        [perfil.nome]: perfil.ACESSO_AGUA_REDE,
        Salvador: ssa.ACESSO_AGUA_REDE,
      },
      {
        indicador: 'Esgoto Adequado',
        [perfil.nome]: perfil.ESGOTO_REDE_ADEQUADO,
        Salvador: ssa.ESGOTO_REDE_ADEQUADO,
      },
      {
        indicador: 'Iluminação Pública',
        [perfil.nome]: perfil.ENTORNO_ILUMINACAO_PUBLICA,
        Salvador: ssa.ENTORNO_ILUMINACAO_PUBLICA,
      },
      {
        indicador: 'Coleta Direta Lixo',
        [perfil.nome]: perfil.COLETA_LIXO_DIRETA,
        Salvador: ssa.COLETA_LIXO_DIRETA,
      },
      {
        indicador: 'Calçada / Passeio',
        [perfil.nome]: perfil.ENTORNO_CALCADA,
        Salvador: ssa.ENTORNO_CALCADA,
      },
      {
        indicador: 'Arborização (≥1 árv.)',
        [perfil.nome]: perfil.ENTORNO_ARBORIZACAO,
        Salvador: ssa.ENTORNO_ARBORIZACAO,
      },
      {
        indicador: 'Rampa Cadeirante',
        [perfil.nome]: perfil.ENTORNO_RAMPA_CADEIRANTE,
        Salvador: ssa.ENTORNO_RAMPA_CADEIRANTE,
      },
    ];
  }, [perfil, ssa]);

  const ageChartData = useMemo(() => {
    return [
      {
        faixa: '0 a 14 anos (Jovens)',
        'Beiru / Tancredo Neves': beiru.PERC_POP_0_14,
        Pernambués: pern.PERC_POP_0_14,
        Salvador: ssa.PERC_POP_0_14,
      },
      {
        faixa: '15 a 59 anos (Ativa)',
        'Beiru / Tancredo Neves': beiru.PERC_POP_15_59,
        Pernambués: pern.PERC_POP_15_59,
        Salvador: ssa.PERC_POP_15_59,
      },
      {
        faixa: '60+ anos (Idosos)',
        'Beiru / Tancredo Neves': beiru.PERC_POP_60_MAIS,
        Pernambués: pern.PERC_POP_60_MAIS,
        Salvador: ssa.PERC_POP_60_MAIS,
      },
    ];
  }, [beiru, pern, ssa]);

  const racePieData = useMemo(() => {
    return [
      { name: 'Parda', value: perfil.PERC_POP_PARDA },
      { name: 'Preta', value: perfil.PERC_POP_PRETA },
      { name: 'Branca e Outras', value: Number((100 - perfil.PERC_POP_NEGRA).toFixed(2)) },
    ];
  }, [perfil]);

  const kpiCards = [
    {
      title: 'População Residente',
      value: formatNumber(perfil.POP_RESIDENTE),
      unit: 'habitantes',
      subtitle: `Densidade: ${formatNumber(perfil.DENSIDADE_DEMOGRAFICA, 1)} hab/km² (${formatNumber(perfil.AREA_KM2, 2)} km²)`,
      source: 'IBGE - Censo 2022 (V0001)',
      year: '2022',
      scale: activeCode === '2927408' ? 'Município' : 'Bairro Oficial',
      classification: 'Dado observado',
      icon: Users,
      accent: '#38bdf8',
    },
    {
      title: 'Domicílios Ocupados (DPPO)',
      value: formatNumber(perfil.DOM_OCUPADOS),
      unit: `de ${formatNumber(perfil.DOM_TOTAIS)} totais`,
      subtitle: `Média: ${formatNumber(perfil.MEDIA_MORADORES_DOM, 2)} mor/dom | 6+ mor.: ${formatNumber(perfil.ADENSAMENTO_DOMICILIAR_6MAIS, 2)}%`,
      source: 'IBGE - Censo 2022 (V00001 / V0005)',
      year: '2022',
      scale: activeCode === '2927408' ? 'Município' : 'Bairro Oficial',
      classification: 'Dado observado',
      icon: Home,
      accent: '#10b981',
    },
    {
      title: 'Rendimento Médio / Mediano',
      value: formatCurrency(perfil.RENDA_MEDIA_RESP),
      unit: `Mediana: ${formatCurrency(perfil.RENDA_MEDIANA_RESP)}`,
      subtitle: `${formatNumber(perfil.PERC_SETORES_BAIXA_RENDA, 1)}% dos setores com renda média ≤ 1,5 SM`,
      source: 'IBGE - Censo 2022 (V06004 / V06006)',
      year: '2022',
      scale: activeCode === '2927408' ? 'Município' : 'Bairro Oficial',
      classification: 'Dado observado',
      icon: DollarSign,
      accent: '#f59e0b',
    },
    {
      title: 'Taxa de Alfabetização (15+)',
      value: `${formatNumber(perfil.TAXA_ALFABETIZACAO_15MAIS, 2)}%`,
      unit: `${formatNumber(perfil.PESSOAS_NAO_ALFABETIZADAS_15MAIS)} não alfabetizados`,
      subtitle: `População Negra (Preta + Parda): ${formatNumber(perfil.PERC_POP_NEGRA, 2)}%`,
      source: 'IBGE - Censo 2022 (V00900 / V00901)',
      year: '2022',
      scale: activeCode === '2927408' ? 'Município' : 'Bairro Oficial',
      classification: 'Indicador derivado',
      icon: GraduationCap,
      accent: '#a855f7',
    },
    {
      title: 'Déficit de Arborização no Entorno',
      value: `${formatNumber(perfil.ENTORNO_SEM_ARVORES, 2)}%`,
      unit: 'faces sem árvores',
      subtitle: `Apenas ${formatNumber(perfil.ENTORNO_ARBORIZACAO, 2)}% com ≥1 árvore | Calçada: ${formatNumber(perfil.ENTORNO_CALCADA, 1)}%`,
      source: 'IBGE - Censo 2022 Entorno (V05030)',
      year: '2022',
      scale: activeCode === '2927408' ? 'Município' : 'Bairro Oficial',
      classification: 'Indicador derivado',
      icon: TreePine,
      accent: '#06b6d4',
    },
    {
      title: 'IEVS Exploratório (Cenário Base)',
      value: `${formatNumber(perfil.IEVS_EXPLORATORIO, 2)}`,
      unit: '/ 100 pontos',
      subtitle: `Risco Térmico: ${formatNumber(perfil.PROXY_RISCO_TERMICO_URBANO, 1)} | Pressão Tarifária: ${formatNumber(perfil.PROXY_COMPROMETIMENTO_RENDA_ENERGIA, 1)}%`,
      source: 'Observatório (IBGE + Contexto EPE)',
      year: '2022',
      scale: 'Bairro (Índice Exploratório)',
      classification: 'Proxy/estimativa',
      icon: Zap,
      accent: '#f43f5e',
    },
  ];

  return (
    <div className="screen-container">
      {/* Barra de Seleção Territorial e Metadados Visíveis */}
      <div className="control-panel-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">TELA 1 — VISÃO GERAL DO TERRITÓRIO</span>
            <h2 className="section-title">
              Caracterização Socioeconômica, Habitacional, Urbana e Socioenergética
            </h2>
          </div>
          <div className="territory-selector-group">
            <label htmlFor="select-territorio-visao" className="control-label">
              <MapPin size={15} /> Território em Foco:
            </label>
            <select
              id="select-territorio-visao"
              className="select-input highlight-select"
              value={activeCode}
              onChange={(e) => setSelectedBairro(e.target.value)}
            >
              {TERRITORY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="QuickSwitchPills">
          {TERRITORY_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              className={`territory-pill ${activeCode === opt.code ? 'active' : ''}`}
              onClick={() => setSelectedBairro(opt.code)}
            >
              {opt.code === '2927408018' && '📍 Beiru / Tancredo Neves (38.329 hab.)'}
              {opt.code === '2927408117' && '📍 Pernambués (52.564 hab.)'}
              {opt.code === '2927408' && '🏙️ Salvador — Referência Municipal (2,42 mi hab.)'}
            </button>
          ))}
        </div>

        {/* Nota Metodológica de Equivalência Geográfica visível na Tela 1 */}
        <div className="methodology-banner">
          <Info size={18} className="banner-icon" />
          <div>
            <strong>Equivalência Geográfica e Escala Oficial (IBGE Censo 2022):</strong> Na malha oficial de Bairros de Salvador (Lei Municipal nº 9.278/2017), o território é denominado oficialmente{' '}
            <code>Beiru / Tancredo Neves</code> (código IBGE <code>2927408018</code>, com <strong>38.329 moradores</strong> e <strong>1,64 km²</strong>) e{' '}
            <code>Pernambués</code> (código IBGE <code>2927408117</code>, com <strong>52.564 moradores</strong> e <strong>3,21 km²</strong>). Já no recorte específico de{' '}
            <em>Favelas e Comunidades Urbanas (FCU)</em> do Censo 2022, a FCU Beiru/Tancredo Neves possui <strong>38.871 moradores</strong> (1ª maior da Bahia e 10ª do Brasil) e a FCU Pernambués possui{' '}
            <strong>35.110 moradores</strong> (2ª da Bahia e 11ª do Brasil, correspondendo a 66,8% da população do bairro oficial).
          </div>
        </div>
      </div>

      {/* Grid de 6 KPI Cards Principais com Origem, Escala, Ano e Classificação */}
      <div className="kpi-grid">
        {kpiCards.map((card, idx) => {
          const IconComp = card.icon;
          const badge = getClassificacaoBadgeStyle(card.classification);
          return (
            <div key={idx} className="kpi-card" style={{ borderTop: `3px solid ${card.accent}` }}>
              <div className="kpi-card-top">
                <span className="kpi-title">{card.title}</span>
                <span
                  className="kpi-icon-badge"
                  style={{ background: `${card.accent}20`, color: card.accent }}
                >
                  <IconComp size={18} />
                </span>
              </div>
              <div className="kpi-main-value">
                <span className="kpi-number">{card.value}</span>
                <span className="kpi-unit">{card.unit}</span>
              </div>
              <p className="kpi-subtitle">{card.subtitle}</p>
              <div className="kpi-meta-footer">
                <span
                  className="classification-pill"
                  style={{
                    background: badge.bg,
                    borderColor: badge.border,
                    color: badge.text,
                  }}
                >
                  {badge.short}
                </span>
                <span className="meta-tag">📊 {card.source}</span>
                <span className="meta-tag">🗓️ Ref: {card.year}</span>
                <span className="meta-tag">🗺️ {card.scale}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos de Caracterização do Território */}
      <div className="charts-two-col">
        {/* Gráfico 1: Infraestrutura Habitacional e Entorno Urbano */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <span className="chart-tag">IBGE — CENSO 2022 (DOMICÍLIOS E ENTORNO) | ANO: 2022</span>
              <h3>Infraestrutura Habitacional e Condições Urbanas: {perfil.nome} vs Salvador (%)</h3>
            </div>
          </div>
          <p className="chart-description">
            Embora o acesso físico à água e iluminação pública supere 96%, observa-se forte déficit em{' '}
            <strong>coleta de lixo direta porta a porta</strong> ({formatNumber(perfil.COLETA_LIXO_DIRETA, 1)}%),{' '}
            <strong>presença de calçadas</strong> ({formatNumber(perfil.ENTORNO_CALCADA, 1)}%),{' '}
            <strong>arborização viária</strong> ({formatNumber(perfil.ENTORNO_ARBORIZACAO, 1)}%) e{' '}
            <strong>acessibilidade por rampa</strong> ({formatNumber(perfil.ENTORNO_RAMPA_CADEIRANTE, 2)}%).
          </p>
          <div className="chart-wrapper" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={infraChartData}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 36, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" unit="%" />
                <YAxis type="category" dataKey="indicador" stroke="#cbd5e1" width={135} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${formatNumber(value, 2)}%`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Legend />
                <Bar dataKey={perfil.nome} fill="#38bdf8" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Salvador" fill="#64748b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Perfil Demográfico (Estrutura Etária e Composição Racial) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <span className="chart-tag">IBGE — CENSO 2022 (DEMOGRAFIA E COR/RAÇA) | ANO: 2022</span>
              <h3>Composição Etária Comparada e Perfil Racial de {perfil.nome}</h3>
            </div>
          </div>
          <p className="chart-description">
            Em <strong>{perfil.nome}</strong>, a população negra (preta + parda) representa{' '}
            <strong>{formatNumber(perfil.PERC_POP_NEGRA, 2)}%</strong> dos residentes (sendo{' '}
            {formatNumber(perfil.PERC_POP_PRETA, 2)}% pretos e {formatNumber(perfil.PERC_POP_PARDA, 2)}% pardos), e a
            razão de dependência etária é de <strong>{formatNumber(perfil.RAZAO_DEPENDENCIA_ETARIA, 2)}%</strong>.
          </p>
          <div className="dual-mini-charts">
            <div style={{ flex: 1.25, height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="faixa" stroke="#cbd5e1" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" unit="%" />
                  <Tooltip
                    formatter={(val) => [`${formatNumber(val, 2)}%`, '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Beiru / Tancredo Neves" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pernambués" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Salvador" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 0.9, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                Autodeclaração Racial ({perfil.nome})
              </span>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={racePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {racePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RACE_COLORS[index % RACE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${formatNumber(val, 2)}%`, 'Participação']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo Relacional de Observações do Território Selecionado (Filtro por Dimensão, Classificação e Fonte) */}
      <div className="table-section-card">
        <div className="table-header-bar">
          <div>
            <span className="section-eyebrow">CONSULTA RELACIONAL (TABELA `observacoes` JOIN `indicadores` JOIN `fontes`)</span>
            <h3>Todos os Indicadores de {perfil.nome} (Ano de Referência: 2022)</h3>
          </div>
          <div className="filter-controls-row">
            <div className="filter-item">
              <Filter size={14} />
              <select value={dimFilter} onChange={(e) => setDimFilter(e.target.value)} className="select-input">
                <option value="ALL">Todas as Dimensões (7)</option>
                <option value="Demográfica">Demográfica</option>
                <option value="Econômica">Econômica</option>
                <option value="Social">Social</option>
                <option value="Habitacional">Habitacional</option>
                <option value="Urbana">Urbana</option>
                <option value="Socioenergética">Socioenergética</option>
              </select>
            </div>
            <div className="filter-item">
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="select-input">
                <option value="ALL">Todas as Classificações</option>
                <option value="Dado observado">Dado observado</option>
                <option value="Indicador derivado">Indicador derivado</option>
                <option value="Proxy/estimativa">Proxy/estimativa</option>
              </select>
            </div>
            <div className="filter-item">
              <select value={fonteFilter} onChange={(e) => setFonteFilter(e.target.value)} className="select-input">
                <option value="ALL">Todas as Fontes</option>
                <option value="IBGE">IBGE (Censo 2022)</option>
                <option value="IPEA">IPEA (Atlas IVS)</option>
                <option value="Observatório Socioenergético (SENAI CIMATEC)">Observatório (Derivados/IEVS)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="responsive-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dimensão</th>
                <th>Indicador</th>
                <th>Valor ({perfil.nome})</th>
                <th>Ref. Salvador</th>
                <th>Classificação Metodológica</th>
                <th>Fonte Oficial / Variável</th>
                <th>Escala & Ano</th>
              </tr>
            </thead>
            <tbody>
              {filteredObs.map((row) => {
                const badge = getClassificacaoBadgeStyle(row.indicador.classificacao);
                const dimColor = getDimensaoColor(row.indicador.dimensao);
                const ssaVal = ssa[row.indicador.codigo];
                return (
                  <tr key={row.id}>
                    <td>
                      <span
                        className="dim-badge"
                        style={{
                          background: `${dimColor}18`,
                          color: dimColor,
                          border: `1px solid ${dimColor}44`,
                        }}
                      >
                        {row.indicador.dimensao}
                      </span>
                    </td>
                    <td>
                      <div className="td-main-title">{row.indicador.nome}</div>
                      <div className="td-sub-code">Código: {row.indicador.codigo}</div>
                    </td>
                    <td className="td-numeric-highlight">
                      {formatValueByUnit(row.valor, row.indicador.unidade)}
                    </td>
                    <td className="td-numeric-muted">
                      {ssaVal !== undefined ? formatValueByUnit(ssaVal, row.indicador.unidade) : '—'}
                    </td>
                    <td>
                      <span
                        className="classification-pill"
                        style={{
                          background: badge.bg,
                          borderColor: badge.border,
                          color: badge.text,
                        }}
                      >
                        {row.indicador.classificacao}
                      </span>
                    </td>
                    <td>
                      <div className="td-source-inst">{row.fonte.instituicao}</div>
                      <div className="td-sub-code">{row.indicador.variaveis_origem}</div>
                    </td>
                    <td>
                      <span className="meta-tag">{row.escala_registro}</span>{' '}
                      <span className="meta-tag">{row.ano}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
