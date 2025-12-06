import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../config/database';
import coverArtService from '../services/coverArtService';
import { Song, APIResponse } from '../types';

/**
 * Obtener todas las canciones
 */
export const getAllSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const result: QueryResult<Song> = await pool.query(`
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
      ORDER BY play_count DESC NULLS LAST, created_at DESC
    `);

    const response: APIResponse<Song[]> = {
      success: true,
      data: result.rows,
      count: result.rows.length
    };

    res.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al obtener canciones:', errorMessage);

    const errorResponse: APIResponse = {
      success: false,
      message: 'Error al obtener las canciones',
      error: errorMessage
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * Obtener una canción por ID
 */
export const getSongById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result: QueryResult<Song> = await pool.query(
      'SELECT * FROM songs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const notFoundResponse: APIResponse = {
        success: false,
        message: 'Canción no encontrada'
      };
      res.status(404).json(notFoundResponse);
      return;
    }

    const response: APIResponse<Song> = {
      success: true,
      data: result.rows[0]
    };

    res.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al obtener canción:', errorMessage);

    const errorResponse: APIResponse = {
      success: false,
      message: 'Error al obtener la canción',
      error: errorMessage
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * Votar por una canción
 */
export const voteSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que la canción existe
    const checkResult: QueryResult<{ id: number }> = await pool.query(
      'SELECT id FROM songs WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      const notFoundResponse: APIResponse = {
        success: false,
        message: 'Canción no encontrada'
      };
      res.status(404).json(notFoundResponse);
      return;
    }

    // Incrementar el contador de votos
    const result: QueryResult<Song> = await pool.query(
      'UPDATE songs SET votes = COALESCE(votes, 0) + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    const response: APIResponse<Song> = {
      success: true,
      message: 'Voto registrado exitosamente',
      data: result.rows[0]
    };

    res.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al votar por canción:', errorMessage);

    const errorResponse: APIResponse = {
      success: false,
      message: 'Error al registrar voto',
      error: errorMessage
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * Incrementar contador de reproducciones
 */
export const registerPlay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que la canción existe
    const checkResult: QueryResult<{ id: number }> = await pool.query(
      'SELECT id FROM songs WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      const notFoundResponse: APIResponse = {
        success: false,
        message: 'Canción no encontrada'
      };
      res.status(404).json(notFoundResponse);
      return;
    }

    // Incrementar el contador de reproducciones
    const result: QueryResult<Song> = await pool.query(
      'UPDATE songs SET play_count = COALESCE(play_count, 0) + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    const response: APIResponse<Song> = {
      success: true,
      message: 'Reproducción registrada exitosamente',
      data: result.rows[0]
    };

    res.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al registrar reproducción:', errorMessage);

    const errorResponse: APIResponse = {
      success: false,
      message: 'Error al registrar reproducción',
      error: errorMessage
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * Buscar carátula de álbum
 */
export const getCover = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Obtener información de la canción
    const songResult: QueryResult<{ title: string; artist: string }> = await pool.query(
      'SELECT title, artist FROM songs WHERE id = $1',
      [id]
    );

    if (songResult.rows.length === 0) {
      const notFoundResponse: APIResponse = {
        success: false,
        message: 'Canción no encontrada'
      };
      res.status(404).json(notFoundResponse);
      return;
    }

    const { title, artist } = songResult.rows[0];

    // Usar el servicio de búsqueda de carátulas
    const result = await coverArtService.searchCover(artist, title);

    const response: APIResponse = {
      success: true,
      ...result
    };

    res.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al buscar carátula:', errorMessage);

    const errorResponse: APIResponse = {
      success: false,
      message: 'Error al buscar carátula',
      error: errorMessage
    };

    res.status(500).json(errorResponse);
  }
};
