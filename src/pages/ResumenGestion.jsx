import { useMemo, useState } from 'react';
import {
  Activity, BarChart3, CalendarCheck2, CheckCircle, ListChecks, MapPin, TrendingUp,
} from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, Segmented, EmptyState } from '../components/ui';
import { AreaTrend, BarsChart, Donut, MultiLine } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact, fmtPct } from '../lib/format';

const PERIODS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'mes-pasado', label: 'Mes pasado' },
];

export default function ResumenGestion() {
  const [period, setPeriod] = useState('mes');
  const { data, loading, error, reload } = useFetch(() => api.rsalesIndicators({ period }), [period]);

  const ind = (data && (data.indicators || data)) || {};
  const porDia = data?.porDia || data?.serieDiaria || [];
  const acumulado = data?.acumulado || [];
  const cumplimiento = data?.cumplimiento || data?.estadoAgendas || [];
  const etapas = data?.etapas || data?.porEtapa || [];
  const causales = data?.causales || [];

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">RSales Analytics</div>
          <h1>Resumen Gestión Comercial</h1>
        </div>
        <Segmented options={PERIODS} value={period} onChange={setPeriod} />
      </div>

      {loading && <Loader label="Cargando indicadores…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {!loading && data && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={ListChecks} label="Total agendas" value={fmtInt(ind.totalAgendas || ind.agendas)} tone="info" />
            <KpiCard icon={CheckCircle} label="Cumplidas" value={fmtInt(ind.cumplidas)} tone="success" />
            <KpiCard icon={CalendarCheck2} label="Tasa de cumplimiento" value={fmtPct(ind.tasaCumplimiento ?? 0)} tone="info" />
            <KpiCard icon={MapPin} label="Visitas" value={fmtInt(ind.visitas)} tone="info" />
            <KpiCard icon={TrendingUp} label="Ventas" value={fmtCompact(ind.ventasMonto)} tone="success" foot="Bs." />
            <KpiCard icon={Activity} label="Transacciones" value={fmtInt(ind.transacciones)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-8" title="Gestiones por día" subtitle="Planeadas vs realizadas" accent>
              {porDia.length ? (
                <MultiLine
                  data={porDia.map((d) => ({
                    label: d.fecha || d.label,
                    planeadas: d.planeadas ?? d.programadas ?? 0,
                    realizadas: d.realizadas ?? d.cumplidas ?? 0,
                  }))}
                  series={[
                    { key: 'planeadas', name: 'Planeadas', color: '#5AC8FA', dashed: true },
                    { key: 'realizadas', name: 'Realizadas', color: '#00E5FF' },
                  ]}
                />
              ) : <EmptyState message="Sin datos diarios" />}
            </Card>

            <Card className="wv-col-4" title="Cumplimiento" subtitle="Estado de agendas" accent>
              {cumplimiento.length ? (
                <Donut
                  data={cumplimiento.map((c) => ({ name: c.estado || c.label, value: c.cantidad ?? c.value }))}
                  colors={['#32D74B', '#FF453A', '#FFD60A', '#5AC8FA']}
                  formatter={fmtInt}
                />
              ) : <EmptyState message="Sin distribución" />}
            </Card>
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Agendas por etapa" subtitle="Fuente: RSales" accent>
              {etapas.length ? (
                <BarsChart
                  data={etapas.map((e) => ({ label: e.etapa || e.label, value: e.cantidad ?? e.value }))}
                  layout="horizontal"
                  color="#00E5FF"
                  valueFormatter={fmtInt}
                />
              ) : <EmptyState message="Sin etapas" />}
            </Card>

            <Card className="wv-col-6" title="Causales de visita" subtitle="% del total" accent>
              {causales.length ? (
                <BarsChart
                  data={causales.map((c) => ({ label: c.causal || c.label, value: c.porcentaje ?? c.value }))}
                  layout="horizontal"
                  color="#BF5AF2"
                  valueFormatter={(v) => `${Math.round(v)}%`}
                />
              ) : <EmptyState message="Sin causales" />}
            </Card>
          </div>

          {acumulado.length > 0 && (
            <Card title="Gestiones acumuladas" subtitle="Evolución acumulada del período" accent>
              <AreaTrend
                data={acumulado.map((a) => ({
                  label: a.fecha || a.label,
                  acumulado: a.acumulado ?? a.total ?? 0,
                }))}
                xKey="label"
                series={[{ key: 'acumulado', name: 'Acumulado', color: '#00E5FF' }]}
                valueFormatter={fmtInt}
                height={300}
              />
            </Card>
          )}
        </>
      )}
    </>
  );
}
