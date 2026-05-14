'use strict';

/**
 * api/pedidos.js
 * Agrega /orders de RSales API para "Pedido, Factura, Devolución y Cotización" BI.
 */

const RSALES_BASE = process.env.RSALES_BASE_URL || 'https://api.ventasremotas.com/v1';
const API_KEY = process.env.RSALES_API_KEY;
const CLIENT_ID = process.env.RSALES_CLIENT_ID;
const CLIENT_SECRET = process.env.RSALES_CLIENT_SECRET;

let _tokenCache = null;
let _dataCache = {};   // keyed by period
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

async function fetchAllOrders(dateFrom, dateTo) {
  // RSales /orders endpoint no acepta date params; obtenemos todo y filtramos en memoria por created_at
  const all = [];
  for (let page = 1; page <= 50; page++) {
    let data;
    try {
      data = await rsalesGet('/orders', { limit: 500, page });
    } catch (e) {
      // Si /orders falla, devolvemos lo que tenemos
      break;
    }
    const items = data.data || [];
    if (items.length === 0) break;
    all.push(...items);
    const total = data.meta?.totalItems || 0;
    if (all.length >= total) break;
  }
  // Filter by date range using created_at / date / day field
  if (dateFrom && dateTo) {
    return all.filter(o => {
      const d = ((o.created_at || o.date || o.day || '') + '').slice(0, 10);
      return d >= dateFrom && d <= dateTo;
    });
  }
  return all;
}

function computeDateRange(year, month) {
  const y = parseInt(year) || new Date().getFullYear();
  if (!month || month === '0') {
    return { from: `${y}-01-01`, to: `${y}-12-31` };
  }
  const m = String(month).padStart(2, '0');
  const lastDay = new Date(y, parseInt(month), 0).getDate();
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${String(lastDay).padStart(2,'0')}` };
}

async function loadPedidos(year, month) {
  const key = `${year}-${month}`;
  const cached = _dataCache[key];
  if (cached && (Date.now() - cached._time) < CACHE_TTL) return cached.data;

  const range = computeDateRange(year, month);
  const [orders, customers, sellers] = await Promise.all([
    fetchAllOrders(range.from, range.to),
    rsalesGet('/customers', { limit: 1 }),    // just totals
    rsalesGet('/sellers', { limit: 500 })
  ]);

  // Total clientes asignados (for impact %)
  const totalClientes = customers.meta?.totalItems || 0;

  // Seller map
  const sellerMap = {};
  (sellers.data || []).forEach(s => { sellerMap[s.code] = { name: s.name, supervisor: s.supervisor || s.group || 'N/A' }; });

  // Aggregates
  const sumByField = (arr, getKey, getVal) => {
    const m = {};
    arr.forEach(o => { const k = getKey(o); if (!k) return; m[k] = (m[k] || 0) + (Number(getVal(o)) || 0); });
    return m;
  };
  const countByField = (arr, getKey) => {
    const m = {};
    arr.forEach(o => { const k = getKey(o); if (!k) return; m[k] = (m[k] || 0) + 1; });
    return m;
  };

  // KPIs
  const totalVentas = orders.reduce((s, o) => s + (Number(o.total) || Number(o.subtotal) || 0), 0);
  const totalUnidades = orders.reduce((s, o) => {
    if (Array.isArray(o.items)) return s + o.items.reduce((ss, i) => ss + (Number(i.quantity) || 0), 0);
    return s + (Number(o.quantity) || Number(o.units) || 0);
  }, 0);
  const totalTx = orders.length;
  const clientesImpactados = new Set(orders.map(o => o.client_id || o.customer_id || o.customer_code).filter(Boolean)).size;
  const usuariosVenta = new Set(orders.map(o => o.seller_id || o.seller_code).filter(Boolean)).size;
  const referencias = new Set(orders.flatMap(o => Array.isArray(o.items) ? o.items.map(i => i.product_code) : [o.product_code]).filter(Boolean)).size;

  // Por tipo de transacción
  const porTipo = sumByField(orders, o => o.type || o.transaction_type || 'Pedido', o => o.total || o.subtotal || 0);
  const txCountPorTipo = countByField(orders, o => o.type || o.transaction_type || 'Pedido');
  const tipoTrans = Object.entries(porTipo).map(([k, v]) => ({ tipo: k, total: v, tx: txCountPorTipo[k] || 0 }));

  // Por estado
  const stateMap = { A: 'Aprobado', R: 'Rechazado', P: 'Pendiente', T: 'Retenido', H: 'Retenido' };
  const porEstado = {};
  orders.forEach(o => {
    const raw = o.state || o.status || 'A';
    const lbl = stateMap[raw] || raw;
    if (!porEstado[lbl]) porEstado[lbl] = { total: 0, tx: 0 };
    porEstado[lbl].total += Number(o.total) || 0;
    porEstado[lbl].tx++;
  });
  const estados = Object.entries(porEstado).map(([k,v]) => ({ estado: k, total: v.total, tx: v.tx }));

  // Por usuario (supervisor)
  const porSeller = {};
  orders.forEach(o => {
    const sid = o.seller_id || o.seller_code || 'NA';
    const info = sellerMap[sid] || { name: 'Vendedor '+sid, supervisor: 'N/A' };
    if (!porSeller[sid]) porSeller[sid] = { name: info.name, supervisor: info.supervisor, total: 0, tx: 0, units: 0, clientes: new Set() };
    porSeller[sid].total += Number(o.total) || 0;
    porSeller[sid].tx++;
    porSeller[sid].units += Array.isArray(o.items) ? o.items.reduce((s,i)=>s+(Number(i.quantity)||0),0) : (Number(o.quantity)||0);
    const cid = o.client_id || o.customer_id;
    if (cid) porSeller[sid].clientes.add(cid);
  });
  const usuarios = Object.entries(porSeller).map(([id, v]) => ({
    seller_id: id, nombre: v.name, supervisor: v.supervisor,
    total_ventas: v.total, tx: v.tx, unidades: v.units,
    clientes: v.clientes.size,
    promedio: v.tx > 0 ? v.total / v.tx : 0
  })).sort((a,b) => b.total_ventas - a.total_ventas);

  // Por supervisor
  const porSup = {};
  usuarios.forEach(u => {
    if (!porSup[u.supervisor]) porSup[u.supervisor] = { total: 0, tx: 0 };
    porSup[u.supervisor].total += u.total_ventas;
    porSup[u.supervisor].tx    += u.tx;
  });
  const supervisores = Object.entries(porSup).map(([sup, v]) => ({ supervisor: sup, total: v.total, tx: v.tx }));

  // Por producto (group)
  const porProd = {};
  orders.forEach(o => {
    const items = Array.isArray(o.items) ? o.items : [];
    items.forEach(i => {
      const grp = i.group || i.product_group || 'OTRO';
      if (!porProd[grp]) porProd[grp] = { total: 0, units: 0, tx: new Set() };
      porProd[grp].total += Number(i.subtotal) || Number(i.total) || 0;
      porProd[grp].units += Number(i.quantity) || 0;
      porProd[grp].tx.add(o.id || o.code);
    });
  });
  const productos = Object.entries(porProd).map(([g, v]) => ({ grupo: g, total: v.total, unidades: v.units, tx: v.tx.size }))
    .sort((a,b) => b.total - a.total).slice(0, 40);

  // Clientes (top 30)
  const porCli = {};
  orders.forEach(o => {
    const cid = o.client_id || o.customer_id || o.customer_code;
    if (!cid) return;
    if (!porCli[cid]) porCli[cid] = { name: o.client_name || o.customer_name || 'Cliente '+cid, city: o.city || '', total: 0, tx: 0, units: 0 };
    porCli[cid].total += Number(o.total) || 0;
    porCli[cid].tx++;
    porCli[cid].units += Array.isArray(o.items) ? o.items.reduce((s,i)=>s+(Number(i.quantity)||0),0) : (Number(o.quantity)||0);
  });
  const clientes = Object.entries(porCli).map(([id,v]) => ({ id, ...v }))
    .sort((a,b) => b.total - a.total).slice(0, 30);

  // Comparativo anual: trial — by month within year
  const porMes = {};
  orders.forEach(o => {
    const d = (o.date || o.created_at || o.day || '').slice(0,7);
    if (!d) return;
    if (!porMes[d]) porMes[d] = { total: 0, tx: 0, units: 0, clientes: new Set() };
    porMes[d].total += Number(o.total) || 0;
    porMes[d].tx++;
    porMes[d].units += Array.isArray(o.items) ? o.items.reduce((s,i)=>s+(Number(i.quantity)||0),0) : (Number(o.quantity)||0);
    const cid = o.client_id || o.customer_id;
    if (cid) porMes[d].clientes.add(cid);
  });
  const evolucionMensual = Object.entries(porMes).map(([m,v]) => ({
    mes: m, total: v.total, tx: v.tx, units: v.units, clientes: v.clientes.size
  })).sort((a,b) => a.mes.localeCompare(b.mes));

  const result = {
    periodo: range,
    kpis: {
      total_ventas: totalVentas,
      unidades_pedidas: totalUnidades,
      total_tx: totalTx,
      clientes_impactados: clientesImpactados,
      total_clientes: totalClientes,
      pct_impacto: totalClientes > 0 ? (clientesImpactados / totalClientes * 100) : 0,
      usuarios: usuariosVenta,
      referencias
    },
    tipo_transaccion: tipoTrans,
    estados,
    usuarios,
    supervisores,
    productos,
    clientes,
    evolucion_mensual: evolucionMensual,
    total_orders: orders.length,
    generated_at: new Date().toISOString()
  };

  _dataCache[key] = { _time: Date.now(), data: result };
  return result;
}

module.exports = async function pedidosHandler(req, res) {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = year || String(now.getFullYear());
    const m = month != null ? month : String(now.getMonth() + 1);
    const data = await loadPedidos(y, m);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[/api/pedidos]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
