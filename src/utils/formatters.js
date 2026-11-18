export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  return Number(val).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(val, decimals = 2) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  return Number(val).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatValueByUnit(val, unidade) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  const u = (unidade || '').toLowerCase();
  if (u === 'r$') return formatCurrency(val, 2);
  if (u === '%' || u.includes('%')) return `${formatNumber(val, 2)}%`;
  if (u === 'habitantes' || u === 'domicílios') return formatNumber(val, 0);
  if (u === 'hab/km²') return `${formatNumber(val, 1)} hab/km²`;
  if (u === 'gwh') return `${formatNumber(val, 2)} GWh`;
  if (u.includes('0 a 1')) return formatNumber(val, 3);
  return `${formatNumber(val, 2)} ${unidade || ''}`.trim();
}

/**
 * Estilo do selo de classificação metodológica (Dado observado / Indicador derivado / Proxy).
 * As cores vêm de variáveis CSS para acompanhar os modos claro e escuro.
 */
export function getClassificacaoBadgeStyle(classificacao) {
  const key =
    classificacao === 'Dado observado'
      ? 'obs'
      : classificacao === 'Indicador derivado'
        ? 'der'
        : classificacao === 'Proxy/estimativa'
          ? 'proxy'
          : 'neutral';
  const short = {
    obs: 'Dado observado',
    der: 'Indicador derivado',
    proxy: 'Proxy / estimativa',
    neutral: classificacao || 'Indicador',
  }[key];
  return {
    bg: `var(--badge-${key}-bg)`,
    border: `var(--badge-${key}-border)`,
    text: `var(--badge-${key}-text)`,
    short,
  };
}

/** Cor discreta usada apenas no marcador (ponto) do selo de dimensão. */
export function getDimensaoColor(dimensao) {
  const map = {
    Demográfica: '#1f4e79',
    Econômica: '#b7791f',
    Social: '#6b5b95',
    Habitacional: '#3f6e5a',
    Urbana: '#4a7a8c',
    Energética: '#a08a2c',
    Socioenergética: '#8c4a5a',
  };
  return map[dimensao] || '#64748b';
}
