// Number / currency formatters tuned for Colombia (COP) and the long scale:
//   1 millón     = 10^6  → "M"
//   1 mil millón = 10^9  → "MM"
//   1 billón     = 10^12 → "B"

const nf0   = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const nf2   = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfPct = new Intl.NumberFormat('es-CO', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function fmtInt(n) {
  if (n == null || isNaN(n)) return '—';
  return nf0.format(Math.round(n));
}

/**
 * Compact format using Latin-American long scale.
 * < 1.000      → entero plano
 * < 1.000.000  → "X.X K"
 * < 1.000 M    → "X.XX M"      (millones, 10^6)
 * < 1 B        → "X.XX MM"     (mil millones, 10^9)
 * >= 1 B       → "X.XX B"      (billones, 10^12)
 */
export function fmtCompact(n) {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs < 1e3)  return sign + nf0.format(Math.round(abs));
  if (abs < 1e6)  return sign + (abs / 1e3).toFixed(1).replace('.', ',') + ' K';
  if (abs < 1e9)  return sign + (abs / 1e6).toFixed(2).replace('.', ',') + ' M';
  if (abs < 1e12) return sign + (abs / 1e9).toFixed(2).replace('.', ',') + ' MM';
  return sign + (abs / 1e12).toFixed(2).replace('.', ',') + ' B';
}

export function fmtMoney(n) {
  if (n == null || isNaN(n)) return '—';
  return '$ ' + fmtCompact(n);
}

export function fmtMoneyFull(n) {
  if (n == null || isNaN(n)) return '—';
  return '$ ' + nf2.format(n);
}

export function fmtPct(n, fromFraction = false) {
  if (n == null || isNaN(n)) return '—';
  if (fromFraction) return nfPct.format(n);
  return nfPct.format(n / 100);
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
