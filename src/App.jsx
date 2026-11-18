import React, { useState, useEffect, useCallback } from 'react';
import { Database, Github, Sun, Moon, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchObservatorioData } from './services/observatorioService';
import TelaVisaoGeral from './components/TelaVisaoGeral';
import TelaComparativo from './components/TelaComparativo';
import TelaMapa from './components/TelaMapa';
import TelaEnergiaIEVS from './components/TelaEnergiaIEVS';
import TelaMetodologiaAnalise from './components/TelaMetodologiaAnalise';
import SupabaseModal from './components/SupabaseModal';
import { formatNumber } from './utils/formatters';

// Nomes das telas seguem a Seção 6 da Situação de Aprendizagem
const NAV_TABS = [
  { id: 'visao_geral', step: '01', label: 'Visão geral' },
  { id: 'comparativo', step: '02', label: 'Comparativo territorial' },
  { id: 'mapa', step: '03', label: 'Mapa de vulnerabilidade' },
  { id: 'energia_ievs', step: '04', label: 'Análise energética' },
  { id: 'metodologia', step: '05', label: 'Metodologia e fontes' },
];

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('obs_ui_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // armazenamento indisponível
  }
  return 'light';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [selectedBairro, setSelectedBairro] = useState('2927408018');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('obs_ui_theme', theme);
    } catch {
      // armazenamento indisponível
    }
  }, [theme]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchObservatorioData();
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function goToTab(id) {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading || !data) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <h2>Observatório de Vulnerabilidade Socioenergética</h2>
        <p>Carregando dados do IBGE (Censo 2022), IPEA (Atlas IVS) e EPE (Anuário Estatístico)…</p>
      </div>
    );
  }

  const isLive = data.connectionStatus.mode === 'supabase_live';
  const beiru = data.perfisTerritoriais['2927408018'];
  const pern = data.perfisTerritoriais['2927408117'];
  const epeYears = (data.epeBahiaSeries || []).map((r) => r.ano);
  const epeRange = epeYears.length ? `${Math.min(...epeYears)}–${Math.max(...epeYears)}` : '—';

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="header-inner">
          <div className="brand-block">
            <div className="brand-mark" aria-hidden="true">
              OVS
            </div>
            <div className="brand-copy">
              <span className="brand-kicker">SENAI CIMATEC · Desenvolvimento Fullstack</span>
              <h1 className="brand-title">Observatório de Vulnerabilidade Socioenergética de Salvador</h1>
              <span className="brand-subtitle">Beiru / Tancredo Neves e Pernambués · IBGE, IPEA e EPE</span>
            </div>
          </div>

          <div className="header-status-actions">
            <button
              type="button"
              className={`header-btn ${showProjectInfo ? 'active' : ''}`}
              onClick={() => setShowProjectInfo((v) => !v)}
              aria-expanded={showProjectInfo}
            >
              <Info size={15} />
              <span>Sobre o projeto</span>
              {showProjectInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              type="button"
              className={`header-btn db-status ${isLive ? 'live' : 'snapshot'}`}
              onClick={() => setIsModalOpen(true)}
              title="Ver ou configurar a conexão com o Supabase"
            >
              <span className="status-dot" />
              <Database size={14} />
              <span>{isLive ? 'Supabase conectado' : 'Espelho do ETL'}</span>
            </button>

            <button
              type="button"
              className="header-btn icon-only"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              title={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
              aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {showProjectInfo && (
          <div className="project-info-drawer">
            <dl className="project-info-grid">
              <div>
                <dt>Instituição</dt>
                <dd>Centro Universitário SENAI CIMATEC · UC Desenvolvimento Fullstack · Prof. Celso Barreto (AV3)</dd>
              </div>
              <div>
                <dt>Territórios</dt>
                <dd>
                  Beiru / Tancredo Neves (IBGE <code>2927408018</code> · {formatNumber(beiru?.POP_RESIDENTE)} hab.) e
                  Pernambués (IBGE <code>2927408117</code> · {formatNumber(pern?.POP_RESIDENTE)} hab.), com Salvador
                  (<code>2927408</code>) como referência e a Bahia (UF 29) apenas para o contexto energético.
                </dd>
              </div>
              <div>
                <dt>Fonte dos dados</dt>
                <dd>
                  {data.connectionStatus.label} · {data.connectionStatus.totalObservacoes} observações.
                </dd>
              </div>
            </dl>
          </div>
        )}

        <nav className="main-nav" aria-label="Telas do observatório">
          <div className="main-nav-inner">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => goToTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span className="nav-tab-step">{tab.step}</span>
                <span className="nav-tab-title">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'visao_geral' && (
          <TelaVisaoGeral
            data={data}
            selectedBairro={selectedBairro}
            setSelectedBairro={setSelectedBairro}
            theme={theme}
          />
        )}
        {activeTab === 'comparativo' && <TelaComparativo data={data} theme={theme} />}
        {activeTab === 'mapa' && <TelaMapa data={data} appTheme={theme} />}
        {activeTab === 'energia_ievs' && <TelaEnergiaIEVS data={data} theme={theme} />}
        {activeTab === 'metodologia' && <TelaMetodologiaAnalise data={data} />}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>Observatório de Vulnerabilidade Socioenergética de Salvador</strong>
            <span>Projeto Integrador · SENAI CIMATEC</span>
          </div>
          <div className="footer-links">
            <span>{data.indicadores.length} indicadores</span>
            <span className="footer-sep" aria-hidden="true">·</span>
            <span>{data.resumoSetores?.total_setores ?? '—'} setores censitários (Censo 2022)</span>
            <span className="footer-sep" aria-hidden="true">·</span>
            <span>EPE Bahia {epeRange}</span>
            <span className="footer-sep" aria-hidden="true">·</span>
            <a
              href="https://github.com/ironJohnsson/FullstackAV3"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-gh-link"
            >
              <Github size={13} /> Repositório
            </a>
          </div>
        </div>
      </footer>

      <SupabaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        connectionStatus={data.connectionStatus}
        onReconnect={loadData}
      />
    </div>
  );
}
