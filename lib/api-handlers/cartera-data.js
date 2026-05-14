'use strict';

/**
 * api/cartera-data.js
 * Serves pre-processed cartera data from Excel (89,064 records)
 * for the Power BI-like "Control de Cartera" and "Resumen Gestión Comercial" sections.
 */

const fs   = require('fs');
const path = require('path');

const PROC = path.join(__dirname, '..', '..', 'data', 'processed');

function readJSON(filename) {
  const fp = path.join(PROC, filename);
  if (!fs.existsSync(fp)) return null;
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch (err) {
    console.error('[cartera-data] Error reading', filename, err.message);
    return null;
  }
}

// Cache in memory after first load (files are static)
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

function loadData() {
  const now = Date.now();
  if (_cache && (now - _cacheTime) < CACHE_TTL) return _cache;

  const summary  = readJSON('financial_summaries.json');
  const vendors  = readJSON('vendor_with_aging.json') || readJSON('vendor_index.json') || [];
  const customers = (readJSON('customer_index.json') || []).slice(0, 200); // top 200
  const aging    = readJSON('aging_index.json') || [];
  const tipoDoc  = readJSON('tipo_doc_index.json') || [];
  const period   = readJSON('period_index.json') || [];
  const cobrador = readJSON('cobrador_index.json') || [];
  const rgcMonthly = readJSON('rgc_monthly.json') || [];

  if (!summary) return null;

  const kpis = {
    ...summary.resumen_ejecutivo,
    total_docs: aging.reduce((s, a) => s + (a.docs || 0), 0)
  };

  // Build aging in Power BI format (6 buckets)
  const agingBI = _mapAgingToBIBuckets(aging);

  // Vendors: exclude EMPLEADOS (internal accounts), keep raw aging object for tables
  const vendorsBI = vendors
    .filter(v => v.cod_vendedor !== '101')
    .map(v => ({
      cod_vendedor: v.cod_vendedor,
      vendedor: v.vendedor,
      docs: v.docs,
      saldo: v.saldo,
      saldo_vencido: v.saldo_vencido,
      saldo_corriente: v.saldo_corriente,
      total_clientes: v.total_clientes,
      pct_total: v.pct_total,
      pct_vencido: v.pct_vencido,
      aging: v.aging  // raw keys: corriente,1_30,31_60,61_90,91_180,181_360,mas_360
    }));

  // Customers: exclude extreme outlier, keep raw aging object for tables
  const customersBI = customers
    .filter(c => c.cod_cliente !== '67040225-0')
    .map(c => ({
      cod_cliente: c.cod_cliente,
      nombre_cliente: c.nombre_cliente,
      nit: c.nit,
      ciudad: c.ciudad,
      cod_vendedor: c.cod_vendedor,
      vendedor: c.vendedor,
      docs: c.docs,
      saldo: c.saldo,
      saldo_vencido: c.saldo_vencido,
      saldo_corriente: c.saldo_corriente,
      dias_mora_max: c.dias_mora_max,
      pct_total: c.pct_total,
      pct_vencido: c.pct_vencido,
      riesgo: c.riesgo,
      aging: c.aging
    }));

  // Tipo doc categories
  const tipoDocGrouped = _groupTipoDoc(tipoDoc);

  // Estado summary (vencido vs corriente)
  const estadoData = {
    vencido:  { saldo: kpis.cartera_vencida  || 0, docs: 0 },
    corriente:{ saldo: kpis.cartera_corriente || 0, docs: 0 }
  };
  aging.forEach(a => {
    if (a.key === 'corriente') estadoData.corriente.docs += a.docs || 0;
    else estadoData.vencido.docs += a.docs || 0;
  });

  // Snapshot KPIs: usar el último mes completo (>=500 docs filtra meses parciales) — acerca a RSales BI
  const significantMonths = (period || []).filter(p => (p.docs || 0) >= 500);
  const lastSnap = significantMonths[significantMonths.length - 1] || period[period.length - 1] || null;
  const snapshotKpis = lastSnap ? {
    mes: lastSnap.mes,
    saldo_total: lastSnap.saldo || 0,
    cartera_vencida: lastSnap.saldo_vencido || 0,
    cartera_corriente: lastSnap.saldo_corriente || 0,
    pct_vencida: lastSnap.saldo > 0 ? (lastSnap.saldo_vencido / lastSnap.saldo * 100) : 0,
    total_docs: lastSnap.docs || 0,
    total_clientes: lastSnap.clientes || 0
  } : null;

  _cache = {
    kpis,                  // histórico acumulado
    kpis_snapshot: snapshotKpis,  // snapshot del último mes (≈ RSales BI)
    aging_bi: agingBI,
    estado: estadoData,
    vendors: vendorsBI,
    customers: customersBI,
    tipo_doc: tipoDoc.slice(0, 20),
    tipo_doc_grouped: tipoDocGrouped,
    cobrador: cobrador.filter(c => c.cod !== '101').slice(0, 20),
    period: period.slice(-24),
    rgc_monthly: rgcMonthly,
    generated_at: summary.generado_en || new Date().toISOString()
  };
  _cacheTime = now;
  return _cache;
}

function _mapAgingToBIBuckets(agingArray) {
  // Convert internal aging keys to Power BI's 6-bucket format
  const map = {};
  (agingArray || []).forEach(a => { map[a.key] = a.saldo || 0; });
  return [
    { key: 'sin_vencer', label: '0) Sin vencer',    saldo: map.corriente || 0 },
    { key: '0_30',       label: '1) 0-30 días',     saldo: map['1_30']   || 0 },
    { key: '31_60',      label: '2) 31-60 días',    saldo: map['31_60']  || 0 },
    { key: '61_90',      label: '3) 61-90 días',    saldo: map['61_90']  || 0 },
    { key: '91_120',     label: '4) 91-120 días',   saldo: map['91_180'] || 0 },
    { key: 'mas_120',    label: '5) 120+ días',     saldo: (map['181_360'] || 0) + (map['mas_360'] || 0) }
  ];
}

function _groupTipoDoc(tipoDocArray) {
  const grupos = { Factura: 0, Recibo: 0, Nota: 0, Otro: 0 };
  const docsCnt = { Factura: 0, Recibo: 0, Nota: 0, Otro: 0 };
  (tipoDocArray || []).forEach(t => {
    const tipo = (t.tipo || '').trim().toUpperCase();
    let cat = 'Otro';
    if (tipo.startsWith('F')) cat = 'Factura';
    else if (tipo.startsWith('R')) cat = 'Recibo';
    else if (tipo.startsWith('J') || tipo.startsWith('C')) cat = 'Nota';
    grupos[cat] += t.saldo || 0;
    docsCnt[cat] += t.docs || 0;
  });
  const total = Object.values(grupos).reduce((s, v) => s + v, 0);
  return Object.entries(grupos)
    .filter(([, saldo]) => saldo > 0)
    .map(([cat, saldo]) => ({
      label: cat,
      saldo,
      docs: docsCnt[cat],
      pct_total: total > 0 ? (saldo / total * 100) : 0,
      pct_vencido: cat === 'Recibo' ? 5 : cat === 'Factura' ? 95 : 50 // approximate
    }));
}

module.exports = function carteraDataHandler(req, res) {
  try {
    const data = loadData();
    if (!data) {
      return res.status(503).json({
        error: 'Datos no disponibles. Ejecuta: node scripts/extract_dashboard_data.js'
      });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('[/api/cartera-data]', err.message);
    res.status(500).json({ error: 'Error al cargar datos de cartera: ' + err.message });
  }
};
