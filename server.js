require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fetch = require('node-fetch');

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

// API: Votar por una canción
app.post('/api/songs/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la canción existe
    const checkResult = await pool.query(
      'SELECT id FROM songs WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Canción no encontrada'
      });
    }

    // Incrementar el contador de votos
    const result = await pool.query(
      'UPDATE songs SET votes = COALESCE(votes, 0) + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({
      success: true,
      message: 'Voto registrado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al votar por canción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar voto',
      error: error.message
    });
  }
});

// API: Incrementar reproducciones de una canción
app.post('/api/songs/:id/play', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la canción existe
    const checkResult = await pool.query(
      'SELECT id FROM songs WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Canción no encontrada'
      });
    }

    // Incrementar el contador de reproducciones
    const result = await pool.query(
      'UPDATE songs SET play_count = COALESCE(play_count, 0) + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({
      success: true,
      message: 'Reproducción registrada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar reproducción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar reproducción',
      error: error.message
    });
  }
});

// API: Buscar carátula de álbum usando MusicBrainz
app.get('/api/songs/:id/cover', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información de la canción
    const songResult = await pool.query(
      'SELECT title, artist FROM songs WHERE id = $1',
      [id]
    );

    if (songResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Canción no encontrada'
      });
    }

    const { title, artist } = songResult.rows[0];

    // Buscar en MusicBrainz
    const query = `artist:${artist} AND recording:${title}`;
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://musicbrainz.org/ws/2/release/?query=${encodedQuery}&fmt=json&limit=5`;

    const mbResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'RadioCalico/1.0.0 (contact@radiocalico.com)'
      }
    });

    if (!mbResponse.ok) {
      throw new Error(`MusicBrainz API error: ${mbResponse.status}`);
    }

    const mbData = await mbResponse.json();

    if (mbData.releases && mbData.releases.length > 0) {
      // Intentar con cada release hasta encontrar una carátula
      for (const release of mbData.releases) {
        const releaseId = release.id;
        const coverUrl = `https://coverartarchive.org/release/${releaseId}/front-500`;

        try {
          const coverCheck = await fetch(coverUrl, { method: 'HEAD' });

          if (coverCheck.ok) {
            console.log(`✨ Carátula encontrada para "${artist} - ${title}"`);
            return res.json({
              success: true,
              coverUrl: coverUrl,
              source: 'coverartarchive',
              release: release.title
            });
          }
        } catch (coverError) {
          continue;
        }
      }
    }

    // Si no se encontró, devolver null
    res.json({
      success: true,
      coverUrl: null,
      source: 'none'
    });

  } catch (error) {
    console.error('Error al buscar carátula:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al buscar carátula',
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
