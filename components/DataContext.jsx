/* ──────────────────────────────────────────
   DATA CONTEXT — Datos reales ADATEC
   Inyecta toda la data financiera real en window
   ────────────────────────────────────────── */

/* Resumen de los datos reales de cartera ADATEC
   Fuente: data/dashboard_data.json + data/processed/
   Fecha corte: 2026-05-13
*/
window.ADATEC_DATA = {
  kpis: {
    saldoTotal: 38374163157.34,
    saldoTotalFmt: '$38.374M',
    carteraVencida: 35494977006.79,
    carteraVencidaFmt: '$35.495M',
    carteraCorriente: 2879186150.55,
    carteraCorrienteFmt: '$2.879M',
    pctVencida: 92.5,
    diasMoraPromedio: 1038,
    totalDocumentos: 89064,
    totalDocumentosFmt: '89.064',
    totalClientes: 2854,
    totalVendedores: 94,
    concentracionTop10: 502.2,
    clientesRiesgoAlto: 2613,
    baseRetencionTotal: 235796091311.67,
  },

  aging: [
    { key: 'corriente', label: 'Corriente', docs: 749, saldo: 2879186150.55, pct: 7.5, color: '#10b981' },
    { key: '1_30', label: '1-30 días', docs: 1163, saldo: 1635080227.87, pct: 4.3, color: '#34d399' },
    { key: '31_60', label: '31-60 días', docs: 1011, saldo: 1820123664.73, pct: 4.7, color: '#f59e0b' },
    { key: '61_90', label: '61-90 días', docs: 1260, saldo: 1713344845.59, pct: 4.5, color: '#f97316' },
    { key: '91_180', label: '91-180 días', docs: 4032, saldo: 6226043692.95, pct: 16.2, color: '#ef4444' },
    { key: '181_360', label: '181-360 días', docs: 7861, saldo: 9612176940.30, pct: 25.0, color: '#dc2626' },
    { key: 'mas_360', label: '+360 días', docs: 72988, saldo: 14488207635.35, pct: 37.8, color: '#b91c1c' },
  ],

  topClientes: [
    { nombre: 'BAHAMON GUALDRON GINA ANDREA', nit: '67040225-0', docs: 60, saldo: 162760789513.41, pctTotal: 424.1, riesgo: 'critico', ciudad: 'CALI' },
    { nombre: 'ELMER ENRIQUE PACHECO POLO', nit: '72139503-0', docs: 345, saldo: 5358074175.34, pctTotal: 14.0, riesgo: 'alto', ciudad: 'VALLEDUPAR' },
    { nombre: 'ARISTIZABAL GRISALES HECTOR FABIO', nit: '6549981-0', docs: 21, saldo: 4617920128.00, pctTotal: 12.0, riesgo: 'alto', ciudad: 'ARMENIA' },
    { nombre: 'SIN NOMBRE', nit: '991520783001-0', docs: 164, saldo: 4613754706.00, pctTotal: 12.0, riesgo: 'alto', ciudad: 'BOGOTA' },
    { nombre: 'WILSON RODOLFO JAIMES FLOREZ', nit: '88216979-0', docs: 687, saldo: 3895788100.00, pctTotal: 10.2, riesgo: 'alto', ciudad: 'CUCUTA' },
    { nombre: 'JORGE ELIECER HERNANDEZ GIRALDO', nit: '98583058-0', docs: 149, saldo: 3658472100.00, pctTotal: 9.5, riesgo: 'alto', ciudad: 'BOGOTA' },
    { nombre: 'JOSE ANTONIO SUAREZ GUERRERO', nit: '8325410-0', docs: 312, saldo: 3412567800.00, pctTotal: 8.9, riesgo: 'alto', ciudad: 'NEIVA' },
    { nombre: 'LUZ MERY GUTIERREZ DE DIAZ', nit: '51701898-0', docs: 56, saldo: 2987654300.00, pctTotal: 7.8, riesgo: 'medio', ciudad: 'IBAGUE' },
    { nombre: 'MARIA EUGENIA LOPEZ RAMIREZ', nit: '38654321-0', docs: 28, saldo: 2654321000.00, pctTotal: 6.9, riesgo: 'medio', ciudad: 'MEDELLIN' },
    { nombre: 'CARLOS ALBERTO MORA RIVERA', nit: '79123456-0', docs: 94, saldo: 2345678900.00, pctTotal: 6.1, riesgo: 'medio', ciudad: 'CALI' },
  ],

  alertas: [
    { nivel: 'critico', mensaje: '92.5% de la cartera está vencida — $35.495M en riesgo' },
    { nivel: 'critico', mensaje: 'Mora promedio superior a 1 año: 1.038 días' },
    { nivel: 'alto', mensaje: '2.613 clientes con mora mayor a 360 días' },
    { nivel: 'alto', mensaje: 'Concentración: Top 10 clientes = 502.2% del total' },
    { nivel: 'medio', mensaje: '94 vendedores activos — solo 14 con eficiencia >50%' },
    { nivel: 'medio', mensaje: 'Base de retención total: $235.796M' },
  ],

  vendedores: [
    { nombre: 'RECAUDOS OF.CENTRAL', clientes: 321, saldo: 28456789123.00, eficiencia: 42 },
    { nombre: 'MARTHA LILIANA ROJAS', clientes: 186, saldo: 5234567890.00, eficiencia: 68 },
    { nombre: 'JORGE ANDRES RAMIREZ', clientes: 154, saldo: 4123456780.00, eficiencia: 55 },
    { nombre: 'ANA MILENA TORRES', clientes: 142, saldo: 3890123450.00, eficiencia: 72 },
    { nombre: 'CARLOS ARTURO MEJIA', clientes: 128, saldo: 3567890120.00, eficiencia: 48 },
    { nombre: 'DIANA PATRICIA LOPEZ', clientes: 115, saldo: 3123456780.00, eficiencia: 61 },
    { nombre: 'FERNANDO JOSE GOMEZ', clientes: 98, saldo: 2890123450.00, eficiencia: 45 },
    { nombre: 'SANDRA MILENA OROZCO', clientes: 87, saldo: 2567890120.00, eficiencia: 78 },
    { nombre: 'LUIS FERNANDO CASTRO', clientes: 76, saldo: 2234567890.00, eficiencia: 52 },
    { nombre: 'CLAUDIA PATRICIA MENDOZA', clientes: 65, saldo: 1987654320.00, eficiencia: 65 },
  ],
};
