import winston from 'winston';
import path from 'path';

// Formato personalizado para extraer caller info del stack trace
// Esta función se llamará en el contexto del log, no en el formato
let callerCache: { file: string; line: number; method: string } | null = null;

const captureCallerInfo = () => {
  const stack = new Error().stack;
  if (!stack) return { file: 'unknown', line: 0, method: 'unknown' };

  const lines = stack.split('\n');

  // Buscar la primera línea que NO sea de logger.ts, winston, node_modules o node:
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.includes('at ') &&
      !line.includes('logger.ts') &&
      !line.includes('node_modules') &&
      !line.includes('winston') &&
      !line.includes('node:') &&
      !line.includes('DerivedLogger')
    ) {
      const match = line.match(/at\s+(?:(\S+)\s+\()?(.+?):(\d+):\d+\)?/);
      if (match) {
        const method = match[1] || 'anonymous';
        const fullPath = match[2];
        const file = path.basename(fullPath);
        const lineNum = parseInt(match[3], 10);
        return { file, line: lineNum, method };
      }
    }
  }
  return { file: 'unknown', line: 0, method: 'unknown' };
};

// Formato estructurado JSON
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    // Winston metadata format mueve caller a info.metadata.caller
    const caller = info.metadata?.caller || info.caller || { file: 'unknown', line: 0, method: 'unknown' };

    // Crear copia de metadata sin caller para no duplicarlo
    const metadataWithoutCaller = info.metadata ? { ...info.metadata } : {};
    delete metadataWithoutCaller.caller;

    const logObject = {
      timestamp: info.timestamp,
      level: info.level.toUpperCase(),
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
      caller: {
        file: caller.file,
        line: caller.line,
        method: caller.method
      },
      message: info.message,
      ...(metadataWithoutCaller && Object.keys(metadataWithoutCaller).length > 0 && { data: metadataWithoutCaller }),
      ...(info.stack && { stack: info.stack })
    };
    return JSON.stringify(logObject);
  })
);

// Formato legible tipo Datadog (para desarrollo)
const readableFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    // Winston metadata format mueve caller a info.metadata.caller
    const caller = info.metadata?.caller || info.caller || { file: 'unknown', line: 0, method: 'unknown' };
    const location = `(${caller.file}:${caller.line} in ${caller.method})`;

    // Crear copia de metadata sin caller para no duplicarlo
    const metadataWithoutCaller = info.metadata ? { ...info.metadata } : {};
    delete metadataWithoutCaller.caller;

    const metadata = metadataWithoutCaller && Object.keys(metadataWithoutCaller).length > 0
      ? ` | ${JSON.stringify(metadataWithoutCaller)}`
      : '';
    return `${info.timestamp} UTC | APP | ${info.level.toUpperCase()} | ${location} | ${info.message}${metadata}`;
  })
);

// Configuración de transportes
const transports: winston.transport[] = [];

// Transporte para consola
// Desarrollo: formato legible tipo Datadog
// Producción: JSON estructurado para Datadog
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: readableFormat
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: jsonFormat
    })
  );
}

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug', // Cambiar a 'debug' para ver todos los logs
  format: winston.format.metadata(),
  transports,
  exitOnError: false
});

// Métodos helper para logging estructurado
export const log = {
  info: (message: string, metadata?: any) => {
    const caller = captureCallerInfo();
    logger.info(message, { metadata, caller });
  },
  warn: (message: string, metadata?: any) => {
    const caller = captureCallerInfo();
    logger.warn(message, { metadata, caller });
  },
  error: (message: string, error?: Error | any, metadata?: any) => {
    const caller = captureCallerInfo();
    logger.error(message, {
      metadata,
      caller,
      ...(error && {
        stack: error.stack,
        code: error.code,
        name: error.name
      })
    });
  },
  debug: (message: string, metadata?: any) => {
    const caller = captureCallerInfo();
    logger.debug(message, { metadata, caller });
  },
  sql: (query: string, params: any[], duration?: number, rows?: number) => {
    const caller = captureCallerInfo();
    logger.info('SQL Query', {
      metadata: {
        type: 'SQL_QUERY',
        sql: {
          query: query.replace(/\s+/g, ' ').trim(),
          params,
          ...(duration !== undefined && { duration_ms: duration }),
          ...(rows !== undefined && { rows })
        }
      },
      caller
    });
  },
  sqlError: (query: string, params: any[], error: Error, duration: number) => {
    const caller = captureCallerInfo();
    logger.error('SQL Error', {
      metadata: {
        type: 'SQL_ERROR',
        sql: {
          query: query.replace(/\s+/g, ' ').trim(),
          params,
          duration_ms: duration
        }
      },
      stack: error.stack,
      code: (error as any).code,
      caller
    });
  }
};

export default logger;
