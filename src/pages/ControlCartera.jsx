import { useMemo, useState } from 'react';
import {
  AlertTriangle, BadgeDollarSign, Banknote, FileText, Layers,
  ShieldCheck, Users, UserRound, Database, Filter,
} from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, Segmented, EmptyState } from '../components/ui';
import { AreaTrend, BarsChart, Donut } from '../components/charts/Charts';
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

  const baseKpis = (mode === 'snapshot' ? data?.kpis_snapshot : data?.kpis) || data?.kpis || {};
  const histKpis = data?.kpis || {};
  const agingBI = data?.aging_bi || [];
  const estado = data?.estado || {};
  const vendors = data?.vendors || [];
  const customers = data?.customers || [];
  const period = data?.period || [];

  const filteredVendors = useMemo(() => {
    if (!filter) return vendors;
    const q = filter.toLowerCase();
    return vendors.filter((v) => (v.vendedor || '').toLowerCase().includes(q));
  }, [vendors, filter]);

  const filteredCustomers = useMemo(() => {
    if (!filter) return customers;
    const q = filter.toLowerCase();
    return customers.filter((c) => (c.nombre_cliente || '').toLowerCase().includes(q));
  }, [customers, filter]);

  // KPI values: snapshot keys are slightly different
  const saldoTotal = baseKpis.saldo_total ?? 0;
  const carteraVencida = baseKpis.cartera_vencida ?? 0;
  const carteraCorriente = baseKpis.cartera_corriente ?? 0;
  const pctVencida = baseKpis.pct_vencida ?? (saldoTotal > 0 ? (carteraVencida / saldoTotal) * 100 : 0);
  const totalDocs = baseKpis.total_docs ?? baseKpis.total_documentos ?? histKpis.total_docs ?? histKpis.total_documentos ?? 0;
  const totalClientes = baseKpis.total_clientes ?? histKpis.total_clientes ?? 0;
  const totalVendedores = histKpis.total_vendedores ?? vendors.length;
  const diasMora = histKpis.dias_mora_promedio ?? 0;
  const saldoPromedio = histKpis.saldo_promedio ?? (totalDocs > 0 ? saldoTotal / totalDocs : 0);
  const mesLabel = data?.kpis_snapshot?.mes;

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Cartera</div>
          <h1>Control de Cartera</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, color: 'var(--wv-text-muted)', fontSize: 12 }}>
            <Database size={13} />
            <span>
              {mode === 'snapshot' && mesLabel
                ? `Snapshot · ${mesLabel}`
                : 'Histórico acumulado · Excel SQL'}
            </span>
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
              value={fmtMoney(saldoTotal)}
              foot={`${fmtInt(totalDocs)} documentos`}
              tone="info"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Saldo en mora"
              value={fmtMoney(carteraVencida)}
              tone="danger"
              delta={fmtPct(pctVencida)}
              deltaUp={false}
            />
            <KpiCard
              icon={ShieldCheck}
              label="Cartera corriente"
              value={fmtMoney(carteraCorriente)}
              tone="success"
            />
            <KpiCard
              icon={BadgeDollarSign}
              label="Saldo promedio"
              value={fmtMoney(saldoPromedio)}
            />
            <KpiCard
              icon={Users}
              label="Total vendedores"
              value={fmtInt(totalVendedores)}
              tone="info"
            />
            <KpiCard
              icon={UserRound}
              label="Total clientes"
              value={fmtInt(totalClientes)}
              tone="info"
            />
            <KpiCard
              icon={Layers}
              label="Días mora promedio"
              value={fmtInt(diasMora)}
              tone="warn"
            />
            <KpiCard
              icon={FileText}
              label="Documentos"
              value={fmtInt(totalDocs)}
              tone="info"
            />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Distribución por edad de cartera" subtitle="Buckets de mora · $ COP" accent>
              {agingBI.length ? (
                <BarsChart
                  data={agingBI.map((a) => ({ label: a.label, value: a.saldo }))}
                  xKey="label"
                  yKey="value"
                  layout="horizontal"
                  color="#00E5FF"
                  valueFormatter={fmtCompact}
                  height={Math.max(280, agingBI.length * 38)}
                />
              ) : (
                <EmptyState message="Sin datos de aging" />
              )}
            </Card>

            <Card className="wv-col-6" title="Estado de cartera" subtitle="Mora vs corriente" accent>
              <Donut
                data={[
                  { name: 'En mora', value: estado?.vencido?.saldo ?? carteraVencida },
                  { name: 'Corriente', value: estado?.corriente?.saldo ?? carteraCorriente },
                ]}
                colors={['#FF453A', '#32D74B']}
                formatter={fmtCompact}
                centerLabel="Saldo total"
              />
            </Card>
          </div>

          {period.length > 0 && (
            <Card title="Evolución mensual de cartera" subtitle="Saldo total y clientes con deuda" accent className="wv-col-12" style={{ marginBottom: 24 }}>
              <AreaTrend
                data={period.map((m) => ({
                  label: m.mes,
                  saldo: m.saldo || 0,
                  clientes: m.clientes || 0,
                }))}
                xKey="label"
                series={[
                  { key: 'saldo', name: 'Saldo ($)', color: '#00E5FF' },
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
              <VendorTable rows={filteredVendors} />
            ) : (
              <CustomerTable rows={filteredCustomers} />
            )}
          </Card>
        </>
      )}
    </>
  );
}

function VendorTable({ rows }) {
  if (!rows.length) return <EmptyState title="Sin resultados" message="No hay registros para los filtros seleccionados" />;
  return (
    <div className="wv-table-wrap">
      <table className="wv-table">
        <thead>
          <tr>
            <th>Vendedor</th>
            <th style={{ textAlign: 'right' }}>Saldo total</th>
            <th style={{ textAlign: 'right' }}>Saldo en mora</th>
            <th style={{ textAlign: 'right' }}>% mora</th>
            <th style={{ textAlign: 'right' }}>Clientes</th>
            <th style={{ textAlign: 'right' }}>Docs</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 80).map((r, i) => {
            const pct = r.pct_vencido ?? 0;
            const tone = pct >= 60 ? 'var(--wv-danger)' : pct >= 30 ? 'var(--wv-warn)' : 'var(--wv-success)';
            return (
              <tr key={r.cod_vendedor || i}>
                <td>{r.vendedor}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{fmtMoney(r.saldo)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-danger)' }}>{fmtMoney(r.saldo_vencido)}</td>
                <td className="mono" style={{ textAlign: 'right', color: tone, fontWeight: 600 }}>{fmtPct(pct)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-text-muted)' }}>{fmtInt(r.total_clientes)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-text-muted)' }}>{fmtInt(r.docs)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CustomerTable({ rows }) {
  if (!rows.length) return <EmptyState title="Sin resultados" message="No hay registros para los filtros seleccionados" />;
  return (
    <div className="wv-table-wrap">
      <table className="wv-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th style={{ textAlign: 'right' }}>Saldo</th>
            <th style={{ textAlign: 'right' }}>Saldo mora</th>
            <th style={{ textAlign: 'right' }}>% mora</th>
            <th style={{ textAlign: 'right' }}>Días</th>
            <th>Riesgo</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 80).map((r, i) => {
            const pct = r.pct_vencido ?? 0;
            const tone = pct >= 60 ? 'var(--wv-danger)' : pct >= 30 ? 'var(--wv-warn)' : 'var(--wv-success)';
            const riesgo = (r.riesgo || '').toLowerCase();
            const riesgoCls = riesgo.includes('alto') ? 'danger' : riesgo.includes('medio') ? 'warn' : 'live';
            return (
              <tr key={r.cod_cliente || i}>
                <td>{r.nombre_cliente}</td>
                <td style={{ color: 'var(--wv-text-muted)' }}>{r.vendedor || '—'}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{fmtMoney(r.saldo)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-danger)' }}>{fmtMoney(r.saldo_vencido)}</td>
                <td className="mono" style={{ textAlign: 'right', color: tone, fontWeight: 600 }}>{fmtPct(pct)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-text-muted)' }}>{fmtInt(r.dias_mora_max)}</td>
                <td>
                  {r.riesgo && <span className={`wv-badge ${riesgoCls}`} style={{ fontSize: 10 }}>{r.riesgo}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
