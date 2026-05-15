import { useMemo } from 'react';
import { Banknote, FileText, Wallet, TrendingDown, Users, ReceiptText } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState } from '../components/ui';
import { AreaTrend, BarsChart, Donut } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact, fmtMoney, fmtPct } from '../lib/format';

export default function Recaudos() {
  const { data, loading, error, reload } = useFetch(() => api.carteraData(), []);

  const kpis = data?.kpis || {};
  const docTypes = data?.documentTypes || data?.tiposDocumento || [];
  const monthlyDocs = data?.monthlyDocs || data?.evolutionMonthly || [];
  const topClients = useMemo(() => (data?.clientes || []).slice(0, 15), [data]);
  const aging = data?.aging || [];

  return (
    <>
      <div className="section-head">
        <div>
          <div className="crumb">Cartera</div>
          <h1>Reporte de Recaudos</h1>
        </div>
      </div>

      {loading && <Loader label="Cargando recaudos…" />}
      {error && <ErrorPanel message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="wv-grid wv-grid-kpis" style={{ marginBottom: 24 }}>
            <KpiCard icon={Wallet} label="Cartera total" value={fmtMoney(kpis.saldo_total)} tone="info" />
            <KpiCard icon={TrendingDown} label="En mora" value={fmtMoney(kpis.cartera_vencida)} tone="danger" />
            <KpiCard icon={Banknote} label="Corriente" value={fmtMoney(kpis.cartera_por_vencer)} tone="success" />
            <KpiCard icon={FileText} label="Documentos" value={fmtInt(kpis.total_documentos)} tone="info" />
            <KpiCard icon={Users} label="Clientes con saldo" value={fmtInt(kpis.total_clientes)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Tipos de documento" subtitle="Facturas, Recibos y Notas" accent>
              {docTypes.length ? (
                <Donut
                  data={docTypes.map((t) => ({ name: t.tipo || t.label, value: t.cantidad ?? t.value }))}
                  formatter={fmtInt}
                />
              ) : <EmptyState message="Sin tipos de documento" />}
            </Card>

            <Card className="wv-col-6" title="Distribución por edad de cartera" accent>
              {aging.length ? (
                <BarsChart
                  data={aging.map((a) => ({ label: a.rango, value: a.saldo }))}
                  layout="horizontal"
                  color="#FFD60A"
                  valueFormatter={fmtCompact}
                />
              ) : <EmptyState message="Sin datos" />}
            </Card>
          </div>

          {monthlyDocs.length > 0 && (
            <Card title="Evolución mensual de recaudos" subtitle="Historial de documentos por mes" accent style={{ marginBottom: 24 }}>
              <AreaTrend
                data={monthlyDocs.map((m) => ({
                  label: m.mes || m.month || m.label,
                  saldo: m.saldo ?? m.total ?? 0,
                  documentos: m.documentos ?? m.docs ?? 0,
                }))}
                series={[
                  { key: 'saldo', name: 'Saldo Bs.', color: '#00E5FF' },
                  { key: 'documentos', name: 'Documentos', color: '#BF5AF2' },
                ]}
                valueFormatter={fmtCompact}
                height={340}
              />
            </Card>
          )}

          {topClients.length > 0 && (
            <Card title="Top clientes con mayor cartera" subtitle="Saldo total pendiente · Top 15" accent>
              <BarsChart
                data={topClients.map((c) => ({ label: (c.nombre || c.cliente || '').slice(0, 30), value: c.saldo ?? c.saldo_total ?? 0 }))}
                layout="horizontal"
                color="#00E5FF"
                valueFormatter={fmtCompact}
                height={Math.max(280, topClients.length * 26)}
              />
            </Card>
          )}
        </>
      )}
    </>
  );
}
