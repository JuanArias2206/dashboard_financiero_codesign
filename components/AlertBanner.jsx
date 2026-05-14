/* ──────────────────────────────────────────
   ALERT BANNER — Alertas críticas y advertencias
   ────────────────────────────────────────── */

window.AlertBanner = function AlertBanner({ alerts, onDismiss }) {
  const [dismissed, setDismissed] = React.useState({});

  const handleDismiss = (i) => {
    setDismissed(prev => ({ ...prev, [i]: true }));
    onDismiss && onDismiss(i);
  };

  const visibleAlerts = alerts.filter((_, i) => !dismissed[i]);

  if (visibleAlerts.length === 0) return null;

  const iconMap = {
    critico: '🔴',
    alto: '🟠',
    medio: '🟡',
  };

  return (
    <div style={styles.wrap}>
      {visibleAlerts.slice(0, 3).map((a, i) => (
        <div key={i} style={{
          ...styles.alert,
          borderLeft: `3px solid ${a.nivel === 'critico' ? '#ef4444' : a.nivel === 'alto' ? '#f59e0b' : '#eab308'}`,
          background: a.nivel === 'critico' ? 'rgba(239,68,68,0.06)' :
                       a.nivel === 'alto' ? 'rgba(245,158,11,0.06)' : 'rgba(234,179,8,0.05)',
        }}>
          <span style={styles.icon}>{iconMap[a.nivel] || 'ℹ️'}</span>
          <span style={{
            ...styles.text,
            color: a.nivel === 'critico' ? '#fca5a5' : a.nivel === 'alto' ? '#fcd34d' : '#fde68a',
          }}>{a.mensaje}</span>
          <button style={styles.dismiss} onClick={() => handleDismiss(i)}>✕</button>
        </div>
      ))}
      {visibleAlerts.length > 3 && (
        <div style={styles.more}>
          +{visibleAlerts.length - 3} alertas más
        </div>
      )}
    </div>
  );
};

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    animation: 'fadeIn 0.2s ease',
  },
  icon: {
    fontSize: 14,
    flexShrink: 0,
  },
  text: {
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
    flex: 1,
  },
  dismiss: {
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    fontSize: 11,
    padding: '2px 4px',
    borderRadius: 4,
  },
  more: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    padding: '2px 0',
  },
};
