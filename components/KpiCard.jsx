/* ──────────────────────────────────────────
   KPI CARD — Tarjeta de métrica con sparkline
   ────────────────────────────────────────── */

window.KpiCard = function KpiCard({ label, value, sub, delta, deltaUp, sparkData, accent, icon }) {
  const sparkW = 100, sparkH = 32;
  const max = Math.max(...sparkData, 1);
  const min = Math.min(...sparkData);
  const range = Math.max(1, max - min);
  const step = sparkW / (sparkData.length - 1);
  const pts = sparkData.map((v, i) =>
    `${(i * step).toFixed(1)},${(sparkH - ((v - min) / range) * sparkH).toFixed(1)}`
  );
  const path = `M${pts.join(' L')}`;
  const area = `${path} L${sparkW},${sparkH} L0,${sparkH} Z`;

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={styles.left}>
          <div style={styles.iconWrap}>{icon}</div>
          <span style={styles.label}>{label}</span>
        </div>
        <svg width={sparkW} height={sparkH} style={styles.spark}>
          <path d={area} fill={`${accent}15`} />
          <path d={path} stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={styles.valueRow}>
        <span style={styles.value}>{value}</span>
        {delta && (
          <span style={{
            ...styles.delta,
            color: deltaUp ? accent : deltaUp === false ? '#ef4444' : '#64748b',
          }}>
            {deltaUp ? '↑' : deltaUp === false ? '↓' : '→'} {delta}
          </span>
        )}
      </div>
      {sub && <span style={styles.sub}>{sub}</span>}
    </div>
  );
};

const styles = {
  card: {
    background: '#111b2e',
    borderRadius: 16,
    padding: '18px 20px 16px',
    border: '1px solid rgba(148,163,184,0.08)',
    cursor: 'default',
    transition: 'all 0.2s ease',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
  spark: {
    flexShrink: 0,
    opacity: 0.7,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    color: '#f1f5f9',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
  },
  delta: {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  },
  sub: {
    display: 'block',
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  },
};
