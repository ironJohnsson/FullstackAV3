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
  // Pesos interativos para o Simulador de Sensibilidade do IEVS
  const [wRendaRaw, setWRendaRaw] = useState(40);
  const [wHabRaw, setWHabRaw] = useState(30);
  const [wUrbRaw, setWUrbRaw] = useState(30);

  const epeSeries = data.epeBahiaSeries || [];
  const epe2022 = epeSeries.find((r) => r.ano === 2022) || epeSeries[4] || {};
  const epeLatest = epeSeries[epeSeries.length - 1] || {};

  const beiru = data.perfisTerritoriais['2927408018'];
  const pern = data.perfisTerritoriais['2927408117'];
  const ssa = data.perfisTerritoriais['2927408'];

  // Normalização automática dos pesos para somar 1.00 (100%)
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
              TELA 4 — ANÁLISE ENERGÉTICA (EPE BAHIA) & SIMULADOR DO ÍNDICE SOCIOENERGÉTICO (IEVS)
            </span>
            <h2 className="section-title">
              Contextualização do Mercado Residencial da Bahia (EPE) e Riscos Socioenergéticos Locais
            </h2>
          </div>
        </div>

        <div className="warning-methodology-box">
          <AlertTriangle size={22} className="warn-icon" />
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
        <div className="kpi-card" style={{ borderTop: '3px solid #eab308' }}>
          <div className="kpi-card-top">
            <span className="kpi-title">Consumo Residencial na Bahia (Ano Censo)</span>
            <span className="kpi-icon-badge" style={{ background: 'rgba(234,179,8,0.18)', color: '#eab308' }}>
              <Zap size={18} />
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
            <span className="classification-pill" style={{ color: '#34d399', borderColor: '#34d39955', background: '#10b98122' }}>
              Dado Observado
            </span>
            <span className="meta-tag">📊 EPE Dados Abertos</span>
            <span className="meta-tag">🗺️ Escala: UF Bahia</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderTop: '3px solid #38bdf8' }}>
          <div className="kpi-card-top">
            <span className="kpi-title">Unidades Consumidoras Residenciais (BA)</span>
            <span className="kpi-icon-badge" style={{ background: 'rgba(56,189,248,0.18)', color: '#38bdf8' }}>
              <TrendingUp size={18} />
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
            <span className="classification-pill" style={{ color: '#34d399', borderColor: '#34d39955', background: '#10b98122' }}>
              Dado Observado
            </span>
            <span className="meta-tag">📊 EPE Anuário</span>
            <span className="meta-tag">🗺️ Escala: UF Bahia</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderTop: '3px solid #10b981' }}>
          <div className="kpi-card-top">
            <span className="kpi-title">Subclasse Residencial Baixa Renda (TSEE BA)</span>
            <span className="kpi-icon-badge" style={{ background: 'rgba(16,185,129,0.18)', color: '#10b981' }}>
              <Zap size={18} />
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
            <span className="classification-pill" style={{ color: '#38bdf8', borderColor: '#38bdf855', background: '#38bdf822' }}>
              Indicador Derivado
            </span>
            <span className="meta-tag">📊 EPE Subclasses</span>
            <span className="meta-tag">🗺️ Escala: UF Bahia</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderTop: '3px solid #f43f5e' }}>
          <div className="kpi-card-top">
            <span className="kpi-title">Consumo Médio Mensal por UC (Bahia)</span>
            <span className="kpi-icon-badge" style={{ background: 'rgba(244,63,94,0.18)', color: '#f43f5e' }}>
              <Zap size={18} />
            </span>
          </div>
          <div className="kpi-main-value">
            <span className="kpi-number">{formatNumber(epe2022.consumo_medio_mensal_kwh_uc, 1)}</span>
            <span className="kpi-unit">kWh / mês (2022)</span>
          </div>
          <p className="kpi-subtitle">
            Convencional: {formatNumber(epe2022.consumo_medio_convencional_kwh_uc, 1)} kWh | Baixa Renda:{' '}
            {formatNumber(epe2022.consumo_medio_baixa_renda_kwh_uc, 1)} kWh/mês
          </p>
          <div className="kpi-meta-footer">
            <span className="classification-pill" style={{ color: '#38bdf8', borderColor: '#38bdf855', background: '#38bdf822' }}>
              Indicador Derivado
            </span>
            <span className="meta-tag">📊 EPE (MWh / UCs)</span>
            <span className="meta-tag">🗺️ Escala: UF Bahia</span>
          </div>
        </div>
      </div>

      {/* Gráficos Estaduais da EPE (2018-2025) */}
      <div className="charts-two-col">
        {/* Gráfico EPE 1: Evolução do Consumo Residencial (Convencional vs Baixa Renda) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <span className="chart-tag">EPE — ANUÁRIO ESTATÍSTICO DE ENERGIA ELÉTRICA | ESCALA: UF BAHIA (2018–2025)</span>
              <h3>Evolução do Consumo Residencial na Bahia: Convencional vs. Baixa Renda (GWh)</h3>
            </div>
          </div>
          <p className="chart-description">
            O consumo da subclasse <strong>Residencial Baixa Renda (Tarifa Social)</strong> na Bahia praticamente dobrou
            entre 2018 (1.219,6 GWh) e 2025 (2.427,6 GWh), demonstrando a relevância estrutural do subsídio tarifário no
            estado.
          </p>
          <div className="chart-wrapper" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={epeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="ano" stroke="#cbd5e1" />
                <YAxis stroke="#94a3b8" unit=" GWh" />
                <Tooltip
                  formatter={(val) => [`${formatNumber(val, 2)} GWh`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="consumo_convencional_gwh"
                  name="Residencial Convencional (GWh)"
                  stackId="1"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.45}
                />
                <Area
                  type="monotone"
                  dataKey="consumo_baixa_renda_gwh"
                  name="Residencial Baixa Renda - TSEE (GWh)"
                  stackId="1"
                  stroke="#eab308"
                  fill="#eab308"
                  fillOpacity={0.65}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico EPE 2: Evolução de Consumidores e Participação Baixa Renda */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <span className="chart-tag">EPE — MERCADO CATIVO RESIDENCIAL | ESCALA: UF BAHIA (2018–2025)</span>
              <h3>Unidades Consumidoras Residenciais e % Baixa Renda na Bahia</h3>
            </div>
          </div>
          <p className="chart-description">
            A proporção de famílias baianas enquadradas na subclasse <strong>Baixa Renda</strong> subiu de{' '}
            <strong>20,35% (2018)</strong> para <strong>28,22% no Censo 2022</strong> e <strong>32,78% em 2025</strong>,
            enquanto o consumo médio mensal manteve-se na faixa de 108 a 113 kWh/mês.
          </p>
          <div className="chart-wrapper" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={epeSeries} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="ano" stroke="#cbd5e1" />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#eab308" unit="%" domain={[0, 45]} />
                <Tooltip
                  formatter={(val, name) =>
                    String(name).includes('%') ? [`${formatNumber(val, 2)}%`, name] : [formatNumber(val), name]
                  }
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
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
                  strokeWidth={3}
                  dot={{ r: 4 }}
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
              DESAFIO ADICIONAL — ÍNDICE EXPLORATÓRIO DE VULNERABILIDADE SOCIOENERGÉTICA (IEVS)
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
            <RotateCcw size={15} /> Restaurar Pesos Base (40% / 30% / 30%)
          </button>
        </div>

        <div className="ievs-disclaimer-box">
          <ShieldAlert size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <span>
            <strong>Nota de Rigor Metodológico (Seção 9):</strong> O <strong>IEVS</strong> é uma proposta analítica
            exploratória construída sobre variáveis oficiais normalizadas do Censo 2022 para apoiar a priorização de
            políticas públicas no território. <strong>Não deve ser apresentado como índice oficial nem como medida
            direta validada de pobreza energética familiar.</strong>
          </span>
        </div>

        <div className="simulator-grid">
          {/* Controles de Pesos (Sliders) */}
          <div className="sliders-panel">
            <h4 className="sliders-title">
              <Sliders size={16} /> Ajuste de Pesos das Dimensões (Teste de Sensibilidade ao Vivo)
            </h4>

            <div className="slider-item">
              <div className="slider-label-row">
                <span>1. Dimensão Renda & Capacidade Tarifária (I_Renda)</span>
                <strong style={{ color: '#f59e0b' }}>Peso Efetivo: {normWeights.rendaPct}%</strong>
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
                (Beiru = {beiru.IEVS_SUB_RENDA} pts | Pernambués = {pern.IEVS_SUB_RENDA} pts).
              </small>
            </div>

            <div className="slider-item">
              <div className="slider-label-row">
                <span>2. Dimensão Habitação, Saneamento & Adensamento (I_Hab)</span>
                <strong style={{ color: '#10b981' }}>Peso Efetivo: {normWeights.habPct}%</strong>
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
                (Beiru = {beiru.IEVS_SUB_HABITACAO} pts | Pernambués = {pern.IEVS_SUB_HABITACAO} pts).
              </small>
            </div>

            <div className="slider-item">
              <div className="slider-label-row">
                <span>3. Dimensão Condições Urbanas & Estresse Térmico (I_Urb)</span>
                <strong style={{ color: '#f43f5e' }}>Peso Efetivo: {normWeights.urbPct}%</strong>
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
                calçadas e iluminação pública (Beiru = {beiru.IEVS_SUB_URBANA} pts | Pernambués = {pern.IEVS_SUB_URBANA}{' '}
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

          {/* Resultado Simulado e Gráfico de Decomposição */}
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
                <span className="sim-score-sub">Beiru mais vulnerável em todos os cenários</span>
              </div>
            </div>

            <div style={{ height: 240, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulatedIEVS.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="territorio" stroke="#cbd5e1" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" domain={[0, 80]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                  <Bar dataKey="Subíndice Renda (Ponderado)" stackId="ievs" fill="#f59e0b" />
                  <Bar dataKey="Subíndice Habitação (Ponderado)" stackId="ievs" fill="#10b981" />
                  <Bar dataKey="Subíndice Urbano/Térmico (Ponderado)" stackId="ievs" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabela Formal de Teste de Sensibilidade dos 4 Cenários */}
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
                  <td className="td-numeric-highlight" style={{ color: '#fda4af' }}>
                    {formatNumber(sc.scores.beiru_tancredo_neves, 2)} pts
                  </td>
                  <td className="td-numeric-highlight" style={{ color: '#7dd3fc' }}>
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
