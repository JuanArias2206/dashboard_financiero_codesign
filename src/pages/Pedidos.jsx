import { useState, useMemo } from 'react';
import { ShoppingCart, ReceiptText, FileText, Users, Package, Filter } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState, Segmented } from '../components/ui';
import { AreaTrend, BarsChart, Donut } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact, fmtMoney } from '../lib/format';

const TYPES = [
  { value: 'todos', label: 'Todos' },
  { value: 'pedido', label: 'Pedidos' },
  { value: 'factura', label: 'Facturas' },
  { value: 'cotizacion', label: 'Cotizaciones' },
];

export default function Pedidos() {
  const { data, loading, error, reload } = useFetch(() => api.pedidos(), []);
  const [type, setType] = useState('todos');
  const [search, setSearch] = useState('');

  const kpis = data?.kpis || {};
  const porTipo = data?.porTipo || [];
  const porEstado = data?.porEstado || [];
  const porSupervisor = data?.porSupervisor || [];
  const topClientes = useMemo(() => (data?.topClientes || data?.clientes || []).slice(0, 30), [data]);
  const productos = data?.productos || data?.gruposProductos || [];
  const evolucion = data?.evolucionMensual || data?.monthly || [];
  const transacciones = data?.transacciones || [];

  const filteredTx = useMemo(() => {
    let rows = transacciones;
    if (type !== 'todos') {
      rows = rows.filter((t) => (t.tipo || '').toLowerCase().includes(type));
    }
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((t) =>
        (t.cliente || t.numero || t.referencia || '').toLowerCase().includes(q)
      );
    }
    return rows.slice(0, 80);
  }, [transacciones, type, search]);

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Inventario y Ventas</div>
          <h1>Pedido · Factura · Cotización</h1>
        </div>
      </div>

      {loading && <Loader label="Cargando transacciones…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={ShoppingCart} label="Total ventas" value={fmtMoney(kpis.totalVentas)} tone="success" />
            <KpiCard icon={ReceiptText} label="Facturas" value={fmtInt(kpis.facturas)} tone="info" />
            <KpiCard icon={FileText} label="Pedidos" value={fmtInt(kpis.pedidos)} tone="info" />
            <KpiCard icon={Package} label="Cotizaciones" value={fmtInt(kpis.cotizaciones)} tone="warn" />
            <KpiCard icon={Users} label="Clientes únicos" value={fmtInt(kpis.clientes)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Ventas por tipo de transacción" accent>
              {porTipo.length ? (
                <Donut
                  data={porTipo.map((p) => ({ name: p.tipo || p.label, value: p.monto ?? p.value ?? 0 }))}
                  formatter={fmtCompact}
                  centerLabel="Bs."
                />
              ) : <EmptyState message="Sin tipos" />}
            </Card>

            <Card className="wv-col-6" title="Ventas por estado" accent>
              {porEstado.length ? (
                <BarsChart
                  data={porEstado.map((e) => ({ label: e.estado || e.label, value: e.monto ?? e.value ?? 0 }))}
                  layout="horizontal"
                  color="#00E5FF"
                  valueFormatter={fmtCompact}
                />
              ) : <EmptyState message="Sin estados" />}
            </Card>
          </div>

          {porSupervisor.length > 0 && (
            <Card title="Ventas y transacciones por supervisor" subtitle="Total por equipo" accent style={{ marginBottom: 24 }}>
              <BarsChart
                data={porSupervisor.map((s) => ({
                  label: s.supervisor || s.nombre,
                  ventas: s.ventas ?? s.monto ?? 0,
                  transacciones: s.transacciones ?? 0,
                }))}
                series={[
                  { key: 'ventas', name: 'Ventas (Bs.)', color: '#00E5FF' },
                  { key: 'transacciones', name: 'Transacciones', color: '#32D74B' },
                ]}
                layout="horizontal"
                valueFormatter={fmtCompact}
                height={Math.max(300, porSupervisor.length * 32)}
              />
            </Card>
          )}

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            {productos.length > 0 && (
              <Card className="wv-col-6" title="Análisis por productos" subtitle="Top 40 grupos" accent>
                <BarsChart
                  data={productos.slice(0, 40).map((p) => ({ label: (p.grupo || p.nombre || '').slice(0, 22), value: p.ventas ?? p.monto ?? 0 }))}
                  layout="horizontal"
                  color="#BF5AF2"
                  valueFormatter={fmtCompact}
                  height={460}
                />
              </Card>
            )}

            {topClientes.length > 0 && (
              <Card className="wv-col-6" title="Top clientes" subtitle="Top 30 por ventas" accent>
                <BarsChart
                  data={topClientes.map((c) => ({ label: (c.nombre || c.cliente || '').slice(0, 22), value: c.ventas ?? c.monto ?? 0 }))}
                  layout="horizontal"
                  color="#00E5FF"
                  valueFormatter={fmtCompact}
                  height={460}
                />
              </Card>
            )}
          </div>

          {evolucion.length > 0 && (
            <Card title="Evolución mensual de ventas" subtitle="Comparativo dentro del período" accent style={{ marginBottom: 24 }}>
              <AreaTrend
                data={evolucion.map((m) => ({ label: m.mes || m.label, ventas: m.ventas ?? m.monto ?? 0 }))}
                series={[{ key: 'ventas', name: 'Ventas Bs.', color: '#00E5FF' }]}
                valueFormatter={fmtCompact}
              />
            </Card>
          )}

          {transacciones.length > 0 && (
            <Card
              accent
              title="Listado de transacciones"
              subtitle={`${filteredTx.length} resultados`}
              action={
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Segmented options={TYPES} value={type} onChange={setType} />
                  <div className="wv-search" style={{ minWidth: 220 }}>
                    <Filter size={14} color="var(--wv-text-dim)" />
                    <input placeholder="Cliente, n°…" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
              }
            >
              <div className="wv-table-wrap">
                <table className="wv-table">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Tipo</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th style={{ textAlign: 'right' }}>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map((t, i) => (
                      <tr key={t.id || t.numero || i}>
                        <td className="mono" style={{ color: 'var(--wv-text-muted)' }}>{t.numero || t.id}</td>
                        <td>
                          <span className="wv-badge neutral" style={{ fontSize: 10 }}>{t.tipo || '—'}</span>
                        </td>
                        <td>{t.cliente || '—'}</td>
                        <td className="mono" style={{ color: 'var(--wv-text-muted)' }}>{t.fecha || '—'}</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{fmtMoney(t.monto)}</td>
                        <td>
                          <span className={`wv-badge ${(t.estado || '').toLowerCase() === 'pagada' ? 'live' : 'neutral'}`} style={{ fontSize: 10 }}>
                            {t.estado || 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </>
  );
}
