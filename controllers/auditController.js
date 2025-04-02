const AuditLog = require('../models/auditLog');

// Crear un nuevo registro de auditoría
exports.createLog = async (req, res) => {
  try {
    // Obtener información del cliente
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Combinar datos del cuerpo con información del cliente
    const logData = {
      ...req.body,
      clientInfo: {
        ip: clientIp,
        userAgent: req.headers['user-agent'],
        ...req.body.clientInfo // Mantener cualquier dato adicional enviado
      }
    };
    
    const newLog = new AuditLog(logData);
    const savedLog = await newLog.save();
    
    res.status(201).json(savedLog);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el registro de auditoría', error: error.message });
  }
};

// Obtener todos los registros de auditoría (con paginación)
exports.getLogs = async (req, res) => {
  try {
    const { videoCode, action, limit = 100, page = 1, sort = 'desc' } = req.query;
    
    // Construir el filtro
    const filter = {};
    if (videoCode) filter.videoCode = videoCode;
    if (action) filter.action = action;
    
    // Calcular skip para paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Realizar la consulta
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: sort === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Obtener el conteo total para metadatos de paginación
    const totalLogs = await AuditLog.countDocuments(filter);
    
    res.status(200).json({
      logs,
      pagination: {
        totalLogs,
        totalPages: Math.ceil(totalLogs / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registros de auditoría', error: error.message });
  }
};

// Obtener logs para un video específico
exports.getLogsByVideo = async (req, res) => {
  try {
    const { videoCode } = req.params;
    const logs = await AuditLog.find({ videoCode }).sort({ timestamp: -1 });
    
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener logs del video', error: error.message });
  }
};

// Obtener estadísticas generales de auditoría
exports.getStats = async (req, res) => {
  try {
    // Total de logs
    const totalLogs = await AuditLog.countDocuments();
    
    // Logs por tipo de acción
    const actionStats = await AuditLog.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Videos más accedidos
    const topVideos = await AuditLog.aggregate([
      { $match: { action: "VIDEO_ACCESS" } },
      { $group: { _id: "$videoCode", title: { $first: "$videoTitle" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Errores recientes
    const recentErrors = await AuditLog.find({ status: "ERROR" })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('timestamp action videoCode error');
    
    res.status(200).json({
      totalLogs,
      actionStats,
      topVideos,
      recentErrors
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Exportar logs a JSON (para descargar)
exports.exportLogs = async (req, res) => {
  try {
    const { videoCode, days = 30 } = req.query;
    
    const filter = {};
    if (videoCode) filter.videoCode = videoCode;
    
    // Si se especifica un número de días, filtrar por fecha
    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      filter.timestamp = { $gte: daysAgo };
    }
    
    const logs = await AuditLog.find(filter).sort({ timestamp: -1 });
    
    // Configurar headers para descarga de archivo
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${new Date().toISOString().slice(0,10)}.json`);
    
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al exportar logs', error: error.message });
  }
};

// Eliminar logs antiguos (solo accesible para administradores)
exports.purgeLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    
    if (days < 7) {
      return res.status(400).json({ message: 'El período mínimo de retención es de 7 días' });
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await AuditLog.deleteMany({ timestamp: { $lt: cutoffDate } });
    
    res.status(200).json({ 
      message: `Se han eliminado los logs anteriores a ${cutoffDate.toISOString().split('T')[0]}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al purgar logs', error: error.message });
  }
};