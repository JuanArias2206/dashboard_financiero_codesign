import { useMemo, useState } from 'react';
import {
  Activity, CalendarCheck, CalendarX, CheckCircle2, Layers,
  ListChecks, MapPinned, TrendingUp, Users,
} from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, Segmented } from '../components/ui';
import { AreaTrend, BarsChart, Donut } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact } from '../lib/format';

const PERIODS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'mes-pasado', label: 'Mes pasado' },
];

export default function Inicio() {
  const [period, setPeriod] = useState('mes');
  const { data, loading, error, reload } = useFetch(() => api.rsalesIndicators({ period }), [period]);

  const kpis = useMemo(() => {
    if (!data) return null;
    const i = data.indicators || data || {};
    return {
      agendas: i.totalAgendas ?? i.agendas ?? 0,
      cumplidas: i.cumplidas ?? 0,
      canceladas: i.canceladas ?? 0,
      vencidas: i.vencidas ?? 0,
      ventas: i.ventasMonto ?? 0,
      transacciones: i.transacciones ?? 0,
      usuariosActivos: i.usuariosActivos ?? i.usuarios ?? 0,
      visitas: i.visitas ?? 0,
    };
  }, [data]);

  const diaSeries = useMemo(() => {
    const arr = (data && (data.porDia || data.serieDiaria)) || [];
    return arr.map((d) => ({
      label: d.fecha || d.dia || d.label,
      planeadas: d.planeadas ?? d.programadas ?? 0,
      realizadas: d.realizadas ?? d.cumplidas ?? 0,
    }));
  }, [data]);

  const tipoData = useMemo(() => {
    const t = (data && (data.porTipo || data.tipos)) || [];
    return t.map((d) => ({ name: d.tipo || d.label || d.name, value: d.cantidad ?? d.total ?? 0 }));
  }, [data]);

  return (
    <>
      <SectionHead
        title="Indicadores en vivo"
        sub="Resumen ejecutivo del periodo · datos RSales"
        right={<Segmented options={PERIODS} value={period} onChange={setPeriod} />}
      />

      {loading && <Loader label="Sincronizando con RSales…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {kpis && !loading && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={ListChecks} label="Total agendas" value={fmtInt(kpis.agendas)} tone="info" />
            <KpiCard icon={CheckCircle2} label="Cumplidas" value={fmtInt(kpis.cumplidas)} tone="success" />
            <KpiCard icon={CalendarX} label="Vencidas" value={fmtInt(kpis.vencidas)} tone="danger" />
            <KpiCard icon={CalendarCheck} label="Canceladas" value={fmtInt(kpis.canceladas)} tone="warn" />
            <KpiCard icon={TrendingUp} label="Ventas (Bs.)" value={fmtCompact(kpis.ventas)} tone="info" />
            <KpiCard icon={Activity} label="Transacciones" value={fmtInt(kpis.transacciones)} tone="info" />
            <KpiCard icon={Users} label="Usuarios activos" value={fmtInt(kpis.usuariosActivos)} tone="info" />
            <KpiCard icon={MapPinned} label="Visitas registradas" value={fmtInt(kpis.visitas)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12">
            <Card
              className="wv-col-8"
              accent
              title="Gestiones por día"
              subtitle="Planeadas vs realizadas en el período"
            >
              {diaSeries.length ? (
                <AreaTrend
                  data={diaSeries}
                  xKey="label"
                  series={[
                    { key: 'planeadas', name: 'Planeadas', color: '#5AC8FA' },
                    { key: 'realizadas', name: 'Realizadas', color: '#00E5FF' },
                  ]}
                  valueFormatter={fmtInt}
                />
              ) : (
                <PlaceholderChart label="Sin datos de gestiones diarias en el período seleccionado" />
              )}
            </Card>

            <Card className="wv-col-4" title="Distribución por tipo" subtitle="Transacciones del período" accent>
              {tipoData.length ? (
                <Donut data={tipoData} formatter={fmtInt} centerLabel="Transacciones" />
              ) : (
                <PlaceholderChart label="Sin distribución por tipo disponible" />
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}

function SectionHead({ title, sub, right }) {
  return (
    <div className="section-head">
      <div>
        <div className="crumb">Resumen ejecutivo</div>
        <h1>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: 'var(--wv-text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function PlaceholderChart({ label }) {
  return (
    <div style={{
      height: 240,
      display: 'grid',
      placeItems: 'center',
      color: 'var(--wv-text-muted)',
      fontSize: 13,
      border: '1px dashed var(--wv-border)',
      borderRadius: 12,
    }}>
      {label}
    </div>
  );
}
