import * as express from 'express';
import { Router } from 'express';
import * as songsController from '../controllers/songsController';
import { validateSongExists } from '../middleware/validateResource';

const router: Router = express.Router();

// Obtener todas las canciones
router.get('/', songsController.getAllSongs);

// Obtener una canción por ID (con validación de existencia)
router.get('/:id', validateSongExists, songsController.getSongById);

// Votar por una canción (con validación de existencia)
router.post('/:id/vote', validateSongExists, songsController.voteSong);

// Registrar reproducción (con validación de existencia)
router.post('/:id/play', validateSongExists, songsController.registerPlay);

// Obtener carátula de álbum (con validación de existencia)
router.get('/:id/cover', validateSongExists, songsController.getCover);

export default router;
