import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Scale,
  Map as MapIcon,
  Zap,
  BookOpen,
  Database,
  Github,
  Sun,
  Moon,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { fetchObservatorioData } from './services/observatorioService';
import TelaVisaoGeral from './components/TelaVisaoGeral';
import TelaComparativo from './components/TelaComparativo';
import TelaMapa from './components/TelaMapa';
import TelaEnergiaIEVS from './components/TelaEnergiaIEVS';
import TelaMetodologiaAnalise from './components/TelaMetodologiaAnalise';
import SupabaseModal from './components/SupabaseModal';

const NAV_TABS = [
  {
    id: 'visao_geral',
    step: '01',
    label: 'Visão Geral',
    icon: LayoutDashboard,
  },
  {
    id: 'comparativo',
    step: '02',
    label: 'Comparativo',
    icon: Scale,
  },
  {
    id: 'mapa',
    step: '03',
    label: 'Mapa Territorial',
    icon: MapIcon,
  },
  {
    id: 'energia_ievs',
    step: '04',
    label: 'Energia & IEVS',
    icon: Zap,
  },
  {
    id: 'metodologia',
    step: '05',
    label: 'Metodologia & 8 Questões',
    icon: BookOpen,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [selectedBairro, setSelectedBairro] = useState('2927408018');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('obs_ui_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('obs_ui_theme', theme);
    } catch {
      // ignore storage errors
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

  if (loading || !data) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <h2>Carregando Observatório Socioenergético de Salvador</h2>
        <p>Integrando bases oficiais do IBGE (Censo 2022), IPEA (Atlas IVS) e EPE (Anuário Estatístico)</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="header-inner">
          <div className="brand-block">
            <div className="brand-logo-icon">
              <Zap size={18} />
            </div>
            <div className="brand-copy">
              <h1 className="brand-title">
                Observatório Socioenergético de Salvador
              </h1>
              <span className="brand-subtitle-compact">
                Beiru / Tancredo Neves e Pernambués · IBGE, IPEA e EPE
              </span>
            </div>
          </div>

          <div className="header-status-actions">
            <button
              type="button"
              className={`info-drawer-toggle ${showProjectInfo ? 'active' : ''}`}
              onClick={() => setShowProjectInfo((v) => !v)}
            >
              <Info size={14} />
              <span>Ficha do Projeto</span>
              {showProjectInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              title={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
            </button>

            <button
              type="button"
              className={`db-status-pill ${
                data.connectionStatus.mode === 'supabase_live' ? 'live' : 'snapshot'
              }`}
              onClick={() => setIsModalOpen(true)}
              title="Configurar ou testar conexão PostgreSQL / Supabase"
            >
              <span className="status-dot" />
              <Database size={13} />
              <span>Supabase Live</span>
            </button>
          </div>
        </div>

        {/* Gaveta Expansível com Ficha Institucional do Projeto */}
        {showProjectInfo && (
          <div className="project-info-drawer">
            <div className="project-info-drawer-inner">
              <div>
                <strong>Instituição:</strong> Centro Universitário SENAI CIMATEC · <strong>UC:</strong> Desenvolvimento Fullstack · <strong>Prof.:</strong> Celso Barreto (AV3)
              </div>
              <div>
                <strong>Recortes Oficiais Investigados:</strong> Bairro <code>Beiru / Tancredo Neves</code> (IBGE <code>2927408018</code> · 38.329 hab.) e Bairro <code>Pernambués</code> (IBGE <code>2927408117</code> · 52.564 hab.), comparados a <code>Salvador</code> (<code>2927408</code>) e ao contexto energético estadual da <code>Bahia</code> (<code>UF 29</code>).
              </div>
              <div>
                <strong>Conexão de Dados:</strong> {data.connectionStatus.label} ({data.connectionStatus.totalObservacoes} observações oficiais auditadas).
              </div>
            </div>
          </div>
        )}

        <div className="nav-bar-wrapper">
          <nav className="main-nav-tabs" aria-label="Navegação Principal das Telas do Observatório">
            {NAV_TABS.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComp size={15} className="nav-tab-icon" />
                  <span className="nav-tab-step">{tab.step}.</span>
                  <span className="nav-tab-title">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'visao_geral' && (
          <TelaVisaoGeral
            data={data}
            selectedBairro={selectedBairro}
            setSelectedBairro={setSelectedBairro}
            onNavigateTab={setActiveTab}
          />
        )}
        {activeTab === 'comparativo' && <TelaComparativo data={data} />}
        {activeTab === 'mapa' && <TelaMapa data={data} />}
        {activeTab === 'energia_ievs' && <TelaEnergiaIEVS data={data} />}
        {activeTab === 'metodologia' && <TelaMetodologiaAnalise data={data} />}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>Observatório Socioenergético de Salvador</strong>
            <span className="footer-sep">·</span>
            <span>SENAI CIMATEC</span>
          </div>
          <div className="footer-links">
            <span>24 Indicadores</span>
            <span className="footer-sep">·</span>
            <span>172 Setores (Censo 2022)</span>
            <span className="footer-sep">·</span>
            <span>EPE Bahia (2018–2025)</span>
            <span className="footer-sep">·</span>
            <a
              href="https://github.com/ironJohnsson/FullstackAV3"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-gh-link"
            >
              <Github size={13} /> GitHub
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
