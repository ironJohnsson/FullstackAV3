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
import { Zap, AlertTriangle, Sliders, ShieldAlert, TrendingUp, RotateCcw } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function TelaEnergiaIEVS({ data }) {
  const [wRendaRaw, setWRendaRaw] = useState(40);
  const [wHabRaw, setWHabRaw] = useState(30);
  const [wUrbRaw, setWUrbRaw] = useState(30);

  const epeSeries = data.epeBahiaSeries || [];
  const epe2022 = epeSeries.find((r) => r.ano === 2022) || epeSeries[4] || {};
  const epeLatest = epeSeries[epeSeries.length - 1] || {};

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

  function applyPresetScenario(r, h, u) {
    setWRendaRaw(r);
    setWHabRaw(h);
    setWUrbRaw(u);
  }

  return (
    <div className="screen-container">
      {/* Aviso Metodológico Obrigatório: Escala Estadual EPE vs Escala Local IBGE */}
      <div className="control-panel-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">
              Tela 04 · Análise Energética (EPE Bahia) & Simulador do Índice Socioenergético (IEVS)
            </span>
            <h2 className="section-title">
              Contextualização do Mercado Residencial da Bahia (EPE) e Riscos Socioenergéticos Locais
            </h2>
          </div>
        </div>

        <div className="warning-methodology-box">
          <AlertTriangle size={18} className="warn-icon" />
          <div>
            <strong>Cuidado Metodológico de Escala Geográfica (Requisito Obrigatório):</strong> Os dados abertos do{' '}
            <strong>Anuário Estatístico de Energia Elétrica da EPE</strong> são publicados exclusivamente em{' '}
            <strong>escala estadual (UF: Bahia — código IBGE 29)</strong>. Em conformidade com as boas práticas
            científicas e de modelagem no banco de dados (<code>territorio_id = 2</code>), os valores estaduais da EPE{' '}
            <strong>não são replicados nem atribuídos diretamente aos bairros</strong>. Eles contextualizam a dinâmica
            estadual do consumo residencial e da Tarifa Social (Baixa Renda), sendo articulados às condições locais de
            Beiru/Tancredo Neves e Pernambués por meio de proxies documentadas e do simulador exploratório IEVS.
          </div>
        </div>
      </div>

      {/* KPIs Estaduais da EPE (Escala: UF Bahia) */}
      <div className="kpi-grid kpi-grid-4">
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-title-wrap">
              <span className="kpi-accent-dot" style={{ background: '#eab308' }} />
              <span className="kpi-title">Consumo Residencial na Bahia</span>
            </div>
            <span className="classification-pill" style={{ color: '#34d399', borderColor: '#34d39955', background: '#10b98118' }}>
              Dado Observado
            </span>
          </div>
          <div className="kpi-main-value">
            <span className="kpi-number">{formatNumber(epe2022.consumo_total_gwh, 2)}</span>
            <span className="kpi-unit">GWh (2022)</span>
          </div>
          <p className="kpi-subtitle">
            Evoluiu para <strong>{formatNumber(epeLatest.consumo_total_gwh, 2)} GWh</strong> em {epeLatest.ano} (+14,3%
            desde 2018)
          </p>
          <div className="kpi-meta-footer">
            <div className="kpi-meta-inline">
              <span>EPE Dados Abertos</span>
              <span>·</span>
              <span>Escala: UF Bahia</span>
            </div>
            <span className="kpi-icon-badge" style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308' }}>
              <Zap size={15} />
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-title-wrap">
              <span className="kpi-accent-dot" style={{ background: '#38bdf8' }} />
              <span className="kpi-title">Unidades Consumidoras (BA)</span>
            </div>
            <span className="classification-pill" style={{ color: '#34d399', borderColor: '#34d39955', background: '#10b98118' }}>
              Dado Observado
            </span>
          </div>
          <div className="kpi-main-value">
            <span className="kpi-number">{formatNumber(epe2022.consumidores_total)}</span>
            <span className="kpi-unit">UCs (2022)</span>
          </div>
          <p className="kpi-subtitle">
            Alcançou <strong>{formatNumber(epeLatest.consumidores_total)} UCs</strong> em {epeLatest.ano} na Bahia
          </p>
          <div className="kpi-meta-footer">
            <div className="kpi-meta-inline">
              <span>EPE Anuário</span>
              <span>·</span>
              <span>Escala: UF Bahia</span>
            </div>
            <span className="kpi-icon-badge" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
              <TrendingUp size={15} />
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-title-wrap">
              <span className="kpi-accent-dot" style={{ background: '#10b981' }} />
              <span className="kpi-title">Subclasse Baixa Renda (TSEE)</span>
            </div>
            <span className="classification-pill" style={{ color: '#38bdf8', borderColor: '#38bdf855', background: '#38bdf818' }}>
              Indicador Derivado
            </span>
          </div>
          <div className="kpi-main-value">
            <span className="kpi-number">{formatNumber(epe2022.perc_consumidores_baixa_renda, 2)}%</span>
            <span className="kpi-unit">({formatNumber(epe2022.consumidores_baixa_renda)} UCs)</span>
          </div>
          <p className="kpi-subtitle">
            Cresceu para <strong>{formatNumber(epeLatest.perc_consumidores_baixa_renda, 2)}%</strong> (
            {formatNumber(epeLatest.consumidores_baixa_renda)} famílias na Tarifa Social em {epeLatest.ano})
          </p>
          <div className="kpi-meta-footer">
            <div className="kpi-meta-inline">
              <span>EPE Subclasses</span>
              <span>·</span>
              <span>Escala: UF Bahia</span>
            </div>
            <span className="kpi-icon-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <Zap size={15} />
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-title-wrap">
              <span className="kpi-accent-dot" style={{ background: '#f43f5e' }} />
              <span className="kpi-title">Consumo Médio Mensal por UC</span>
            </div>
            <span className="classification-pill" style={{ color: '#38bdf8', borderColor: '#38bdf855', background: '#38bdf818' }}>
              Indicador Derivado
            </span>
          </div>
          <div className="kpi-main-value">
            <span className="kpi-number">{formatNumber(epe2022.consumo_medio_mensal_kwh_uc, 1)}</span>
            <span className="kpi-unit">kWh / mês (2022)</span>
          </div>
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
            <span className="kpi-icon-badge" style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>
              <Zap size={15} />
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos Estaduais da EPE (2018-2025) */}
      <div className="charts-two-col">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <span className="chart-tag">EPE · Anuário Estatístico de Energia Elétrica · Escala: UF Bahia (2018–2025)</span>
              <h3>Evolução do Consumo Residencial na Bahia: Convencional vs. Baixa Renda (GWh)</h3>
            </div>
          </div>
          <p className="chart-description">
            O consumo da subclasse <strong>Residencial Baixa Renda (Tarifa Social)</strong> na Bahia praticamente dobrou
            entre 2018 (1.219,6 GWh) e 2025 (2.427,6 GWh), demonstrando a relevância estrutural do subsídio tarifário no
            estado.
          </p>
          <div className="chart-wrapper" style={{ height: 295 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={epeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                <XAxis dataKey="ano" stroke="#94a3b8" tick={{ fontSize: 11.5 }} />
                <YAxis stroke="#94a3b8" unit=" GWh" tick={{ fontSize: 11.5 }} />
                <Tooltip
                  formatter={(val) => [`${formatNumber(val, 2)} GWh`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="consumo_convencional_gwh"
                  name="Residencial Convencional (GWh)"
                  stackId="1"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="consumo_baixa_renda_gwh"
                  name="Residencial Baixa Renda - TSEE (GWh)"
                  stackId="1"
                  stroke="#eab308"
                  fill="#eab308"
                  fillOpacity={0.6}
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
            A proporção de famílias baianas enquadradas na subclasse <strong>Baixa Renda</strong> subiu de{' '}
            <strong>20,35% (2018)</strong> para <strong>28,22% no Censo 2022</strong> e <strong>32,78% em 2025</strong>,
            enquanto o consumo médio mensal manteve-se na faixa de 108 a 113 kWh/mês.
          </p>
          <div className="chart-wrapper" style={{ height: 295 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={epeSeries} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                <XAxis dataKey="ano" stroke="#94a3b8" tick={{ fontSize: 11.5 }} />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                  tick={{ fontSize: 11.5 }}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#eab308" unit="%" domain={[0, 45]} tick={{ fontSize: 11.5 }} />
                <Tooltip
                  formatter={(val, name) =>
                    String(name).includes('%') ? [`${formatNumber(val, 2)}%`, name] : [formatNumber(val), name]
                  }
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="left"
                  dataKey="consumidores_convencional"
                  name="UCs Convencionais (BA)"
                  stackId="ucs"
                  fill="#475569"
                />
                <Bar
                  yAxisId="left"
                  dataKey="consumidores_baixa_renda"
                  name="UCs Baixa Renda / Tarifa Social (BA)"
                  stackId="ucs"
                  fill="#10b981"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="perc_consumidores_baixa_renda"
                  name="% UCs Baixa Renda na Bahia"
                  stroke="#eab308"
                  strokeWidth={2.5}
                  dot={{ r: 3.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DESAFIO ADICIONAL — SIMULADOR INTERATIVO E ANÁLISE DE SENSIBILIDADE DO IEVS */}
      <div className="simulator-section-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">
              Desafio Adicional · Índice Exploratório de Vulnerabilidade Socioenergética (IEVS)
            </span>
            <h2 className="section-title">
              Simulador de Ponderação e Teste de Sensibilidade Multidimensional (Renda, Habitação e Urbano-Térmico)
            </h2>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => applyPresetScenario(40, 30, 30)}
          >
            <RotateCcw size={14} /> Restaurar Pesos Base (40% / 30% / 30%)
          </button>
        </div>

        <div className="ievs-disclaimer-box">
          <ShieldAlert size={17} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
          <span>
            <strong>Nota de Rigor Metodológico (Seção 9):</strong> O <strong>IEVS</strong> é uma proposta analítica
            exploratória construída sobre variáveis oficiais normalizadas do Censo 2022 para apoiar a priorização de
            políticas públicas no território. <strong>Não deve ser apresentado como índice oficial nem como medida
            direta validada de pobreza energética familiar.</strong>
          </span>
        </div>

        <div className="simulator-grid">
          <div className="sliders-panel">
            <h4 className="sliders-title">
              <Sliders size={15} /> Ajuste de Pesos das Dimensões (Teste de Sensibilidade ao Vivo)
            </h4>

            <div className="slider-item">
              <div className="slider-label-row">
                <span>1. Dimensão Renda & Capacidade Tarifária (I_Renda)</span>
                <strong style={{ color: 'var(--accent-amber)' }}>Peso Efetivo: {normWeights.rendaPct}%</strong>
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
                <strong style={{ color: 'var(--accent-emerald)' }}>Peso Efetivo: {normWeights.habPct}%</strong>
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
                <strong style={{ color: 'var(--accent-rose)' }}>Peso Efetivo: {normWeights.urbPct}%</strong>
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
                Base: Proxy de Ilha de Calor (74,4% sem árvores no Beiru + densidade 23,4 mil hab/km²), déficit de
                calçadas e iluminação pública (Beiru = {beiru.IEVS_SUB_URBANA} pts · Pernambués = {pern.IEVS_SUB_URBANA}{' '}
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
                <strong className="sim-score-value">+{formatNumber(simulatedIEVS.diff, 2)}</strong>
                <span className="sim-score-sub">Beiru 1º em todos os cenários</span>
              </div>
            </div>

            <div style={{ height: 235, marginTop: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulatedIEVS.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                  <XAxis dataKey="territorio" stroke="#94a3b8" tick={{ fontSize: 11.5 }} />
                  <YAxis stroke="#94a3b8" domain={[0, 80]} tick={{ fontSize: 11.5 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                  <Bar dataKey="Subíndice Renda (Ponderado)" stackId="ievs" fill="#f59e0b" />
                  <Bar dataKey="Subíndice Habitação (Ponderado)" stackId="ievs" fill="#10b981" />
                  <Bar dataKey="Subíndice Urbano/Térmico (Ponderado)" stackId="ievs" fill="#fb7185" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="responsive-table-wrap" style={{ marginTop: 18 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cenário de Sensibilidade</th>
                <th>Pesos (Renda / Hab. / Urbana)</th>
                <th>IEVS Beiru / Tancredo Neves</th>
                <th>IEVS Pernambués</th>
                <th>IEVS Salvador (Ref.)</th>
                <th>Δ (Beiru − Pern.)</th>
                <th>Diagnóstico de Robustez</th>
              </tr>
            </thead>
            <tbody>
              {(data.ievsSensibilidade || []).map((sc) => (
                <tr key={sc.id}>
                  <td>
                    <div className="td-main-title">{sc.nome}</div>
                    <div className="td-sub-code">{sc.justificativa}</div>
                  </td>
                  <td>
                    <code>
                      {(sc.pesos.renda * 100).toFixed(0)}% / {(sc.pesos.habitacao * 100).toFixed(0)}% /{' '}
                      {(sc.pesos.urbana * 100).toFixed(0)}%
                    </code>
                  </td>
                  <td className="td-numeric-highlight" style={{ color: 'var(--accent-rose)' }}>
                    {formatNumber(sc.scores.beiru_tancredo_neves, 2)} pts
                  </td>
                  <td className="td-numeric-highlight" style={{ color: 'var(--accent-blue)' }}>
                    {formatNumber(sc.scores.pernambues, 2)} pts
                  </td>
                  <td className="td-numeric-muted">{formatNumber(sc.scores.salvador, 2)} pts</td>
                  <td className="td-delta">
                    <span className="delta-pos">+{formatNumber(sc.scores.diferenca_beiru_pernambues, 2)} pts</span>
                  </td>
                  <td>
                    <span className="meta-tag">Ranking Invariante ({sc.scores.territorio_mais_vulneravel} 1º)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
