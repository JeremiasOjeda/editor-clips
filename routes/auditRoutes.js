const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// Ruta para crear un nuevo registro de auditoría
router.post('/', auditController.createLog);

// Ruta para obtener todos los registros (con paginación y filtros)
router.get('/', auditController.getLogs);

// Ruta para obtener logs de un video específico
router.get('/video/:videoCode', auditController.getLogsByVideo);

// Ruta para obtener estadísticas
router.get('/stats', auditController.getStats);

// Ruta para exportar logs
router.get('/export', auditController.exportLogs);

// Ruta para eliminar logs antiguos
router.delete('/purge', auditController.purgeLogs);

module.exports = router;