import { createClient } from '@supabase/supabase-js';

const DEFAULT_PROJECT_URL = 'https://xihsaawlfcuapdhoijay.supabase.co';
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_TaPAZyj2TU7524hbXh3qng__dIZZIf2';

const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_PROJECT_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_PUBLISHABLE_KEY;

export function getStoredSupabaseConfig() {
  try {
    const savedUrl = localStorage.getItem('obs_supabase_url') || envUrl;
    const savedKey = localStorage.getItem('obs_supabase_anon_key') || envAnonKey;
    const isValid =
      Boolean(savedUrl && savedKey) &&
      !savedUrl.includes('seu-projeto-id') &&
      savedUrl.startsWith('http');
    return {
      url: savedUrl,
      anonKey: savedKey,
      isConfigured: isValid,
      source: localStorage.getItem('obs_supabase_url') ? 'localStorage' : 'env',
    };
  } catch {
    const isValid =
      Boolean(envUrl && envAnonKey) &&
      !envUrl.includes('seu-projeto-id') &&
      envUrl.startsWith('http');
    return {
      url: envUrl,
      anonKey: envAnonKey,
      isConfigured: isValid,
      source: 'env',
    };
  }
}

export function saveSupabaseConfig(url, anonKey) {
  if (!url || !anonKey) {
    localStorage.removeItem('obs_supabase_url');
    localStorage.removeItem('obs_supabase_anon_key');
    return null;
  }
  localStorage.setItem('obs_supabase_url', url.trim());
  localStorage.setItem('obs_supabase_anon_key', anonKey.trim());
  return createClient(url.trim(), anonKey.trim());
}

export function getSupabaseClient() {
  const cfg = getStoredSupabaseConfig();
  if (!cfg.isConfigured) {
    return null;
  }
  return createClient(cfg.url, cfg.anonKey);
}
