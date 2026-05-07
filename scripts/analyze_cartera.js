const mssql = require('mssql');

const config = {
  server: 'NPROSERVER',
  user: 'adatec_read',
  password: 'PasswordSeguro123!',
  database: 'ADATEC',
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

async function analyzeCartera() {
  let pool;
  try {
    pool = await mssql.connect(config);
    const req = () => pool.request();

    // 1. Totales generales
    console.log('=== TOTALES GENERALES ===');
    const total = await req().query(`
      SELECT 
        COUNT(*) as total_registros,
        SUM(SALDO) as saldo_total,
        AVG(SALDO) as saldo_promedio,
        MAX(SALDO) as saldo_maximo,
        MIN(SALDO) as saldo_minimo,
        SUM(SALDO_BASE) as saldo_base_total,
        SUM(VALOR_IMPUESTOS) as impuestos_total,
        SUM(BASE_RETENCION) as base_retencion_total
      FROM CARTERA
    `);
    const t = total.recordset[0];
    console.log(`  Registros: ${t.total_registros.toLocaleString()}`);
    console.log(`  Saldo total: $${Number(t.saldo_total).toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}`);
    console.log(`  Saldo promedio: $${Number(t.saldo_promedio).toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}`);
    console.log(`  Saldo máximo: $${Number(t.saldo_maximo).toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}`);
    console.log(`  Saldo base total: $${Number(t.saldo_base_total).toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}`);
    console.log(`  Impuestos total: $${Number(t.impuestos_total).toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}`);
    console.log(`  Base retención total: $${Number(t.base_retencion_total).toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}`);

    // 2. Rango de fechas
    console.log('\n=== RANGO DE FECHAS ===');
    const fechas = await req().query(`
      SELECT 
        MIN(FECHA_DOCUMENTO) as fecha_min,
        MAX(FECHA_DOCUMENTO) as fecha_max,
        MIN(FECHA_VENCIMIENTO) as vencimiento_min,
        MAX(FECHA_VENCIMIENTO) as vencimiento_max
      FROM CARTERA
    `);
    const f = fechas.recordset[0];
    console.log(`  Fecha doc: ${f.fecha_min?.toLocaleDateString()} a ${f.fecha_max?.toLocaleDateString()}`);
    console.log(`  Vencimiento: ${f.vencimiento_min?.toLocaleDateString()} a ${f.vencimiento_max?.toLocaleDateString()}`);

    // 3. Por tipo de documento
    console.log('\n=== POR TIPO DE DOCUMENTO ===');
    const tipoDoc = await req().query(`
      SELECT TIPO_DOCUMENTO, COUNT(*) as cnt, SUM(SALDO) as total_saldo
      FROM CARTERA
      GROUP BY TIPO_DOCUMENTO
      ORDER BY total_saldo DESC
    `);
    tipoDoc.recordset.forEach(r => {
      console.log(`  ${r.TIPO_DOCUMENTO}: ${r.cnt.toLocaleString()} docs, Saldo: $${Number(r.total_saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 4. Por estado
    console.log('\n=== POR ESTADO ===');
    const estado = await req().query(`
      SELECT ISNULL(ESTADO, 'SIN ESTADO') as estado, COUNT(*) as cnt, SUM(SALDO) as total_saldo
      FROM CARTERA
      GROUP BY ESTADO
      ORDER BY total_saldo DESC
    `);
    estado.recordset.forEach(r => {
      console.log(`  ${r.estado}: ${r.cnt.toLocaleString()} docs, Saldo: $${Number(r.total_saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 5. Por proceso
    console.log('\n=== POR PROCESO ===');
    const proceso = await req().query(`
      SELECT PROCESO, COUNT(*) as cnt, SUM(SALDO) as total_saldo
      FROM CARTERA
      GROUP BY PROCESO
      ORDER BY total_saldo DESC
    `);
    proceso.recordset.forEach(r => {
      console.log(`  ${r.PROCESO}: ${r.cnt.toLocaleString()} docs, Saldo: $${Number(r.total_saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 6. Aging (vencidas vs por vencer)
    console.log('\n=== ANÁLISIS DE VENCIMIENTO ===');
    const aging = await req().query(`
      SELECT 
        CASE 
          WHEN FECHA_VENCIMIENTO < GETDATE() THEN 'VENCIDA'
          ELSE 'POR VENCER'
        END as situacion,
        COUNT(*) as cnt,
        SUM(SALDO) as total_saldo
      FROM CARTERA
      WHERE FECHA_VENCIMIENTO IS NOT NULL
      GROUP BY 
        CASE 
          WHEN FECHA_VENCIMIENTO < GETDATE() THEN 'VENCIDA'
          ELSE 'POR VENCER'
        END
    `);
    aging.recordset.forEach(r => {
      console.log(`  ${r.situacion}: ${r.cnt.toLocaleString()} docs, Saldo: $${Number(r.total_saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 7. Aging por rangos de días vencidos
    console.log('\n=== RANGOS DE MORA ===');
    const mora = await req().query(`
      SELECT 
        CASE 
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 0 THEN '0. No vencida'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 30 THEN '1. 1-30 días'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 60 THEN '2. 31-60 días'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 90 THEN '3. 61-90 días'
          ELSE '4. +90 días'
        END as rango,
        COUNT(*) as cnt,
        SUM(SALDO) as total_saldo
      FROM CARTERA
      WHERE FECHA_VENCIMIENTO IS NOT NULL
      GROUP BY 
        CASE 
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 0 THEN '0. No vencida'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 30 THEN '1. 1-30 días'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 60 THEN '2. 31-60 días'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 90 THEN '3. 61-90 días'
          ELSE '4. +90 días'
        END
      ORDER BY MIN(DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()))
    `);
    mora.recordset.forEach(r => {
      console.log(`  ${r.rango}: ${r.cnt.toLocaleString()} docs, Saldo: $${Number(r.total_saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 8. Top 20 clientes con mayor saldo
    console.log('\n=== TOP 20 CLIENTES CON MAYOR SALDO ===');
    const topClientes = await req().query(`
      SELECT TOP 20 c.CLIENTE_CODIGO, cl.CLIENTE_NOMBRE, 
        COUNT(*) as num_docs, SUM(c.SALDO) as total_saldo
      FROM CARTERA c
      LEFT JOIN CLIENTES cl ON c.CLIENTE_CODIGO = cl.CLIENTE_CODIGO AND c.EMPRESA_CODIGO = cl.EMPRESA_CODIGO
      GROUP BY c.CLIENTE_CODIGO, cl.CLIENTE_NOMBRE
      ORDER BY total_saldo DESC
    `);
    topClientes.recordset.forEach((r, i) => {
      console.log(`  ${i+1}. [${r.CLIENTE_CODIGO}] ${r.CLIENTE_NOMBRE || 'S/N'}: ${r.num_docs} docs, $${Number(r.total_saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 9. Por vendedor
    console.log('\n=== TOP 15 VENDEDORES CON MAYOR CARTERA ===');
    const topVendedores = await req().query(`
      SELECT TOP 15 v.VENDEDOR_CODIGO, v.VENDEDOR_NOMBRE,
        COUNT(*) as num_docs, SUM(c.SALDO) as total_saldo
      FROM CARTERA c
      LEFT JOIN VENDEDORES v ON c.VENDEDOR_CODIGO = v.VENDEDOR_CODIGO AND c.EMPRESA_CODIGO = v.EMPRESA_CODIGO
      GROUP BY v.VENDEDOR_CODIGO, v.VENDEDOR_NOMBRE
      ORDER BY total_saldo DESC
    `);
    topVendedores.recordset.forEach((r, i) => {
      console.log(`  ${i+1}. [${r.VENDEDOR_CODIGO}] ${r.VENDEDOR_NOMBRE || 'S/N'}: ${r.num_docs} docs, $${Number(r.total_saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 10. Cartera vencida por vendedor
    console.log('\n=== TOP 15 VENDEDORES CON MAYOR CARTERA VENCIDA ===');
    const carteraVendida = await req().query(`
      SELECT TOP 15 v.VENDEDOR_CODIGO, v.VENDEDOR_NOMBRE,
        COUNT(*) as num_docs, SUM(c.SALDO) as total_vencido
      FROM CARTERA c
      LEFT JOIN VENDEDORES v ON c.VENDEDOR_CODIGO = v.VENDEDOR_CODIGO AND c.EMPRESA_CODIGO = v.EMPRESA_CODIGO
      WHERE c.FECHA_VENCIMIENTO < GETDATE()
      GROUP BY v.VENDEDOR_CODIGO, v.VENDEDOR_NOMBRE
      ORDER BY total_vencido DESC
    `);
    carteraVendida.recordset.forEach((r, i) => {
      console.log(`  ${i+1}. [${r.VENDEDOR_CODIGO}] ${r.VENDEDOR_NOMBRE || 'S/N'}: ${r.num_docs} docs, $${Number(r.total_vencido).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 11. Por cuenta contable
    console.log('\n=== POR CUENTA CONTABLE ===');
    const cuentas = await req().query(`
      SELECT ISNULL(CUENTA_CONTABLE, 'SIN CUENTA') as cuenta, COUNT(*) as cnt, SUM(SALDO) as total_saldo
      FROM CARTERA
      GROUP BY CUENTA_CONTABLE
      ORDER BY total_saldo DESC
    `);
    cuentas.recordset.forEach(r => {
      console.log(`  ${r.cuenta}: ${r.cnt} docs, $${Number(r.total_saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}`);
    });

    // 12. Relación con SALDO_BASE
    console.log('\n=== COMPARACIÓN CON SALDO_BASE ===');
    const comp = await req().query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN SALDO <> SALDO_BASE THEN 1 ELSE 0 END) as con_diferencia,
        SUM(ABS(SALDO - SALDO_BASE)) as diferencia_total
      FROM CARTERA
    `);
    const c = comp.recordset[0];
    console.log(`  Registros con diferencia: ${c.con_diferencia.toLocaleString()} de ${c.total.toLocaleString()}`);
    console.log(`  Diferencia total acumulada: $${Number(c.diferencia_total).toLocaleString('es-CO', {minimumFractionDigits:0})}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

analyzeCartera();
