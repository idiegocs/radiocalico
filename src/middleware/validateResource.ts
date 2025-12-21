import { Request, Response, NextFunction } from 'express';
import { QueryResult } from 'pg';
import pool from '../config/database';
import { APIResponse } from '../types';

/**
 * Middleware para validar que una canción existe
 *
 * Verifica si el ID de la canción en los parámetros de la ruta existe en la base de datos.
 * Si no existe, devuelve un error 404 y detiene la ejecución.
 * Si existe, permite que la petición continúe al siguiente middleware o controlador.
 *
 * @param req - Request object de Express
 * @param res - Response object de Express
 * @param next - NextFunction para continuar al siguiente middleware
 */
export async function validateSongExists(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar que el ID es un número válido
    const songId = parseInt(id, 10);
    if (isNaN(songId)) {
      const errorResponse: APIResponse = {
        success: false,
        message: 'ID de canción inválido'
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Verificar que la canción existe en la base de datos
    const result: QueryResult<{ id: number }> = await pool.query(
      'SELECT id FROM songs WHERE id = $1',
      [songId]
    );

    if (result.rows.length === 0) {
      const notFoundResponse: APIResponse = {
        success: false,
        message: 'Canción no encontrada'
      };
      res.status(404).json(notFoundResponse);
      return;
    }

    // La canción existe, continuar al siguiente middleware/controlador
    next();
  } catch (error) {
    // Error de base de datos u otro error inesperado
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al validar canción:', errorMessage);

    const errorResponse: APIResponse = {
      success: false,
      message: 'Error al validar la canción',
      error: errorMessage
    };

    res.status(500).json(errorResponse);
  }
}
