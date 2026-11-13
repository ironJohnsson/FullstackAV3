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
  {
    code: '2927408018',
    shortLabel: 'Beiru / Tancredo Neves (38.329 hab.)',
    label: 'Beiru / Tancredo Neves (Bairro Oficial - IBGE 2927408018)',
  },
  {
    code: '2927408117',
    shortLabel: 'Pernambués (52.564 hab.)',
    label: 'Pernambués (Bairro Oficial - IBGE 2927408117)',
  },
  {
    code: '2927408',
    shortLabel: 'Salvador — Referência (2,42 mi hab.)',
    label: 'Salvador (Referência Municipal - IBGE 2927408)',
  },
];

const RACE_COLORS = ['#0ea5e9', '#6366f1', '#94a3b8'];

export default function TelaVisaoGeral({ data, selectedBairro, setSelectedBairro }) {
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
      source: 'IBGE · Censo 2022 (V0001)',
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
      subtitle: `Média: ${formatNumber(perfil.MEDIA_MORADORES_DOM, 2)} mor/dom · 6+ mor.: ${formatNumber(perfil.ADENSAMENTO_DOMICILIAR_6MAIS, 2)}%`,
      source: 'IBGE · Censo 2022 (V00001 / V0005)',
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
      source: 'IBGE · Censo 2022 (V06004 / V06006)',
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
      source: 'IBGE · Censo 2022 (V00900 / V00901)',
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
      subtitle: `Apenas ${formatNumber(perfil.ENTORNO_ARBORIZACAO, 2)}% com ≥1 árvore · Calçada: ${formatNumber(perfil.ENTORNO_CALCADA, 1)}%`,
      source: 'IBGE · Censo 2022 Entorno (V05030)',
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
      subtitle: `Risco Térmico: ${formatNumber(perfil.PROXY_RISCO_TERMICO_URBANO, 1)} · Pressão Tarifária: ${formatNumber(perfil.PROXY_COMPROMETIMENTO_RENDA_ENERGIA, 1)}%`,
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
      {/* Barra de Seleção Territorial e Nota de Equivalência Geográfica */}
      <div className="control-panel-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">Tela 01 · Visão Geral do Território</span>
            <h2 className="section-title">
              Caracterização Socioeconômica, Habitacional, Urbana e Socioenergética
            </h2>
          </div>

          <div className="territory-selector-group">
            <div className="QuickSwitchPills" role="group" aria-label="Seleção rápida de território">
              {TERRITORY_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  className={`territory-pill ${activeCode === opt.code ? 'active' : ''}`}
                  onClick={() => setSelectedBairro(opt.code)}
                >
                  <MapPin size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />
                  {opt.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="methodology-banner">
          <Info size={17} className="banner-icon" />
          <div>
            <strong>Equivalência Geográfica e Escala Oficial (IBGE Censo 2022):</strong> Na malha oficial de Bairros de Salvador (Lei Municipal nº 9.278/2017), o território é denominado oficialmente{' '}
            <code>Beiru / Tancredo Neves</code> (código IBGE <code>2927408018</code>, com <strong>38.329 moradores</strong> e <strong>1,64 km²</strong>) e{' '}
            <code>Pernambués</code> (código IBGE <code>2927408117</code>, com <strong>52.564 moradores</strong> e <strong>3,21 km²</strong>). Já no recorte específico de{' '}
            <em>Favelas e Comunidades Urbanas (FCU)</em> do Censo 2022, a FCU Beiru/Tancredo Neves possui <strong>38.871 moradores</strong> (1ª maior da Bahia e 10ª do Brasil) e a FCU Pernambués possui{' '}
            <strong>35.110 moradores</strong> (2ª da Bahia e 11ª do Brasil, correspondendo a 66,8% da população do bairro oficial).
          </div>
        </div>
      </div>

      {/* Grid de 6 KPI Cards Principais */}
      <div className="kpi-grid">
        {kpiCards.map((card, idx) => {
          const IconComp = card.icon;
          const badge = getClassificacaoBadgeStyle(card.classification);
          return (
            <div key={idx} className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-title-wrap">
                  <span className="kpi-accent-dot" style={{ background: card.accent }} />
                  <span className="kpi-title">{card.title}</span>
                </div>
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
              </div>

              <div className="kpi-main-value">
                <span className="kpi-number">{card.value}</span>
                <span className="kpi-unit">{card.unit}</span>
              </div>

              <p className="kpi-subtitle">{card.subtitle}</p>

              <div className="kpi-meta-footer">
                <div className="kpi-meta-inline">
                  <span>{card.source}</span>
                  <span>·</span>
                  <span>{card.scale}</span>
                  <span>·</span>
                  <span>Ref: {card.year}</span>
                </div>
                <span
                  className="kpi-icon-badge"
                  style={{ background: `${card.accent}18`, color: card.accent }}
                >
                  <IconComp size={15} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos de Caracterização do Território */}
      <div className="charts-two-col">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <span className="chart-tag">IBGE · Censo 2022 (Domicílios e Entorno) · Ref: 2022</span>
              <h3>Infraestrutura Habitacional e Condições Urbanas: {perfil.nome} vs. Salvador (%)</h3>
            </div>
          </div>
          <p className="chart-description">
            Embora o acesso físico à água e iluminação pública supere 96%, observa-se forte déficit em{' '}
            <strong>coleta de lixo direta porta a porta</strong> ({formatNumber(perfil.COLETA_LIXO_DIRETA, 1)}%),{' '}
            <strong>presença de calçadas</strong> ({formatNumber(perfil.ENTORNO_CALCADA, 1)}%),{' '}
            <strong>arborização viária</strong> ({formatNumber(perfil.ENTORNO_ARBORIZACAO, 1)}%) e{' '}
            <strong>acessibilidade por rampa</strong> ({formatNumber(perfil.ENTORNO_RAMPA_CADEIRANTE, 2)}%).
          </p>
          <div className="chart-wrapper" style={{ height: 310 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={infraChartData}
                layout="vertical"
                margin={{ top: 6, right: 20, left: 32, bottom: 6 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" unit="%" tick={{ fontSize: 11.5 }} />
                <YAxis type="category" dataKey="indicador" stroke="#94a3b8" width={132} tick={{ fontSize: 11.5 }} />
                <Tooltip
                  formatter={(value) => [`${formatNumber(value, 2)}%`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey={perfil.nome} fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={13} />
                <Bar dataKey="Salvador" fill="#64748b" radius={[0, 4, 4, 0]} barSize={13} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <span className="chart-tag">IBGE · Censo 2022 (Demografia e Cor/Raça) · Ref: 2022</span>
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
            <div style={{ flex: 1.25, height: 255 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: -8, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                  <XAxis dataKey="faixa" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${formatNumber(val, 2)}%`, '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Beiru / Tancredo Neves" fill="#fb7185" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pernambués" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Salvador" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 0.9, height: 255, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
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
                    innerRadius={44}
                    outerRadius={72}
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
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo Relacional de Observações do Território Selecionado */}
      <div className="table-section-card">
        <div className="table-header-bar">
          <div>
            <span className="section-eyebrow">Consulta Relacional · Tabela observacoes JOIN indicadores JOIN fontes</span>
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
                          background: `${dimColor}16`,
                          color: dimColor,
                          border: `1px solid ${dimColor}38`,
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
                      <div className="td-main-title" style={{ fontSize: '0.78rem' }}>{row.fonte.instituicao}</div>
                      <div className="td-sub-code">{row.indicador.variaveis_origem}</div>
                    </td>
                    <td>
                      <span className="meta-tag">{row.escala_registro} · {row.ano}</span>
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
