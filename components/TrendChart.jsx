/* ──────────────────────────────────────────────
   TREND CHART — Evolución mensual facturación vs recaudo
   SVG área con tooltips, comparación año anterior
   ────────────────────────────────────────────── */

window.TrendChart = function TrendChart({ data, accent }) {
  const [hovered, setHovered] = React.useState(-1);
  // data: array de { month, facturado, saldo, year }
  const W = 640, H = 260, P = { top: 16, right: 20, bottom: 36, left: 52 };
  const iW = W - P.left - P.right;
  const iH = H - P.top - P.bottom;
  const last12 = data.slice(-12);
  const maxVal = Math.max(...last12.flatMap(d => [d.facturado || 0, d.saldo || 0])) * 1.15;

  const xScale = (i) => P.left + (i / Math.max(last12.length - 1, 1)) * iW;
  const yScale = (v) => P.top + iH - (v / maxVal) * iH;

  const factPath = last12.map((d, i) =>
    `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.facturado || 0).toFixed(1)}`
  ).join('');
  const factArea = factPath +
    `L${xScale(last12.length - 1).toFixed(1)},${(P.top + iH).toFixed(1)}` +
    `L${xScale(0).toFixed(1)},${(P.top + iH).toFixed(1)}Z`;

  const saldoPath = last12.map((d, i) =>
    `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.saldo || 0).toFixed(1)}`
  ).join('');

  const fmt = (v) => {
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(0) + 'M';
    return '$' + (v / 1e3).toFixed(0) + 'K';
  };

  return (
    <div style={styles.wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        role="img" aria-label="Evolución mensual facturación vs saldo de cartera">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = P.top + iH - r * iH;
          return (
            <g key={i}>
              <line x1={P.left} y1={y} x2={W - P.right} y2={y} stroke="rgba(148,163,184,0.07)" strokeWidth={1} />
              <text x={P.left - 8} y={y + 4} textAnchor="end" fill="#475569" fontSize={10}
                fontFamily="'JetBrains Mono', ui-monospace, monospace">
                {fmt(maxVal * r)}
              </text>
            </g>
          );
        })}

        {/* Área facturación */}
        <path d={factArea} fill={accent} opacity={0.08} />
        {/* Línea facturación */}
        <path d={factPath} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Línea saldo (cartera) */}
        <path d={saldoPath} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="6,3" opacity={0.6} />

        {/* Eje X meses */}
        {last12.map((d, i) => (
          <text key={i} x={xScale(i)} y={H - 4} textAnchor={i === 0 ? 'start' : i === last12.length - 1 ? 'end' : 'middle'}
            fill="#475569" fontSize={9} fontFamily="'JetBrains Mono', ui-monospace, monospace">
            {d.month ? d.month.slice(0, 3) : ''}
          </text>
        ))}

        {/* Hit areas + tooltips */}
        {last12.map((d, i) => (
          <g key={i}>
            <rect
              x={xScale(i) - 14} y={P.top} width={28} height={iH}
              fill="transparent" style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(-1)}
            />
            {hovered === i && (
              <>
                <circle cx={xScale(i)} cy={yScale(d.facturado || 0)} r={5} fill={accent} stroke="#0a0e17" strokeWidth={2.5} />
                <circle cx={xScale(i)} cy={yScale(d.saldo || 0)} r={5} fill="#f59e0b" stroke="#0a0e17" strokeWidth={2.5} />
                <rect
                  x={Math.min(Math.max(xScale(i) - 56, 4), W - 136)}
                  y={Math.max(yScale(Math.max(d.facturado || 0, d.saldo || 0)) - 52, 4)}
                  width={130} height={48} rx={8}
                  fill="#1c2333" stroke="rgba(148,163,184,0.15)"
                />
                <text
                  x={Math.min(Math.max(xScale(i), 61), W - 67)}
                  y={Math.max(yScale(Math.max(d.facturado || 0, d.saldo || 0)) - 36, 10)}
                  textAnchor="middle" fill="#f1f5f9" fontSize={11} fontWeight={700}
                  fontFamily="'JetBrains Mono', ui-monospace, monospace">
                  {d.month}
                </text>
                <text
                  x={Math.min(Math.max(xScale(i), 61), W - 67)}
                  y={Math.max(yScale(Math.max(d.facturado || 0, d.saldo || 0)) - 20, 22)}
                  textAnchor="middle" fill={accent} fontSize={10}
                  fontFamily="'JetBrains Mono', ui-monospace, monospace">
                  Fact: {fmt(d.facturado || 0)}
                </text>
                <text
                  x={Math.min(Math.max(xScale(i), 61), W - 67)}
                  y={Math.max(yScale(Math.max(d.facturado || 0, d.saldo || 0)) - 8, 34)}
                  textAnchor="middle" fill="#f59e0b" fontSize={10}
                  fontFamily="'JetBrains Mono', ui-monospace, monospace">
                  Saldo: {fmt(d.saldo || 0)}
                </text>
              </>
            )}
          </g>
        ))}

        {/* Leyenda */}
        <rect x={W - 140} y={4} width={130} height={30} rx={6} fill="rgba(0,0,0,0.2)" />
        <rect x={W - 132} y={11} width={10} height={2} rx={1} fill={accent} />
        <text x={W - 118} y={15} fill={accent} fontSize={9} fontFamily="'JetBrains Mono', ui-monospace, monospace">
          Facturación
        </text>
        <line x1={W - 132} y1={22} x2={W - 122} y2={22} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,2" />
        <text x={W - 118} y={26} fill="#f59e0b" fontSize={9} fontFamily="'JetBrains Mono', ui-monospace, monospace">
          Saldo cartera
        </text>
      </svg>
    </div>
  );
};

const styles = {
  wrap: {
    background: '#111b2e',
    borderRadius: 16,
    padding: '16px 12px 8px',
    border: '1px solid rgba(148,163,184,0.08)',
  },
};
