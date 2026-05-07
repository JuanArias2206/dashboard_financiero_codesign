const mssql = require('mssql');

const config = {
  server: 'NPROSERVER',
  user: 'adatec_read',
  password: 'PasswordSeguro123!',
  database: 'ADATEC',
  options: { trustServerCertificate: true, encrypt: false }
};

async function exploreHistorical() {
  let pool;
  try {
    pool = await mssql.connect(config);
    const req = () => pool.request();

    // PAGO_ITEM columns check
    console.log('=== PAGO_ITEM columns ===');
    const cols = await req().query(`
      SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'PAGO_ITEM' ORDER BY ORDINAL_POSITION
    `);
    cols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

    // PAGO_MAST columns check
    console.log('\n=== PAGO_MAST columns ===');
    const colsMast = await req().query(`
      SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'PAGO_MAST' ORDER BY ORDINAL_POSITION
    `);
    colsMast.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

    // 1. Facturación mensual
    console.log('\n=== FACTURACIÓN MENSUAL ===');
    const factMensual = await req().query(`
      SELECT 
        YEAR(FECHA_DOCUMENTO) as anio,
        MONTH(FECHA_DOCUMENTO) as mes,
        COUNT(*) as total_docs,
        SUM(SALDO) as facturado,
        SUM(SALDO_BASE) as saldo_base
      FROM CARTERA
      WHERE FECHA_DOCUMENTO IS NOT NULL
      GROUP BY YEAR(FECHA_DOCUMENTO), MONTH(FECHA_DOCUMENTO)
      ORDER BY anio, mes
    `);
    console.log(`  Meses: ${factMensual.recordset.length}`);

    // 2. Pagos mensuales (usando FECHA_PAGO de PAGO_MAST)
    console.log('\n=== RECAUDOS MENSUALES ===');
    const recaudos = await req().query(`
      SELECT 
        YEAR(pm.FECHA_PAGO) as anio,
        MONTH(pm.FECHA_PAGO) as mes,
        COUNT(DISTINCT pi.PAGO_CODIGO) as num_recibos,
        SUM(pi.VALOR_ABONO) as total_recaudado
      FROM PAGO_ITEM pi
      JOIN PAGO_MAST pm ON pi.PAGO_CODIGO = pm.PAGO_CODIGO AND pi.EMPRESA_CODIGO = pm.EMPRESA_CODIGO
      WHERE pm.FECHA_PAGO IS NOT NULL
      GROUP BY YEAR(pm.FECHA_PAGO), MONTH(pm.FECHA_PAGO)
      ORDER BY anio, mes
    `);
    console.log(`  Meses: ${recaudos.recordset.length}`);
    recaudos.recordset.slice(-5).forEach(r => {
      console.log(`  ${r.anio}/${String(r.mes).padStart(2,'0')}: ${r.num_recibos} recibos, $${Number(r.total_recaudado).toLocaleString('es-CO', {maximumFractionDigits:0})}`);
    });

    // 3. Pedidos mensuales
    console.log('\n=== PEDIDOS MENSUALES ===');
    const pedidos = await req().query(`
      SELECT 
        YEAR(FECHA_ENTREGA) as anio,
        MONTH(FECHA_ENTREGA) as mes,
        COUNT(*) as total_pedidos
      FROM PEDIDO_MAST
      WHERE FECHA_ENTREGA IS NOT NULL
      GROUP BY YEAR(FECHA_ENTREGA), MONTH(FECHA_ENTREGA)
      ORDER BY anio, mes
    `);
    console.log(`  Meses: ${pedidos.recordset.length}`);

    // 4. Valor total de pedidos por mes (con subquery seguro)
    console.log('\n=== VALOR PEDIDOS MENSUALES ===');
    const valorPedidos = await req().query(`
      SELECT 
        YEAR(pm.FECHA_ENTREGA) as anio,
        MONTH(pm.FECHA_ENTREGA) as mes,
        COUNT(*) as total_pedidos,
        SUM(pi.TOTAL) as valor_total
      FROM PEDIDO_MAST pm
      JOIN PEDIDO_ITEM pi ON pm.PEDIDO_CODIGO = pi.PEDIDO_CODIGO AND pm.EMPRESA_CODIGO = pi.EMPRESA_CODIGO
      WHERE pm.FECHA_ENTREGA IS NOT NULL
      GROUP BY YEAR(pm.FECHA_ENTREGA), MONTH(pm.FECHA_ENTREGA)
      ORDER BY anio, mes
    `);
    console.log(`  Meses: ${valorPedidos.recordset.length}`);
    valorPedidos.recordset.slice(-5).forEach(r => {
      console.log(`  ${r.anio}/${String(r.mes).padStart(2,'0')}: ${r.total_pedidos} pedidos, $${Number(r.valor_total).toLocaleString('es-CO', {maximumFractionDigits:0})}`);
    });

    // 5. Cartera por mes de creación
    console.log('\n=== CARTERA POR MES DE CREACIÓN ===');
    const carteraMensual = await req().query(`
      SELECT 
        YEAR(FECHA_DOCUMENTO) as anio,
        MONTH(FECHA_DOCUMENTO) as mes,
        COUNT(*) as documentos,
        SUM(SALDO) as saldo_actual,
        SUM(SALDO_BASE) as saldo_original,
        SUM(CASE WHEN FECHA_VENCIMIENTO < GETDATE() THEN SALDO ELSE 0 END) as saldo_vencido
      FROM CARTERA
      WHERE FECHA_DOCUMENTO IS NOT NULL
      GROUP BY YEAR(FECHA_DOCUMENTO), MONTH(FECHA_DOCUMENTO)
      ORDER BY anio, mes
    `);
    console.log(`  Meses: ${carteraMensual.recordset.length}`);

    // 6. Top clientes
    console.log('\n=== TOP 20 CLIENTES ===');
    const topClientes = await req().query(`
      SELECT TOP 20
        c.CLIENTE_CODIGO,
        cl.CLIENTE_NOMBRE,
        cl.NIT,
        cl.CLIENTE_CIUDAD,
        COUNT(*) as num_docs,
        SUM(c.SALDO) as saldo_total,
        SUM(CASE WHEN c.FECHA_VENCIMIENTO < GETDATE() THEN c.SALDO ELSE 0 END) as saldo_vencido,
        SUM(c.SALDO_BASE) as saldo_base
      FROM CARTERA c
      LEFT JOIN CLIENTES cl ON c.CLIENTE_CODIGO = cl.CLIENTE_CODIGO AND c.EMPRESA_CODIGO = cl.EMPRESA_CODIGO
      GROUP BY c.CLIENTE_CODIGO, cl.CLIENTE_NOMBRE, cl.NIT, cl.CLIENTE_CIUDAD
      ORDER BY saldo_total DESC
    `);
    topClientes.recordset.slice(0, 10).forEach((r, i) => {
      console.log(`  ${i+1}. [${r.CLIENTE_CODIGO}] ${(r.CLIENTE_NOMBRE||'').substring(0,40)}: $${Number(r.saldo_total).toLocaleString('es-CO', {maximumFractionDigits:0})}`);
    });

    // 7. Vendedores
    console.log('\n=== VENDEDORES ===');
    const carteraVendedor = await req().query(`
      SELECT 
        v.VENDEDOR_CODIGO,
        v.VENDEDOR_NOMBRE,
        COUNT(*) as num_docs,
        SUM(c.SALDO) as saldo_total,
        SUM(CASE WHEN c.FECHA_VENCIMIENTO < GETDATE() THEN c.SALDO ELSE 0 END) as saldo_vencido,
        SUM(CASE WHEN c.FECHA_VENCIMIENTO >= GETDATE() THEN c.SALDO ELSE 0 END) as saldo_por_vencer,
        AVG(CAST(DATEDIFF(DAY, c.FECHA_VENCIMIENTO, GETDATE()) as float)) as avg_dias_mora
      FROM CARTERA c
      LEFT JOIN VENDEDORES v ON c.VENDEDOR_CODIGO = v.VENDEDOR_CODIGO AND c.EMPRESA_CODIGO = v.EMPRESA_CODIGO
      GROUP BY v.VENDEDOR_CODIGO, v.VENDEDOR_NOMBRE
      ORDER BY saldo_total DESC
    `);
    console.log(`  Vendedores: ${carteraVendedor.recordset.length}`);

    // 8. Collection efficiency by year
    console.log('\n=== EFICIENCIA DE RECAUDO POR AÑO ===');
    const efficiency = await req().query(`
      SELECT 
        anio,
        SUM(facturado) as total_facturado,
        SUM(recaudado) as total_recaudado,
        CASE WHEN SUM(facturado) > 0 THEN SUM(recaudado) * 100.0 / SUM(facturado) ELSE 0 END as eficiencia
      FROM (
        SELECT YEAR(FECHA_DOCUMENTO) as anio, SUM(SALDO_BASE) as facturado, 0 as recaudado
        FROM CARTERA WHERE FECHA_DOCUMENTO IS NOT NULL
        GROUP BY YEAR(FECHA_DOCUMENTO)
        UNION ALL
        SELECT YEAR(pm.FECHA_PAGO) as anio, 0 as facturado, SUM(pi.VALOR_ABONO) as recaudado
        FROM PAGO_ITEM pi
        JOIN PAGO_MAST pm ON pi.PAGO_CODIGO = pm.PAGO_CODIGO AND pi.EMPRESA_CODIGO = pm.EMPRESA_CODIGO
        WHERE pm.FECHA_PAGO IS NOT NULL
        GROUP BY YEAR(pm.FECHA_PAGO)
      ) x
      GROUP BY anio
      ORDER BY anio
    `);
    efficiency.recordset.forEach(r => {
      console.log(`  ${r.anio}: Facturado $${Number(r.total_facturado).toLocaleString('es-CO', {maximumFractionDigits:0})}, Recaudado $${Number(r.total_recaudado).toLocaleString('es-CO', {maximumFractionDigits:0})}, Eficiencia ${Number(r.eficiencia).toFixed(1)}%`);
    });

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    if (pool) await pool.close();
  }
}

exploreHistorical();
