/* ──────────────────────────────────────────
   DONUT CHART — Distribución circular (aging)
   SVG puro con animación hover por sector
   ────────────────────────────────────────── */

window.DonutChart = function DonutChart({ data }) {
  const [hovered, setHovered] = React.useState(-1);
  const CX = 120, CY = 120, R = 90, IR = 52;
  const total = data.reduce((s, d) => s + d.pct, 0);
  let cur = 0;

  const arcPath = (start, end) => {
    const sr = ((start / total) * 2 - 0.5) * Math.PI;
    const er = ((end / total) * 2 - 0.5) * Math.PI;
    const sx = CX + R * Math.cos(sr), sy = CY + R * Math.sin(sr);
    const ex = CX + R * Math.cos(er), ey = CY + R * Math.sin(er);
    const large = end - start > 50 ? 1 : 0;
    return `M${sx.toFixed(1)},${sy.toFixed(1)} A${R},${R} 0 ${large} 1 ${ex.toFixed(1)},${ey.toFixed(1)} L${CX},${CY} Z`;
  };

  const innerArc = (start, end) => {
    const sr = ((start / total) * 2 - 0.5) * Math.PI;
    const er = ((end / total) * 2 - 0.5) * Math.PI;
    const sx = CX + IR * Math.cos(sr), sy = CY + IR * Math.sin(sr);
    const ex = CX + IR * Math.cos(er), ey = CY + IR * Math.sin(er);
    const sx2 = CX + R * Math.cos(sr), sy2 = CY + R * Math.sin(sr);
    const ex2 = CX + R * Math.cos(er), ey2 = CY + R * Math.sin(er);
    const large = end - start > 50 ? 1 : 0;
    return `M${sx.toFixed(1)},${sy.toFixed(1)} L${sx2.toFixed(1)},${sy2.toFixed(1)} A${R},${R} 0 ${large} 1 ${ex2.toFixed(1)},${ey2.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)} A${IR},${IR} 0 ${large} 0 ${sx.toFixed(1)},${sy.toFixed(1)} Z`;
  };

  const fmt = (v) => {
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
    return '$' + (v / 1e3).toFixed(0) + 'K';
  };

  return (
    <div style={styles.wrap}>
      <svg viewBox="0 0 240 240" style={{ width: '100%', maxWidth: 280, height: 'auto', display: 'block', margin: '0 auto' }}
        role="img" aria-label="Distribución de cartera por antigüedad">
        {/* Slices */}
        {data.map((d, i) => {
          const startAngle = cur;
          cur += d.pct;
          const endAngle = cur;
          const isHov = hovered === i;
          return (
            <g key={d.key}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(-1)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              transform={isHov ? `scale(1.03) translate(${-CX * 0.03},${-CY * 0.03})` : ''}
            >
              <path d={innerArc(startAngle, endAngle)} fill={d.color} opacity={isHov ? 1 : 0.85}
                stroke="#0a0e17" strokeWidth={1.5} />
            </g>
          );
        })}

        {/* Centro */}
        <circle cx={CX} cy={CY} r={IR - 4} fill="#0f1622" />
        <text x={CX} y={CY - 8} textAnchor="middle" fill="#94a3b8" fontSize={10}
          fontFamily="'JetBrains Mono', ui-monospace, monospace">
          Total cartera
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fill="#f1f5f9" fontSize={16} fontWeight={700}
          fontFamily="'JetBrains Mono', ui-monospace, monospace" fontVariantNumeric="tabular-nums">
          $38.4B
        </text>

        {/* Label hovered */}
        {hovered >= 0 && hovered < data.length && (() => {
          const d = data[hovered];
          return (
            <g>
              <rect x={30} y={215} width={180} height={20} rx={6} fill="#1c2333"
                stroke="rgba(148,163,184,0.12)" />
              <text x={120} y={228} textAnchor="middle" fill="#f1f5f9" fontSize={10}
                fontFamily="'JetBrains Mono', ui-monospace, monospace">
                {d.label}: {fmt(d.saldo)} ({d.pct}%)
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Leyenda */}
      <div style={styles.legend}>
        {data.map((d, i) => (
          <div key={d.key} style={styles.legendItem}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(-1)}>
            <span style={{ ...styles.dot, background: d.color, opacity: hovered === i ? 1 : 0.7 }} />
            <span style={{ ...styles.legendLabel, color: hovered === i ? '#f1f5f9' : '#94a3b8' }}>{d.label}</span>
            <span style={styles.legendVal}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  wrap: {
    background: '#111b2e',
    borderRadius: 16,
    padding: '16px 16px 12px',
    border: '1px solid rgba(148,163,184,0.08)',
  },
  legend: {
    marginTop: 8,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    padding: '3px 4px',
    borderRadius: 4,
    transition: 'background 0.15s',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 10,
    flex: 1,
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    transition: 'color 0.15s',
  },
  legendVal: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontVariantNumeric: 'tabular-nums',
  },
};
