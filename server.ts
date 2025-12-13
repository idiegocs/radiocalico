import 'dotenv/config';
import express, { Request, Response, Application } from 'express';
import path from 'path';
import pool from './src/config/database';
import songsRoutes from './src/routes/songs';
import { APIResponse } from './src/types';

const app: Application = express();
// Puerto interno en el que escucha el servidor (siempre 3000 en Docker)
const PORT: number = 3000;
// Puerto externo para mostrar al usuario (viene de APP_PORT en .env)
const DISPLAY_PORT: number = parseInt(process.env.APP_PORT || '3000', 10);

// Determinar la ruta base del proyecto
// En desarrollo: __dirname es la raíz del proyecto
// En producción: __dirname es dist/, necesitamos subir un nivel
const isProduction = process.env.NODE_ENV === 'production';
const publicPath = isProduction
  ? path.join(__dirname, '..', 'public')
  : path.join(__dirname, 'public');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(publicPath));

// Ruta principal - sirve la página de inicio
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Ruta API de estado
app.get('/api/status', (req: Request, res: Response) => {
  const response: APIResponse = {
    message: 'Bienvenido a Disc Radio',
    success: true,
    data: {
      status: 'Server funcionando correctamente',
      environment: process.env.NODE_ENV || 'development',
      port: DISPLAY_PORT,
      database: process.env.POSTGRES_DB || 'unknown',
      version: '1.0.0'
    }
  };
  res.json(response);
});

// Ruta para probar la conexión a la base de datos
app.get('/db-test', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    const response: APIResponse = {
      success: true,
      message: 'Conexión a PostgreSQL exitosa',
      data: {
        timestamp: result.rows[0].now
      }
    };
    res.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al conectar con la base de datos:', errorMessage);

    const errorResponse: APIResponse = {
      success: false,
      message: 'Error al conectar con la base de datos',
      error: errorMessage
    };
    res.status(500).json(errorResponse);
  }
});

// API Routes
app.use('/api/songs', songsRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores globales
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (error: Error) => {
  console.error('❌ Promesa rechazada no manejada:', error);
});
