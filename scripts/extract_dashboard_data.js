const mssql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: 'NPROSERVER',
  user: 'adatec_read',
  password: 'PasswordSeguro123!',
  database: 'ADATEC',
  options: { trustServerCertificate: true, encrypt: false }
};

const dataDir = path.join(__dirname, '..', 'data');

async function extractAll() {
  let pool;
  try {
    pool = await mssql.connect(config);
    const req = () => pool.request();

    // 1. KPIs principales
    console.log('Extracting KPIs...');
    const kpis = await req().query(`
      SELECT 
        COUNT(*) as total_documentos,
        SUM(SALDO) as saldo_total,
        AVG(SALDO) as saldo_promedio,
        SUM(SALDO_BASE) as saldo_base_total,
        SUM(CASE WHEN FECHA_VENCIMIENTO < GETDATE() THEN SALDO ELSE 0 END) as cartera_vencida,
        SUM(CASE WHEN FECHA_VENCIMIENTO >= GETDATE() THEN SALDO ELSE 0 END) as cartera_por_vencer,
        COUNT(DISTINCT CLIENTE_CODIGO) as total_clientes,
        COUNT(DISTINCT VENDEDOR_CODIGO) as total_vendedores,
        AVG(CAST(CASE WHEN FECHA_VENCIMIENTO < GETDATE() THEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) ELSE 0 END as float)) as dias_mora_promedio,
        SUM(BASE_RETENCION) as base_retencion_total
      FROM CARTERA
    `);

    // 2. Aging detallado
    console.log('Extracting aging...');
    const aging = await req().query(`
      SELECT 
        CASE 
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 0 THEN 'Corriente'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 30 THEN '1-30 dias'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 60 THEN '31-60 dias'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 90 THEN '61-90 dias'
          ELSE '+90 dias'
        END as rango,
        COUNT(*) as documentos,
        SUM(SALDO) as saldo,
        SUM(SALDO_BASE) as saldo_base
      FROM CARTERA
      WHERE FECHA_VENCIMIENTO IS NOT NULL
      GROUP BY 
        CASE 
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 0 THEN 'Corriente'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 30 THEN '1-30 dias'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 60 THEN '31-60 dias'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 90 THEN '61-90 dias'
          ELSE '+90 dias'
        END
      ORDER BY MIN(DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()))
    `);

    // 3. Facturacion mensual (historico)
    console.log('Extracting facturacion mensual...');
    const facturacionMensual = await req().query(`
      SELECT 
        CAST(CAST(YEAR(FECHA_DOCUMENTO) as varchar) + '-' + RIGHT('0' + CAST(MONTH(FECHA_DOCUMENTO) as varchar), 2) + '-01' as date) as mes,
        COUNT(*) as documentos,
        SUM(SALDO) as saldo,
        SUM(SALDO_BASE) as facturado
      FROM CARTERA
      WHERE FECHA_DOCUMENTO IS NOT NULL
      GROUP BY YEAR(FECHA_DOCUMENTO), MONTH(FECHA_DOCUMENTO)
      ORDER BY mes
    `);

    // 4. Recaudos mensuales
    console.log('Extracting recaudos mensuales...');
    const recaudosMensual = await req().query(`
      SELECT 
        CAST(CAST(YEAR(pm.FECHA_PAGO) as varchar) + '-' + RIGHT('0' + CAST(MONTH(pm.FECHA_PAGO) as varchar), 2) + '-01' as date) as mes,
        COUNT(DISTINCT pi.PAGO_CODIGO) as recibos,
        SUM(pi.VALOR_ABONO) as recaudado
      FROM PAGO_ITEM pi
      JOIN PAGO_MAST pm ON pi.PAGO_CODIGO = pm.PAGO_CODIGO AND pi.EMPRESA_CODIGO = pm.EMPRESA_CODIGO
      WHERE pm.FECHA_PAGO IS NOT NULL
      GROUP BY YEAR(pm.FECHA_PAGO), MONTH(pm.FECHA_PAGO)
      ORDER BY mes
    `);

    // 5. Pedidos mensuales
    console.log('Extracting pedidos mensual...');
    const pedidosMensual = await req().query(`
      SELECT 
        CAST(CAST(YEAR(pm.FECHA_ENTREGA) as varchar) + '-' + RIGHT('0' + CAST(MONTH(pm.FECHA_ENTREGA) as varchar), 2) + '-01' as date) as mes,
        COUNT(DISTINCT pm.PEDIDO_CODIGO) as pedidos,
        SUM(pi.TOTAL) as valor_ventas
      FROM PEDIDO_MAST pm
      JOIN PEDIDO_ITEM pi ON pm.PEDIDO_CODIGO = pi.PEDIDO_CODIGO AND pm.EMPRESA_CODIGO = pi.EMPRESA_CODIGO
      WHERE pm.FECHA_ENTREGA IS NOT NULL
      GROUP BY YEAR(pm.FECHA_ENTREGA), MONTH(pm.FECHA_ENTREGA)
      ORDER BY mes
    `);

    // 6. Top clientes
    console.log('Extracting top clientes...');
    const topClientes = await req().query(`
      SELECT TOP 20
        c.CLIENTE_CODIGO as codigo,
        ISNULL(cl.CLIENTE_NOMBRE, 'Sin nombre') as nombre,
        ISNULL(cl.NIT, '') as nit,
        ISNULL(cl.CLIENTE_CIUDAD, '') as ciudad,
        COUNT(*) as documentos,
        SUM(c.SALDO) as saldo,
        SUM(CASE WHEN c.FECHA_VENCIMIENTO < GETDATE() THEN c.SALDO ELSE 0 END) as saldo_vencido,
        SUM(c.SALDO_BASE) as saldo_base
      FROM CARTERA c
      LEFT JOIN CLIENTES cl ON c.CLIENTE_CODIGO = cl.CLIENTE_CODIGO AND c.EMPRESA_CODIGO = cl.EMPRESA_CODIGO
      GROUP BY c.CLIENTE_CODIGO, cl.CLIENTE_NOMBRE, cl.NIT, cl.CLIENTE_CIUDAD
      ORDER BY saldo DESC
    `);

    // 7. Cartera por vendedor
    console.log('Extracting cartera por vendedor...');
    const carteraVendedor = await req().query(`
      SELECT 
        ISNULL(v.VENDEDOR_CODIGO, 'S/C') as codigo,
        ISNULL(v.VENDEDOR_NOMBRE, 'Sin asignar') as nombre,
        COUNT(*) as documentos,
        SUM(c.SALDO) as saldo_total,
        SUM(CASE WHEN c.FECHA_VENCIMIENTO < GETDATE() THEN c.SALDO ELSE 0 END) as saldo_vencido,
        SUM(CASE WHEN c.FECHA_VENCIMIENTO >= GETDATE() THEN c.SALDO ELSE 0 END) as saldo_corriente,
        ROUND(AVG(CAST(CASE WHEN FECHA_VENCIMIENTO < GETDATE() THEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) ELSE 0 END as float)), 1) as dias_mora_promedio
      FROM CARTERA c
      LEFT JOIN VENDEDORES v ON c.VENDEDOR_CODIGO = v.VENDEDOR_CODIGO AND c.EMPRESA_CODIGO = v.EMPRESA_CODIGO
      GROUP BY v.VENDEDOR_CODIGO, v.VENDEDOR_NOMBRE
      ORDER BY saldo_total DESC
    `);

    // 8. Tipo documento
    console.log('Extracting por tipo documento...');
    const tipoDocumento = await req().query(`
      SELECT 
        TIPO_DOCUMENTO as tipo,
        COUNT(*) as documentos,
        SUM(SALDO) as saldo
      FROM CARTERA
      GROUP BY TIPO_DOCUMENTO
      ORDER BY saldo DESC
    `);

    // 9. Evolucion mensual de cartera (saldo pendiente por mes)
    console.log('Extracting evolucion cartera...');
    const evolucionCartera = await req().query(`
      WITH Meses AS (
        SELECT DISTINCT 
          CAST(CAST(YEAR(FECHA_DOCUMENTO) as varchar) + '-' + RIGHT('0' + CAST(MONTH(FECHA_DOCUMENTO) as varchar), 2) + '-01' as date) as mes
        FROM CARTERA
        WHERE FECHA_DOCUMENTO IS NOT NULL
      )
      SELECT 
        m.mes,
        ISNULL(SUM(CASE WHEN c.FECHA_DOCUMENTO <= EOMONTH(m.mes) THEN c.SALDO ELSE 0 END), 0) as saldo_acumulado,
        ISNULL(SUM(CASE WHEN c.FECHA_DOCUMENTO <= EOMONTH(m.mes) AND c.FECHA_VENCIMIENTO < GETDATE() THEN c.SALDO ELSE 0 END), 0) as saldo_vencido,
        ISNULL(COUNT(CASE WHEN c.FECHA_DOCUMENTO <= EOMONTH(m.mes) THEN 1 END), 0) as docs_acumulados
      FROM Meses m
      LEFT JOIN CARTERA c ON 1=1
      GROUP BY m.mes
      ORDER BY m.mes
    `);

    // 10. Eficiencia de recaudo por año
    console.log('Extracting eficiencia recaudo...');
    const eficiencia = await req().query(`
      SELECT anio, facturado, recaudado,
        CASE WHEN facturado > 0 THEN ROUND(recaudado * 100.0 / facturado, 1) ELSE 0 END as porcentaje
      FROM (
        SELECT 
          anio,
          SUM(facturado) as facturado,
          SUM(recaudado) as recaudado
        FROM (
          SELECT YEAR(FECHA_DOCUMENTO) as anio, SUM(SALDO_BASE) as facturado, 0 as recaudado
          FROM CARTERA WHERE FECHA_DOCUMENTO IS NOT NULL
          GROUP BY YEAR(FECHA_DOCUMENTO)
          UNION ALL
          SELECT YEAR(pm.FECHA_PAGO) as anio, 0, SUM(pi.VALOR_ABONO)
          FROM PAGO_ITEM pi
          JOIN PAGO_MAST pm ON pi.PAGO_CODIGO = pm.PAGO_CODIGO AND pi.EMPRESA_CODIGO = pm.EMPRESA_CODIGO
          WHERE pm.FECHA_PAGO IS NOT NULL
          GROUP BY YEAR(pm.FECHA_PAGO)
        ) x
        GROUP BY anio
      ) y
      ORDER BY anio
    `);

    // 11. Concentracion (Pareto)
    console.log('Extracting concentracion...');
    const concentracion = await req().query(`
      WITH ClientesSaldo AS (
        SELECT CLIENTE_CODIGO, SUM(SALDO) as saldo
        FROM CARTERA
        GROUP BY CLIENTE_CODIGO
      ),
      TotalSaldo AS (
        SELECT SUM(saldo) as total FROM ClientesSaldo
      ),
      Ranked AS (
        SELECT 
          cs.CLIENTE_CODIGO,
          cs.saldo,
          ROW_NUMBER() OVER (ORDER BY cs.saldo DESC) as rn,
          t.total
        FROM ClientesSaldo cs, TotalSaldo t
      )
      SELECT 
        rn as num_clientes,
        ROUND(rn * 100.0 / (SELECT COUNT(*) FROM ClientesSaldo), 1) as pct_clientes,
        ROUND(SUM(saldo) * 100.0 / total, 1) as pct_saldo
      FROM Ranked
      WHERE rn <= 100
      GROUP BY rn, total
      ORDER BY rn
    `);

    // Build dashboard data
    const dashboardData = {
      generated_at: new Date().toISOString(),
      kpis: kpis.recordset[0],
      aging: aging.recordset,
      facturacion_mensual: facturacionMensual.recordset,
      recaudos_mensual: recaudosMensual.recordset,
      pedidos_mensual: pedidosMensual.recordset,
      top_clientes: topClientes.recordset,
      cartera_vendedor: carteraVendedor.recordset,
      tipo_documento: tipoDocumento.recordset,
      evolucion_cartera: evolucionCartera.recordset,
      eficiencia_recaudo: eficiencia.recordset,
      concentracion: concentracion.recordset
    };

    fs.writeFileSync(
      path.join(dataDir, 'dashboard_data.json'),
      JSON.stringify(dashboardData, null, 2)
    );

    console.log(`\nDashboard data saved: dashboard_data.json`);
    console.log(`File size: ${(fs.statSync(path.join(dataDir, 'dashboard_data.json')).size / 1024).toFixed(1)} KB`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

extractAll();
