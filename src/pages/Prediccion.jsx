import { useMemo } from 'react';
import { Gauge, LineChart as LineIcon, Target, CalendarRange, TrendingUp } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState } from '../components/ui';
import { MultiLine, BarsChart } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtCompact, fmtMoney } from '../lib/format';

const MONTH_LABEL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function parseMonthLabel(label) {
  // label is YYYY-MM or "Ene 24" etc; extract month index if possible
  if (!label) return null;
  const ym = /^(\d{4})-(\d{2})$/.exec(label);
  if (ym) return { year: +ym[1], month: +ym[2] - 1 };
  for (let i = 0; i < MONTH_LABEL.length; i++) {
    if (label.toLowerCase().startsWith(MONTH_LABEL[i].toLowerCase())) return { year: null, month: i };
  }
  return null;
}

function nextLabel(prevParsed, offset) {
  if (!prevParsed) return `+${offset}m`;
  const idx = (prevParsed.month + offset) % 12;
  const yearShift = Math.floor((prevParsed.month + offset) / 12);
  if (prevParsed.year != null) {
    const y = prevParsed.year + yearShift;
    return `${y}-${String(idx + 1).padStart(2, '0')}`;
  }
  return MONTH_LABEL[idx];
}

function forecastSeries(monthly, horizon = 6) {
  if (!monthly.length) return { history: [], forecast: [] };
  const xs = monthly.map((_, i) => i);
  const ys = monthly.map((m) => m.saldo || 0);
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
  const history = monthly.map((m, i) => ({ label: m.mes, historico: ys[i] }));
  const lastParsed = parseMonthLabel(monthly[monthly.length - 1].mes);
  const forecast = [];
  for (let i = 1; i <= horizon; i++) {
    const xi = n - 1 + i;
    const v = Math.max(0, intercept + slope * xi);
    forecast.push({
      label: nextLabel(lastParsed, i),
      forecast: v,
      bandLow: v * 0.9,
      bandHigh: v * 1.1,
    });
  }
  return { history, forecast };
}

export default function Prediccion() {
  const { data, loading, error, reload } = useFetch(() => api.carteraData(), []);

  const period = data?.period || [];

  const { history, forecast } = useMemo(() => forecastSeries(period, 6), [period]);

  const merged = useMemo(() => {
    // Build merged set: history has historico key, forecast appends with forecast/band
    const h = history.map((d) => ({ label: d.label, historico: d.historico }));
    // bridge: last historic value also as starting point for forecast line
    const lastHist = history[history.length - 1];
    const f = forecast.map((d, i) => ({
      label: d.label,
      forecast: d.forecast,
      bandLow: d.bandLow,
      bandHigh: d.bandHigh,
    }));
    if (lastHist && f.length) {
      f.unshift({ label: lastHist.label, forecast: lastHist.historico, bandLow: lastHist.historico, bandHigh: lastHist.historico });
    }
    // merge by label
    const map = new Map();
    h.forEach((d) => map.set(d.label, { ...d }));
    f.forEach((d) => {
      const existing = map.get(d.label) || { label: d.label };
      map.set(d.label, { ...existing, ...d });
    });
    return Array.from(map.values());
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
            Regresión lineal · banda de confianza ±10% · horizonte 6 meses
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
            ) : <EmptyState message="Sin datos suficientes" />}
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
