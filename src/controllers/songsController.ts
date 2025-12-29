import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../config/database';
import coverArtService from '../services/coverArtService';
import { Song, APIResponse } from '../types';
import { log } from '../config/logger';

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
    log.error('Error al obtener canciones', error);

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
 * Nota: La validación de existencia se realiza en el middleware validateSongExists
 */
export const getSongById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result: QueryResult<Song> = await pool.query(
      'SELECT * FROM songs WHERE id = $1',
      [id]
    );

    const response: APIResponse<Song> = {
      success: true,
      data: result.rows[0]
    };

    res.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Error al obtener canción', error, { songId: id });

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
 * Nota: La validación de existencia se realiza en el middleware validateSongExists
 */
export const voteSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

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
    log.error('Error al votar por canción', error, { songId: id });

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
 * Nota: La validación de existencia se realiza en el middleware validateSongExists
 */
export const registerPlay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

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
    log.error('Error al registrar reproducción', error, { songId: id });

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
 * Nota: La validación de existencia se realiza en el middleware validateSongExists
 */
export const getCover = async (req: Request, res: Response): Promise<void> => {
  let title: string | undefined;
  let artist: string | undefined;

  try {
    const { id } = req.params;

    // Obtener información de la canción
    const songResult: QueryResult<{ title: string; artist: string }> = await pool.query(
      'SELECT title, artist FROM songs WHERE id = $1',
      [id]
    );

    title = songResult.rows[0]?.title;
    artist = songResult.rows[0]?.artist;

    // Usar el servicio de búsqueda de carátulas
    const result = await coverArtService.searchCover(artist!, title!);

    const response: APIResponse = {
      success: true,
      ...result
    };

    res.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Error al buscar carátula', error, { artist, title });

    const errorResponse: APIResponse = {
      success: false,
      message: 'Error al buscar carátula',
      error: errorMessage
    };

    res.status(500).json(errorResponse);
  }
};
