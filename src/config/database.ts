import { Pool } from 'pg';
import { DatabaseConfig } from '../types';

// Configuración del pool de conexiones a PostgreSQL
// SSL solo si se especifica explícitamente (para producción en cloud)
const config: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(config);

// Event listeners para debugging
pool.on('connect', () => {
  console.log('✅ Nueva conexión al pool de PostgreSQL');
});

pool.on('error', (err: Error) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
  process.exit(-1);
});

export default pool;
