const pool = require('../config/database');
const coverArtService = require('../services/coverArtService');

/**
 * Obtener todas las canciones
 */
exports.getAllSongs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        artist,
        audio_file,
        image_url,
        description,
        spotify_url,
        youtube_url,
        genre,
        duration,
        votes,
        play_count,
        created_at
      FROM songs
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener canciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las canciones',
      error: error.message
    });
  }
};

/**
 * Obtener una canción por ID
 */
exports.getSongById = async (req, res) => {
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
      message: 'Error al obtener la canción',
      error: error.message
    });
  }
};

/**
 * Votar por una canción
 */
exports.voteSong = async (req, res) => {
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
};

/**
 * Incrementar contador de reproducciones
 */
exports.registerPlay = async (req, res) => {
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
};

/**
 * Buscar carátula de álbum
 */
exports.getCover = async (req, res) => {
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

    // Usar el servicio de búsqueda de carátulas
    const result = await coverArtService.searchCover(artist, title);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error al buscar carátula:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al buscar carátula',
      error: error.message
    });
  }
};
