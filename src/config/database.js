const { Pool } = require('pg');

// Configuración del pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Event listeners para debugging
pool.on('connect', () => {
  console.log('✅ Nueva conexión al pool de PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;
