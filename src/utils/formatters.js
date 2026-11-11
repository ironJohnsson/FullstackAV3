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

export function getClassificacaoBadgeStyle(classificacao) {
  switch (classificacao) {
    case 'Dado observado':
      return {
        bg: 'rgba(16, 185, 129, 0.14)',
        border: 'rgba(16, 185, 129, 0.4)',
        text: '#34d399',
        short: 'Dado Observado',
      };
    case 'Indicador derivado':
      return {
        bg: 'rgba(56, 189, 248, 0.14)',
        border: 'rgba(56, 189, 248, 0.4)',
        text: '#38bdf8',
        short: 'Indicador Derivado',
      };
    case 'Proxy/estimativa':
      return {
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.45)',
        text: '#fbbf24',
        short: 'Proxy / Estimativa',
      };
    default:
      return {
        bg: 'rgba(148, 163, 184, 0.15)',
        border: 'rgba(148, 163, 184, 0.4)',
        text: '#cbd5e1',
        short: classificacao || 'Indicador',
      };
  }
}

export function getDimensaoColor(dimensao) {
  const map = {
    Demográfica: '#38bdf8',
    Econômica: '#f59e0b',
    Social: '#a855f7',
    Habitacional: '#10b981',
    Urbana: '#06b6d4',
    Energética: '#eab308',
    Socioenergética: '#f43f5e',
  };
  return map[dimensao] || '#64748b';
}
