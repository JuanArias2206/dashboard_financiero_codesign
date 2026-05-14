/* ──────────────────────────────────────────
   CLIENT TABLE — Top deudores con barras de riesgo
   Tabla ordenable con indicador de riesgo
   ────────────────────────────────────────── */

window.ClientTable = function ClientTable({ data }) {
  const [sortKey, setSortKey] = React.useState('saldo');
  const [sortDir, setSortDir] = React.useState('desc');
  const [selected, setSelected] = React.useState(null);

  const sorted = [...data].sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const riesgoStyle = (r) => {
    if (r === 'critico') return { bg: 'rgba(239,68,68,0.15)', fg: '#ef4444', label: 'Crítico' };
    if (r === 'alto') return { bg: 'rgba(245,158,11,0.15)', fg: '#f59e0b', label: 'Alto' };
    return { bg: 'rgba(234,179,8,0.12)', fg: '#eab308', label: 'Medio' };
  };

  const maxSaldo = Math.max(...data.map(d => d.saldo));

  const SortIcon = ({ k }) => sortKey === k
    ? <span style={{ opacity: 0.8 }}>{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>
    : <span style={{ opacity: 0.3 }}> ⇅</span>;

  return (
    <div style={styles.wrap}>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th} onClick={() => toggleSort('nombre')}>
                Cliente <SortIcon k="nombre" />
              </th>
              <th style={styles.th} onClick={() => toggleSort('ciudad')}>
                Ciudad <SortIcon k="ciudad" />
              </th>
              <th style={{ ...styles.th, textAlign: 'right' }} onClick={() => toggleSort('saldo')}>
                Saldo <SortIcon k="saldo" />
              </th>
              <th style={{ ...styles.th, textAlign: 'right' }} onClick={() => toggleSort('pctTotal')}>
                % Total <SortIcon k="pctTotal" />
              </th>
              <th style={styles.th}>Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => {
              const rs = riesgoStyle(c.riesgo);
              const sel = selected === i;
              return (
                <tr key={c.nit}
                  style={{
                    ...styles.tr,
                    background: sel ? 'rgba(16,185,129,0.06)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelected(sel ? null : i)}
                  onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'rgba(148,163,184,0.04)'; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={styles.td}>
                    <div style={{ fontWeight: 500, color: '#f1f5f9', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.nombre}
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                      NIT: {c.nit}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.ciudad}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute', right: 0, bottom: -2, width: `${(c.saldo / maxSaldo) * 100}%`,
                        height: 3, borderRadius: 2, background: c.riesgo === 'critico' ? 'rgba(239,68,68,0.3)' :
                          c.riesgo === 'alto' ? 'rgba(245,158,11,0.3)' : 'rgba(234,179,8,0.2)',
                      }} />
                      <span style={{ fontSize: 12, color: '#f1f5f9', fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontVariantNumeric: 'tabular-nums', position: 'relative', zIndex: 1 }}>
                        ${(c.saldo / 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}M
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                      {c.docs} docs
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: c.pctTotal > 100 ? '#ef4444' : '#f59e0b',
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    }}>
                      {c.pctTotal}%
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                      background: rs.bg, color: rs.fg, fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.03em', fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    }}>
                      {rs.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detalle seleccionado */}
      {selected !== null && (() => {
        const c = sorted[selected];
        return (
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{c.nombre}</span>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.drawerGrid}>
              <div style={styles.drawerItem}>
                <span style={styles.drawerLabel}>NIT</span>
                <span style={styles.drawerVal}>{c.nit}</span>
              </div>
              <div style={styles.drawerItem}>
                <span style={styles.drawerLabel}>Ciudad</span>
                <span style={styles.drawerVal}>{c.ciudad}</span>
              </div>
              <div style={styles.drawerItem}>
                <span style={styles.drawerLabel}>Documentos</span>
                <span style={{ ...styles.drawerVal, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                  {c.docs.toLocaleString()}
                </span>
              </div>
              <div style={styles.drawerItem}>
                <span style={styles.drawerLabel}>Saldo total</span>
                <span style={{ ...styles.drawerVal, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                  ${(c.saldo / 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}M
                </span>
              </div>
              <div style={styles.drawerItem}>
                <span style={styles.drawerLabel}>% del total</span>
                <span style={{ ...styles.drawerVal, fontFamily: "'JetBrains Mono', ui-monospace, monospace", color: c.pctTotal > 100 ? '#ef4444' : '#f59e0b' }}>
                  {c.pctTotal}%
                </span>
              </div>
              <div style={styles.drawerItem}>
                <span style={styles.drawerLabel}>Riesgo</span>
                <span style={{ ...styles.drawerVal, color: c.riesgo === 'critico' ? '#ef4444' : c.riesgo === 'alto' ? '#f59e0b' : '#eab308' }}>
                  {c.riesgo.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const styles = {
  wrap: {
    background: '#111b2e',
    borderRadius: 16,
    padding: 0,
    border: '1px solid rgba(148,163,184,0.08)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    color: '#475569',
    fontWeight: 600,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(148,163,184,0.08)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid rgba(148,163,184,0.04)',
    transition: 'background 0.12s',
  },
  td: {
    padding: '8px 14px',
    borderBottom: '1px solid rgba(148,163,184,0.04)',
  },
  drawer: {
    borderTop: '1px solid rgba(148,163,184,0.1)',
    padding: '16px 20px',
    background: 'rgba(0,0,0,0.15)',
    animation: 'fadeIn 0.2s ease',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeBtn: {
    background: 'rgba(148,163,184,0.08)',
    border: 'none',
    color: '#94a3b8',
    width: 24,
    height: 24,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  drawerItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  drawerLabel: {
    fontSize: 10,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  drawerVal: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: 500,
  },
};
