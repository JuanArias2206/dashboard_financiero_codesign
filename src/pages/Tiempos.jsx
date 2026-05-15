import { useState } from 'react';
import { Clock, UserCheck, Route, Calendar, Activity, Users } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState, Segmented } from '../components/ui';
import { BarsChart, MultiLine } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtPct } from '../lib/format';

const now = new Date();
const YEARS = [now.getFullYear(), now.getFullYear() - 1].map((y) => ({ value: String(y), label: String(y) }));
const MONTHS = [
  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
  { value: '0', label: 'Todo el año' },
];

export default function Tiempos() {
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const { data, loading, error, reload } = useFetch(() => api.tiempos({ year, month }), [year, month]);

  const kpis = data?.kpis || {};
  const supervisores = data?.supervisores || [];
  const porDia = data?.por_dia || [];
  const usuarios = data?.usuarios || [];

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Inventario y Ventas</div>
          <h1>Control de Tiempos</h1>
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

      {loading && <Loader label="Cargando tiempos…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={Calendar} label="Programadas" value={fmtInt(kpis.programadas)} tone="info" />
            <KpiCard icon={UserCheck} label="Cumplidas" value={fmtInt(kpis.cumplidas)} tone="success" />
            <KpiCard icon={Route} label="Extraruta" value={fmtInt(kpis.extraruta)} tone="warn" />
            <KpiCard icon={Clock} label="Tasa cumplimiento" value={fmtPct(kpis.pct_cumplimiento ?? 0)} tone="info" />
            <KpiCard icon={Users} label="Usuarios activos" value={fmtInt(kpis.usuarios)} tone="info" />
            <KpiCard icon={Activity} label="Clientes gestionados" value={fmtInt(kpis.clientes_gestionados)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Gestiones por supervisor" subtitle="Programadas, cumplidas y extraruta" accent>
              {supervisores.length ? (
                <BarsChart
                  data={supervisores.map((s) => ({
                    label: s.supervisor.slice(0, 22),
                    programadas: s.programadas,
                    cumplidas: s.cumplidas,
                    extraruta: s.extraruta,
                  }))}
                  series={[
                    { key: 'programadas', name: 'Programadas', color: '#5AC8FA' },
                    { key: 'cumplidas', name: 'Cumplidas', color: '#32D74B' },
                    { key: 'extraruta', name: 'Extraruta', color: '#FFD60A' },
                  ]}
                  layout="horizontal"
                  valueFormatter={fmtInt}
                  height={Math.max(300, supervisores.length * 38)}
                />
              ) : <EmptyState message="Sin datos por supervisor" />}
            </Card>

            <Card className="wv-col-6" title="Comportamiento agenda por día" accent>
              {porDia.length ? (
                <MultiLine
                  data={porDia.map((d) => ({
                    label: d.fecha.slice(5),
                    programadas: d.programadas,
                    cumplidas: d.cumplidas,
                    extraruta: d.extraruta,
                  }))}
                  series={[
                    { key: 'programadas', name: 'Programadas', color: '#5AC8FA', dashed: true },
                    { key: 'cumplidas', name: 'Cumplidas', color: '#32D74B' },
                    { key: 'extraruta', name: 'Extraruta', color: '#FFD60A' },
                  ]}
                  valueFormatter={fmtInt}
                />
              ) : <EmptyState message="Sin datos diarios" />}
            </Card>
          </div>

          {usuarios.length > 0 && (
            <Card title="Análisis por usuarios" subtitle={`${usuarios.length} usuarios en el período`} accent>
              <div className="wv-table-wrap">
                <table className="wv-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Supervisor</th>
                      <th>Horario</th>
                      <th style={{ textAlign: 'right' }}>Programadas</th>
                      <th style={{ textAlign: 'right' }}>Cumplidas</th>
                      <th style={{ textAlign: 'right' }}>Clientes</th>
                      <th style={{ textAlign: 'right' }}>% Cumpl.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.slice(0, 80).map((u, i) => {
                      const pct = u.pct_cumplimiento ?? 0;
                      const tone = pct >= 80 ? 'var(--wv-success)' : pct >= 50 ? 'var(--wv-warn)' : 'var(--wv-danger)';
                      return (
                        <tr key={u.seller_id || i}>
                          <td>{u.nombre}</td>
                          <td style={{ color: 'var(--wv-text-muted)' }}>{u.supervisor || '—'}</td>
                          <td className="mono" style={{ color: 'var(--wv-text-muted)', fontSize: 12 }}>
                            {u.hora_inicio} → {u.hora_fin}
                          </td>
                          <td className="mono" style={{ textAlign: 'right' }}>{fmtInt(u.programadas)}</td>
                          <td className="mono" style={{ textAlign: 'right' }}>{fmtInt(u.cumplidas)}</td>
                          <td className="mono" style={{ textAlign: 'right', color: 'var(--wv-text-muted)' }}>{fmtInt(u.clientes)}</td>
                          <td className="mono" style={{ textAlign: 'right', color: tone, fontWeight: 600 }}>{fmtPct(pct)}</td>
                        </tr>
                      );
                    })}
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
