/**
 * Paleta institucional do Observatório.
 * Cores de série são fixas por entidade (o mesmo território tem sempre a mesma cor
 * em todas as telas) e ajustadas para manter contraste nos modos claro e escuro.
 */
const SERIES = {
  light: {
    beiru: '#1f4e79',
    pern: '#b7791f',
    ssa: '#94a3b8',
    bahia: '#3f6e5a',
    // Categóricas neutras para séries que não são territórios
    cat: ['#1f4e79', '#b7791f', '#3f6e5a', '#8c4a5a', '#64748b'],
    // Escala sequencial (baixo → alto) usada no mapa coroplético
    seq: ['#e9e2cf', '#d6b27a', '#b9733f', '#8a3b25'],
    seqNeutral: '#cbd5e1',
    regular: '#9fb4c9',
  },
  dark: {
    beiru: '#7aa7d6',
    pern: '#e0a955',
    ssa: '#7c8799',
    bahia: '#7fb39a',
    cat: ['#7aa7d6', '#e0a955', '#7fb39a', '#d08a9b', '#94a3b8'],
    seq: ['#e9e2cf', '#d6b27a', '#b9733f', '#8a3b25'],
    seqNeutral: '#475569',
    regular: '#6f8aa6',
  },
};

export function getSeriesColors(theme = 'light') {
  return SERIES[theme === 'dark' ? 'dark' : 'light'];
}

export function getChartTheme(theme = 'light') {
  const isLight = theme !== 'dark';
  const series = getSeriesColors(theme);
  return {
    isLight,
    series,
    gridStroke: isLight ? '#e7e9ee' : 'rgba(148, 163, 184, 0.14)',
    polarStroke: isLight ? '#d9dde4' : 'rgba(148, 163, 184, 0.22)',
    axisStroke: isLight ? '#cbd2dc' : '#3b4656',
    tickFill: isLight ? '#5b6474' : '#9aa5b5',
    legendStyle: { fontSize: 12, color: isLight ? '#3d4554' : '#c3cad5', paddingTop: 6 },
    tooltipStyle: {
      backgroundColor: isLight ? '#ffffff' : '#1b2230',
      border: isLight ? '1px solid #dde1e7' : '1px solid #2e3747',
      borderRadius: '6px',
      color: isLight ? '#1a2230' : '#e8ecf2',
      boxShadow: isLight ? '0 6px 18px rgba(16, 24, 40, 0.08)' : '0 8px 22px rgba(0, 0, 0, 0.4)',
      fontSize: '12px',
      padding: '8px 10px',
    },
    tooltipItemStyle: {
      color: isLight ? '#1a2230' : '#e8ecf2',
      fontWeight: 500,
      padding: '1px 0',
    },
    tooltipLabelStyle: {
      color: isLight ? '#1a2230' : '#e8ecf2',
      fontWeight: 600,
      marginBottom: '4px',
    },
    barCursor: {
      fill: isLight ? 'rgba(31, 78, 121, 0.05)' : 'rgba(122, 167, 214, 0.08)',
    },
  };
}
