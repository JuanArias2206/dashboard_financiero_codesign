// Number / currency formatters tuned for Bolivia (Bs.) and large values.

const nf0 = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfPct = new Intl.NumberFormat('es-BO', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function fmtInt(n) {
  if (n == null || isNaN(n)) return '—';
  return nf0.format(Math.round(n));
}

export function fmtCompact(n) {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + ' B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + ' M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + ' K';
  return nf0.format(n);
}

export function fmtMoney(n) {
  if (n == null || isNaN(n)) return '—';
  return 'Bs. ' + fmtCompact(n);
}

export function fmtMoneyFull(n) {
  if (n == null || isNaN(n)) return '—';
  return 'Bs. ' + nf2.format(n);
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
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
