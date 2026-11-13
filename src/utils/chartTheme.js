export function getChartTheme(theme = 'dark') {
  const isLight = theme === 'light';
  return {
    isLight,
    gridStroke: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.14)',
    polarStroke: isLight ? 'rgba(15, 23, 42, 0.14)' : 'rgba(148, 163, 184, 0.22)',
    axisStroke: isLight ? '#64748b' : '#94a3b8',
    tickFill: isLight ? '#475569' : '#94a3b8',
    tooltipStyle: {
      backgroundColor: isLight ? 'rgba(255, 255, 255, 0.97)' : 'rgba(15, 23, 42, 0.96)',
      border: isLight ? '1px solid rgba(15, 23, 42, 0.12)' : '1px solid #334155',
      borderRadius: '10px',
      color: isLight ? '#0f172a' : '#f8fafc',
      boxShadow: isLight ? '0 10px 25px rgba(15, 23, 42, 0.12)' : '0 12px 28px rgba(0, 0, 0, 0.45)',
      fontSize: '12px',
    },
    tooltipItemStyle: {
      color: isLight ? '#0f172a' : '#f8fafc',
      fontWeight: 500,
    },
    tooltipLabelStyle: {
      color: isLight ? '#0284c7' : '#38bdf8',
      fontWeight: 700,
      marginBottom: '4px',
    },
    barCursor: {
      fill: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.10)',
    },
  };
}
