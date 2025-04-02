const express = require('express');
const router = express.Router();
const clipController = require('../controllers/clipController');

// Ruta para obtener todos los clips
router.get('/', clipController.getAllClips);

// Ruta para obtener clips por código de video
router.get('/video/:videoCode', clipController.getClipsByVideo);

// Ruta para crear un nuevo clip
router.post('/', clipController.createClip);

// Ruta para obtener un clip específico por ID
router.get('/:id', clipController.getClipById);

// Ruta para eliminar un clip
router.delete('/:id', clipController.deleteClip);

// Ruta para obtener estadísticas de clips
router.get('/stats/overview', clipController.getClipStats);

module.exports = router;