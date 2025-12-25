import { Pool } from 'pg';
import { DatabaseConfig } from '../types';
import { log } from './logger';

// Configuración del pool de conexiones a PostgreSQL
// Valores optimizados para desarrollo y producción
const config: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Número máximo de clientes en el pool (default: 10)
  // Incrementado para manejar más peticiones concurrentes
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),

  // Número mínimo de clientes en el pool (default: 0)
  // Mantiene conexiones listas para uso inmediato
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),

  // Tiempo en ms que un cliente puede estar inactivo antes de cerrarse (default: 10000)
  // 30 segundos permite reutilización pero libera recursos inactivos
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),

  // Tiempo en ms para esperar al intentar conectar (default: 0 = sin timeout)
  // 2 segundos permite fallar rápido si hay problemas de conexión
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),

  // Número máximo de usos de un cliente antes de retirarlo (default: Infinity)
  // Previene memory leaks reciclando conexiones después de 7500 usos
  maxUses: parseInt(process.env.DB_MAX_USES || '7500', 10)
};

const pool = new Pool(config);

// Event listeners para debugging
pool.on('connect', () => {
  log.info('Nueva conexión al pool de PostgreSQL');
});

pool.on('error', (err: Error) => {
  log.error('Error inesperado en el cliente de PostgreSQL', err);
  process.exit(-1);
});

// Interceptar el método query para logging
const originalQuery = pool.query.bind(pool);

pool.query = function(text: any, params?: any, callback?: any): any {
  const start = Date.now();

  // Determinar si es una query con parámetros o sin ellos
  const queryText = typeof text === 'string' ? text : text.text;
  const queryParams = typeof text === 'string' ? params : text.values;

  // Ejecutar la query original
  const result = originalQuery(text, params, callback);

  // Si es una Promise, agregar logging al resultado
  if (result && typeof result.then === 'function') {
    return result
      .then((res: any) => {
        const duration = Date.now() - start;
        log.sql(queryText, queryParams || [], duration, res.rowCount);
        return res;
      })
      .catch((error: any) => {
        const duration = Date.now() - start;
        log.sqlError(queryText, queryParams || [], error, duration);
        throw error;
      });
  }

  return result;
};

export default pool;
