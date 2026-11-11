import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Scale,
  Map as MapIcon,
  Zap,
  BookOpen,
  Database,
  Activity,
  Github,
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
    label: 'Tela 1 • Visão Geral',
    subtitle: 'População, Renda e Entorno',
    icon: LayoutDashboard,
  },
  {
    id: 'comparativo',
    label: 'Tela 2 • Comparativo Territorial',
    subtitle: 'Beiru vs Pernambués (Δ e Δ%)',
    icon: Scale,
  },
  {
    id: 'mapa',
    label: 'Tela 3 • Mapa de Vulnerabilidade',
    subtitle: 'Bairros & 172 Setores (Censo 2022)',
    icon: MapIcon,
  },
  {
    id: 'energia_ievs',
    label: 'Tela 4 • Análise Energética & IEVS',
    subtitle: 'EPE Bahia (2018-25) + Simulador',
    icon: Zap,
  },
  {
    id: 'metodologia',
    label: 'Tela 5 • Metodologia & 8 Questões',
    subtitle: 'Dicionário, Fórmulas e Análise',
    icon: BookOpen,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [selectedBairro, setSelectedBairro] = useState('2927408018');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <h2>Carregando Observatório de Vulnerabilidade Socioenergética de Salvador...</h2>
        <p>Integrando dados oficiais do IBGE (Censo 2022), IPEA (Atlas IVS) e EPE (Anuário Estatístico)</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Topo Institucional */}
      <header className="top-header">
        <div className="header-inner">
          <div className="brand-block">
            <div className="brand-logo-icon">
              <Zap size={24} />
            </div>
            <div>
              <div className="brand-eyebrow">
                SENAI CIMATEC • UC: DESENVOLVIMENTO FULLSTACK • PROF. CELSO BARRETO • AV3
              </div>
              <h1 className="brand-title">
                Observatório de Vulnerabilidade Socioenergética de Salvador
              </h1>
              <p className="brand-subtitle">
                Territórios Investigados: <strong>Beiru / Tancredo Neves</strong> (IBGE 2927408018) e{' '}
                <strong>Pernambués</strong> (IBGE 2927408117) • Fontes Oficiais: <strong>IBGE, IPEA e EPE</strong>
              </p>
            </div>
          </div>

          <div className="header-status-actions">
            <button
              type="button"
              className={`db-status-pill ${
                data.connectionStatus.mode === 'supabase_live' ? 'live' : 'snapshot'
              }`}
              onClick={() => setIsModalOpen(true)}
              title="Clique para configurar ou testar conexão PostgreSQL / Supabase"
            >
              <Database size={15} />
              <span>{data.connectionStatus.label}</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação das 5 Telas Obrigatórias */}
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
                <IconComp size={18} className="nav-tab-icon" />
                <div className="nav-tab-texts">
                  <span className="nav-tab-title">{tab.label}</span>
                  <span className="nav-tab-sub">{tab.subtitle}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo Principal da Tela Selecionada */}
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

      {/* Rodapé Institucional e Metodológico */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div>
            <strong>Observatório de Vulnerabilidade Socioenergética de Salvador</strong> — Situação de Aprendizagem
            (Projeto Integrador Fullstack • SENAI CIMATEC)
          </div>
          <div className="footer-links">
            <span>24 Indicadores Verificados</span>
            <span>•</span>
            <span>172 Setores Censitários (Censo 2022)</span>
            <span>•</span>
            <span>Série EPE Bahia (2018–2025)</span>
            <span>•</span>
            <a
              href="https://github.com/ironJohnsson/FullstackAV3"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
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
