const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Ruta para obtener todos los videos
router.get('/', videoController.getAllVideos);

// Ruta para resetear a valores predeterminados
// Esta ruta debe estar antes de la ruta :code para evitar conflictos
router.post('/reset/defaults', videoController.resetToDefaults);

// Ruta para obtener un video por su código
router.get('/:code', videoController.getVideoByCode);

// Ruta para crear un nuevo video
router.post('/', videoController.createVideo);

// Ruta para actualizar un video
router.put('/:code', videoController.updateVideo);

// Ruta para eliminar un video
router.delete('/:code', videoController.deleteVideo);

module.exports = router;  // Mover esto al final del archivo