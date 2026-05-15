import { useMemo, useState } from 'react';
import { Boxes, PackageX, Warehouse, Layers, Filter, PackageCheck, Activity } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState } from '../components/ui';
import { BarsChart, Donut } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtPct } from '../lib/format';

export default function Inventario() {
  const { data, loading, error, reload } = useFetch(() => api.inventario(), []);
  const [search, setSearch] = useState('');

  const kpis = data?.kpis || {};
  const estado = data?.estado || [];
  const disponibilidad = data?.disponibilidad || [];
  const agotadosGrupo = data?.agotados_por_grupo || [];
  const productosGrupo = data?.productos_por_grupo || [];
  const porBodega = data?.inventario_por_bodega || [];
  const productos = data?.productos || [];

  const filtered = useMemo(() => {
    if (!search) return productos.slice(0, 100);
    const q = search.toLowerCase();
    return productos.filter((p) =>
      (p.name || p.code || '').toLowerCase().includes(q)
    ).slice(0, 100);
  }, [productos, search]);

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Inventario y Ventas</div>
          <h1>Análisis de Inventario</h1>
        </div>
      </div>

      {loading && <Loader label="Cargando inventario…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={Boxes} label="Total productos" value={fmtInt(kpis.total_productos)} tone="info" />
            <KpiCard icon={PackageCheck} label="Activos" value={fmtInt(kpis.total_activos)} tone="success" foot={fmtPct(kpis.pct_activos ?? 0)} />
            <KpiCard icon={PackageX} label="Agotados" value={fmtInt(kpis.productos_agotados)} tone="danger" />
            <KpiCard icon={Activity} label="Disponibles" value={fmtInt(kpis.productos_disponibles)} tone="info" foot={fmtPct(kpis.pct_disponibles ?? 0)} />
            <KpiCard icon={Layers} label="Unidades inventario" value={fmtInt(kpis.total_inventario_unidades)} tone="info" />
            <KpiCard icon={Warehouse} label="Bodegas" value={fmtInt(porBodega.length)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-8" title="Top grupos con productos agotados" subtitle="Top 25 grupos sin stock" accent>
              {agotadosGrupo.length ? (
                <BarsChart
                  data={agotadosGrupo.slice(0, 25).map((g) => ({ label: g.grupo.slice(0, 30), value: g.count }))}
                  layout="horizontal"
                  color="#FF453A"
                  valueFormatter={fmtInt}
                  height={Math.max(360, agotadosGrupo.slice(0, 25).length * 24)}
                />
              ) : <EmptyState message="Sin datos de grupos agotados" />}
            </Card>

            <div className="wv-col-4" style={{ display: 'grid', gap: 16 }}>
              <Card title="Productos por estado" accent>
                {estado.length ? (
                  <Donut
                    data={estado.map((p) => ({ name: p.label, value: p.count }))}
                    colors={['#32D74B', '#98989D']}
                    formatter={fmtInt}
                    centerLabel="Productos"
                    height={240}
                  />
                ) : <EmptyState message="Sin distribución" />}
              </Card>

              <Card title="Disponibilidad" accent>
                {disponibilidad.length ? (
                  <Donut
                    data={disponibilidad.map((p) => ({ name: p.label, value: p.count }))}
                    colors={['#00E5FF', '#FF453A']}
                    formatter={fmtInt}
                    centerLabel="Productos"
                    height={240}
                  />
                ) : <EmptyState message="Sin disponibilidad" />}
              </Card>
            </div>
          </div>

          {productosGrupo.length > 0 && (
            <Card title="Productos por grupo" subtitle="Total vs sin rotación · Top 30" accent style={{ marginBottom: 24 }}>
              <BarsChart
                data={productosGrupo.map((g) => ({
                  label: g.grupo.slice(0, 26),
                  con_rotacion: g.total - g.sin_rotacion,
                  sin_rotacion: g.sin_rotacion,
                }))}
                series={[
                  { key: 'con_rotacion', name: 'Con stock', color: '#32D74B' },
                  { key: 'sin_rotacion', name: 'Sin stock', color: '#FF453A' },
                ]}
                stacked
                layout="horizontal"
                valueFormatter={fmtInt}
                height={Math.max(360, productosGrupo.length * 24)}
              />
            </Card>
          )}

          {porBodega.length > 0 && (
            <Card title="Productos por bodega" subtitle="Top 20 bodegas por volumen · disponibilidad" accent style={{ marginBottom: 24 }}>
              {(() => {
                const sorted = [...porBodega].sort((a, b) => (b.si + b.no) - (a.si + a.no));
                const top = sorted.slice(0, 20);
                const rest = sorted.slice(20);
                const others = rest.length
                  ? [{ bodega: `Otros (${rest.length})`, si: rest.reduce((s, r) => s + r.si, 0), no: rest.reduce((s, r) => s + r.no, 0) }]
                  : [];
                const data = [...top, ...others];
                return (
                  <BarsChart
                    data={data.map((b) => ({
                      label: b.bodega,
                      disponible: b.si,
                      agotado: b.no,
                    }))}
                    series={[
                      { key: 'disponible', name: 'Disponible', color: '#00E5FF' },
                      { key: 'agotado', name: 'Agotado', color: '#FF453A' },
                    ]}
                    stacked
                    valueFormatter={fmtInt}
                    height={Math.max(360, data.length * 28)}
                  />
                );
              })()}
            </Card>
          )}

          <Card
            accent
            title="Detalle de productos"
            subtitle={`${filtered.length} de ${productos.length} resultados`}
            action={
              <div className="wv-search" style={{ minWidth: 240 }}>
                <Filter size={14} color="var(--wv-text-dim)" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto, código…"
                />
              </div>
            }
          >
            {filtered.length === 0 ? (
              <EmptyState message="Sin productos para mostrar" />
            ) : (
              <div className="wv-table-wrap">
                <table className="wv-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Grupo</th>
                      <th style={{ textAlign: 'right' }}>Stock</th>
                      <th>Estado</th>
                      <th>Disponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.code || i}>
                        <td className="mono" style={{ color: 'var(--wv-text-muted)' }}>{p.code || '—'}</td>
                        <td>{p.name}</td>
                        <td style={{ color: 'var(--wv-text-muted)' }}>{p.group || '—'}</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{fmtInt(p.quantity)}</td>
                        <td>
                          <span className={`wv-badge ${p.active ? 'live' : 'neutral'}`} style={{ fontSize: 10 }}>
                            {p.state}
                          </span>
                        </td>
                        <td>
                          <span className={`wv-badge ${p.quantity > 0 ? 'live' : 'danger'}`} style={{ fontSize: 10 }}>
                            {p.available}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}
