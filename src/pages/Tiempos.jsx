import { Clock, UserCheck, Route, Calendar, Activity } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState } from '../components/ui';
import { BarsChart, MultiLine } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtPct } from '../lib/format';

export default function Tiempos() {
  const { data, loading, error, reload } = useFetch(() => api.tiempos(), []);

  const kpis = data?.kpis || {};
  const supervisores = data?.porSupervisor || data?.supervisores || [];
  const porDia = data?.porDia || [];
  const usuarios = data?.usuarios || [];

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Inventario y Ventas</div>
          <h1>Control de Tiempos</h1>
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
            <KpiCard icon={Clock} label="Tasa cumplimiento" value={fmtPct(kpis.tasaCumplimiento ?? 0)} tone="info" />
            <KpiCard icon={Activity} label="Usuarios activos" value={fmtInt(kpis.usuariosActivos)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Gestiones por supervisor" accent>
              {supervisores.length ? (
                <BarsChart
                  data={supervisores.map((s) => ({
                    label: s.supervisor || s.nombre,
                    programadas: s.programadas ?? 0,
                    cumplidas: s.cumplidas ?? 0,
                    extraruta: s.extraruta ?? 0,
                  }))}
                  series={[
                    { key: 'programadas', name: 'Programadas', color: '#5AC8FA' },
                    { key: 'cumplidas', name: 'Cumplidas', color: '#32D74B' },
                    { key: 'extraruta', name: 'Extraruta', color: '#FFD60A' },
                  ]}
                  layout="horizontal"
                  valueFormatter={fmtInt}
                  height={Math.max(300, supervisores.length * 32)}
                />
              ) : <EmptyState message="Sin datos por supervisor" />}
            </Card>

            <Card className="wv-col-6" title="Comportamiento agenda por día" accent>
              {porDia.length ? (
                <MultiLine
                  data={porDia.map((d) => ({
                    label: d.fecha || d.label,
                    programadas: d.programadas ?? 0,
                    cumplidas: d.cumplidas ?? 0,
                    extraruta: d.extraruta ?? 0,
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
                      <th style={{ textAlign: 'right' }}>Programadas</th>
                      <th style={{ textAlign: 'right' }}>Cumplidas</th>
                      <th style={{ textAlign: 'right' }}>% Cumpl.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.slice(0, 60).map((u, i) => {
                      const pct = u.programadas > 0 ? (u.cumplidas / u.programadas) * 100 : 0;
                      const tone = pct >= 80 ? 'var(--wv-success)' : pct >= 50 ? 'var(--wv-warn)' : 'var(--wv-danger)';
                      return (
                        <tr key={u.id || i}>
                          <td>{u.nombre || u.usuario}</td>
                          <td style={{ color: 'var(--wv-text-muted)' }}>{u.supervisor || '—'}</td>
                          <td className="mono" style={{ textAlign: 'right' }}>{fmtInt(u.programadas)}</td>
                          <td className="mono" style={{ textAlign: 'right' }}>{fmtInt(u.cumplidas)}</td>
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
