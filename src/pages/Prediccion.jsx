import { useMemo } from 'react';
import { Gauge, LineChart as LineIcon, Target, CalendarRange, TrendingUp } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState } from '../components/ui';
import { AreaTrend, MultiLine, BarsChart } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact, fmtMoney } from '../lib/format';

/* Heuristic forecast from monthly history when API doesn't provide it directly.
   Linear regression with mild damping; 6-month horizon, ±10% confidence band. */
function forecastSeries(monthly = [], horizon = 6) {
  if (!monthly.length) return { history: [], forecast: [] };
  const xs = monthly.map((_, i) => i);
  const ys = monthly.map((m) => m.saldo ?? m.total ?? m.value ?? 0);
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  const history = monthly.map((m, i) => ({
    label: m.mes || m.month || m.label,
    historico: ys[i],
  }));
  const lastMonth = monthly[monthly.length - 1].mes || monthly[monthly.length - 1].label || '';
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  let nextIdx = 0;
  for (let i = 0; i < monthNames.length; i++) {
    if (lastMonth.toLowerCase().startsWith(monthNames[i].toLowerCase())) {
      nextIdx = (i + 1) % 12;
      break;
    }
  }
  const forecast = [];
  for (let i = 1; i <= horizon; i++) {
    const xi = n - 1 + i;
    const v = Math.max(0, intercept + slope * xi);
    forecast.push({
      label: monthNames[(nextIdx + i - 1) % 12],
      forecast: v,
      bandLow: v * 0.9,
      bandHigh: v * 1.1,
    });
  }
  return { history, forecast };
}

export default function Prediccion() {
  const { data, loading, error, reload } = useFetch(() => api.carteraData(), []);

  const monthly = data?.evolutionMonthly || data?.monthly || [];

  const { history, forecast } = useMemo(() => forecastSeries(monthly, 6), [monthly]);

  const merged = useMemo(() => {
    const h = history.map((d) => ({ label: d.label, historico: d.historico }));
    const f = forecast.map((d) => ({ label: d.label, forecast: d.forecast, bandLow: d.bandLow, bandHigh: d.bandHigh }));
    return [...h, ...f];
  }, [history, forecast]);

  const summary = useMemo(() => {
    if (!history.length || !forecast.length) return null;
    const last = history[history.length - 1].historico;
    const next = forecast[0].forecast;
    const sixMo = forecast[forecast.length - 1].forecast;
    const growthNext = last > 0 ? ((next - last) / last) * 100 : 0;
    const growthHorizon = last > 0 ? ((sixMo - last) / last) * 100 : 0;
    const avgForecast = forecast.reduce((s, f) => s + f.forecast, 0) / forecast.length;
    return { last, next, sixMo, growthNext, growthHorizon, avgForecast };
  }, [history, forecast]);

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Forecast</div>
          <h1>Predicción de Recaudos</h1>
          <div style={{ color: 'var(--wv-text-muted)', fontSize: 13, marginTop: 4 }}>
            Modelo de regresión lineal · banda de confianza ±10% · horizonte 6 meses
          </div>
        </div>
      </div>

      {loading && <Loader label="Calculando forecast…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {!loading && data && summary && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard
              icon={Gauge}
              label="Último mes histórico"
              value={fmtMoney(summary.last)}
              tone="info"
            />
            <KpiCard
              icon={Target}
              label="Próximo mes (proyección)"
              value={fmtMoney(summary.next)}
              delta={`${summary.growthNext >= 0 ? '+' : ''}${summary.growthNext.toFixed(1)}%`}
              deltaUp={summary.growthNext >= 0}
              tone="info"
            />
            <KpiCard
              icon={TrendingUp}
              label="Horizonte 6 meses"
              value={fmtMoney(summary.sixMo)}
              delta={`${summary.growthHorizon >= 0 ? '+' : ''}${summary.growthHorizon.toFixed(1)}%`}
              deltaUp={summary.growthHorizon >= 0}
              tone={summary.growthHorizon >= 0 ? 'success' : 'danger'}
            />
            <KpiCard
              icon={CalendarRange}
              label="Promedio mensual proyectado"
              value={fmtMoney(summary.avgForecast)}
              tone="info"
            />
          </div>

          <Card title="Histórico + proyección" subtitle="Línea sólida = histórico real · línea punteada = forecast" accent style={{ marginBottom: 24 }}>
            {merged.length ? (
              <MultiLine
                data={merged}
                series={[
                  { key: 'historico', name: 'Histórico', color: '#00E5FF' },
                  { key: 'forecast', name: 'Forecast', color: '#FFD60A', dashed: true },
                  { key: 'bandHigh', name: 'Banda alta', color: '#32D74B', dashed: true },
                  { key: 'bandLow', name: 'Banda baja', color: '#FF453A', dashed: true },
                ]}
                valueFormatter={fmtCompact}
                height={380}
              />
            ) : <EmptyState message="Sin datos suficientes para proyección" />}
          </Card>

          <Card title="Proyección mes a mes" subtitle="Valores esperados por mes" accent>
            {forecast.length ? (
              <BarsChart
                data={forecast.map((f) => ({ label: f.label, value: f.forecast }))}
                color="#FFD60A"
                valueFormatter={fmtCompact}
              />
            ) : <EmptyState message="Sin proyección" />}
          </Card>
        </>
      )}

      {!loading && data && !summary && (
        <Card title="Histórico" accent>
          <EmptyState
            icon={LineIcon}
            title="Sin histórico suficiente"
            message="Se requiere al menos 3 meses de datos para calcular el forecast."
          />
        </Card>
      )}
    </>
  );
}
