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

async function exploreDB() {
  let pool;
  try {
    pool = await mssql.connect(config);
    console.log('=== CONEXIÓN EXITOSA ===\n');

    // 1. List all tables
    console.log('=== TABLAS ===');
    const tables = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);
    tables.recordset.forEach(t => console.log(`  ${t.TABLE_SCHEMA}.${t.TABLE_NAME}`));
    console.log(`Total: ${tables.recordset.length} tablas\n`);

    // 2. List all views
    console.log('=== VISTAS ===');
    const views = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME 
      FROM INFORMATION_SCHEMA.VIEWS
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);
    views.recordset.forEach(v => console.log(`  ${v.TABLE_SCHEMA}.${v.TABLE_NAME}`));
    console.log(`Total: ${views.recordset.length} vistas\n`);

    // 3. For each table, show columns and row count
    console.log('=== DETALLE DE TABLAS ===');
    for (const table of tables.recordset) {
      const fullName = `[${table.TABLE_SCHEMA}].[${table.TABLE_NAME}]`;
      
      const columns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${table.TABLE_SCHEMA}' AND TABLE_NAME = '${table.TABLE_NAME}'
        ORDER BY ORDINAL_POSITION
      `);

      let rowCount = null;
      try {
        const count = await pool.request().query(`SELECT COUNT(*) as cnt FROM ${fullName}`);
        rowCount = count.recordset[0].cnt;
      } catch {
        rowCount = 'N/A';
      }

      console.log(`\n--- ${fullName} (${rowCount} filas) ---`);
      columns.recordset.forEach(c => {
        const len = c.CHARACTER_MAXIMUM_LENGTH ? `(${c.CHARACTER_MAXIMUM_LENGTH})` : '';
        const nullable = c.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`    ${c.COLUMN_NAME} ${c.DATA_TYPE}${len} ${nullable}`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

exploreDB();
