/**
 * RSales Indicators API endpoint
 * Returns real appointment-based KPIs from RSales API.
 * Supports period filters: hoy, ayer, semana, mes (default), mes-pasado, custom (date_from + date_to)
 */

const RSALES_BASE = process.env.RSALES_BASE_URL || 'https://api.ventasremotas.com/v1';
const API_KEY = process.env.RSALES_API_KEY;
const CLIENT_ID = process.env.RSALES_CLIENT_ID;
const CLIENT_SECRET = process.env.RSALES_CLIENT_SECRET;

let _tokenCache = null;

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
  const allItems = [];
  let page = 1;
  while (true) {
    const data = await rsalesGet('/appointments', { day_from: dateFrom, limit: 500, page });
    const items = data.data || [];
    allItems.push(...items);
    const total = data.meta?.totalItems || 0;
    if (allItems.length >= total || items.length === 0 || page > 20) break;
    page++;
  }
  return allItems;
}

function computeDateRange(period) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  switch (period) {
    case 'hoy':
      return { from: today, to: today };
    case 'ayer': {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      const s = d.toISOString().split('T')[0];
      return { from: s, to: s };
    }
    case 'semana': {
      const dow = now.getDay();
      const mon = new Date(now);
      mon.setDate(mon.getDate() - (dow === 0 ? 6 : dow - 1));
      return { from: mon.toISOString().split('T')[0], to: today };
    }
    case 'mes-pasado': {
      const firstCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastPrev = new Date(firstCurrent);
      lastPrev.setDate(0);
      const firstPrev = new Date(lastPrev.getFullYear(), lastPrev.getMonth(), 1);
      return {
        from: firstPrev.toISOString().split('T')[0],
        to: lastPrev.toISOString().split('T')[0]
      };
    }
    default: { // mes
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: first.toISOString().split('T')[0], to: today };
    }
  }
}

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function buildPeriodLabel(from, to) {
  const fromD = new Date(from + 'T12:00:00');
  const toD   = new Date(to   + 'T12:00:00');
  if (from === to)
    return `${fromD.getDate()} ${MONTHS_ES[fromD.getMonth()].slice(0,3)} ${fromD.getFullYear()}`;
  if (fromD.getMonth() === toD.getMonth() && fromD.getFullYear() === toD.getFullYear())
    return `${MONTHS_ES[fromD.getMonth()]} ${fromD.getFullYear()}`;
  return `${from} — ${to}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let { period = 'mes', date_from, date_to } = req.query;

    if (!date_from || !date_to) {
      const range = computeDateRange(period);
      date_from = range.from;
      date_to   = range.to;
    }

    // Parallel fetch: appointments + sellers + customers count
    const [appointments, sellersData, customersData] = await Promise.all([
      fetchAllAppointments(date_from),
      rsalesGet('/sellers', { limit: 500 }),
      rsalesGet('/customers', { limit: 1 })
    ]);

    // Filter to exact date range (RSales only supports day_from, not day_to)
    const inRange = appointments.filter(a => {
      const day = (a.day || '').split('T')[0];
      return day >= date_from && day <= date_to;
    });

    // Seller name map
    const sellerMap = {};
    (sellersData.data || []).forEach(s => { sellerMap[s.code] = s.name; });

    // Agenda states: C=Cumplida, V=Vencida, A=Activa/Pendiente
    const cumplidas = inRange.filter(a => a.state === 'C').length;
    const vencidas  = inRange.filter(a => a.state === 'V').length;
    const pendientes = inRange.filter(a => a.state === 'A').length;
    const extraruta  = inRange.filter(a => a.presence_activity === 'Y').length;

    // Average exec times from executed_at
    const execTimes = inRange
      .filter(a => a.executed_at)
      .map(a => new Date(a.executed_at))
      .filter(d => !isNaN(d.getTime()));

    let horaInicio = '—', horaFin = '—';
    if (execTimes.length > 0) {
      const hours = execTimes.map(d => d.getHours() + d.getMinutes() / 60);
      const minH = Math.min(...hours);
      const maxH = Math.max(...hours);
      const toHM = h => {
        const hh = Math.floor(h);
        const mm = Math.round((h - hh) * 60);
        return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
      };
      horaInicio = toHM(minH);
      horaFin    = toHM(maxH);
    }

    // Client stats
    const gestionadosSet = new Set(inRange.map(a => a.client_id).filter(Boolean));
    const clientesActivos = customersData.meta?.totalItems || 0;
    const gestionados = gestionadosSet.size;

    // Labor by seller (all appointments count)
    const sellerCounts = {};
    inRange.forEach(a => {
      if (a.seller_id) sellerCounts[a.seller_id] = (sellerCounts[a.seller_id] || 0) + 1;
    });
    const labor = Object.entries(sellerCounts)
      .map(([id, count]) => ({
        seller_id: id,
        nombre: sellerMap[id] || `Vendedor ${id}`,
        gestiones: count
      }))
      .sort((a, b) => b.gestiones - a.gestiones);

    // Gestiones por día (planeadas = total that day, realizadas = completed/C)
    const dayMap = {};
    inRange.forEach(a => {
      const day = (a.day || '').split('T')[0];
      if (!day || day < date_from || day > date_to) return;
      if (!dayMap[day]) dayMap[day] = { planeadas: 0, realizadas: 0 };
      dayMap[day].planeadas++;
      if (a.state === 'C') dayMap[day].realizadas++;
    });
    const gestiones_dia = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        fecha: date,
        label: date.slice(5).replace('-', '/'), // MM/DD
        planeadas: counts.planeadas,
        realizadas: counts.realizadas
      }));

    // Causales from appointment observations (free text, keyword-categorized)
    const causalesMap = {};
    inRange.forEach(a => {
      const obs = (a.observations || '').toLowerCase().trim();
      if (!obs) return;
      const cat = /\bpedido\b|\bordenar?\b/.test(obs) ? 'Pedido/Orden'
        : /recaudo|cobr|pago|factura|caja/.test(obs) ? 'Recaudo/Cobro'
        : /inventario|stock|mercanc[íi]a/.test(obs) ? 'Inventario'
        : /seguimiento|retom|llamar|telemercadeo/.test(obs) ? 'Seguimiento'
        : /visita|visitar/.test(obs) ? 'Visita presencial'
        : 'Otro';
      causalesMap[cat] = (causalesMap[cat] || 0) + 1;
    });
    const totalObs = Object.values(causalesMap).reduce((s, v) => s + v, 0) || 1;
    const causales = Object.entries(causalesMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ cat, count, pct: +((count / totalObs) * 100).toFixed(1) }));

    return res.status(200).json({
      period:  { from: date_from, to: date_to, label: buildPeriodLabel(date_from, date_to) },
      agendas: { cumplidas, vencidas, pendientes, extraruta },
      tiempos: { inicio: horaInicio, fin: horaFin },
      clientes: {
        activos:    clientesActivos,
        gestionados,
        sin_gestion: Math.max(0, clientesActivos - gestionados),
        pct:        clientesActivos > 0 ? Math.round(gestionados / clientesActivos * 100) : 0
      },
      labor,
      gestiones_dia,
      causales,
      total_appointments: inRange.length,
      updated: new Date().toISOString()
    });
  } catch (err) {
    console.error('[rsales-indicators] error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
