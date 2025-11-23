const { Client } = require('pg');

async function liberarLocks() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'occupational_health',
    user: 'postgres',
    password: 'Liloestit013',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Liberar TODAS as conexões idle e ativas (exceto esta)
    const result = await client.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = 'occupational_health'
        AND pid <> pg_backend_pid();
    `);

    console.log(`🔓 Locks liberados: ${result.rowCount} conexões terminadas`);

    // Verificar conexões restantes
    const connections = await client.query(`
      SELECT pid, usename, state, application_name, query_start
      FROM pg_stat_activity
      WHERE datname = 'occupational_health';
    `);

    console.log(`📊 Conexões ativas: ${connections.rowCount}`);
    connections.rows.forEach(row => {
      console.log(`  - PID ${row.pid}: ${row.application_name} (${row.state})`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
    console.log('👋 Desconectado');
  }
}

liberarLocks();
