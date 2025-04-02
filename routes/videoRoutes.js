const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Ruta para obtener todos los videos
router.get('/', videoController.getAllVideos);

// Ruta para obtener un video por su código
router.get('/:code', videoController.getVideoByCode);

// Ruta para crear un nuevo video
router.post('/', videoController.createVideo);

// Ruta para actualizar un video
router.put('/:code', videoController.updateVideo);

// Ruta para eliminar un video
router.delete('/:code', videoController.deleteVideo);

// Ruta para resetear a valores predeterminados
router.post('/reset/defaults', videoController.resetToDefaults);

module.exports = router;