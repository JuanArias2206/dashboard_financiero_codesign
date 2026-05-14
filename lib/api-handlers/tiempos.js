'use strict';

/**
 * api/tiempos.js
 * Agrega /appointments por supervisor/usuario/día para "Control de Tiempos" BI.
 */

const RSALES_BASE = process.env.RSALES_BASE_URL || 'https://api.ventasremotas.com/v1';
const API_KEY = process.env.RSALES_API_KEY;
const CLIENT_ID = process.env.RSALES_CLIENT_ID;
const CLIENT_SECRET = process.env.RSALES_CLIENT_SECRET;

let _tokenCache = null;
let _cache = {};
const CACHE_TTL = 10 * 60 * 1000;

async function getToken() {
  if (_tokenCache && _tokenCache.exp > Date.now()) return _tokenCache.token;
  const resp = await fetch(`${RSALES_BASE}/token`, {
    method: 'POST',
    headers: { 'Subscription-Key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET })
  });
  if (!resp.ok) throw new Error(`RSales auth failed: ${resp.status}`);
  const data = await resp.json();
  _tokenCache = { token: data.access_token, exp: Date.now() + 55 * 60 * 1000 };
  return _tokenCache.token;
}

async function rsalesGet(path, params = {}) {
  const token = await getToken();
  const url = new URL(`${RSALES_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const resp = await fetch(url.toString(), {
    headers: { 'Subscription-Key': API_KEY, 'Authorization': `Bearer ${token}` }
  });
  if (!resp.ok) throw new Error(`RSales ${path} error: ${resp.status}`);
  return resp.json();
}

async function fetchAllAppointments(dateFrom) {
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const data = await rsalesGet('/appointments', { day_from: dateFrom, limit: 500, page });
    const items = data.data || [];
    all.push(...items);
    const total = data.meta?.totalItems || 0;
    if (all.length >= total || items.length === 0) break;
  }
  return all;
}

function rangeFor(year, month) {
  const y = parseInt(year) || new Date().getFullYear();
  if (!month || month === '0') return { from: `${y}-01-01`, to: `${y}-12-31` };
  const m = String(month).padStart(2, '0');
  const lastDay = new Date(y, parseInt(month), 0).getDate();
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${String(lastDay).padStart(2,'0')}` };
}

async function loadTiempos(year, month) {
  const key = `${year}-${month}`;
  if (_cache[key] && (Date.now() - _cache[key]._t) < CACHE_TTL) return _cache[key].data;

  const range = rangeFor(year, month);
  const [appts, sellersRes, customersRes] = await Promise.all([
    fetchAllAppointments(range.from),
    rsalesGet('/sellers', { limit: 500 }),
    rsalesGet('/customers', { limit: 1 })
  ]);

  // Filter to date range
  const inRange = appts.filter(a => {
    const day = (a.day || '').split('T')[0];
    return day >= range.from && day <= range.to;
  });

  const sellerMap = {};
  (sellersRes.data || []).forEach(s => { sellerMap[s.code] = { name: s.name, supervisor: s.supervisor || s.group || 'N/A - No Aplica' }; });

  // KPIs (RSales BI shows total = transacciones reales; nuestras métricas vendrán de appointments)
  const total = inRange.length;
  const cumplidas = inRange.filter(a => a.state === 'C').length;
  const vencidas  = inRange.filter(a => a.state === 'V').length;
  const pendientes= inRange.filter(a => a.state === 'A').length;
  const extraruta = inRange.filter(a => a.presence_activity === 'Y' || a.extraruta === true).length;
  const clientesGest = new Set(inRange.map(a => a.client_id).filter(Boolean)).size;
  const usuariosCount = new Set(inRange.map(a => a.seller_id).filter(Boolean)).size;

  // Por supervisor — gestiones programadas vs cumplidas vs extraruta
  const supMap = {};
  inRange.forEach(a => {
    const info = sellerMap[a.seller_id] || { supervisor: 'N/A - No Aplica' };
    const sup = info.supervisor;
    if (!supMap[sup]) supMap[sup] = { programadas: 0, cumplidas: 0, extraruta: 0 };
    supMap[sup].programadas++;
    if (a.state === 'C') supMap[sup].cumplidas++;
    if (a.presence_activity === 'Y') supMap[sup].extraruta++;
  });
  const supervisores = Object.entries(supMap).map(([sup, v]) => ({
    supervisor: sup,
    programadas: v.programadas,
    cumplidas: v.cumplidas,
    extraruta: v.extraruta,
    pct_cumplimiento: v.programadas > 0 ? (v.cumplidas / v.programadas * 100) : 0
  })).sort((a,b) => b.programadas - a.programadas);

  // Por usuario
  const userMap = {};
  inRange.forEach(a => {
    const sid = a.seller_id;
    if (!sid) return;
    const info = sellerMap[sid] || { name: 'Vendedor '+sid, supervisor: 'N/A' };
    if (!userMap[sid]) userMap[sid] = {
      seller_id: sid, nombre: info.name, supervisor: info.supervisor,
      programadas: 0, cumplidas: 0, extraruta: 0,
      execTimes: [], clientes: new Set(),
      total_tx: 0
    };
    userMap[sid].programadas++;
    if (a.state === 'C') userMap[sid].cumplidas++;
    if (a.presence_activity === 'Y') userMap[sid].extraruta++;
    if (a.executed_at) userMap[sid].execTimes.push(new Date(a.executed_at));
    if (a.client_id) userMap[sid].clientes.add(a.client_id);
  });
  const usuarios = Object.values(userMap).map(u => {
    const validTimes = u.execTimes.filter(d => !isNaN(d.getTime()));
    let hi = '—', hf = '—';
    if (validTimes.length > 0) {
      const hrs = validTimes.map(d => d.getHours() + d.getMinutes()/60);
      const toHM = h => { const hh=Math.floor(h); const mm=Math.round((h-hh)*60); return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'); };
      hi = toHM(Math.min(...hrs));
      hf = toHM(Math.max(...hrs));
    }
    return {
      seller_id: u.seller_id, nombre: u.nombre, supervisor: u.supervisor,
      hora_inicio: hi, hora_fin: hf,
      programadas: u.programadas, cumplidas: u.cumplidas, extraruta: u.extraruta,
      pct_cumplimiento: u.programadas > 0 ? (u.cumplidas / u.programadas * 100) : 0,
      clientes: u.clientes.size,
      total_tx: u.total_tx
    };
  }).sort((a,b) => b.programadas - a.programadas);

  // Por día (timeseries)
  const diaMap = {};
  inRange.forEach(a => {
    const day = (a.day || '').split('T')[0];
    if (!day) return;
    if (!diaMap[day]) diaMap[day] = { programadas: 0, cumplidas: 0, extraruta: 0, usuarios: new Set(), clientes: new Set() };
    diaMap[day].programadas++;
    if (a.state === 'C') diaMap[day].cumplidas++;
    if (a.presence_activity === 'Y') diaMap[day].extraruta++;
    if (a.seller_id) diaMap[day].usuarios.add(a.seller_id);
    if (a.client_id) diaMap[day].clientes.add(a.client_id);
  });
  const por_dia = Object.entries(diaMap).sort(([a],[b]) => a.localeCompare(b)).map(([day, v]) => ({
    fecha: day,
    programadas: v.programadas,
    cumplidas: v.cumplidas,
    extraruta: v.extraruta,
    usuarios: v.usuarios.size,
    clientes: v.clientes.size
  }));

  const result = {
    periodo: range,
    kpis: {
      total_gestiones: total,
      total_transacciones: 0, // RSales API no expone tx en appointments
      programadas: total,
      cumplidas,
      vencidas,
      pendientes,
      extraruta,
      clientes_gestionados: clientesGest,
      usuarios: usuariosCount,
      pct_cumplimiento: total > 0 ? (cumplidas / total * 100) : 0
    },
    supervisores,
    usuarios,
    por_dia,
    generated_at: new Date().toISOString()
  };

  _cache[key] = { _t: Date.now(), data: result };
  return result;
}

module.exports = async function tiemposHandler(req, res) {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = year || String(now.getFullYear());
    const m = month != null ? month : String(now.getMonth() + 1);
    const data = await loadTiempos(y, m);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[/api/tiempos]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
