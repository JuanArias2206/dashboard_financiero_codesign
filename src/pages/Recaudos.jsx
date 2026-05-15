import { useMemo } from 'react';
import { Banknote, FileText, Wallet, TrendingDown, Users, ReceiptText } from 'lucide-react';
import { Card, KpiCard, Loader, ErrorPanel, EmptyState } from '../components/ui';
import { AreaTrend, BarsChart, Donut } from '../components/charts/Charts';
import { useFetch } from '../lib/useFetch';
import { api } from '../lib/api';
import { fmtInt, fmtCompact, fmtMoney } from '../lib/format';

export default function Recaudos() {
  const { data, loading, error, reload } = useFetch(() => api.carteraData(), []);

  const kpis = data?.kpis || {};
  const tipoDoc = data?.tipo_doc_grouped || [];
  const period = data?.period || [];
  const aging = data?.aging_bi || [];
  const topCustomers = useMemo(
    () => (data?.customers || []).slice(0, 15),
    [data]
  );

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
            <KpiCard icon={Banknote} label="Corriente" value={fmtMoney(kpis.cartera_corriente)} tone="success" />
            <KpiCard icon={FileText} label="Documentos" value={fmtInt(kpis.total_documentos || kpis.total_docs)} tone="info" />
            <KpiCard icon={Users} label="Clientes con saldo" value={fmtInt(kpis.total_clientes)} tone="info" />
          </div>

          <div className="wv-grid wv-grid-12" style={{ marginBottom: 24 }}>
            <Card className="wv-col-6" title="Tipos de documento" subtitle="Facturas, Recibos y Notas" accent>
              {tipoDoc.length ? (
                <Donut
                  data={tipoDoc.map((t) => ({ name: t.label, value: t.saldo }))}
                  formatter={fmtCompact}
                  centerLabel="Saldo Bs."
                />
              ) : <EmptyState message="Sin tipos de documento" />}
            </Card>

            <Card className="wv-col-6" title="Distribución por edad de cartera" accent>
              {aging.length ? (
                <BarsChart
                  data={aging.map((a) => ({ label: a.label, value: a.saldo }))}
                  layout="horizontal"
                  color="#FFD60A"
                  valueFormatter={fmtCompact}
                  height={Math.max(280, aging.length * 38)}
                />
              ) : <EmptyState message="Sin datos" />}
            </Card>
          </div>

          {tipoDoc.length > 0 && (
            <Card title="Documentos por tipo" subtitle="Cantidad de documentos" accent style={{ marginBottom: 24 }}>
              <BarsChart
                data={tipoDoc.map((t) => ({ label: t.label, value: t.docs }))}
                color="#00E5FF"
                valueFormatter={fmtInt}
                height={260}
              />
            </Card>
          )}

          {period.length > 0 && (
            <Card title="Evolución mensual de recaudos" subtitle="Saldo total y documentos por mes" accent style={{ marginBottom: 24 }}>
              <AreaTrend
                data={period.map((m) => ({
                  label: m.mes,
                  saldo: m.saldo || 0,
                  documentos: m.docs || 0,
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

          {topCustomers.length > 0 && (
            <Card title="Top clientes con mayor cartera" subtitle="Saldo total pendiente · Top 15" accent>
              <BarsChart
                data={topCustomers.map((c) => ({
                  label: (c.nombre_cliente || '').slice(0, 30),
                  value: c.saldo,
                }))}
                layout="horizontal"
                color="#00E5FF"
                valueFormatter={fmtCompact}
                height={Math.max(280, topCustomers.length * 26)}
              />
            </Card>
          )}
        </>
      )}
    </>
  );
}
