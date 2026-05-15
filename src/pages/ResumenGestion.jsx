import { useState } from 'react';
import {
  Activity, CalendarCheck2, CheckCircle, ListChecks, MapPin, Clock,
  Users, AlertCircle,
} from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, Segmented, EmptyState } from '../components/ui';
import { BarsChart, Donut, MultiLine } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtPct } from '../lib/format';

const PERIODS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'mes-pasado', label: 'Mes pasado' },
];

export default function ResumenGestion() {
  const [period, setPeriod] = useState('mes');
  const { data, loading, error, reload } = useFetch(() => api.rsalesIndicators({ period }), [period]);

  const agendas = data?.agendas || {};
  const clientes = data?.clientes || {};
  const tiempos = data?.tiempos || {};
  const labor = data?.labor || [];
  const gestionesDia = data?.gestiones_dia || [];
  const causales = data?.causales || [];
  const totalApps = data?.total_appointments ?? ((agendas.cumplidas || 0) + (agendas.vencidas || 0) + (agendas.pendientes || 0));
  const tasaCumpl = totalApps > 0 ? (agendas.cumplidas / totalApps) * 100 : 0;
  const periodLabel = data?.period?.label;

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">RSales Analytics</div>
          <h1>Resumen Gestión Comercial</h1>
          {periodLabel && (
            <div style={{ fontSize: 12, color: 'var(--wv-text-muted)', marginTop: 4 }}>{periodLabel}</div>
          )}
        </div>
        <Segmented options={PERIODS} value={period} onChange={setPeriod} />
      </div>

      {loading && <Loader label="Cargando indicadores…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {!loading && data && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={ListChecks} label="Total agendas" value={fmtInt(totalApps)} tone="info" />
            <KpiCard icon={CheckCircle} label="Cumplidas" value={fmtInt(agendas.cumplidas)} tone="success" />
            <KpiCard icon={CalendarCheck2} label="Tasa cumplimiento" value={fmtPct(tasaCumpl)} tone="info" />
            <KpiCard icon={Activity} label="Extraruta" value={fmtInt(agendas.extraruta)} tone="warn" />
            <KpiCard icon={MapPin} label="Clientes gestionados" value={fmtInt(clientes.gestionados)} tone="info" />
            <KpiCard icon={Users} label="Cobertura" value={fmtPct(clientes.pct ?? 0)} tone="info" />
            <KpiCard icon={Clock} label="Hora inicio prom." value={tiempos.inicio || '—'} tone="info" />
            <KpiCard icon={AlertCircle} label="Hora fin prom." value={tiempos.fin || '—'} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-8" title="Gestiones por día" subtitle="Planeadas vs realizadas" accent>
              {gestionesDia.length ? (
                <MultiLine
                  data={gestionesDia.map((d) => ({
                    label: d.label,
                    planeadas: d.planeadas,
                    realizadas: d.realizadas,
                  }))}
                  series={[
                    { key: 'planeadas', name: 'Planeadas', color: '#5AC8FA', dashed: true },
                    { key: 'realizadas', name: 'Realizadas', color: '#00E5FF' },
                  ]}
                  valueFormatter={fmtInt}
                />
              ) : <EmptyState message="Sin datos diarios" />}
            </Card>

            <Card className="wv-col-4" title="Cumplimiento" subtitle="Estado de agendas" accent>
              {totalApps > 0 ? (
                <Donut
                  data={[
                    { name: 'Cumplidas', value: agendas.cumplidas || 0 },
                    { name: 'Vencidas', value: agendas.vencidas || 0 },
                    { name: 'Pendientes', value: agendas.pendientes || 0 },
                  ]}
                  colors={['#32D74B', '#FF453A', '#FFD60A']}
                  formatter={fmtInt}
                  centerLabel="Total"
                />
              ) : <EmptyState message="Sin distribución" />}
            </Card>
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Gestiones por usuario" subtitle="Top 15 vendedores" accent>
              {labor.length ? (
                <BarsChart
                  data={labor.slice(0, 15).map((l) => ({ label: l.nombre, value: l.gestiones }))}
                  layout="horizontal"
                  color="#00E5FF"
                  valueFormatter={fmtInt}
                  height={Math.max(280, labor.slice(0, 15).length * 28)}
                />
              ) : <EmptyState message="Sin gestiones por usuario" />}
            </Card>

            <Card className="wv-col-6" title="Causales de visita" subtitle="% del total" accent>
              {causales.length ? (
                <BarsChart
                  data={causales.map((c) => ({ label: c.cat, value: c.pct }))}
                  layout="horizontal"
                  color="#BF5AF2"
                  valueFormatter={(v) => `${Math.round(v)}%`}
                />
              ) : <EmptyState message="Sin causales" />}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
