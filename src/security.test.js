/**
 * "Chaves privilegiadas de banco nunca devem ser expostas no frontend." (Seção 5)
 * Varre tudo o que vai para o navegador (src/ e index.html) em busca de chaves secretas.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return /\.(jsx?|tsx?|css|html|json)$/.test(entry.name) && !/\.test\.jsx?$/.test(entry.name) ? [full] : [];
  });
}

function decodeJwtRole(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')).role;
  } catch {
    return null;
  }
}

const files = [...listFiles(path.join(ROOT, 'src')), path.join(ROOT, 'index.html')];

describe('segurança do frontend', () => {
  it('não contém chaves secretas do Supabase (sb_secret_)', () => {
    const offenders = files.filter((f) => /sb_secret_[A-Za-z0-9_-]{8,}/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('não contém JWT com papel service_role', () => {
    const offenders = [];
    for (const f of files) {
      const jwts = fs.readFileSync(f, 'utf8').match(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || [];
      if (jwts.some((t) => decodeJwtRole(t) === 'service_role')) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });

  it('variáveis expostas ao navegador (VITE_) não carregam a chave service_role', () => {
    const example = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
    const viteVars = example.split('\n').filter((l) => l.startsWith('VITE_'));
    expect(viteVars.length).toBeGreaterThan(0);
    expect(viteVars.some((l) => /SERVICE_ROLE|SECRET/i.test(l))).toBe(false);
  });
});
