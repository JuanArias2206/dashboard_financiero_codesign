const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#10b981",
  "accentWarm": "#f59e0b",
  "density": 1,
  "darkMode": true
}/*EDITMODE-END*/;

/* ──────────────────────────────────────────────
   FINANCIAL DATA
   ────────────────────────────────────────────── */
const MONTHLY_REVENUE = [
  { month: 'Ene', actual: 184, target: 170, forecast: 186 },
  { month: 'Feb', actual: 192, target: 178, forecast: 190 },
  { month: 'Mar', actual: 188, target: 185, forecast: 193 },
  { month: 'Abr', actual: 201, target: 190, forecast: 198 },
  { month: 'May', actual: 215, target: 198, forecast: 208 },
  { month: 'Jun', actual: 224, target: 205, forecast: 216 },
  { month: 'Jul', actual: 238, target: 215, forecast: 225 },
  { month: 'Ago', actual: 251, target: 225, forecast: 234 },
  { month: 'Sep', actual: 267, target: 235, forecast: 246 },
  { month: 'Oct', actual: 282, target: 248, forecast: 258 },
  { month: 'Nov', actual: 298, target: 260, forecast: 270 },
  { month: 'Dic', actual: 312, target: 275, forecast: 285 },
];

const EXPENSES_BY_CATEGORY = [
  { category: 'Cloud infra', value: 42, color: '#6366f1' },
  { category: 'Marketing', value: 28, color: '#10b981' },
  { category: 'Salaries', value: 86, color: '#f59e0b' },
  { category: 'Operations', value: 18, color: '#ef4444' },
  { category: 'R&D', value: 34, color: '#8b5cf6' },
];

const PORTFOLIO = [
  { symbol: 'AAPL', name: 'Apple Inc.', allocation: 22, value: '$48.2K', change: '+3.2%', positive: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', allocation: 18, value: '$39.5K', change: '+2.8%', positive: true },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', allocation: 15, value: '$32.9K', change: '-1.4%', positive: false },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', allocation: 12, value: '$26.3K', change: '+5.1%', positive: true },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', allocation: 10, value: '$21.9K', change: '+8.7%', positive: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', allocation: 8, value: '$17.5K', change: '-4.2%', positive: false },
  { symbol: 'BTC', name: 'Bitcoin ETF', allocation: 15, value: '$32.9K', change: '+12.3%', positive: true },
];

const RECENT_TRANSACTIONS = [
  { id: 'TXN-001', description: 'Transferencia entrante — Cliente Corp.', amount: '+$24,500', date: 'Hoy, 14:23', status: 'Completada', type: 'incoming' },
  { id: 'TXN-002', description: 'Pago proveedor — Cloud Services', amount: '-$8,420', date: 'Hoy, 11:05', status: 'Pendiente', type: 'outgoing' },
  { id: 'TXN-003', description: 'Dividendo trimestral — AAPL', amount: '+$1,280', date: 'Ayer, 09:30', status: 'Completada', type: 'incoming' },
  { id: 'TXN-004', description: 'Suscripción anual — SaaS Suite', amount: '-$3,600', date: 'Ayer, 08:15', status: 'Completada', type: 'outgoing' },
  { id: 'TXN-005', description: 'Depósito cuenta rendimiento', amount: '+$50,000', date: '24 Mar, 2025', status: 'Completada', type: 'incoming' },
  { id: 'TXN-006', description: 'Retiro — Cuenta operativa', amount: '-$12,000', date: '23 Mar, 2025', status: 'Rechazada', type: 'outgoing' },
];

const PERIODS = ['7 días', '30 días', '90 días', '1 año'];

/* ──────────────────────────────────────────────
   NAVIGATION CONFIG
   ────────────────────────────────────────────── */
const NAV_SECTIONS = [
  { label: 'Principal', items: [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'analytics', label: 'Analítica', icon: '▤' },
    { id: 'transacciones', label: 'Transacciones', icon: '⇄' },
  ]},
  { label: 'Gestión', items: [
    { id: 'portafolio', label: 'Portafolio', icon: '◉' },
    { id: 'reportes', label: 'Reportes', icon: '▣' },
    { id: 'presupuesto', label: 'Presupuesto', icon: '⟐' },
  ]},
  { label: 'Configuración', items: [
    { id: 'ajustes', label: 'Ajustes', icon: '⚙' },
  ]},
];

/* ──────────────────────────────────────────────
   CHART COMPONENTS (Inline SVG)
   ────────────────────────────────────────────── */

/* Area chart for revenue trend */
function RevenueChart({ data, accent, onHover, hoveredIndex }) {
  const W_ = 640, H_ = 280, P = { top: 20, right: 16, bottom: 32, left: 48 };
  const iW = W_ - P.left - P.right;
  const iH = H_ - P.top - P.bottom;
  const maxVal = Math.max(...data.map(d => Math.max(d.actual, d.target, d.forecast))) * 1.12;

  const xScale = (i) => P.left + (i / (data.length - 1)) * iW;
  const yScale = (v) => P.top + iH - (v / maxVal) * iH;

  const linePath = data.map((d, i) =>
    `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.actual).toFixed(1)}`
  ).join('');

  const areaPath = linePath +
    `L${xScale(data.length - 1).toFixed(1)},${(P.top + iH).toFixed(1)}` +
    `L${xScale(0).toFixed(1)},${(P.top + iH).toFixed(1)}Z`;

  return (
    <svg viewBox={`0 0 ${W_} ${H_}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }} role="img" aria-label="Gráfico de ingresos mensuales">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((r) => {
        const y = P.top + iH - r * iH;
        return (
          <g key={r}>
            <line x1={P.left} y1={y} x2={W_ - P.right} y2={y} stroke="rgba(148,163,184,0.08)" strokeWidth={1} />
            <text x={P.left - 8} y={y + 4} textAnchor="end" fill="var(--ocd-tweak-text-muted)" fontSize={11} fontFamily="ui-monospace,monospace">
              ${(maxVal * r).toFixed(0)}K
            </text>
          </g>
        );
      })}

      {/* Target line */}
      <line
        x1={P.left} y1={yScale(data[0].target)}
        x2={W_ - P.right} y2={yScale(data[data.length-1].target)}
        stroke="var(--ocd-tweak-accent-warm)" strokeWidth={1.5} strokeDasharray="6,4"
        opacity={0.5}
      />
      <text x={W_ - P.right + 4} y={yScale(data[0].target) + 4} fill="var(--ocd-tweak-accent-warm)" fontSize={10} opacity={0.6}>Meta</text>

      {/* Area fill */}
      <path d={areaPath} fill={`var(--ocd-tweak-accent)`} opacity={0.1} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={`var(--ocd-tweak-accent)`} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points & hover areas */}
      {data.map((d, i) => (
        <g key={i}>
          <rect
            x={xScale(i) - 14} y={P.top} width={28} height={iH}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(-1)}
          />
          {(hoveredIndex === i) && (
            <>
              <circle cx={xScale(i)} cy={yScale(d.actual)} r={5} fill="var(--ocd-tweak-accent)" stroke="#0a0e17" strokeWidth={2.5} />
              <rect
                x={Math.min(Math.max(xScale(i) - 48, 4), W_ - 104)}
                y={Math.max(yScale(d.actual) - 48, 4)}
                width={96} height={38} rx={8}
                fill="#1c2333" stroke="rgba(148,163,184,0.15)"
              />
              <text
                x={Math.min(Math.max(xScale(i), 52), W_ - 56)}
                y={Math.max(yScale(d.actual) - 34, 10)}
                textAnchor="middle" fill="#f1f5f9" fontSize={13} fontWeight={700}
              >
                ${d.actual}K
              </text>
              <text
                x={Math.min(Math.max(xScale(i), 52), W_ - 56)}
                y={Math.max(yScale(d.actual) - 20, 24)}
                textAnchor="middle" fill="#94a3b8" fontSize={10}
              >
                {d.month} — vs ${d.target}K meta
              </text>
            </>
          )}
        </g>
      ))}

      {/* X-axis labels */}
      {data.filter((_, i) => i % 2 === 0).map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <text key={idx} x={xScale(idx)} y={H_ - 6} textAnchor="middle" fill="var(--ocd-tweak-text-muted)" fontSize={11}>
            {d.month}
          </text>
        );
      })}
    </svg>
  );
}

/* Horizontal bar chart for expenses */
function ExpensesChart({ data }) {
  const W_ = 420, H_ = 200, barH = 28, gap_ = 8, left = 90, right = 60;
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <svg viewBox={`0 0 ${W_} ${H_}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Gastos por categoría">
      {data.map((d, i) => {
        const y = i * (barH + gap_);
        const barW = (d.value / maxVal) * (W_ - left - right);
        return (
          <g key={d.category}>
            <text x={left - 8} y={y + barH * 0.68} textAnchor="end" fill="var(--ocd-tweak-text-muted)" fontSize={11}>
              {d.category}
            </text>
            <rect x={left} y={y + 2} width={barW} height={barH - 4} rx={6} fill={d.color} opacity={0.85} />
            <text x={left + barW + 8} y={y + barH * 0.68} fill="var(--ocd-tweak-text)" fontSize={11} fontWeight={600}>
              ${d.value}K
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Donut for portfolio allocation */
function PortfolioDonut({ data }) {
  const cx = 100, cy = 100, r = 72, iR = 48;
  const total = data.reduce((s, d) => s + d.allocation, 0);
  let angle = -90;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const polar = (deg, radius) => ({
    x: cx + radius * Math.cos(toRad(deg)),
    y: cy + radius * Math.sin(toRad(deg)),
  });

  const pal = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  const slices = data.map((d, i) => {
    const pct = (d.allocation / total) * 360;
    const startA = angle;
    const endA = angle + pct;
    angle = endA;

    const s1 = polar(startA, r);
    const s2 = polar(endA, r);
    const s3 = polar(endA, iR);
    const s4 = polar(startA, iR);
    const large = pct > 180 ? 1 : 0;

    const midA = startA + pct / 2;
    const labelP = polar(midA, (r + iR) / 2);

    const path = [
      `M ${s1.x} ${s1.y}`,
      `A ${r} ${r} 0 ${large} 1 ${s2.x} ${s2.y}`,
      `L ${s3.x} ${s3.y}`,
      `A ${iR} ${iR} 0 ${large} 0 ${s4.x} ${s4.y}`,
      'Z',
    ].join(' ');

    return { path, color: pal[i % pal.length], label: d.symbol, pct: d.allocation, lx: labelP.x, ly: labelP.y };
  });

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: 'auto', maxWidth: 280 }} role="img" aria-label="Distribución del portafolio">
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.path} fill={s.color} opacity={0.85} stroke="#0a0e17" strokeWidth={1.5} />
          {s.pct > 8 && (
            <text x={s.lx} y={s.ly + 4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700}>
              {s.pct}%
            </text>
          )}
        </g>
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--ocd-tweak-text)" fontSize={14} fontWeight={800}>$219K</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--ocd-tweak-text-muted)" fontSize={9}>Total</text>
    </svg>
  );
}

/* Sparkline mini chart for KPI cards */
function Sparkline({ data, color, width = 80, height = 32 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
  ).join(' ');
  const poly = `0,${height} ${pts} ${width},${height}`;

  return (
    <svg width={width} height={height} aria-hidden="true">
      <polygon points={poly} fill={color} opacity={0.1} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   MAIN APP COMPONENT
   ────────────────────────────────────────────── */
function App() {
  const [activeNav, setActiveNav] = React.useState('dashboard');
  const [hoveredPoint, setHoveredPoint] = React.useState(-1);
  const [period, setPeriod] = React.useState('30 días');
  const [drawerTx, setDrawerTx] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [showAllTx, setShowAllTx] = React.useState(false);

  const gap = 16 * TWEAK_DEFAULTS.density;
  const accent = `var(--ocd-tweak-accent, ${TWEAK_DEFAULTS.accent})`;

  const kpis = [
    { label: 'Ingresos Totales', value: '$3.12M', delta: '+18.3%', positive: true, sparkData: [124,138,145,152,168,172,185,194,212,228,244,261,278,292,312] },
    { label: 'MRR (Mensual)', value: '$267.4K', delta: '+12.7%', positive: true, sparkData: [210,218,224,231,238,244,251,258,267,274,282,298] },
    { label: 'Churn Rate', value: '3.2%', delta: '-0.8%', positive: true, sparkData: [4.8,4.5,4.3,4.1,3.9,3.8,3.6,3.5,3.4,3.3,3.2,3.2] },
    { label: 'Gastos Operativos', value: '$208K', delta: '+4.1%', positive: false, sparkData: [178,182,185,188,192,196,198,201,204,206,208,208] },
  ];

  const visibleTx = showAllTx ? RECENT_TRANSACTIONS : RECENT_TRANSACTIONS.slice(0, 4);

  return (
    <div style={{
      minHeight: '100%',
      background: '#0a0e17',
      color: '#f1f5f9',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      display: 'grid',
      gridTemplateColumns: sidebarOpen ? '228px minmax(0, 1fr)' : '0px minmax(0, 1fr)',
      transition: 'grid-template-columns 0.25s ease',
    }}>
      {/* ─── SIDEBAR ─── */}
      <aside style={{
        background: '#0f1622',
        borderRight: '1px solid rgba(148,163,184,0.08)',
        display: 'flex', flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'hidden',
        width: sidebarOpen ? 228 : 0,
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '20px 18px 16px',
          borderBottom: '1px solid rgba(148,163,184,0.08)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800,
          }}>F</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>Financiero</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Dashboard ejecutivo</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {NAV_SECTIONS.map(group => (
            <div key={group.label}>
              <div style={{
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em',
                color: '#475569', padding: '0 8px', marginBottom: 6,
              }}>
                {group.label}
              </div>
              <div style={{ display: 'grid', gap: 2 }}>
                {group.items.map(item => {
                  const selected = activeNav === item.id;
                  return (
                    <button key={item.id} type="button" onClick={() => setActiveNav(item.id)}
                      aria-current={selected ? 'page' : undefined}
                      style={{
                        minHeight: 38, border: 0, borderRadius: 8, padding: '0 10px',
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        color: selected ? '#f1f5f9' : '#64748b',
                        background: selected ? 'rgba(16,185,129,0.12)' : 'transparent',
                        boxShadow: selected ? 'inset 2px 0 0 #10b981' : 'none',
                        cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: selected ? 600 : 400,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(148,163,184,0.06)'; }}
                      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: 14, opacity: 0.7 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: '14px 14px 18px', borderTop: '1px solid rgba(148,163,184,0.08)',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e293b', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>
            CP
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#e2e8f0' }}>Carlos Pérez</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Admin</div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{ minWidth: 0, padding: '24px 28px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        {/* Toggle sidebar button (mobile) */}
        <button type="button" onClick={() => setSidebarOpen(o => !o)}
          aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          style={{
            display: 'none', border: 0, background: '#1e293b',
            color: '#f1f5f9', width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
            marginBottom: 12, fontSize: 18,
          }}
          className="sidebar-toggle"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>

        {/* ─── HEADER ─── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, marginBottom: 28, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', letterSpacing: '0.03em' }}>
              Panel Principal / {NAV_SECTIONS.flatMap(g => g.items).find(i => i.id === activeNav)?.label || 'Dashboard'}
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: -0.6, color: '#f1f5f9' }}>
              Resumen Financiero
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Period selector */}
            <div style={{ display: 'flex', gap: 4, background: '#0f1622', borderRadius: 10, padding: 3, border: '1px solid rgba(148,163,184,0.1)' }}>
              {PERIODS.map(p => (
                <button key={p} type="button" onClick={() => setPeriod(p)}
                  style={{
                    minHeight: 32, padding: '0 12px', border: 0, borderRadius: 8,
                    background: period === p ? '#1e293b' : 'transparent',
                    color: period === p ? '#f1f5f9' : '#64748b',
                    cursor: 'pointer', font: 'inherit', fontSize: 12, fontWeight: period === p ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >{p}</button>
              ))}
            </div>

            {/* Search */}
            <label style={{
              minHeight: 38, display: 'flex', alignItems: 'center', gap: 8,
              borderRadius: 10, background: '#0f1622', padding: '0 12px',
              border: '1px solid rgba(148,163,184,0.1)', minWidth: 200,
            }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>🔍</span>
              <input aria-label="Buscar" placeholder="Buscar transacciones..."
                style={{ flex: 1, border: 0, outline: 0, background: 'transparent', color: '#f1f5f9', font: 'inherit', fontSize: 13 }}
              />
            </label>

            {/* Notifications */}
            <button type="button" aria-label="Notificaciones"
              style={{
                minHeight: 38, minWidth: 38, border: '1px solid rgba(148,163,184,0.1)',
                borderRadius: 10, background: '#0f1622', color: '#94a3b8', cursor: 'pointer',
                display: 'grid', placeItems: 'center', fontSize: 16, position: 'relative',
              }}
            >
              🔔
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 7, height: 7,
                borderRadius: '50%', background: '#ef4444',
              }} />
            </button>
          </div>
        </header>

        {/* ─── KPI CARDS ─── */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap,
          marginBottom: gap,
        }}>
          {kpis.map(kpi => (
            <article key={kpi.label}
              style={{
                background: '#111b2e',
                borderRadius: 16,
                padding: '18px 20px',
                border: '1px solid rgba(148,163,184,0.08)',
                display: 'flex', flexDirection: 'column', gap: 2,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>{kpi.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, letterSpacing: -0.5, color: '#f1f5f9' }}>{kpi.value}</div>
                </div>
                <Sparkline data={kpi.sparkData} color={accent} />
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
                color: kpi.positive ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: 600,
              }}>
                <span>{kpi.positive ? '↑' : '↓'}</span>
                {kpi.delta}
                <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 4 }}>vs periodo anterior</span>
              </div>
            </article>
          ))}
        </section>

        {/* ─── CHARTS ROW ─── */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          gap,
          marginBottom: gap,
        }} className="charts-grid">
          {/* Main revenue chart */}
          <article style={{
            background: '#111b2e',
            borderRadius: 18,
            padding: '20px 20px 12px',
            border: '1px solid rgba(148,163,184,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Ingresos Mensuales</h2>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Enero — Diciembre 2025 · en miles USD</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#64748b' }}>
                <span><span style={{ color: '#10b981', fontWeight: 700 }}>●</span> Actual</span>
                <span><span style={{ color: '#f59e0b', fontWeight: 700 }}>●</span> Meta</span>
              </div>
            </div>
            <RevenueChart data={MONTHLY_REVENUE} accent={accent} onHover={setHoveredPoint} hoveredIndex={hoveredPoint} />
            {hoveredPoint >= 0 && (
              <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 4 }}>
                Datos al {MONTHLY_REVENUE[hoveredPoint].month} — Proyección: ${MONTHLY_REVENUE[hoveredPoint].forecast}K
              </div>
            )}
          </article>

          {/* Right column: stacked cards */}
          <div style={{ display: 'grid', gap, gridTemplateRows: '1fr 1fr' }}>
            {/* Expenses chart */}
            <article style={{
              background: '#111b2e',
              borderRadius: 18,
              padding: '18px 20px',
              border: '1px solid rgba(148,163,184,0.08)',
            }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Gastos por Categoría</h2>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>Total: $208K este período</div>
              <ExpensesChart data={EXPENSES_BY_CATEGORY} />
            </article>

            {/* Portfolio summary */}
            <article style={{
              background: '#111b2e',
              borderRadius: 18,
              padding: '18px 20px',
              border: '1px solid rgba(148,163,184,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Portafolio</h2>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>7 activos · $219.2K total</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>+4.8%</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <PortfolioDonut data={PORTFOLIO} />
                <div style={{ flex: 1, display: 'grid', gap: 3, alignContent: 'center' }}>
                  {PORTFOLIO.slice(0, 5).map(p => (
                    <div key={p.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#94a3b8', padding: '1px 0' }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{p.symbol}</span>
                      <span style={{ color: p.positive ? '#10b981' : '#ef4444' }}>{p.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ─── TRANSACTIONS TABLE ─── */}
        <section style={{
          background: '#111b2e',
          borderRadius: 18,
          padding: '20px 0',
          border: '1px solid rgba(148,163,184,0.08)',
          marginBottom: gap,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Transacciones Recientes</h2>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{RECENT_TRANSACTIONS.length} movimientos este mes</div>
            </div>
            <button type="button" onClick={() => setShowAllTx(o => !o)}
              style={{
                minHeight: 34, padding: '0 14px', border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: 8, background: 'transparent', color: '#94a3b8',
                cursor: 'pointer', font: 'inherit', fontSize: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(148,163,184,0.08)'; e.currentTarget.style.color = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              {showAllTx ? 'Ver menos' : 'Ver todas'}
            </button>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: 12,
            padding: '0 20px 10px', fontSize: 11, color: '#475569', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(148,163,184,0.06)',
          }}>
            <span>ID</span>
            <span>Descripción</span>
            <span>Monto</span>
            <span>Estado</span>
            <span></span>
          </div>

          {/* Rows */}
          <div style={{ display: 'grid' }}>
            {visibleTx.map((tx, i) => (
              <div key={tx.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 0.5fr', gap: 12,
                  alignItems: 'center', padding: '12px 20px', minHeight: 52,
                  borderBottom: i < visibleTx.length - 1 ? '1px solid rgba(148,163,184,0.04)' : 'none',
                  fontSize: 13, cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(148,163,184,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                onClick={() => setDrawerTx(tx)}
              >
                <span style={{ color: '#64748b', fontFamily: 'ui-monospace,monospace', fontSize: 11 }}>{tx.id}</span>
                <span style={{ color: '#e2e8f0' }}>{tx.description}</span>
                <span style={{
                  fontWeight: 600, fontFamily: 'ui-monospace,monospace',
                  color: tx.type === 'incoming' ? '#10b981' : '#f87171',
                }}>
                  {tx.amount}
                </span>
                <span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 999,
                    fontSize: 11, fontWeight: 500,
                    background: tx.status === 'Completada' ? 'rgba(16,185,129,0.12)' :
                               tx.status === 'Pendiente' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                    color: tx.status === 'Completada' ? '#34d399' :
                           tx.status === 'Pendiente' ? '#fbbf24' : '#f87171',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                    {tx.status}
                  </span>
                </span>
                <span style={{ color: '#475569', fontSize: 11 }}>{tx.date}</span>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {visibleTx.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <div style={{ fontWeight: 600, color: '#94a3b8' }}>No hay transacciones</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Las transacciones aparecerán aquí cuando se registren movimientos.</div>
            </div>
          )}
        </section>

        {/* ─── FOOTER INSIGHT ─── */}
        <footer style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap,
          padding: '0 0 20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,150,105,0.04))',
            borderRadius: 14, padding: '16px 20px',
            border: '1px solid rgba(16,185,129,0.12)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 24 }}>📈</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>Crecimiento proyectado</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Se espera un aumento del 22% en ingresos para el próximo trimestre basado en la tendencia actual.</div>
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(79,70,229,0.04))',
            borderRadius: 14, padding: '16px 20px',
            border: '1px solid rgba(99,102,241,0.12)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 24 }}>🎯</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>Meta trimestral</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Has alcanzado el 78% de la meta de ingresos del Q1 2025. Faltan $84K para cumplir el objetivo.</div>
            </div>
          </div>
        </footer>
      </main>

      {/* ─── TRANSACTION DETAIL DRAWER ─── */}
      {drawerTx && (
        <div role="dialog" aria-label="Detalle de transacción" aria-modal="true"
          onClick={() => setDrawerTx(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.65)',
            display: 'grid', placeItems: 'end',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div onClick={(e) => e.stopPropagation()}
            style={{
              width: 400, maxWidth: '96vw', height: '100%',
              background: '#111b2e', padding: '24px 28px',
              borderLeft: '1px solid rgba(148,163,184,0.1)',
              boxShadow: '-16px 0 48px rgba(0,0,0,0.4)',
              display: 'flex', flexDirection: 'column', gap: 20,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#f1f5f9' }}>Detalle de Transacción</h2>
              <button type="button" onClick={() => setDrawerTx(null)} aria-label="Cerrar"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 0,
                  background: 'rgba(148,163,184,0.1)', color: '#94a3b8',
                  cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center',
                }}
              >✕</button>
            </div>

            <div style={{
              background: 'rgba(148,163,184,0.04)', borderRadius: 12, padding: 20,
              border: '1px solid rgba(148,163,184,0.06)',
            }}>
              <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Monto</div>
              <div style={{
                fontSize: 32, fontWeight: 700, fontFamily: 'ui-monospace,monospace',
                color: drawerTx.type === 'incoming' ? '#34d399' : '#f87171',
              }}>
                {drawerTx.amount}
              </div>
            </div>

            {[
              ['ID de transacción', drawerTx.id],
              ['Descripción', drawerTx.description],
              ['Fecha', drawerTx.date],
              ['Estado', drawerTx.status],
              ['Tipo', drawerTx.type === 'incoming' ? 'Ingreso' : 'Egreso'],
              ['Método', 'Transferencia bancaria'],
              ['Referencia', `REF-${drawerTx.id.slice(-3)}${Math.floor(Math.random() * 1000)}`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '4px 0' }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 500, textAlign: 'right' }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
              <button type="button"
                style={{
                  flex: 1, minHeight: 42, border: '1px solid rgba(148,163,184,0.15)',
                  borderRadius: 10, background: 'transparent', color: '#94a3b8',
                  cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 500,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(148,163,184,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Descargar recibo
              </button>
              <button type="button"
                style={{
                  flex: 1, minHeight: 42, border: 0, borderRadius: 10,
                  background: '#10b981', color: '#fff',
                  cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 600,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#10b981'; }}
                onClick={() => setDrawerTx(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STYLES ─── */}
      <style>{`
        :root {
          --ocd-tweak-accent: ${TWEAK_DEFAULTS.accent};
          --ocd-tweak-accent-warm: ${TWEAK_DEFAULTS.accentWarm};
          --ocd-tweak-text: #f1f5f9;
          --ocd-tweak-text-muted: #64748b;
        }

        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        @media (max-width: 640px) {
          .sidebar-toggle { display: flex !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
          main { padding: 16px !important; }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .charts-grid { grid-template-columns: 1fr !important; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        button:focus-visible, input:focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);