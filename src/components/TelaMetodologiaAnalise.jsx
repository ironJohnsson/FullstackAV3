import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Database,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { getClassificacaoBadgeStyle, getDimensaoColor, formatNumber } from '../utils/formatters';

export default function TelaMetodologiaAnalise({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dimFilter, setDimFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('dicionario');
  const [activeFonteModule, setActiveFonteModule] = useState('fontes'); // 'fontes' | 'ipea_ivs'

  // Accordion states for Dicionário (24 indicators) and Desafio Analítico (8 questions)
  const [openIndIds, setOpenIndIds] = useState({ 1: true });
  const [expandAllInds, setExpandAllInds] = useState(false);

  const [openQuestionIds, setOpenQuestionIds] = useState({ 1: true });
  const [expandAllQuestions, setExpandAllQuestions] = useState(false);

  const filteredIndicadores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (data.indicadores || []).filter((ind) => {
      if (dimFilter !== 'ALL' && ind.dimensao !== dimFilter) return false;
      if (classFilter !== 'ALL' && ind.classificacao !== classFilter) return false;
      if (q) {
        const hay = `${ind.codigo} ${ind.nome} ${ind.descricao} ${ind.variaveis_origem} ${ind.formula} ${ind.limitacoes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.indicadores, searchQuery, dimFilter, classFilter]);

  const ipeaObs = useMemo(() => {
    const terrMap = Object.fromEntries((data.territories || []).map((t) => [t.id, t]));
    return (data.observacoes || [])
      .filter((o) => o.indicador_id === 11)
      .map((o) => ({
        ...o,
        territorio: terrMap[o.territorio_id],
      }));
  }, [data.observacoes, data.territories]);

  function toggleIndAccordion(id) {
    setOpenIndIds((prev) => ({
      ...prev,
      [id]: !(expandAllInds ? true : !!prev[id]),
    }));
    if (expandAllInds) setExpandAllInds(false);
  }

  function toggleQuestionAccordion(id) {
    setOpenQuestionIds((prev) => ({
      ...prev,
      [id]: !(expandAllQuestions ? true : !!prev[id]),
    }));
    if (expandAllQuestions) setExpandAllQuestions(false);
  }

  return (
    <div className="screen-container">
      <div className="control-panel-card">
        <div className="control-panel-header">
          <div>
            <span className="section-eyebrow">
              Metodologia, Fontes Oficiais & Desafio Analítico
            </span>
            <h2 className="section-title">
              Dicionário de Indicadores (24), Fórmulas, Limitações e 8 Questões Fundamentadas
            </h2>
          </div>
        </div>

        <div className="subtab-nav-bar">
          <button
            type="button"
            className={`subtab-btn ${activeSubTab === 'dicionario' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('dicionario')}
          >
            <BookOpen size={15} /> 1. Dicionário de Indicadores (24)
          </button>
          <button
            type="button"
            className={`subtab-btn ${activeSubTab === 'desafio_analitico' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('desafio_analitico')}
          >
            <HelpCircle size={15} /> 2. Desafio Analítico (8 Questões)
          </button>
          <button
            type="button"
            className={`subtab-btn ${activeSubTab === 'fontes_ipea' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('fontes_ipea')}
          >
            <Database size={15} /> 3. Fontes Oficiais & Escalas IPEA (IVS)
          </button>
        </div>
      </div>

      {/* ABA 1: DICIONÁRIO DE INDICADORES EM ACORDEÃO MODULAR */}
      {activeSubTab === 'dicionario' && (
        <div className="table-section-card">
          <div className="table-header-bar">
            <div>
              <span className="section-eyebrow">
                Clique em qualquer indicador abaixo para abrir sua fórmula, origem, metodologia e limitações
              </span>
              <h3>Dicionário Metodológico ({filteredIndicadores.length} de 24 indicadores)</h3>
            </div>
            <div className="filter-controls-row">
              <div className="search-input-wrap">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Buscar por indicador, variável (ex: V06004)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-search-input"
                />
              </div>
              <select value={dimFilter} onChange={(e) => setDimFilter(e.target.value)} className="select-input">
                <option value="ALL">Todas as Dimensões (7)</option>
                <option value="Demográfica">Demográfica</option>
                <option value="Econômica">Econômica</option>
                <option value="Social">Social</option>
                <option value="Habitacional">Habitacional</option>
                <option value="Urbana">Urbana</option>
                <option value="Energética">Energética</option>
                <option value="Socioenergética">Socioenergética</option>
              </select>
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="select-input">
                <option value="ALL">Todas as Classificações</option>
                <option value="Dado observado">Dado observado</option>
                <option value="Indicador derivado">Indicador derivado</option>
                <option value="Proxy/estimativa">Proxy/estimativa</option>
              </select>
              <button
                type="button"
                className={`action-toggle-btn ${expandAllInds ? 'active' : ''}`}
                onClick={() => {
                  const next = !expandAllInds;
                  setExpandAllInds(next);
                  const map = {};
                  filteredIndicadores.forEach((ind) => {
                    map[ind.id] = next;
                  });
                  setOpenIndIds(map);
                }}
              >
                <Eye size={13} />
                <span>{expandAllInds ? 'Recolher Todos' : 'Expandir Todos'}</span>
              </button>
            </div>
          </div>

          <div className="accordion-list">
            {filteredIndicadores.map((ind) => {
              const badge = getClassificacaoBadgeStyle(ind.classificacao);
              const dimColor = getDimensaoColor(ind.dimensao);
              const isOpen = expandAllInds || !!openIndIds[ind.id];
              return (
                <div key={ind.id} className={`accordion-card ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => toggleIndAccordion(ind.id)}
                  >
                    <div className="accordion-trigger-left">
                      <code className="dict-code">#{ind.id} · {ind.codigo}</code>
                      <span className="accordion-title">{ind.nome}</span>
                    </div>
                    <div className="accordion-trigger-right">
                      <span
                        className="dim-badge"
                        style={{
                          background: `${dimColor}16`,
                          color: dimColor,
                          border: `1px solid ${dimColor}38`,
                        }}
                      >
                        {ind.dimensao}
                      </span>
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
                      <span className="meta-tag">{ind.unidade}</span>
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="accordion-content">
                      <p className="dict-desc" style={{ marginTop: 10 }}>{ind.descricao}</p>

                      <div className="dict-formula-box">
                        <div>
                          <strong>Origem / Variáveis:</strong> <span>{ind.variaveis_origem}</span>
                        </div>
                        <div>
                          <strong>Fórmula de Cálculo:</strong> <code>{ind.formula}</code>
                        </div>
                        <div>
                          <strong>Escala Geográfica Nativa:</strong> <span>{ind.escala_geografica} (Ref: {ind.ano_referencia})</span>
                        </div>
                      </div>

                      <div className="dict-method-box">
                        <p>
                          <strong>Metodologia:</strong> {ind.metodologia}
                        </p>
                        <p className="dict-limitation">
                          <strong>Limitações e Cuidados Interpretativos:</strong> {ind.limitacoes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: DESAFIO ANALÍTICO OBRIGATÓRIO (8 QUESTÕES EM ACORDEÃO INTERATIVO) */}
      {activeSubTab === 'desafio_analitico' && (
        <div className="table-section-card">
          <div className="table-header-bar">
            <div>
              <span className="section-eyebrow">
                Seção 9 do Projeto Integrador · Clique em uma questão para abrir a resposta fundamentada
              </span>
              <h3>Respostas ao Desafio Analítico Obrigatório (8 Questões)</h3>
            </div>
            <button
              type="button"
              className={`action-toggle-btn ${expandAllQuestions ? 'active' : ''}`}
              onClick={() => {
                const next = !expandAllQuestions;
                setExpandAllQuestions(next);
                const map = {};
                (data.analyses || []).forEach((item) => {
                  map[item.id] = next;
                });
                setOpenQuestionIds(map);
              }}
            >
              <Eye size={13} />
              <span>{expandAllQuestions ? 'Recolher Todas as Questões' : 'Expandir Todas as 8 Questões'}</span>
            </button>
          </div>

          <div className="accordion-list">
            {(data.analyses || []).map((item) => {
              const dimColor = getDimensaoColor(item.dimensao_foco);
              const isOpen = expandAllQuestions || !!openQuestionIds[item.id];
              return (
                <article key={item.id} className={`accordion-card ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => toggleQuestionAccordion(item.id)}
                  >
                    <div className="accordion-trigger-left">
                      <span className="question-number-badge">Questão {item.questao_numero}</span>
                      <span className="accordion-title">{item.titulo}</span>
                    </div>
                    <div className="accordion-trigger-right">
                      <span
                        className="dim-badge"
                        style={{
                          background: `${dimColor}16`,
                          color: dimColor,
                          border: `1px solid ${dimColor}38`,
                        }}
                      >
                        {item.dimensao_foco}
                      </span>
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="accordion-content">
                      <p className="analysis-body-text" style={{ marginTop: 10 }}>
                        {item.descricao}
                      </p>
                      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                        <span className="meta-tag">Registro #{item.id} · Atualizado em {item.data_criacao}</span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: CATÁLOGO DE FONTES E CONTEXTUALIZAÇÃO IPEA (IVS) */}
      {activeSubTab === 'fontes_ipea' && (
        <div className="screen-container">
          <div className="module-switcher-bar">
            <div className="module-tabs-group">
              <button
                type="button"
                className={`module-tab-btn ${activeFonteModule === 'fontes' ? 'active' : ''}`}
                onClick={() => setActiveFonteModule('fontes')}
              >
                <Database size={14} />
                <span>Catálogo de Bases de Dados Oficiais ({(data.fontes || []).length})</span>
              </button>
              <button
                type="button"
                className={`module-tab-btn ${activeFonteModule === 'ipea_ivs' ? 'active' : ''}`}
                onClick={() => setActiveFonteModule('ipea_ivs')}
              >
                <BookOpen size={14} />
                <span>Contextualização IPEA · Escalas do IVS ({ipeaObs.length})</span>
              </button>
            </div>
          </div>

          {activeFonteModule === 'fontes' && (
            <div className="table-section-card">
              <div className="table-header-bar">
                <div>
                  <span className="section-eyebrow">Tabela fontes no PostgreSQL / Supabase</span>
                  <h3>Catálogo Rastreável de Bases de Dados Oficiais e URLs de Consulta</h3>
                </div>
              </div>

              <div className="responsive-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Instituição</th>
                      <th>Título da Base / Conjunto de Dados</th>
                      <th>Escala Nativa</th>
                      <th>Período / Ano</th>
                      <th>Data Acesso</th>
                      <th>Link Oficial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.fontes || []).map((f) => (
                      <tr key={f.id}>
                        <td>#{f.id}</td>
                        <td>
                          <strong style={{ color: 'var(--accent-blue)' }}>{f.instituicao}</strong>
                        </td>
                        <td className="td-main-title">{f.titulo}</td>
                        <td>
                          <span className="meta-tag">{f.escala_nativa}</span>
                        </td>
                        <td>{f.ano_referencia}</td>
                        <td>{f.data_acesso}</td>
                        <td>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="source-link-btn"
                          >
                            Acessar Base <ExternalLink size={13} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeFonteModule === 'ipea_ivs' && (
            <div className="table-section-card">
              <div className="table-header-bar">
                <div>
                  <span className="section-eyebrow">
                    Contextualização Social IPEA · Atlas da Vulnerabilidade Social (IVS)
                  </span>
                  <h3>Registros do IVS nas Escalas Efetivamente Publicadas pelo IPEA (UF, RM/Município e UDH)</h3>
                </div>
              </div>
              <p className="chart-description" style={{ marginBottom: 14 }}>
                O <strong>Índice de Vulnerabilidade Social (IVS)</strong> do IPEA varia de <strong>0 a 1</strong> (quanto
                mais próximo de 1, maior a vulnerabilidade social; valores ≥ 0,400 indicam Alta Vulnerabilidade). Conforme
                a orientação metodológica, apresentamos os valores exatamente nas escalas e anos publicados pelo IPEA: as{' '}
                <strong>Unidades de Desenvolvimento Humano (UDHs)</strong> intramunicipais de Beiru/Tancredo Neves (
                <strong>0,442</strong>) e Pernambués (<strong>0,398</strong>) no marco censitário do Atlas, e a evolução
                recente de Salvador e da Bahia até 2022 via PNAD Contínua.
              </p>
              <div className="responsive-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Território / Recorte</th>
                      <th>Tipo de Escala</th>
                      <th>Ano de Referência</th>
                      <th>IVS Geral (0 a 1)</th>
                      <th>Faixa de Vulnerabilidade (IPEA)</th>
                      <th>Escala Efetivamente Publicada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipeaObs.map((row) => {
                      const v = Number(row.valor);
                      const faixa =
                        v >= 0.4
                          ? 'Alta Vulnerabilidade (0,401 – 0,500)'
                          : v >= 0.3
                          ? 'Média Vulnerabilidade (0,301 – 0,400)'
                          : 'Baixa Vulnerabilidade (0,201 – 0,300)';
                      return (
                        <tr key={row.id}>
                          <td className="td-main-title">{row.territorio?.nome}</td>
                          <td>
                            <span className="meta-tag">{row.territorio?.tipo}</span>
                          </td>
                          <td>
                            <strong>{row.ano}</strong>
                          </td>
                          <td className="td-numeric-highlight">{formatNumber(v, 3)}</td>
                          <td>
                            <span
                              className="classification-pill"
                              style={{
                                color: v >= 0.4 ? 'var(--accent-rose)' : v >= 0.3 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                                borderColor: 'var(--border-medium)',
                                background: 'var(--bg-subtle)',
                              }}
                            >
                              {faixa}
                            </span>
                          </td>
                          <td>{row.escala_registro}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
