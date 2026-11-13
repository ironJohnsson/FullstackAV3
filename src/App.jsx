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
    subtitle: 'População, Renda e Entorno',
    icon: LayoutDashboard,
  },
  {
    id: 'comparativo',
    step: '02',
    label: 'Comparativo Territorial',
    subtitle: 'Beiru vs. Pernambués',
    icon: Scale,
  },
  {
    id: 'mapa',
    step: '03',
    label: 'Mapa de Vulnerabilidade',
    subtitle: 'Bairros e 172 Setores',
    icon: MapIcon,
  },
  {
    id: 'energia_ievs',
    step: '04',
    label: 'Energia & Simulador IEVS',
    subtitle: 'EPE Bahia (2018–25) e Pesos',
    icon: Zap,
  },
  {
    id: 'metodologia',
    step: '05',
    label: 'Metodologia & 8 Questões',
    subtitle: 'Catálogo, Fontes e Análise',
    icon: BookOpen,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [selectedBairro, setSelectedBairro] = useState('2927408018');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        <h2>Carregando Observatório de Vulnerabilidade Socioenergética de Salvador</h2>
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
              <Zap size={20} />
            </div>
            <div className="brand-copy">
              <div className="brand-eyebrow-row">
                <span className="brand-eyebrow">SENAI CIMATEC · Desenvolvimento Fullstack · Prof. Celso Barreto · AV3</span>
                <span className="brand-divider">·</span>
                <span className="brand-sources-badge">Fontes Oficiais: IBGE, IPEA e EPE</span>
              </div>
              <h1 className="brand-title">
                Observatório de Vulnerabilidade Socioenergética de Salvador
              </h1>
              <p className="brand-subtitle">
                Recorte de Análise: <strong>Beiru / Tancredo Neves</strong> (<code>2927408018</code>) e{' '}
                <strong>Pernambués</strong> (<code>2927408117</code>) · Contextualizados em Salvador e na Bahia
              </p>
            </div>
          </div>

          <div className="header-status-actions">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              title={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
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
              <Database size={14} />
              <span>{data.connectionStatus.label}</span>
            </button>
          </div>
        </div>

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
                  <div className="nav-tab-icon-wrap">
                    <IconComp size={16} className="nav-tab-icon" />
                  </div>
                  <div className="nav-tab-texts">
                    <div className="nav-tab-title-row">
                      <span className="nav-tab-step">{tab.step}</span>
                      <span className="nav-tab-title">{tab.label}</span>
                    </div>
                    <span className="nav-tab-sub">{tab.subtitle}</span>
                  </div>
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
            <strong>Observatório de Vulnerabilidade Socioenergética de Salvador</strong>
            <span className="footer-sep">·</span>
            <span>Projeto Integrador Fullstack (SENAI CIMATEC)</span>
          </div>
          <div className="footer-links">
            <span>24 Indicadores Verificados</span>
            <span className="footer-sep">·</span>
            <span>172 Setores Censitários (Censo 2022)</span>
            <span className="footer-sep">·</span>
            <span>Série EPE Bahia (2018–2025)</span>
            <span className="footer-sep">·</span>
            <a
              href="https://github.com/ironJohnsson/FullstackAV3"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-gh-link"
            >
              <Github size={14} /> Repositório GitHub
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
