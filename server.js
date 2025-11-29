require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
      message: 'Conexión a PostgreSQL exitosa',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({
      message: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
});

// API: Obtener todas las canciones
app.get('/api/songs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM songs ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener canciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener canciones',
      error: error.message
    });
  }
});

// API: Obtener una canción por ID
app.get('/api/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM songs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Canción no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener canción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener canción',
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV}`);
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada no manejada:', error);
});
