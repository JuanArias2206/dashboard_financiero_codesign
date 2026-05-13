'use strict';

/**
 * api/inventario.js
 * Agrega productos + stocks desde RSales API para la sección "Análisis de Inventario".
 * Replica el R-SALES BI: Rotación de inventario + Inventario por bodega.
 */

const RSALES_BASE = process.env.RSALES_BASE_URL || 'https://api.ventasremotas.com/v1';
const API_KEY = process.env.RSALES_API_KEY;
const CLIENT_ID = process.env.RSALES_CLIENT_ID;
const CLIENT_SECRET = process.env.RSALES_CLIENT_SECRET;

let _tokenCache = null;
let _dataCache = null;
let _dataCacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

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

async function fetchAllPaged(path, limit = 1000, maxPages = 20) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await rsalesGet(path, { limit, page });
    const items = data.data || [];
    all.push(...items);
    const total = data.meta?.totalItems || 0;
    if (all.length >= total || items.length === 0) break;
  }
  return all;
}

async function loadInventario() {
  const now = Date.now();
  if (_dataCache && (now - _dataCacheTime) < CACHE_TTL) return _dataCache;

  const [products, stocks] = await Promise.all([
    fetchAllPaged('/products', 1000, 20),
    fetchAllPaged('/stocks',   1000, 30)
  ]);

  // Index stock by product code — RSales: { product_code, location, quantity, state }
  const stockByProd = {};
  stocks.forEach(s => {
    const pc = s.product_code || s.code;
    if (!pc) return;
    if (!stockByProd[pc]) stockByProd[pc] = { qty: 0, warehouses: {} };
    const q = Number(s.quantity || 0);
    stockByProd[pc].qty += q;
    const wh = s.location || s.warehouse_code || 'PRINCIPAL';
    stockByProd[pc].warehouses[wh] = (stockByProd[pc].warehouses[wh] || 0) + q;
  });

  // Build product list — RSales product: { code, description, state ("Y"|"N"), group_code, family_code, line_code, tax }
  const enriched = products.map(p => {
    const code = p.code || '';
    const stk  = stockByProd[code] || { qty: 0, warehouses: {} };
    const isActive = (p.state === 'Y' || p.state === true || (typeof p.state === 'string' && p.state.toLowerCase().startsWith('a')));
    const isAvail  = stk.qty > 0;
    return {
      code,
      name: p.description || p.name || '',
      group:  p.group_code  || p.group  || 'SIN GRUPO',
      family: p.family_code || p.family || '',
      line:   p.line_code   || p.line   || '',
      state: isActive ? 'Activo' : 'Inactivo',
      active: isActive,
      quantity: stk.qty,
      available_qty: stk.qty,
      available: isAvail ? 'Sí' : 'No',
      warehouses: stk.warehouses,
      impuesto: p.tax || p.tax_rate || 0,
      reference: p.reference || ''
    };
  });

  // KPIs
  const totalProductos = enriched.length;
  const totalActivos = enriched.filter(p => p.active).length;
  const totalInactivos = totalProductos - totalActivos;
  const productosDisponibles = enriched.filter(p => p.available_qty > 0 || p.quantity > 0).length;
  const productosAgotados = enriched.filter(p => p.available_qty <= 0 && p.quantity <= 0).length;
  const totalInventarioUnidades = enriched.reduce((s, p) => s + (p.quantity || 0), 0);
  const promedioVentasMensuales = 0; // sin info de ventas en /stocks; queda para extender con /orders

  // Productos agotados por grupo
  const agotadosPorGrupo = {};
  enriched.filter(p => p.available_qty <= 0 && p.quantity <= 0).forEach(p => {
    agotadosPorGrupo[p.group] = (agotadosPorGrupo[p.group] || 0) + 1;
  });
  const agotadosGrupoArr = Object.entries(agotadosPorGrupo)
    .map(([grupo, count]) => ({ grupo, count }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 25);

  // Productos por grupo (todos) — para el chart de sin-rotación stacked
  const totPorGrupo = {};
  enriched.forEach(p => {
    if (!totPorGrupo[p.group]) totPorGrupo[p.group] = { total: 0, sin_rotacion: 0 };
    totPorGrupo[p.group].total++;
    if (p.available_qty <= 0 && p.quantity <= 0) totPorGrupo[p.group].sin_rotacion++;
  });
  const productosPorGrupo = Object.entries(totPorGrupo)
    .map(([grupo, v]) => ({ grupo, total: v.total, sin_rotacion: v.sin_rotacion }))
    .sort((a,b) => b.total - a.total)
    .slice(0, 30);

  // Productos por bodega + disponibilidad
  const bodegaCount = {};
  enriched.forEach(p => {
    Object.keys(p.warehouses).forEach(wh => {
      const q = p.warehouses[wh] || 0;
      if (!bodegaCount[wh]) bodegaCount[wh] = { si: 0, no: 0 };
      if (q > 0) bodegaCount[wh].si++; else bodegaCount[wh].no++;
    });
  });
  const inventarioPorBodega = Object.entries(bodegaCount)
    .map(([bodega, v]) => ({
      bodega,
      si: v.si,
      no: v.no,
      total: v.si + v.no,
      pct_si: (v.si + v.no) > 0 ? (v.si / (v.si + v.no) * 100) : 0
    }))
    .sort((a,b) => b.total - a.total);

  // Tablas: sin inventario, top productos
  const sinInventario = enriched
    .filter(p => p.quantity <= 0 && p.available_qty <= 0)
    .slice(0, 100)
    .map(p => ({ code: p.code, name: p.name, state: p.state, group: p.group }));

  _dataCache = {
    kpis: {
      total_productos: totalProductos,
      total_activos: totalActivos,
      total_inactivos: totalInactivos,
      productos_disponibles: productosDisponibles,
      productos_agotados: productosAgotados,
      total_inventario_unidades: totalInventarioUnidades,
      pct_activos: totalProductos > 0 ? (totalActivos / totalProductos * 100) : 0,
      pct_disponibles: totalProductos > 0 ? (productosDisponibles / totalProductos * 100) : 0
    },
    estado: [
      { label: 'Activo',   count: totalActivos,   pct: totalProductos > 0 ? (totalActivos / totalProductos * 100) : 0 },
      { label: 'Inactivo', count: totalInactivos, pct: totalProductos > 0 ? (totalInactivos / totalProductos * 100) : 0 }
    ],
    disponibilidad: [
      { label: 'Sí', count: productosDisponibles, pct: totalProductos > 0 ? (productosDisponibles / totalProductos * 100) : 0 },
      { label: 'No', count: productosAgotados,    pct: totalProductos > 0 ? (productosAgotados / totalProductos * 100) : 0 }
    ],
    agotados_por_grupo: agotadosGrupoArr,
    productos_por_grupo: productosPorGrupo,
    inventario_por_bodega: inventarioPorBodega,
    sin_inventario: sinInventario,
    productos: enriched.slice(0, 500),
    generated_at: new Date().toISOString()
  };
  _dataCacheTime = now;
  return _dataCache;
}

module.exports = async function inventarioHandler(req, res) {
  try {
    const data = await loadInventario();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[/api/inventario]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
