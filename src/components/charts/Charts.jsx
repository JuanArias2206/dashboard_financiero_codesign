import { memo } from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { fmtCompact, fmtMoney } from '../../lib/format';

const ACCENT = '#00E5FF';
const ACCENT_STRONG = '#00B8D4';
const SUCCESS = '#32D74B';
const DANGER = '#FF453A';
const WARN = '#FFD60A';

export const CHART_PALETTE = [
  ACCENT, SUCCESS, WARN, '#BF5AF2', '#FF9F0A',
  '#5AC8FA', '#FF6482', '#A2845E', '#64D2FF', DANGER,
];

const baseGrid = { stroke: '#2C2C2E', strokeDasharray: '3 4', vertical: false };
const axisCfg = { stroke: '#3A3A3C', tick: { fill: '#98989D', fontSize: 11 }, tickLine: false, axisLine: { stroke: '#2C2C2E' } };

function TooltipBox({ active, payload, label, valueFormatter = (v) => v, suffix }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#1E1E1E',
      border: '1px solid #3A3A3C',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 11, color: '#98989D', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey + p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.fill }} />
          <span style={{ color: '#98989D' }}>{p.name}</span>
          <span style={{ marginLeft: 'auto', color: '#fff', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {valueFormatter(p.value)}{suffix || ''}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ────────── Area trend (single or multi-series) ────────── */
export const AreaTrend = memo(function AreaTrend({
  data, xKey = 'label', series = [{ key: 'value', name: 'Valor', color: ACCENT }],
  height = 320, valueFormatter = fmtCompact, suffix,
}) {
  return (
    <div className="chart-box" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 6 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`g-${s.key}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color || ACCENT} stopOpacity={0.45} />
                <stop offset="100%" stopColor={s.color || ACCENT} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid {...baseGrid} />
          <XAxis dataKey={xKey} {...axisCfg} />
          <YAxis tickFormatter={valueFormatter} {...axisCfg} width={56} />
          <Tooltip content={<TooltipBox valueFormatter={valueFormatter} suffix={suffix} />} cursor={{ stroke: '#3A3A3C', strokeDasharray: '3 3' }} />
          {series.length > 1 && (
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 8, fontSize: 12, color: '#98989D' }} />
          )}
          {series.map((s, i) => (
            <Area
              key={s.key}
              dataKey={s.key}
              name={s.name || s.key}
              type="monotone"
              stroke={s.color || ACCENT}
              strokeWidth={2.4}
              fill={`url(#g-${s.key}-${i})`}
              activeDot={{ r: 5, stroke: '#121212', strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

/* ────────── Multi-line ────────── */
export const MultiLine = memo(function MultiLine({
  data, xKey = 'label', series, height = 320, valueFormatter = fmtCompact,
}) {
  return (
    <div className="chart-box" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 6 }}>
          <CartesianGrid {...baseGrid} />
          <XAxis dataKey={xKey} {...axisCfg} />
          <YAxis tickFormatter={valueFormatter} {...axisCfg} width={56} />
          <Tooltip content={<TooltipBox valueFormatter={valueFormatter} />} cursor={{ stroke: '#3A3A3C', strokeDasharray: '3 3' }} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 8, fontSize: 12, color: '#98989D' }} />
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.name}
              type="monotone"
              stroke={s.color || ACCENT}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 5, stroke: '#121212', strokeWidth: 2 }}
              strokeDasharray={s.dashed ? '6 4' : undefined}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

/* ────────── Bars (vertical or horizontal) ────────── */
export const BarsChart = memo(function BarsChart({
  data, xKey = 'label', yKey = 'value', height = 320, color = ACCENT,
  layout = 'vertical', valueFormatter = fmtCompact, stacked = false, series,
}) {
  const horizontal = layout === 'horizontal';
  const xs = series || [{ key: yKey, name: 'Valor', color }];
  return (
    <div className="chart-box" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 12, right: 20, left: horizontal ? 90 : 0, bottom: 6 }}
        >
          <CartesianGrid {...baseGrid} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tickFormatter={valueFormatter} {...axisCfg} />
              <YAxis dataKey={xKey} type="category" {...axisCfg} width={150} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...axisCfg} />
              <YAxis tickFormatter={valueFormatter} {...axisCfg} width={56} />
            </>
          )}
          <Tooltip content={<TooltipBox valueFormatter={valueFormatter} />} cursor={{ fill: 'rgba(0,229,255,0.06)' }} />
          {xs.length > 1 && (
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 8, fontSize: 12, color: '#98989D' }} />
          )}
          {xs.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color || color}
              stackId={stacked ? 'a' : undefined}
              radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
              maxBarSize={28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

/* ────────── Donut chart ────────── */
export const Donut = memo(function Donut({ data, nameKey = 'name', valueKey = 'value', height = 280, colors = CHART_PALETTE, formatter = fmtCompact, centerLabel }) {
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0);
  return (
    <div className="chart-box" style={{ height, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            innerRadius="58%"
            outerRadius="88%"
            paddingAngle={2}
            stroke="#121212"
            strokeWidth={2}
          >
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip content={<TooltipBox valueFormatter={formatter} />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', placeItems: 'center',
        pointerEvents: 'none', textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--wv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {centerLabel || 'Total'}
          </div>
          <div className="wv-mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--wv-text)', marginTop: 2 }}>
            {formatter(total)}
          </div>
        </div>
      </div>
    </div>
  );
});

export { ACCENT, ACCENT_STRONG, SUCCESS, DANGER, WARN };
