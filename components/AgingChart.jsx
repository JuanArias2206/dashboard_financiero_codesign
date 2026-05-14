/* ──────────────────────────────────────────
   AGING CHART — Barras de antigüedad de cartera
   SVG inline con tooltips interactivos
   ────────────────────────────────────────── */

window.AgingChart = function AgingChart({ data }) {
  const [hovered, setHovered] = React.useState(-1);
  const W = 560, H = 220, P = { top: 16, right: 16, bottom: 40, left: 80 };
  const iW = W - P.left - P.right;
  const barH = 22;
  const gap = 6;
  const totalH = data.length * (barH + gap);
  const chartH = totalH + P.top + P.bottom;

  const maxVal = Math.max(...data.map(d => d.saldo));
  const fmt = (v) => {
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(0) + 'M';
    return '$' + (v / 1e3).toFixed(0) + 'K';
  };

  return (
    <div style={styles.wrap}>
      <svg viewBox={`0 0 ${W} ${chartH}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Distribución por antigüedad de cartera">
        {/* Eje X */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const x = P.left + r * iW;
          return (
            <g key={i}>
              <line x1={x} y1={P.top} x2={x} y2={P.top + totalH} stroke="rgba(148,163,184,0.06)" strokeWidth={1} />
              <text x={x} y={P.top + totalH + 16} textAnchor="middle" fill="#475569" fontSize={10}
                fontFamily="'JetBrains Mono', ui-monospace, monospace">
                {fmt(maxVal * r)}
              </text>
            </g>
          );
        })}

        {/* Barras */}
        {data.map((d, i) => {
          const y = P.top + i * (barH + gap);
          const bw = (d.saldo / maxVal) * iW;
          const isHov = hovered === i;
          return (
            <g key={d.key}>
              <text x={P.left - 8} y={y + barH / 2 + 4} textAnchor="end" fill={isHov ? '#f1f5f9' : '#64748b'}
                fontSize={isHov ? 12 : 11} fontWeight={isHov ? 700 : 500}>
                {d.label}
              </text>
              <rect
                x={P.left} y={y} width={Math.max(bw, 4)} height={barH} rx={4}
                fill={d.color} opacity={isHov ? 1 : 0.8}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(-1)}
              />
              <text
                x={P.left + bw + 8} y={y + barH / 2 + 4}
                fill={isHov ? '#f1f5f9' : '#94a3b8'}
                fontSize={11} fontFamily="'JetBrains Mono', ui-monospace, monospace"
                fontVariantNumeric="tabular-nums"
                opacity={isHov ? 1 : 0.7}
                style={{ transition: 'opacity 0.15s' }}
              >
                {fmt(d.saldo)} ({d.pct}%)
              </text>
              {isHov && (
                <g>
                  <rect
                    x={P.left + iW - 160} y={y - 22} width={160} height={20} rx={6}
                    fill="#1c2333" stroke="rgba(148,163,184,0.15)"
                  />
                  <text x={P.left + iW - 80} y={y - 8} textAnchor="middle" fill="#94a3b8" fontSize={10}
                    fontFamily="'JetBrains Mono', ui-monospace, monospace">
                    {d.docs.toLocaleString()} documentos
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const styles = {
  wrap: {
    background: '#111b2e',
    borderRadius: 16,
    padding: '18px 16px 8px',
    border: '1px solid rgba(148,163,184,0.08)',
  },
};
