import { useMemo, useState } from 'react';
import {
  CalendarCheck, CalendarX, CheckCircle2, ListChecks, MapPinned,
  Users, AlertCircle, Activity,
} from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, Segmented } from '../components/ui';
import { AreaTrend, BarsChart, Donut } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtPct } from '../lib/format';

const PERIODS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'mes-pasado', label: 'Mes pasado' },
];

export default function Inicio() {
  const [period, setPeriod] = useState('mes');
  const { data, loading, error, reload } = useFetch(() => api.rsalesIndicators({ period }), [period]);

  const agendas = data?.agendas || {};
  const clientes = data?.clientes || {};
  const gestionesDia = data?.gestiones_dia || [];
  const causales = data?.causales || [];
  const labor = data?.labor || [];

  const totalAgendas = (agendas.cumplidas || 0) + (agendas.vencidas || 0) + (agendas.pendientes || 0);
  const periodLabel = data?.period?.label;

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Resumen ejecutivo</div>
          <h1>Indicadores en vivo</h1>
          <div style={{ fontSize: 13, color: 'var(--wv-text-muted)', marginTop: 4 }}>
            {periodLabel ? `Período: ${periodLabel}` : 'Resumen ejecutivo del período · datos RSales'}
          </div>
        </div>
        <Segmented options={PERIODS} value={period} onChange={setPeriod} />
      </div>

      {loading && <Loader label="Sincronizando con RSales…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={ListChecks} label="Total agendas" value={fmtInt(totalAgendas)} tone="info" />
            <KpiCard icon={CheckCircle2} label="Cumplidas" value={fmtInt(agendas.cumplidas)} tone="success" />
            <KpiCard icon={CalendarX} label="Vencidas" value={fmtInt(agendas.vencidas)} tone="danger" />
            <KpiCard icon={CalendarCheck} label="Pendientes" value={fmtInt(agendas.pendientes)} tone="warn" />
            <KpiCard icon={Activity} label="Extraruta" value={fmtInt(agendas.extraruta)} tone="info" />
            <KpiCard icon={Users} label="Clientes gestionados" value={fmtInt(clientes.gestionados)} tone="info" foot={`${fmtInt(clientes.activos)} activos`} />
            <KpiCard icon={MapPinned} label="Cobertura" value={fmtPct(clientes.pct ?? 0)} tone="info" />
            <KpiCard icon={AlertCircle} label="Sin gestión" value={fmtInt(clientes.sin_gestion)} tone="warn" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-8" accent title="Gestiones por día" subtitle="Planeadas vs realizadas">
              {gestionesDia.length ? (
                <AreaTrend
                  data={gestionesDia}
                  xKey="label"
                  series={[
                    { key: 'planeadas', name: 'Planeadas', color: '#5AC8FA' },
                    { key: 'realizadas', name: 'Realizadas', color: '#00E5FF' },
                  ]}
                  valueFormatter={fmtInt}
                />
              ) : (
                <Empty label="Sin datos de gestiones diarias en el período" />
              )}
            </Card>

            <Card className="wv-col-4" title="Causales de visita" subtitle="% del total" accent>
              {causales.length ? (
                <Donut
                  data={causales.map((c) => ({ name: c.cat, value: c.count }))}
                  formatter={fmtInt}
                  centerLabel="Visitas"
                />
              ) : (
                <Empty label="Sin causales registradas" />
              )}
            </Card>
          </div>

          {labor.length > 0 && (
            <Card title="Gestiones por usuario" subtitle={`Top ${Math.min(labor.length, 20)} vendedores activos`} accent>
              <BarsChart
                data={labor.slice(0, 20).map((l) => ({ label: l.nombre, value: l.gestiones }))}
                xKey="label"
                yKey="value"
                layout="horizontal"
                color="#00E5FF"
                valueFormatter={fmtInt}
                height={Math.max(280, labor.slice(0, 20).length * 28)}
              />
            </Card>
          )}
        </>
      )}
    </>
  );
}

function Empty({ label }) {
  return (
    <div style={{
      height: 240, display: 'grid', placeItems: 'center',
      color: 'var(--wv-text-muted)', fontSize: 13,
      border: '1px dashed var(--wv-border)', borderRadius: 12,
    }}>
      {label}
    </div>
  );
}
