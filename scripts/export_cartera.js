const mssql = require('mssql');
const xlsx = require('xlsx');

const config = {
  server: 'NPROSERVER',
  user: 'adatec_read',
  password: 'PasswordSeguro123!',
  database: 'ADATEC',
  options: { trustServerCertificate: true, encrypt: false }
};

async function exportCartera() {
  let pool;
  try {
    pool = await mssql.connect(config);

    console.log('Descargando cartera...');
    const cartera = await pool.request().query(`
      SELECT 
        c.EMPRESA_CODIGO,
        c.CLIENTE_CODIGO,
        cl.CLIENTE_NOMBRE,
        cl.NIT,
        cl.CLIENTE_DIRECCION,
        cl.CLIENTE_CIUDAD,
        cl.CLIENTE_TELEFONO,
        cl.CLIENTE_EMAIL,
        c.VENDEDOR_CODIGO,
        v.VENDEDOR_NOMBRE,
        c.COBRADOR_CODIGO,
        c.TIPO_DOCUMENTO,
        c.NUMERO_DOCUMENTO,
        c.NUMERO,
        c.CUENTA_CONTABLE,
        c.FECHA_DOCUMENTO,
        c.FECHA_VENCIMIENTO,
        DATEDIFF(DAY, c.FECHA_VENCIMIENTO, GETDATE()) as DIAS_MORA,
        c.SALDO,
        c.SALDO_BASE,
        c.VALOR_IMPUESTOS,
        c.BASE_RETENCION,
        c.ESTADO,
        c.PROCESO,
        c.OBSERVACIONES,
        c.FECHA_CREA,
        c.FECHA_MODIFICA
      FROM CARTERA c
      LEFT JOIN CLIENTES cl 
        ON c.CLIENTE_CODIGO = cl.CLIENTE_CODIGO AND c.EMPRESA_CODIGO = cl.EMPRESA_CODIGO
      LEFT JOIN VENDEDORES v 
        ON c.VENDEDOR_CODIGO = v.VENDEDOR_CODIGO AND c.EMPRESA_CODIGO = v.EMPRESA_CODIGO
      ORDER BY c.FECHA_DOCUMENTO DESC
    `);

    console.log(`Registros obtenidos: ${cartera.recordset.length}`);
    console.log('Generando Excel...');

    // Format dates and numbers for Excel
    const data = cartera.recordset.map(r => ({
      Empresa: r.EMPRESA_CODIGO,
      'Cód. Cliente': r.CLIENTE_CODIGO,
      'Nombre Cliente': r.CLIENTE_NOMBRE || '',
      NIT: r.NIT || '',
      'Dirección Cliente': r.CLIENTE_DIRECCION || '',
      Ciudad: r.CLIENTE_CIUDAD || '',
      Teléfono: r.CLIENTE_TELEFONO || '',
      Email: r.CLIENTE_EMAIL || '',
      'Cód. Vendedor': r.VENDEDOR_CODIGO,
      Vendedor: r.VENDEDOR_NOMBRE || '',
      'Cód. Cobrador': r.COBRADOR_CODIGO,
      'Tipo Documento': r.TIPO_DOCUMENTO,
      'Nro Documento': r.NUMERO_DOCUMENTO,
      Numero: r.NUMERO || '',
      'Cuenta Contable': r.CUENTA_CONTABLE || '',
      'Fecha Documento': r.FECHA_DOCUMENTO ? new Date(r.FECHA_DOCUMENTO) : null,
      'Fecha Vencimiento': r.FECHA_VENCIMIENTO ? new Date(r.FECHA_VENCIMIENTO) : null,
      'Días Mora': r.DIAS_MORA,
      Saldo: r.SALDO,
      'Saldo Base': r.SALDO_BASE,
      'Valor Impuestos': r.VALOR_IMPUESTOS,
      'Base Retención': r.BASE_RETENCION,
      Estado: r.ESTADO || '',
      Proceso: r.PROCESO,
      Observaciones: r.OBSERVACIONES || '',
      'Fecha Creación': r.FECHA_CREA ? new Date(r.FECHA_CREA) : null,
      'Fecha Modificación': r.FECHA_MODIFICA ? new Date(r.FECHA_MODIFICA) : null
    }));

    const ws = xlsx.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, { wch: 15 }, { wch: 45 }, { wch: 18 }, { wch: 40 },
      { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 30 },
      { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 12 }, { wch: 14 },
      { wch: 15 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 14 },
      { wch: 12 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 40 },
      { wch: 15 }, { wch: 16 }
    ];

    // Add summary sheet
    const resumen = await pool.request().query(`
      SELECT 
        CASE 
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 0 THEN '0. No vencida'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 30 THEN '1. 1-30 días'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 60 THEN '2. 31-60 días'
          WHEN DATEDIFF(DAY, FECHA_VENCIMIENTO, GETDATE()) <= 90 THEN '3. 61-90 días'
          ELSE '4. +90 días'
        END as Rango_Mora,
        COUNT(*) as Total_Documentos,
        SUM(SALDO) as Total_Saldo
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

    const totales = await pool.request().query(`
      SELECT 
        COUNT(*) as Total_Registros,
        SUM(SALDO) as Saldo_Total,
        AVG(SALDO) as Saldo_Promedio,
        SUM(CASE WHEN FECHA_VENCIMIENTO < GETDATE() THEN SALDO ELSE 0 END) as Cartera_Vencida,
        SUM(CASE WHEN FECHA_VENCIMIENTO >= GETDATE() THEN SALDO ELSE 0 END) as Cartera_Por_Vencer
      FROM CARTERA
    `);

    const summaryData = [
      { Concepto: 'Total Registros', Valor: totales.recordset[0].Total_Registros },
      { Concepto: 'Saldo Total', Valor: totales.recordset[0].Saldo_Total },
      { Concepto: 'Saldo Promedio', Valor: Math.round(totales.recordset[0].Saldo_Promedio) },
      { Concepto: 'Cartera Vencida', Valor: totales.recordset[0].Cartera_Vencida },
      { Concepto: 'Cartera Por Vencer', Valor: totales.recordset[0].Cartera_Por_Vencer },
      { Concepto: '', Valor: '' },
      { Concepto: 'RANGO DE MORA', Valor: '' },
      ...resumen.recordset.map(r => ({ Concepto: r.Rango_Mora, Valor: `${r.Total_Documentos} docs | $${Number(r.Total_Saldo).toLocaleString('es-CO', {minimumFractionDigits:0})}` }))
    ];

    const wsResumen = xlsx.utils.json_to_sheet(summaryData);
    wsResumen['!cols'] = [{ wch: 25 }, { wch: 50 }];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Cartera');
    xlsx.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    const fileName = 'cartera_export.xlsx';
    xlsx.writeFile(wb, fileName);
    console.log(`\nArchivo exportado: ${fileName}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

exportCartera();
