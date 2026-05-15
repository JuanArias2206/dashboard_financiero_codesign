import { useState, useMemo } from 'react';
import { ShoppingCart, ReceiptText, FileText, Users, Package, Activity, Boxes } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState } from '../components/ui';
import { AreaTrend, BarsChart, Donut } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact, fmtMoney, fmtPct } from '../lib/format';

const now = new Date();
const YEARS = [now.getFullYear(), now.getFullYear() - 1].map((y) => ({ value: String(y), label: String(y) }));
const MONTHS = [
  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
  { value: '0', label: 'Todo el año' },
];

export default function Pedidos() {
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const { data, loading, error, reload } = useFetch(() => api.pedidos({ year, month }), [year, month]);

  const kpis = data?.kpis || {};
  const tipoTrans = data?.tipo_transaccion || [];
  const estados = data?.estados || [];
  const supervisores = data?.supervisores || [];
  const productos = data?.productos || [];
  const clientes = data?.clientes || [];
  const evolucion = data?.evolucion_mensual || [];
  const usuariosArr = data?.usuarios || [];

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Inventario y Ventas</div>
          <h1>Pedido · Factura · Cotización</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="wv-select" style={{ width: 120 }} value={year} onChange={(e) => setYear(e.target.value)}>
            {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
          </select>
          <select className="wv-select" style={{ width: 160 }} value={month} onChange={(e) => setMonth(e.target.value)}>
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {loading && <Loader label="Cargando transacciones…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={ShoppingCart} label="Total ventas" value={fmtMoney(kpis.total_ventas)} tone="success" />
            <KpiCard icon={ReceiptText} label="Transacciones" value={fmtInt(kpis.total_tx)} tone="info" />
            <KpiCard icon={Boxes} label="Unidades pedidas" value={fmtInt(kpis.unidades_pedidas)} tone="info" />
            <KpiCard icon={Users} label="Clientes impactados" value={fmtInt(kpis.clientes_impactados)} tone="info" foot={fmtPct(kpis.pct_impacto ?? 0)} />
            <KpiCard icon={Activity} label="Vendedores activos" value={fmtInt(kpis.usuarios)} tone="info" />
            <KpiCard icon={Package} label="Referencias" value={fmtInt(kpis.referencias)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Ventas por tipo de transacción" accent>
              {tipoTrans.length ? (
                <Donut
                  data={tipoTrans.map((p) => ({ name: p.tipo, value: p.total }))}
                  formatter={fmtCompact}
                  centerLabel="$"
                />
              ) : <EmptyState message="Sin tipos" />}
            </Card>

            <Card className="wv-col-6" title="Ventas por estado" accent>
              {estados.length ? (
                <BarsChart
                  data={estados.map((e) => ({ label: e.estado, value: e.total }))}
                  layout="horizontal"
                  color="#00E5FF"
                  valueFormatter={fmtCompact}
                />
              ) : <EmptyState message="Sin estados" />}
            </Card>
          </div>

          {supervisores.length > 0 && (
            <Card title="Ventas y transacciones por supervisor" subtitle="Total por equipo" accent style={{ marginBottom: 24 }}>
              <BarsChart
                data={supervisores.map((s) => ({
                  label: s.supervisor.slice(0, 22),
                  ventas: s.total,
                  transacciones: s.tx,
                }))}
                series={[
                  { key: 'ventas', name: 'Ventas ($)', color: '#00E5FF' },
                  { key: 'transacciones', name: 'Transacciones', color: '#32D74B' },
                ]}
                layout="horizontal"
                valueFormatter={fmtCompact}
                height={Math.max(280, supervisores.length * 36)}
              />
            </Card>
          )}

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            {productos.length > 0 && (
              <Card className="wv-col-6" title="Top productos por ventas" subtitle="Top 40 grupos" accent>
                <BarsChart
                  data={productos.slice(0, 40).map((p) => ({ label: (p.grupo || '').slice(0, 22), value: p.total }))}
                  layout="horizontal"
                  color="#BF5AF2"
                  valueFormatter={fmtCompact}
                  height={Math.max(360, productos.slice(0, 40).length * 22)}
                />
              </Card>
            )}

            {clientes.length > 0 && (
              <Card className="wv-col-6" title="Top clientes" subtitle="Top 30 por ventas" accent>
                <BarsChart
                  data={clientes.slice(0, 30).map((c) => ({ label: (c.name || '').slice(0, 22), value: c.total }))}
                  layout="horizontal"
                  color="#00E5FF"
                  valueFormatter={fmtCompact}
                  height={Math.max(360, clientes.slice(0, 30).length * 22)}
                />
              </Card>
            )}
          </div>

          {evolucion.length > 0 && (
            <Card title="Evolución mensual de ventas" accent style={{ marginBottom: 24 }}>
              <AreaTrend
                data={evolucion.map((m) => ({ label: m.mes, ventas: m.total }))}
                series={[{ key: 'ventas', name: 'Ventas ($)', color: '#00E5FF' }]}
                valueFormatter={fmtCompact}
              />
            </Card>
          )}

          {usuariosArr.length > 0 && (
            <Card title="Detalle por vendedor" subtitle={`${usuariosArr.length} vendedores con ventas`} accent>
              <div className="wv-table-wrap">
                <table className="wv-table">
                  <thead>
                    <tr>
                      <th>Vendedor</th>
                      <th>Supervisor</th>
                      <th style={{ textAlign: 'right' }}>Ventas</th>
                      <th style={{ textAlign: 'right' }}>Transacciones</th>
                      <th style={{ textAlign: 'right' }}>Unidades</th>
                      <th style={{ textAlign: 'right' }}>Clientes</th>
                      <th style={{ textAlign: 'right' }}>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosArr.slice(0, 60).map((u, i) => (
                      <tr key={u.seller_id || i}>
                        <td>{u.nombre}</td>
                        <td style={{ color: 'var(--wv-text-muted)' }}>{u.supervisor || '—'}</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{fmtMoney(u.total_ventas)}</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{fmtInt(u.tx)}</td>
                        <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-text-muted)' }}>{fmtInt(u.unidades)}</td>
                        <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-text-muted)' }}>{fmtInt(u.clientes)}</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{fmtMoney(u.promedio)}</td>
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
