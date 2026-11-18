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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Table2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import {
  formatNumber,
  formatCurrency,
  formatValueByUnit,
  getClassificacaoBadgeStyle,
  getDimensaoColor,
} from '../utils/formatters';
import { getChartTheme } from '../utils/chartTheme';

export default function TelaComparativo({ data, theme = 'light' }) {
  const [activeModule, setActiveModule] = useState('disparidades_radar'); // 'disparidades_radar' | 'renda_residuos' | 'tabela_delta'
  const [showStripNotes, setShowStripNotes] = useState(false);
  const [dimFilter, setDimFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const ct = getChartTheme(theme);
  const sc = ct.series;

  const beiru = data.perfisTerritoriais['2927408018'];
  const pern = data.perfisTerritoriais['2927408117'];
  const ssa = data.perfisTerritoriais['2927408'];
  const ievsDiff = (beiru.IEVS_EXPLORATORIO || 0) - (pern.IEVS_EXPLORATORIO || 0);
  const ievsDiffPct = pern.IEVS_EXPLORATORIO ? (ievsDiff / pern.IEVS_EXPLORATORIO) * 100 : 0;

  const popDiff = pern.POP_RESIDENTE - beiru.POP_RESIDENTE;
  const popDiffPct = (popDiff / beiru.POP_RESIDENTE) * 100;
  const densDiffPct = ((beiru.DENSIDADE_DEMOGRAFICA - pern.DENSIDADE_DEMOGRAFICA) / pern.DENSIDADE_DEMOGRAFICA) * 100;
  const rendaDiffPct = ((pern.RENDA_MEDIA_RESP - beiru.RENDA_MEDIA_RESP) / beiru.RENDA_MEDIA_RESP) * 100;
  const sameMedian = beiru.RENDA_MEDIANA_RESP === pern.RENDA_MEDIANA_RESP;

  const comparativeRows = useMemo(() => {
    // Territórios identificados pelo código IBGE (não por ids do banco)
    const idByCode = Object.fromEntries(data.territories.map((t) => [t.codigo_ibge, t.id]));
    const idBeiru = idByCode['2927408018'];
    const idPern = idByCode['2927408117'];
    const idSsa = idByCode['2927408'];
    const obsByKey = {};
    for (const o of data.observacoes) {
      if (Number(o.ano) === 2022) {
        obsByKey[`${o.indicador_id}_${o.territorio_id}`] = Number(o.valor);
      }
    }

    return data.indicadores
      .filter((ind) => {
        const vBeiru = obsByKey[`${ind.id}_${idBeiru}`];
        const vPern = obsByKey[`${ind.id}_${idPern}`];
        return vBeiru !== undefined && vPern !== undefined;
      })
      .filter((ind) => {
        if (dimFilter !== 'ALL' && ind.dimensao !== dimFilter) return false;
        if (classFilter !== 'ALL' && ind.classificacao !== classFilter) return false;
        return true;
      })
      .map((ind) => {
        const vBeiru = obsByKey[`${ind.id}_${idBeiru}`];
        const vPern = obsByKey[`${ind.id}_${idPern}`];
        const vSsa = obsByKey[`${ind.id}_${idSsa}`] !== undefined ? obsByKey[`${ind.id}_${idSsa}`] : null;
        const diffAbs = vBeiru - vPern;
        // Diferença percentual só é calculada quando o denominador é não nulo
        const diffPct = vPern !== 0 ? ((vBeiru - vPern) / vPern) * 100 : null;

        return {
          ...ind,
          vBeiru,
          vPern,
          vSsa,
          diffAbs,
          diffPct,
        };
      });
  }, [data, dimFilter, classFilter]);

  const barPercentComparison = useMemo(() => {
    return [
      {
        metrica: 'Setores Baixa Renda (≤1,5 SM)',
        'Beiru / Tancredo Neves': beiru.PERC_SETORES_BAIXA_RENDA,
        Pernambués: pern.PERC_SETORES_BAIXA_RENDA,
        Salvador: ssa.PERC_SETORES_BAIXA_RENDA,
      },
      {
        metrica: 'População Negra (Preta+Parda)',
        'Beiru / Tancredo Neves': beiru.PERC_POP_NEGRA,
        Pernambués: pern.PERC_POP_NEGRA,
        Salvador: ssa.PERC_POP_NEGRA,
      },
      {
        metrica: 'Coleta Lixo Direta (Porta)',
        'Beiru / Tancredo Neves': beiru.COLETA_LIXO_DIRETA,
        Pernambués: pern.COLETA_LIXO_DIRETA,
        Salvador: ssa.COLETA_LIXO_DIRETA,
      },
      {
        metrica: 'Calçada no Entorno',
        'Beiru / Tancredo Neves': beiru.ENTORNO_CALCADA,
        Pernambués: pern.ENTORNO_CALCADA,
        Salvador: ssa.ENTORNO_CALCADA,
      },
      {
        metrica: 'Arborização (≥1 árvore)',
        'Beiru / Tancredo Neves': beiru.ENTORNO_ARBORIZACAO,
        Pernambués: pern.ENTORNO_ARBORIZACAO,
        Salvador: ssa.ENTORNO_ARBORIZACAO,
      },
      {
        metrica: 'Drenagem (Bueiro/Boca Lobo)',
        'Beiru / Tancredo Neves': beiru.ENTORNO_BUEIRO,
        Pernambués: pern.ENTORNO_BUEIRO,
        Salvador: ssa.ENTORNO_BUEIRO,
      },
      {
        metrica: 'Acessibilidade (Rampa)',
        'Beiru / Tancredo Neves': beiru.ENTORNO_RAMPA_CADEIRANTE,
        Pernambués: pern.ENTORNO_RAMPA_CADEIRANTE,
        Salvador: ssa.ENTORNO_RAMPA_CADEIRANTE,
      },
    ];
  }, [beiru, pern, ssa]);

  const radarData = useMemo(() => {
    return [
      {
        dimensao: 'Vulnerab. Renda (I_Renda)',
        'Beiru / Tancredo Neves': beiru.IEVS_SUB_RENDA,
        Pernambués: pern.IEVS_SUB_RENDA,
        Salvador: ssa.IEVS_SUB_RENDA,
      },
      {
        dimensao: 'Vulnerab. Habitacional',
        'Beiru / Tancredo Neves': beiru.IEVS_SUB_HABITACAO,
        Pernambués: pern.IEVS_SUB_HABITACAO,
        Salvador: ssa.IEVS_SUB_HABITACAO,
      },
      {
        dimensao: 'Risco Térmico / Urbano',
        'Beiru / Tancredo Neves': beiru.IEVS_SUB_URBANA,
        Pernambués: pern.IEVS_SUB_URBANA,
        Salvador: ssa.IEVS_SUB_URBANA,
      },
      {
        dimensao: 'Déficit Arbóreo (% s/ árv.)',
        'Beiru / Tancredo Neves': beiru.ENTORNO_SEM_ARVORES,
        Pernambués: pern.ENTORNO_SEM_ARVORES,
        Salvador: ssa.ENTORNO_SEM_ARVORES,
      },
      {
        dimensao: 'Déficit Calçada (%)',
        'Beiru / Tancredo Neves': Number((100 - beiru.ENTORNO_CALCADA).toFixed(1)),
        Pernambués: Number((100 - pern.ENTORNO_CALCADA).toFixed(1)),
        Salvador: Number((100 - ssa.ENTORNO_CALCADA).toFixed(1)),
      },
      {
        dimensao: 'IEVS Sintético (0–100)',
        'Beiru / Tancredo Neves': beiru.IEVS_EXPLORATORIO,
        Pernambués: pern.IEVS_EXPLORATORIO,
        Salvador: ssa.IEVS_EXPLORATORIO,
      },
    ];
  }, [beiru, pern, ssa]);

  const incomeChartData = [
    {
      territorio: 'Beiru / Tancredo Neves',
      'Rendimento Médio (V06004)': beiru.RENDA_MEDIA_RESP,
      'Rendimento Mediano (V06006)': beiru.RENDA_MEDIANA_RESP,
    },
    {
      territorio: 'Pernambués',
      'Rendimento Médio (V06004)': pern.RENDA_MEDIA_RESP,
      'Rendimento Mediano (V06006)': pern.RENDA_MEDIANA_RESP,
    },
    {
      territorio: 'Salvador (Município)',
      'Rendimento Médio (V06004)': ssa.RENDA_MEDIA_RESP,
      'Rendimento Mediano (V06006)': ssa.RENDA_MEDIANA_RESP,
    },
  ];

  const garbageChartData = [
    {
      territorio: 'Beiru / Tancredo Neves',
      'Coleta Direta Porta a Porta': beiru.COLETA_LIXO_DIRETA,
      'Coleta em Caçamba Comunitária': beiru.COLETA_LIXO_CACAMBA,
      'Sem Coleta Regular': beiru.SEM_COLETA_LIXO_PERC,
    },
    {
      territorio: 'Pernambués',
      'Coleta Direta Porta a Porta': pern.COLETA_LIXO_DIRETA,
      'Coleta em Caçamba Comunitária': pern.COLETA_LIXO_CACAMBA,
      'Sem Coleta Regular': pern.SEM_COLETA_LIXO_PERC,
    },
    {
      territorio: 'Salvador (Município)',
      'Coleta Direta Porta a Porta': ssa.COLETA_LIXO_DIRETA,
      'Coleta em Caçamba Comunitária': ssa.COLETA_LIXO_CACAMBA,
      'Sem Coleta Regular': ssa.SEM_COLETA_LIXO_PERC,
    },
  ];

  function handleExportCsv() {
    const headers = [
      'Codigo',
      'Indicador',
      'Dimensao',
      'Classificacao',
      'Unidade',
      'Beiru_Tancredo_Neves',
      'Pernambues',
      'Salvador_Ref',
      'Diferenca_Absoluta_Beiru_vs_Pernambues',
      'Diferenca_Percentual_Beiru_vs_Pernambues',
    ];
    const lines = [
      headers.join(';'),
      ...comparativeRows.map((r) =>
        [
          r.codigo,
          `"${r.nome}"`,
          r.dimensao,
          r.classificacao,
          r.unidade,
          r.vBeiru,
          r.vPern,
          r.vSsa ?? '',
          r.diffAbs.toFixed(2),
          r.diffPct === null ? '' : `${r.diffPct.toFixed(2)}%`,
        ].join(';')
      ),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comparativo_beiru_vs_pernambues_censo2022.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="screen-container">
      {/* Cabeçalho Comparativo Enxuto */}
      <div className="control-panel-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">Comparativo Territorial · Censo 2022</span>
            <h2 className="section-title">
              Beiru / Tancredo Neves (2927408018) vs. Pernambués (2927408117)
            </h2>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className={`action-toggle-btn ${showStripNotes ? 'active' : ''}`}
              onClick={() => setShowStripNotes((v) => !v)}
            >
              <Info size={14} />
              <span>{showStripNotes ? 'Recolher Síntese Interpretativa' : 'Ver Síntese Interpretativa'}</span>
              {showStripNotes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <button type="button" className="btn-secondary" onClick={handleExportCsv}>
              <Download size={14} /> Exportar (.CSV)
            </button>
          </div>
        </div>

        <div className="comparison-highlight-strip">
          <div
            className="comp-strip-box"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowStripNotes((v) => !v)}
            title="Clique para mostrar ou ocultar a interpretação"
          >
            <span className="comp-strip-label">População & Escala Física</span>
            <div className="comp-strip-values">
              <span className="val-beiru">Beiru: {formatNumber(beiru.POP_RESIDENTE)} hab. ({formatNumber(beiru.AREA_KM2, 2)} km²)</span>
              <span className="vs-badge">VS</span>
              <span className="val-pern">Pernambués: {formatNumber(pern.POP_RESIDENTE)} hab. ({formatNumber(pern.AREA_KM2, 2)} km²)</span>
            </div>
            {showStripNotes && (
              <p className="comp-strip-note">
                Pernambués tem <strong>+{formatNumber(popDiff)} habitantes (+{formatNumber(popDiffPct, 1)}%)</strong>, mas
                Beiru/Tancredo Neves é <strong>{formatNumber(densDiffPct, 1)}% mais denso</strong> (
                {formatNumber(beiru.DENSIDADE_DEMOGRAFICA, 1)} vs. {formatNumber(pern.DENSIDADE_DEMOGRAFICA, 1)} hab/km²).
              </p>
            )}
          </div>

          <div
            className="comp-strip-box"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowStripNotes((v) => !v)}
            title="Clique para mostrar ou ocultar a interpretação"
          >
            <span className="comp-strip-label">Rendimento Médio vs. Mediano (V06004/V06006)</span>
            <div className="comp-strip-values">
              <span className="val-beiru">Beiru: {formatCurrency(beiru.RENDA_MEDIA_RESP)} (mediana {formatCurrency(beiru.RENDA_MEDIANA_RESP, 0)})</span>
              <span className="vs-badge">VS</span>
              <span className="val-pern">Pernambués: {formatCurrency(pern.RENDA_MEDIA_RESP)} (mediana {formatCurrency(pern.RENDA_MEDIANA_RESP, 0)})</span>
            </div>
            {showStripNotes && (
              <p className="comp-strip-note">
                {sameMedian ? (
                  <>
                    Mediana idêntica de <strong>{formatCurrency(beiru.RENDA_MEDIANA_RESP)}</strong> (1 SM de 2022) nos dois
                    bairros.{' '}
                  </>
                ) : null}
                A média de Pernambués é <strong>{formatNumber(rendaDiffPct, 1)}% maior</strong>, com razão média/mediana de{' '}
                {formatNumber(pern.RAZAO_MEDIA_MEDIANA_RENDA, 2)} (vs. {formatNumber(beiru.RAZAO_MEDIA_MEDIANA_RENDA, 2)} no
                Beiru), o que indica maior desigualdade interna.
              </p>
            )}
          </div>

          <div
            className="comp-strip-box"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowStripNotes((v) => !v)}
            title="Clique para mostrar ou ocultar a interpretação"
          >
            <span className="comp-strip-label">Vulnerabilidade Socioenergética (IEVS Base)</span>
            <div className="comp-strip-values">
              <span className="val-beiru">Beiru: {formatNumber(beiru.IEVS_EXPLORATORIO, 2)} / 100</span>
              <span className="vs-badge">VS</span>
              <span className="val-pern">Pernambués: {formatNumber(pern.IEVS_EXPLORATORIO, 2)} / 100</span>
            </div>
            {showStripNotes && (
              <p className="comp-strip-note">
                Beiru apresenta{' '}
                <strong>
                  {ievsDiff >= 0 ? '+' : ''}
                  {formatNumber(ievsDiff, 2)} pontos ({ievsDiff >= 0 ? '+' : ''}
                  {formatNumber(ievsDiffPct, 1)}%)
                </strong>{' '}
                no índice exploratório, associado ao déficit de arborização ({formatNumber(beiru.ENTORNO_SEM_ARVORES, 1)}%
                sem árvores), à menor coleta direta ({formatNumber(beiru.COLETA_LIXO_DIRETA, 1)}%) e à concentração de
                setores de baixa renda ({formatNumber(beiru.PERC_SETORES_BAIXA_RENDA, 1)}%).
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seletor Modular de Visualização Comparativa */}
      <div className="module-switcher-bar">
        <div className="module-tabs-group" role="tablist" aria-label="Módulos do Comparativo">
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'disparidades_radar'}
            className={`module-tab-btn ${activeModule === 'disparidades_radar' ? 'active' : ''}`}
            onClick={() => setActiveModule('disparidades_radar')}
          >
            <BarChart3 size={14} />
            <span>1. Disparidades Urbanas & Radar IEVS</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'renda_residuos'}
            className={`module-tab-btn ${activeModule === 'renda_residuos' ? 'active' : ''}`}
            onClick={() => setActiveModule('renda_residuos')}
          >
            <PieChartIcon size={14} />
            <span>2. Assimetria de Renda & Coleta de Lixo</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'tabela_delta'}
            className={`module-tab-btn ${activeModule === 'tabela_delta' ? 'active' : ''}`}
            onClick={() => setActiveModule('tabela_delta')}
          >
            <Table2 size={14} />
            <span>3. Tabela Comparativa Completa (Δ e Δ%)</span>
          </button>
        </div>
      </div>

      {/* MÓDULO 1: DISPARIDADES E RADAR MULTIDIMENSIONAL */}
      {activeModule === 'disparidades_radar' && (
        <div className="charts-two-col">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <span className="chart-tag">Visualização 01 · Barras Agrupadas (Censo 2022)</span>
                <h3>Disparidades Socioeconômicas e de Infraestrutura Urbana (%)</h3>
              </div>
            </div>
            <div className="chart-wrapper" style={{ height: 330, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barPercentComparison}
                  layout="vertical"
                  margin={{ top: 6, right: 20, left: 42, bottom: 6 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke={ct.axisStroke} unit="%" tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                  <YAxis type="category" dataKey="metrica" stroke={ct.axisStroke} width={158} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                  <Tooltip
                    cursor={ct.barCursor}
                    formatter={(val) => [`${formatNumber(val, 2)}%`, '']}
                    contentStyle={ct.tooltipStyle}
                    itemStyle={ct.tooltipItemStyle}
                    labelStyle={ct.tooltipLabelStyle}
                  />
                  <Legend wrapperStyle={ct.legendStyle} />
                  <Bar dataKey="Beiru / Tancredo Neves" fill={sc.beiru} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="Pernambués" fill={sc.pern} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="Salvador" fill={sc.ssa} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <span className="chart-tag">Visualização 02 · Radar Multidimensional (0–100)</span>
                <h3>Assinatura Territorial de Riscos Socioenergéticos</h3>
              </div>
            </div>
            <div className="chart-wrapper" style={{ height: 330, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                  <PolarGrid stroke={ct.polarStroke} />
                  <PolarAngleAxis dataKey="dimensao" tick={{ fill: ct.tickFill, fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: ct.tickFill, fontSize: 10 }} />
                  <Radar
                    name="Beiru / Tancredo Neves"
                    dataKey="Beiru / Tancredo Neves"
                    stroke={sc.beiru}
                    fill={sc.beiru}
                    fillOpacity={0.22}
                  />
                  <Radar
                    name="Pernambués"
                    dataKey="Pernambués"
                    stroke={sc.pern}
                    fill={sc.pern}
                    fillOpacity={0.18}
                  />
                  <Radar
                    name="Salvador (Ref.)"
                    dataKey="Salvador"
                    stroke={sc.ssa}
                    fill={sc.ssa}
                    fillOpacity={0.1}
                    strokeDasharray="4 3"
                  />
                  <Legend wrapperStyle={ct.legendStyle} />
                  <Tooltip
                    formatter={(val) => [`${formatNumber(val, 2)} pts`, '']}
                    contentStyle={ct.tooltipStyle}
                    itemStyle={ct.tooltipItemStyle}
                    labelStyle={ct.tooltipLabelStyle}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO 2: ASSIMETRIA DE RENDIMENTO E MODALIDADE DE COLETA DE LIXO */}
      {activeModule === 'renda_residuos' && (
        <div className="charts-two-col">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <span className="chart-tag">Visualização 03 · Assimetria de Rendimento (IBGE Censo 2022)</span>
                <h3>Rendimento Médio vs. Mediano do Responsável (R$)</h3>
              </div>
            </div>
            <p className="chart-description">
              A mediana de <strong>{formatCurrency(beiru.RENDA_MEDIANA_RESP)}</strong> no Beiru e de{' '}
              <strong>{formatCurrency(pern.RENDA_MEDIANA_RESP)}</strong> em Pernambués indica que metade dos responsáveis
              recebe até cerca de 1 salário mínimo (2022); a distância maior entre média e mediana em Pernambués sugere
              maior desigualdade interna.
            </p>
            <div className="chart-wrapper" style={{ height: 285 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
                  <XAxis dataKey="territorio" stroke={ct.axisStroke} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                  <YAxis stroke={ct.axisStroke} tickFormatter={(v) => `R$${v}`} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                  <Tooltip
                    cursor={ct.barCursor}
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={ct.tooltipStyle}
                    itemStyle={ct.tooltipItemStyle}
                    labelStyle={ct.tooltipLabelStyle}
                  />
                  <Legend wrapperStyle={ct.legendStyle} />
                  <Bar dataKey="Rendimento Médio (V06004)" fill={sc.cat[0]} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Rendimento Mediano (V06006)" fill={sc.cat[1]} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <span className="chart-tag">Visualização 04 · Morfologia Viária e Saneamento (V00397 / V00398)</span>
                <h3>Modalidade de Coleta de Resíduos Sólidos (% dos DPPO)</h3>
              </div>
            </div>
            <p className="chart-description">
              A dependência de <strong>caçambas comunitárias</strong> ({formatNumber(beiru.COLETA_LIXO_CACAMBA, 2)}% no Beiru
              e {formatNumber(pern.COLETA_LIXO_CACAMBA, 2)}% em Pernambués, contra {formatNumber(ssa.COLETA_LIXO_CACAMBA, 2)}%
              em Salvador) é compatível com vias estreitas e de difícil acesso para a coleta porta a porta — hipótese que o
              Censo não permite confirmar diretamente.
            </p>
            <div className="chart-wrapper" style={{ height: 285 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={garbageChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
                  <XAxis dataKey="territorio" stroke={ct.axisStroke} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                  <YAxis stroke={ct.axisStroke} unit="%" domain={[0, 100]} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                  <Tooltip
                    cursor={ct.barCursor}
                    formatter={(val) => [`${formatNumber(val, 2)}%`, '']}
                    contentStyle={ct.tooltipStyle}
                    itemStyle={ct.tooltipItemStyle}
                    labelStyle={ct.tooltipLabelStyle}
                  />
                  <Legend wrapperStyle={ct.legendStyle} />
                  <Bar dataKey="Coleta Direta Porta a Porta" stackId="a" fill={sc.cat[0]} />
                  <Bar dataKey="Coleta em Caçamba Comunitária" stackId="a" fill={sc.cat[1]} />
                  <Bar dataKey="Sem Coleta Regular" stackId="a" fill={sc.cat[3]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO 3: TABELA COMPARATIVA COMPLETA COM DIFERENÇAS ABSOLUTAS E PERCENTUAIS */}
      {activeModule === 'tabela_delta' && (
        <div className="table-section-card">
          <div className="table-header-bar">
            <div>
              <span className="section-eyebrow">View Analítica · vw_comparativo_bairros (Censo 2022 + Derivados)</span>
              <h3>Tabela Comparativa com Diferenças Absolutas (Δ) e Percentuais (Δ%)</h3>
            </div>
            <div className="filter-controls-row">
              <div className="filter-item">
                <Filter size={14} />
                <select value={dimFilter} onChange={(e) => setDimFilter(e.target.value)} className="select-input">
                  <option value="ALL">Todas as Dimensões</option>
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
            </div>
          </div>

          <div className="responsive-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dimensão</th>
                  <th>Indicador (Ano: 2022)</th>
                  <th>Classificação</th>
                  <th>Beiru / Tancredo Neves</th>
                  <th>Pernambués</th>
                  <th>Δ Absoluta (Beiru − Pern.)</th>
                  <th>Δ Percentual (Beiru / Pern.)</th>
                  <th>Ref. Salvador (Município)</th>
                </tr>
              </thead>
              <tbody>
                {comparativeRows.map((row) => {
                  const badge = getClassificacaoBadgeStyle(row.classificacao);
                  const dimColor = getDimensaoColor(row.dimensao);
                  const sign = row.diffAbs > 0 ? '+' : '';
                  const pctSign = row.diffPct !== null && row.diffPct > 0 ? '+' : '';
                  return (
                    <tr key={row.id}>
                      <td>
                        <span
                          className="dim-badge"
                          style={{ '--dim': dimColor }}
                        >
                          {row.dimensao}
                        </span>
                      </td>
                      <td>
                        <div className="td-main-title">{row.nome}</div>
                        <div className="td-sub-code">
                          <code>{row.codigo}</code> ({row.unidade})
                        </div>
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
                          {badge.short}
                        </span>
                      </td>
                      <td className="td-numeric-highlight">
                        {formatValueByUnit(row.vBeiru, row.unidade)}
                      </td>
                      <td className="td-numeric-highlight">
                        {formatValueByUnit(row.vPern, row.unidade)}
                      </td>
                      <td className="td-delta">
                        <span className={row.diffAbs === 0 ? 'delta-neutral' : row.diffAbs > 0 ? 'delta-pos' : 'delta-neg'}>
                          {sign}
                          {formatNumber(row.diffAbs, row.unidade === 'habitantes' || row.unidade === 'domicílios' ? 0 : 2)}{' '}
                          {row.unidade === '%' ? 'p.p.' : row.unidade.includes('0 a 100') ? 'pts' : row.unidade}
                        </span>
                      </td>
                      <td className="td-delta">
                        {row.diffPct === null ? (
                          <span className="delta-neutral">n/a</span>
                        ) : (
                          <span className={row.diffPct === 0 ? 'delta-neutral' : 'delta-pill'}>
                            {pctSign}
                            {formatNumber(row.diffPct, 2)}%
                          </span>
                        )}
                      </td>
                      <td className="td-numeric-muted">
                        {row.vSsa !== null ? formatValueByUnit(row.vSsa, row.unidade) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
