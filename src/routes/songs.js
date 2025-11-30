const express = require('express');
const router = express.Router();
const songsController = require('../controllers/songsController');

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

module.exports = router;
