import { useMemo, useState } from 'react';
import { Boxes, PackageX, Warehouse, Layers, Filter, Tag } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState } from '../components/ui';
import { BarsChart, Donut } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact, fmtMoney } from '../lib/format';

export default function Inventario() {
  const { data, loading, error, reload } = useFetch(() => api.inventario(), []);
  const [search, setSearch] = useState('');

  const kpis = data?.kpis || {};
  const grupos = data?.gruposAgotados || data?.grupos || [];
  const productos = data?.productos || [];
  const porEstado = data?.porEstado || [];
  const porBodega = data?.porBodega || [];

  const filtered = useMemo(() => {
    if (!search) return productos.slice(0, 100);
    const q = search.toLowerCase();
    return productos.filter((p) => (p.nombre || p.producto || p.codigo || '').toLowerCase().includes(q)).slice(0, 100);
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
            <KpiCard icon={Boxes} label="Total productos" value={fmtInt(kpis.totalProductos || kpis.total)} tone="info" />
            <KpiCard icon={PackageX} label="Sin stock" value={fmtInt(kpis.sinStock || kpis.agotados)} tone="danger" />
            <KpiCard icon={Warehouse} label="Bodegas" value={fmtInt(kpis.bodegas)} tone="info" />
            <KpiCard icon={Tag} label="Grupos" value={fmtInt(kpis.grupos)} tone="info" />
            <KpiCard icon={Layers} label="Valor inventario" value={fmtMoney(kpis.valorTotal)} tone="success" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-8" title="Top grupos con productos sin stock" subtitle="Top 25 grupos · Sin rotación" accent>
              {grupos.length ? (
                <BarsChart
                  data={grupos.slice(0, 25).map((g) => ({ label: (g.grupo || g.nombre || g.label || '').slice(0, 30), value: g.cantidad ?? g.value ?? 0 }))}
                  layout="horizontal"
                  color="#FF453A"
                  valueFormatter={fmtInt}
                  height={520}
                />
              ) : <EmptyState message="Sin datos de grupos" />}
            </Card>

            <Card className="wv-col-4" title="Productos por estado" accent>
              {porEstado.length ? (
                <Donut
                  data={porEstado.map((p) => ({ name: p.estado || p.label, value: p.cantidad ?? p.value }))}
                  formatter={fmtInt}
                />
              ) : <EmptyState message="Sin distribución" />}
            </Card>
          </div>

          {porBodega.length > 0 && (
            <Card title="Productos por bodega" subtitle="Distribución por ubicación" accent style={{ marginBottom: 24 }}>
              <BarsChart
                data={porBodega.map((b) => ({ label: b.bodega || b.label, value: b.cantidad ?? b.value }))}
                color="#00E5FF"
                valueFormatter={fmtInt}
                height={300}
              />
            </Card>
          )}

          <Card
            accent
            title="Detalle de productos"
            subtitle={`${filtered.length} resultados`}
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
                      <th>Bodega</th>
                      <th style={{ textAlign: 'right' }}>Stock</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.codigo || i}>
                        <td className="mono" style={{ color: 'var(--wv-text-muted)' }}>{p.codigo || '—'}</td>
                        <td>{p.nombre || p.producto}</td>
                        <td style={{ color: 'var(--wv-text-muted)' }}>{p.grupo || '—'}</td>
                        <td style={{ color: 'var(--wv-text-muted)' }}>{p.bodega || '—'}</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{fmtInt(p.stock || p.cantidad || 0)}</td>
                        <td>
                          <span className={`wv-badge ${(p.stock || 0) === 0 ? 'danger' : 'live'}`} style={{ fontSize: 10 }}>
                            {(p.stock || 0) === 0 ? 'Agotado' : p.estado || 'Disponible'}
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
