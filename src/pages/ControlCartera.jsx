import { useMemo, useState } from 'react';
import {
  AlertTriangle, BadgeDollarSign, Banknote, FileText, Layers,
  ShieldCheck, Users, UserRound, Database, Filter,
} from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, Segmented, EmptyState } from '../components/ui';
import { AreaTrend, BarsChart, Donut, MultiLine } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact, fmtMoney, fmtPct } from '../lib/format';

const VIEW_MODES = [
  { value: 'snapshot', label: 'Snapshot actual' },
  { value: 'historic', label: 'Histórico acumulado' },
];

const TABS = [
  { value: 'vendedor', label: 'Por vendedor' },
  { value: 'cliente', label: 'Por cliente' },
];

export default function ControlCartera() {
  const [mode, setMode] = useState('snapshot');
  const [tab, setTab] = useState('vendedor');
  const [filter, setFilter] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.carteraData(), []);

  const kpis = data?.kpis || {};
  const aging = data?.aging || [];
  const vendedores = data?.vendedores || [];
  const clientes = data?.clientes || [];
  const evolutionMonthly = data?.evolutionMonthly || data?.monthly || [];

  const filteredVendors = useMemo(() => {
    if (!filter) return vendedores;
    const q = filter.toLowerCase();
    return vendedores.filter((v) => (v.nombre || v.vendedor || '').toLowerCase().includes(q));
  }, [vendedores, filter]);

  const filteredClients = useMemo(() => {
    if (!filter) return clientes;
    const q = filter.toLowerCase();
    return clientes.filter((c) => (c.nombre || c.cliente || '').toLowerCase().includes(q));
  }, [clientes, filter]);

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Cartera</div>
          <h1>Control de Cartera</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, color: 'var(--wv-text-muted)', fontSize: 12 }}>
            <Database size={13} />
            <span>Excel SQL · 12/05/2026</span>
          </div>
        </div>
        <Segmented options={VIEW_MODES} value={mode} onChange={setMode} />
      </div>

      {loading && <Loader label="Cargando cartera…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard
              icon={Banknote}
              label="Saldo total en cartera"
              value={fmtMoney(kpis.saldo_total)}
              foot={`${fmtInt(kpis.total_documentos)} documentos`}
              tone="info"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Saldo en mora"
              value={fmtMoney(kpis.cartera_vencida)}
              tone="danger"
              delta={fmtPct((kpis.cartera_vencida / (kpis.saldo_total || 1)) * 100)}
              deltaUp={false}
            />
            <KpiCard
              icon={ShieldCheck}
              label="Cartera corriente"
              value={fmtMoney(kpis.cartera_por_vencer)}
              tone="success"
            />
            <KpiCard
              icon={BadgeDollarSign}
              label="Saldo promedio"
              value={fmtMoney(kpis.saldo_promedio)}
            />
            <KpiCard
              icon={Users}
              label="Total vendedores"
              value={fmtInt(kpis.total_vendedores)}
              tone="info"
            />
            <KpiCard
              icon={UserRound}
              label="Total clientes"
              value={fmtInt(kpis.total_clientes)}
              tone="info"
            />
            <KpiCard
              icon={Layers}
              label="Días mora promedio"
              value={fmtInt(kpis.dias_mora_promedio)}
              tone="warn"
            />
            <KpiCard
              icon={FileText}
              label="Documentos"
              value={fmtInt(kpis.total_documentos)}
              tone="info"
            />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Distribución por edad de cartera" subtitle="Buckets de mora · Bs." accent>
              {aging.length ? (
                <BarsChart
                  data={aging.map((a) => ({ label: a.rango, value: a.saldo }))}
                  xKey="label"
                  yKey="value"
                  layout="horizontal"
                  color="#00E5FF"
                  valueFormatter={fmtCompact}
                />
              ) : (
                <EmptyState message="Sin datos de aging" />
              )}
            </Card>

            <Card className="wv-col-6" title="Estado de cartera" subtitle="Mora vs corriente" accent>
              <Donut
                data={[
                  { name: 'En mora', value: kpis.cartera_vencida || 0 },
                  { name: 'Corriente', value: kpis.cartera_por_vencer || 0 },
                ]}
                colors={['#FF453A', '#32D74B']}
                formatter={fmtCompact}
                centerLabel="Saldo total"
              />
            </Card>
          </div>

          {evolutionMonthly.length > 0 && (
            <Card title="Evolución mensual de cartera" subtitle="Saldo total y clientes con deuda" accent className="wv-col-12" style={{ marginBottom: 24 }}>
              <AreaTrend
                data={evolutionMonthly.map((m) => ({
                  label: m.mes || m.month || m.label,
                  saldo: m.saldo ?? m.total ?? 0,
                  clientes: m.clientes ?? m.cantidad ?? 0,
                }))}
                xKey="label"
                series={[
                  { key: 'saldo', name: 'Saldo (Bs.)', color: '#00E5FF' },
                  { key: 'clientes', name: 'Clientes', color: '#BF5AF2' },
                ]}
                valueFormatter={fmtCompact}
                height={340}
              />
            </Card>
          )}

          <Card
            accent
            title="Análisis detallado"
            subtitle="Saldo en cartera y % mora por entidad"
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Segmented options={TABS} value={tab} onChange={setTab} />
                <div className="wv-search" style={{ minWidth: 200 }}>
                  <Filter size={14} color="var(--wv-text-dim)" />
                  <input
                    placeholder={tab === 'vendedor' ? 'Filtrar vendedor…' : 'Filtrar cliente…'}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
              </div>
            }
          >
            {tab === 'vendedor' ? (
              <CarteraTable rows={filteredVendors} kind="vendedor" />
            ) : (
              <CarteraTable rows={filteredClients} kind="cliente" />
            )}
          </Card>
        </>
      )}
    </>
  );
}

function CarteraTable({ rows, kind }) {
  if (!rows || rows.length === 0) {
    return <EmptyState title="Sin resultados" message="No hay registros para los filtros seleccionados" />;
  }
  const top = rows.slice(0, 50);
  return (
    <div className="wv-table-wrap">
      <table className="wv-table">
        <thead>
          <tr>
            <th>{kind === 'vendedor' ? 'Vendedor' : 'Cliente'}</th>
            <th style={{ textAlign: 'right' }}>Saldo total</th>
            <th style={{ textAlign: 'right' }}>Saldo en mora</th>
            <th style={{ textAlign: 'right' }}>% mora</th>
            <th style={{ textAlign: 'right' }}>Docs</th>
          </tr>
        </thead>
        <tbody>
          {top.map((r, i) => {
            const name = r.nombre || r.vendedor || r.cliente || `#${i+1}`;
            const saldo = r.saldo ?? r.saldo_total ?? 0;
            const mora = r.saldo_mora ?? r.cartera_vencida ?? 0;
            const pct = r.pct_mora ?? (saldo > 0 ? (mora / saldo) * 100 : 0);
            const docs = r.documentos ?? r.docs ?? 0;
            const tone = pct >= 60 ? 'var(--wv-danger)' : pct >= 30 ? 'var(--wv-warn)' : 'var(--wv-success)';
            return (
              <tr key={r.id || r.codigo || name + i}>
                <td>{name}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{fmtMoney(saldo)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-danger)' }}>{fmtMoney(mora)}</td>
                <td className="mono" style={{ textAlign: 'right', color: tone, fontWeight: 600 }}>{fmtPct(pct)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-text-muted)' }}>{fmtInt(docs)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
