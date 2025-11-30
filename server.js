require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./src/config/database');
const songsRoutes = require('./src/routes/songs');

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal - sirve la página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta API de estado
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Bienvenido a Radio Calico',
    status: 'Server funcionando correctamente'
  });
});

// Ruta para probar la conexión a la base de datos
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Conexión a PostgreSQL exitosa',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al conectar con la base de datos',
      error: error.message
    });
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
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promesa rechazada no manejada:', error);
});
