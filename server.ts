import 'dotenv/config';
import express, { Request, Response, Application } from 'express';
import path from 'path';
import pool from './src/config/database';
import songsRoutes from './src/routes/songs';
import { APIResponse } from './src/types';

const app: Application = express();
const PORT: number = parseInt(process.env.APP_PORT || '3000', 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal - sirve la página de inicio
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta API de estado
app.get('/api/status', (req: Request, res: Response) => {
  const response: APIResponse = {
    message: 'Bienvenido a Disc Radio',
    success: true,
    data: {
      status: 'Server funcionando correctamente'
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
