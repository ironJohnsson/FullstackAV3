import React, { useState } from 'react';
import { Database, X, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '../lib/supabaseClient';

export default function SupabaseModal({ isOpen, onClose, connectionStatus, onReconnect }) {
  const currentCfg = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentCfg.url || '');
  const [anonKey, setAnonKey] = useState(currentCfg.anonKey || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    saveSupabaseConfig(url, anonKey);
    await onReconnect();
    setSaving(false);
    onClose();
  }

  async function handleClear() {
    saveSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    await onReconnect();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={20} style={{ color: '#10b981' }} />
            <h3>Persistência PostgreSQL / Supabase (Etapa 4)</h3>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="status-banner-modal">
            <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
            <div>
              <strong>Status Atual:</strong> {connectionStatus?.label}
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
                Tabelas modeladas: <code>territories</code>, <code>fontes</code>, <code>indicadores</code>,{' '}
                <code>observacoes</code> ({connectionStatus?.totalObservacoes} registros) e <code>analyses</code> (8
                questões).
              </div>
            </div>
          </div>

          <div className="security-note-modal">
            <ShieldCheck size={17} style={{ color: '#38bdf8', flexShrink: 0 }} />
            <span>
              <strong>Boas Práticas de Segurança (RLS):</strong> O frontend utiliza exclusivamente a chave pública{' '}
              <code>anon</code> com políticas de <em>Row Level Security (SELECT-only)</em> definidas em{' '}
              <code>supabase/schema.sql</code>. Chaves privilegiadas (<code>service_role</code>) nunca são expostas no
              navegador.
            </span>
          </div>

          <form onSubmit={handleSave} className="modal-form">
            <label className="modal-label">
              URL do Projeto Supabase (<code>VITE_SUPABASE_URL</code>):
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="modal-input"
              />
            </label>

            <label className="modal-label">
              Chave Pública Anon JWT (<code>VITE_SUPABASE_ANON_KEY</code>):
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="modal-input"
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={handleClear}>
                Usar Espelho Pós-ETL
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                <RefreshCw size={15} /> {saving ? 'Conectando...' : 'Salvar e Consultar Supabase'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
