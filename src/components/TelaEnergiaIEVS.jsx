import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Zap,
  AlertTriangle,
  Sliders,
  ShieldAlert,
  TrendingUp,
  RotateCcw,
  Table2,
  Info,
} from 'lucide-react';
import { formatNumber, getClassificacaoBadgeStyle } from '../utils/formatters';
import { getChartTheme } from '../utils/chartTheme';

export default function TelaEnergiaIEVS({ data, theme = 'light' }) {
  const [activeModule, setActiveModule] = useState('epe_bahia'); // 'epe_bahia' | 'simulador_ievs' | 'sensibilidade'
  const [showEpeCardMeta, setShowEpeCardMeta] = useState(false);
  const ct = getChartTheme(theme);
  const sc = ct.series;
  const badgeObs = getClassificacaoBadgeStyle('Dado observado');
  const badgeDer = getClassificacaoBadgeStyle('Indicador derivado');

  const [wRendaRaw, setWRendaRaw] = useState(40);
  const [wHabRaw, setWHabRaw] = useState(30);
  const [wUrbRaw, setWUrbRaw] = useState(30);

  const epeSeries = data.epeBahiaSeries || [];
  const epe2022 = epeSeries.find((r) => r.ano === 2022) || epeSeries[4] || {};
  const epeLatest = epeSeries[epeSeries.length - 1] || {};
  const epeFirst = epeSeries[0] || {};
  const pctChange = (a, b) => (a ? ((b - a) / a) * 100 : 0);
  const consumoGrowth = pctChange(epeFirst.consumo_total_gwh, epeLatest.consumo_total_gwh);
  const baixaRendaGrowth = pctChange(epeFirst.consumo_baixa_renda_gwh, epeLatest.consumo_baixa_renda_gwh);
  const consumoMedioValues = epeSeries.map((r) => r.consumo_medio_mensal_kwh_uc).filter((v) => Number.isFinite(v));
  const consumoMedioMin = consumoMedioValues.length ? Math.min(...consumoMedioValues) : 0;
  const consumoMedioMax = consumoMedioValues.length ? Math.max(...consumoMedioValues) : 0;

  const beiru = data.perfisTerritoriais['2927408018'];
  const pern = data.perfisTerritoriais['2927408117'];
  const ssa = data.perfisTerritoriais['2927408'];

  const normWeights = useMemo(() => {
    const sum = wRendaRaw + wHabRaw + wUrbRaw || 1;
    return {
      renda: wRendaRaw / sum,
      hab: wHabRaw / sum,
      urb: wUrbRaw / sum,
      rendaPct: ((wRendaRaw / sum) * 100).toFixed(1),
      habPct: ((wHabRaw / sum) * 100).toFixed(1),
      urbPct: ((wUrbRaw / sum) * 100).toFixed(1),
    };
  }, [wRendaRaw, wHabRaw, wUrbRaw]);

  const simulatedIEVS = useMemo(() => {
    const calc = (m) =>
      Number(
        (
          normWeights.renda * m.IEVS_SUB_RENDA +
          normWeights.hab * m.IEVS_SUB_HABITACAO +
          normWeights.urb * m.IEVS_SUB_URBANA
        ).toFixed(2)
      );

    const sBeiru = calc(beiru);
    const sPern = calc(pern);
    const sSsa = calc(ssa);

    return {
      beiru: sBeiru,
      pern: sPern,
      ssa: sSsa,
      diff: Number((sBeiru - sPern).toFixed(2)),
      chartData: [
        {
          territorio: 'Beiru / Tancredo Neves',
          'Subíndice Renda (Ponderado)': Number((normWeights.renda * beiru.IEVS_SUB_RENDA).toFixed(2)),
          'Subíndice Habitação (Ponderado)': Number((normWeights.hab * beiru.IEVS_SUB_HABITACAO).toFixed(2)),
          'Subíndice Urbano/Térmico (Ponderado)': Number((normWeights.urb * beiru.IEVS_SUB_URBANA).toFixed(2)),
          total: sBeiru,
        },
        {
          territorio: 'Pernambués',
          'Subíndice Renda (Ponderado)': Number((normWeights.renda * pern.IEVS_SUB_RENDA).toFixed(2)),
          'Subíndice Habitação (Ponderado)': Number((normWeights.hab * pern.IEVS_SUB_HABITACAO).toFixed(2)),
          'Subíndice Urbano/Térmico (Ponderado)': Number((normWeights.urb * pern.IEVS_SUB_URBANA).toFixed(2)),
          total: sPern,
        },
        {
          territorio: 'Salvador (Referência)',
          'Subíndice Renda (Ponderado)': Number((normWeights.renda * ssa.IEVS_SUB_RENDA).toFixed(2)),
          'Subíndice Habitação (Ponderado)': Number((normWeights.hab * ssa.IEVS_SUB_HABITACAO).toFixed(2)),
          'Subíndice Urbano/Térmico (Ponderado)': Number((normWeights.urb * ssa.IEVS_SUB_URBANA).toFixed(2)),
          total: sSsa,
        },
      ],
    };
  }, [normWeights, beiru, pern, ssa]);

  const sensRows = data.ievsSensibilidade || [];
  const beiruAlwaysFirst = sensRows.length > 0 && sensRows.every((s) => s.scores.diferenca_beiru_pernambues > 0);
  const signed = (v, dec = 2) => `${v > 0 ? '+' : ''}${formatNumber(v, dec)}`;

  function applyPresetScenario(r, h, u) {
    setWRendaRaw(r);
    setWHabRaw(h);
    setWUrbRaw(u);
  }

  return (
    <div className="screen-container">
      {/* Cabeçalho com Nota Metodológica de Escala Estadual EPE Sob Demanda */}
      <div className="control-panel-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">
              Análise Energética (EPE Bahia) & Simulador IEVS
            </span>
            <h2 className="section-title">
              Contexto Residencial da Bahia (EPE 2018–2025) e Riscos Socioenergéticos Locais
            </h2>
          </div>

        </div>

        <div className="warning-methodology-box">
          <AlertTriangle size={18} className="warn-icon" />
          <div>
            <strong>Escala estadual:</strong> os dados do Anuário Estatístico de Energia Elétrica (EPE) são publicados
            apenas para a <strong>Bahia (UF 29)</strong> e estão armazenados no banco vinculados ao território estadual.
            Eles <strong>não são atribuídos aos bairros</strong>: servem como contexto. Os indicadores locais desta tela
            (IEVS e proxies) são calculados exclusivamente com dados do Censo 2022.
          </div>
        </div>
      </div>

      {/* Seletor Modular da Tela de Energia & IEVS */}
      <div className="module-switcher-bar">
        <div className="module-tabs-group" role="tablist" aria-label="Módulos de Energia e IEVS">
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'epe_bahia'}
            className={`module-tab-btn ${activeModule === 'epe_bahia' ? 'active' : ''}`}
            onClick={() => setActiveModule('epe_bahia')}
          >
            <Zap size={14} />
            <span>1. Contexto Energético da Bahia (EPE 2018–2025)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'simulador_ievs'}
            className={`module-tab-btn ${activeModule === 'simulador_ievs' ? 'active' : ''}`}
            onClick={() => setActiveModule('simulador_ievs')}
          >
            <Sliders size={14} />
            <span>2. Simulador Interativo de Pesos (IEVS)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'sensibilidade'}
            className={`module-tab-btn ${activeModule === 'sensibilidade' ? 'active' : ''}`}
            onClick={() => setActiveModule('sensibilidade')}
          >
            <Table2 size={14} />
            <span>3. Tabela de Sensibilidade (4 Cenários)</span>
          </button>
        </div>

        {activeModule === 'epe_bahia' && (
          <button
            type="button"
            className={`action-toggle-btn ${showEpeCardMeta ? 'active' : ''}`}
            onClick={() => setShowEpeCardMeta((v) => !v)}
          >
            <Info size={13} />
            <span>{showEpeCardMeta ? 'Ocultar Evolução 2018–2025 nos Cards' : 'Detalhar Evolução 2018–2025 nos Cards'}</span>
          </button>
        )}
      </div>

      {/* MÓDULO 1: SÉRIE HISTÓRICA E INDICADORES ESTADUAIS DA EPE (UF BAHIA) */}
      {activeModule === 'epe_bahia' && (
        <>
          <div className="kpi-grid kpi-grid-4">
            <div
              className="kpi-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowEpeCardMeta((v) => !v)}
            >
              <div className="kpi-card-top">
                <div className="kpi-title-wrap">
                  <span className="kpi-icon-badge">
                    <Zap size={15} />
                  </span>
                  <span className="kpi-title">Consumo residencial · Bahia</span>
                </div>
                <span className="classification-pill" style={{ color: badgeObs.text, borderColor: badgeObs.border, background: badgeObs.bg }}>
                  Observado
                </span>
              </div>
              <div className="kpi-main-value">
                <span className="kpi-number">{formatNumber(epe2022.consumo_total_gwh, 2)}</span>
                <span className="kpi-unit">GWh (2022)</span>
              </div>
              {showEpeCardMeta && (
                <>
                  <p className="kpi-subtitle">
                    Evoluiu para <strong>{formatNumber(epeLatest.consumo_total_gwh, 2)} GWh</strong> em {epeLatest.ano} (
                    {signed(consumoGrowth, 1)}% desde {epeFirst.ano})
                  </p>
                  <div className="kpi-meta-footer">
                    <div className="kpi-meta-inline">
                      <span>EPE Dados Abertos</span>
                      <span>·</span>
                      <span>Escala: UF Bahia</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              className="kpi-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowEpeCardMeta((v) => !v)}
            >
              <div className="kpi-card-top">
                <div className="kpi-title-wrap">
                  <span className="kpi-icon-badge">
                    <TrendingUp size={15} />
                  </span>
                  <span className="kpi-title">Unidades consumidoras · Bahia</span>
                </div>
                <span className="classification-pill" style={{ color: badgeObs.text, borderColor: badgeObs.border, background: badgeObs.bg }}>
                  Observado
                </span>
              </div>
              <div className="kpi-main-value">
                <span className="kpi-number">{formatNumber(epe2022.consumidores_total)}</span>
                <span className="kpi-unit">UCs (2022)</span>
              </div>
              {showEpeCardMeta && (
                <>
                  <p className="kpi-subtitle">
                    Alcançou <strong>{formatNumber(epeLatest.consumidores_total)} UCs</strong> em {epeLatest.ano} na Bahia
                  </p>
                  <div className="kpi-meta-footer">
                    <div className="kpi-meta-inline">
                      <span>EPE Anuário</span>
                      <span>·</span>
                      <span>Escala: UF Bahia</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              className="kpi-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowEpeCardMeta((v) => !v)}
            >
              <div className="kpi-card-top">
                <div className="kpi-title-wrap">
                  <span className="kpi-icon-badge">
                    <Zap size={15} />
                  </span>
                  <span className="kpi-title">Subclasse Baixa Renda (TSEE)</span>
                </div>
                <span className="classification-pill" style={{ color: badgeDer.text, borderColor: badgeDer.border, background: badgeDer.bg }}>
                  Derivado
                </span>
              </div>
              <div className="kpi-main-value">
                <span className="kpi-number">{formatNumber(epe2022.perc_consumidores_baixa_renda, 2)}%</span>
                <span className="kpi-unit">({formatNumber(epe2022.consumidores_baixa_renda)} UCs)</span>
              </div>
              {showEpeCardMeta && (
                <>
                  <p className="kpi-subtitle">
                    Cresceu para <strong>{formatNumber(epeLatest.perc_consumidores_baixa_renda, 2)}%</strong> ({formatNumber(epeLatest.consumidores_baixa_renda)} unidades consumidoras em {epeLatest.ano})
                  </p>
                  <div className="kpi-meta-footer">
                    <div className="kpi-meta-inline">
                      <span>EPE Subclasses</span>
                      <span>·</span>
                      <span>Escala: UF Bahia</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              className="kpi-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowEpeCardMeta((v) => !v)}
            >
              <div className="kpi-card-top">
                <div className="kpi-title-wrap">
                  <span className="kpi-icon-badge">
                    <Zap size={15} />
                  </span>
                  <span className="kpi-title">Consumo médio mensal por UC</span>
                </div>
                <span className="classification-pill" style={{ color: badgeDer.text, borderColor: badgeDer.border, background: badgeDer.bg }}>
                  Derivado
                </span>
              </div>
              <div className="kpi-main-value">
                <span className="kpi-number">{formatNumber(epe2022.consumo_medio_mensal_kwh_uc, 1)}</span>
                <span className="kpi-unit">kWh / mês (2022)</span>
              </div>
              {showEpeCardMeta && (
                <>
                  <p className="kpi-subtitle">
                    Convencional: {formatNumber(epe2022.consumo_medio_convencional_kwh_uc, 1)} kWh · Baixa Renda:{' '}
                    {formatNumber(epe2022.consumo_medio_baixa_renda_kwh_uc, 1)} kWh/mês
                  </p>
                  <div className="kpi-meta-footer">
                    <div className="kpi-meta-inline">
                      <span>EPE (MWh / UCs)</span>
                      <span>·</span>
                      <span>Escala: UF Bahia</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="charts-two-col">
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <span className="chart-tag">EPE · Anuário Estatístico de Energia Elétrica · Escala: UF Bahia (2018–2025)</span>
                  <h3>Evolução do Consumo Residencial na Bahia: Convencional vs. Baixa Renda (GWh)</h3>
                </div>
              </div>
              <p className="chart-description">
                O consumo da subclasse <strong>Residencial Baixa Renda (Tarifa Social)</strong> na Bahia passou de{' '}
                {formatNumber(epeFirst.consumo_baixa_renda_gwh, 1)} GWh ({epeFirst.ano}) para{' '}
                {formatNumber(epeLatest.consumo_baixa_renda_gwh, 1)} GWh ({epeLatest.ano}), variação de{' '}
                <strong>{signed(baixaRendaGrowth, 1)}%</strong>. Valores estaduais — não representam o consumo dos bairros.
              </p>
              <div className="chart-wrapper" style={{ height: 295 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={epeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
                    <XAxis dataKey="ano" stroke={ct.axisStroke} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                    <YAxis
                      stroke={ct.axisStroke}
                      width={58}
                      tickFormatter={(v) => formatNumber(v)}
                      tick={{ fill: ct.tickFill, fontSize: 11.5 }}
                      label={{ value: 'GWh', angle: -90, position: 'insideLeft', fill: ct.tickFill, fontSize: 11, dx: -2 }}
                    />
                    <Tooltip
                      formatter={(val) => [`${formatNumber(val, 2)} GWh`, '']}
                      contentStyle={ct.tooltipStyle}
                      itemStyle={ct.tooltipItemStyle}
                      labelStyle={ct.tooltipLabelStyle}
                    />
                    <Legend wrapperStyle={ct.legendStyle} />
                    <Area
                      type="monotone"
                      dataKey="consumo_convencional_gwh"
                      name="Residencial Convencional (GWh)"
                      stackId="1"
                      stroke={sc.cat[0]}
                      fill={sc.cat[0]}
                      fillOpacity={0.28}
                    />
                    <Area
                      type="monotone"
                      dataKey="consumo_baixa_renda_gwh"
                      name="Residencial Baixa Renda - TSEE (GWh)"
                      stackId="1"
                      stroke={sc.cat[1]}
                      fill={sc.cat[1]}
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <span className="chart-tag">EPE · Mercado Cativo Residencial · Escala: UF Bahia (2018–2025)</span>
                  <h3>Unidades Consumidoras Residenciais e % Baixa Renda na Bahia</h3>
                </div>
              </div>
              <p className="chart-description">
                A participação das unidades consumidoras residenciais da Bahia na subclasse <strong>Baixa Renda</strong>{' '}
                passou de <strong>{formatNumber(epeFirst.perc_consumidores_baixa_renda, 2)}% ({epeFirst.ano})</strong> para{' '}
                <strong>{formatNumber(epe2022.perc_consumidores_baixa_renda, 2)}% em 2022</strong> e{' '}
                <strong>
                  {formatNumber(epeLatest.perc_consumidores_baixa_renda, 2)}% em {epeLatest.ano}
                </strong>
                , enquanto o consumo médio mensal por UC variou entre {formatNumber(consumoMedioMin, 1)} e{' '}
                {formatNumber(consumoMedioMax, 1)} kWh.
              </p>
              <div className="chart-wrapper" style={{ height: 295 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={epeSeries} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
                    <XAxis dataKey="ano" stroke={ct.axisStroke} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                    <YAxis
                      yAxisId="left"
                      stroke={ct.axisStroke}
                      tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                      tick={{ fill: ct.tickFill, fontSize: 11.5 }}
                    />
                    <YAxis yAxisId="right" orientation="right" stroke={ct.axisStroke} unit="%" domain={[0, 45]} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                    <Tooltip
                      cursor={ct.barCursor}
                      formatter={(val, name) =>
                        String(name).includes('%') ? [`${formatNumber(val, 2)}%`, name] : [formatNumber(val), name]
                      }
                      contentStyle={ct.tooltipStyle}
                      itemStyle={ct.tooltipItemStyle}
                      labelStyle={ct.tooltipLabelStyle}
                    />
                    <Legend wrapperStyle={ct.legendStyle} />
                    <Bar
                      yAxisId="left"
                      dataKey="consumidores_convencional"
                      name="UCs Convencionais (BA)"
                      stackId="ucs"
                      fill={sc.ssa}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="consumidores_baixa_renda"
                      name="UCs Baixa Renda / Tarifa Social (BA)"
                      stackId="ucs"
                      fill={sc.cat[1]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="perc_consumidores_baixa_renda"
                      name="% UCs Baixa Renda na Bahia"
                      stroke={sc.cat[0]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MÓDULO 2: SIMULADOR INTERATIVO DE PONDERAÇÃO DO IEVS */}
      {activeModule === 'simulador_ievs' && (
        <div className="simulator-section-card">
          <div className="control-panel-header">
            <div>
              <span className="section-eyebrow">
                Desafio Adicional · Índice Exploratório de Vulnerabilidade Socioenergética (IEVS)
              </span>
              <h2 className="section-title">
                Simulador de Ponderação Multidimensional (Renda, Habitação e Urbano-Térmico)
              </h2>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => applyPresetScenario(40, 30, 30)}
              >
                <RotateCcw size={14} /> Restaurar Base (40% / 30% / 30%)
              </button>
            </div>
          </div>

          <div className="ievs-disclaimer-box">
            <ShieldAlert size={17} className="warn-icon" />
            <span>
              <strong>Índice exploratório.</strong> O IEVS é uma proposta analítica da equipe, construída com variáveis do
              Censo 2022 reescaladas por limiares de referência, para apoiar a priorização territorial.{' '}
              <strong>Não é um índice oficial nem uma medida validada de pobreza energética.</strong>
            </span>
          </div>

          <div className="simulator-grid">
            <div className="sliders-panel">
              <h4 className="sliders-title">
                <Sliders size={15} /> Ajuste de Pesos das Dimensões (Teste ao Vivo)
              </h4>

              <div className="slider-item">
                <div className="slider-label-row">
                  <span>1. Dimensão Renda & Capacidade Tarifária (I_Renda)</span>
                  <strong className="slider-weight">Peso efetivo: {normWeights.rendaPct}%</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={wRendaRaw}
                  onChange={(e) => setWRendaRaw(Number(e.target.value))}
                  className="range-slider"
                />
                <small className="slider-help">
                  Base: Déficit do rendimento médio do responsável (V06004) e % de setores censitários com renda ≤ 1,5 SM
                  (Beiru = {beiru.IEVS_SUB_RENDA} pts · Pernambués = {pern.IEVS_SUB_RENDA} pts).
                </small>
              </div>

              <div className="slider-item">
                <div className="slider-label-row">
                  <span>2. Dimensão Habitação, Saneamento & Adensamento (I_Hab)</span>
                  <strong className="slider-weight">Peso efetivo: {normWeights.habPct}%</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={wHabRaw}
                  onChange={(e) => setWHabRaw(Number(e.target.value))}
                  className="range-slider"
                />
                <small className="slider-help">
                  Base: Déficit de coleta direta porta a porta (V00397), esgotamento precário e domicílios com 6+ moradores
                  (Beiru = {beiru.IEVS_SUB_HABITACAO} pts · Pernambués = {pern.IEVS_SUB_HABITACAO} pts).
                </small>
              </div>

              <div className="slider-item">
                <div className="slider-label-row">
                  <span>3. Dimensão Condições Urbanas & Estresse Térmico (I_Urb)</span>
                  <strong className="slider-weight">Peso efetivo: {normWeights.urbPct}%</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={wUrbRaw}
                  onChange={(e) => setWUrbRaw(Number(e.target.value))}
                  className="range-slider"
                />
                <small className="slider-help">
                  Base: proxy de risco térmico (faces sem árvores e densidade demográfica), déficit de calçadas e de
                  iluminação pública (Beiru = {beiru.IEVS_SUB_URBANA} pts · Pernambués = {pern.IEVS_SUB_URBANA}{' '}
                  pts).
                </small>
              </div>

              <div className="preset-buttons-row">
                <button type="button" className="preset-btn" onClick={() => applyPresetScenario(40, 30, 30)}>
                  Cenário 1: Base (40/30/30)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPresetScenario(60, 20, 20)}>
                  Cenário 2: Foco Renda (60/20/20)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPresetScenario(25, 25, 50)}>
                  Cenário 3: Foco Térmico (25/25/50)
                </button>
                <button type="button" className="preset-btn" onClick={() => applyPresetScenario(33, 33, 33)}>
                  Cenário 4: Igualitário (1/3)
                </button>
              </div>
            </div>

            <div className="simulator-results-panel">
              <div className="sim-score-cards">
                <div className="sim-score-box beiru-box">
                  <span className="sim-score-title">Beiru / Tancredo Neves</span>
                  <strong className="sim-score-value">{formatNumber(simulatedIEVS.beiru, 2)}</strong>
                  <span className="sim-score-sub">pontos (0–100)</span>
                </div>
                <div className="sim-score-box pern-box">
                  <span className="sim-score-title">Pernambués</span>
                  <strong className="sim-score-value">{formatNumber(simulatedIEVS.pern, 2)}</strong>
                  <span className="sim-score-sub">pontos (0–100)</span>
                </div>
                <div className="sim-score-box diff-box">
                  <span className="sim-score-title">Diferença (Beiru − Pern.)</span>
                  <strong className="sim-score-value">{signed(simulatedIEVS.diff)}</strong>
                  <span className="sim-score-sub">
                    {simulatedIEVS.diff > 0
                      ? 'Beiru com maior índice nestes pesos'
                      : simulatedIEVS.diff < 0
                        ? 'Pernambués com maior índice nestes pesos'
                        : 'Empate nestes pesos'}
                  </span>
                </div>
              </div>

              <div style={{ height: 245, marginTop: 14 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={simulatedIEVS.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
                    <XAxis dataKey="territorio" stroke={ct.axisStroke} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                    <YAxis stroke={ct.axisStroke} domain={[0, 80]} tick={{ fill: ct.tickFill, fontSize: 11.5 }} />
                    <Tooltip
                      cursor={ct.barCursor}
                      contentStyle={ct.tooltipStyle}
                      itemStyle={ct.tooltipItemStyle}
                      labelStyle={ct.tooltipLabelStyle}
                    />
                    <Legend wrapperStyle={ct.legendStyle} />
                    <Bar dataKey="Subíndice Renda (Ponderado)" stackId="ievs" fill={sc.cat[0]} />
                    <Bar dataKey="Subíndice Habitação (Ponderado)" stackId="ievs" fill={sc.cat[2]} />
                    <Bar dataKey="Subíndice Urbano/Térmico (Ponderado)" stackId="ievs" fill={sc.cat[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO 3: TABELA FORMAL DE ANÁLISE DE SENSIBILIDADE DOS 4 CENÁRIOS */}
      {activeModule === 'sensibilidade' && (
        <div className="table-section-card">
          <div className="table-header-bar">
            <div>
              <span className="section-eyebrow">Análise de Sensibilidade Obrigatória · 4 Cenários de Ponderação</span>
              <h3>Matriz de Robustez do Índice Exploratório de Vulnerabilidade Socioenergética (IEVS)</h3>
            </div>
          </div>
          <p className="chart-description">
            {beiruAlwaysFirst
              ? 'A ordem entre os bairros se mantém em todos os cenários testados: Beiru / Tancredo Neves apresenta o maior índice, com diferença estável entre os pesos.'
              : 'A ordem entre os bairros muda conforme os pesos — o resultado é sensível à ponderação escolhida.'}
          </p>

          <div className="responsive-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cenário de Sensibilidade</th>
                  <th>Pesos (Renda / Hab. / Urbana)</th>
                  <th>IEVS Beiru / Tancredo Neves</th>
                  <th>IEVS Pernambués</th>
                  <th>IEVS Salvador (Ref.)</th>
                  <th>Δ (Beiru − Pern.)</th>
                  <th>Ordenação</th>
                </tr>
              </thead>
              <tbody>
                {sensRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="td-main-title">{row.nome}</div>
                      <div className="td-sub-code">{row.justificativa}</div>
                    </td>
                    <td>
                      <code>
                        {(row.pesos.renda * 100).toFixed(0)}% / {(row.pesos.habitacao * 100).toFixed(0)}% /{' '}
                        {(row.pesos.urbana * 100).toFixed(0)}%
                      </code>
                    </td>
                    <td className="td-numeric-highlight">{formatNumber(row.scores.beiru_tancredo_neves, 2)}</td>
                    <td className="td-numeric-highlight">{formatNumber(row.scores.pernambues, 2)}</td>
                    <td className="td-numeric-muted">{formatNumber(row.scores.salvador, 2)}</td>
                    <td className="td-delta">
                      <span className={row.scores.diferenca_beiru_pernambues >= 0 ? 'delta-pos' : 'delta-neg'}>
                        {signed(row.scores.diferenca_beiru_pernambues)} pts
                      </span>
                    </td>
                    <td>
                      <span className="meta-tag">Maior índice: {row.scores.territorio_mais_vulneravel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
