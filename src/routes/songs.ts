import * as express from 'express';
import { Router } from 'express';
import * as songsController from '../controllers/songsController';

const router: Router = express.Router();

// Obtener todas las canciones
router.get('/', songsController.getAllSongs);

// Obtener una canción por ID
router.get('/:id', songsController.getSongById);

// Votar por una canción
router.post('/:id/vote', songsController.voteSong);

// Registrar reproducción
router.post('/:id/play', songsController.registerPlay);

// Obtener carátula de álbum
router.get('/:id/cover', songsController.getCover);

export default router;
