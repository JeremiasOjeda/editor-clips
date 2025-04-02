const mongoose = require('mongoose');

// Esquema flexible para logs de auditoría (puede almacenar diferentes tipos de eventos)
const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'ERROR', 'WARNING', 'INFO'],
    default: 'INFO'
  },
  videoCode: {
    type: String,
    index: true
  },
  videoTitle: String,
  videoUrl: String,
  clipStart: Number,
  clipEnd: Number,
  clipDuration: Number,
  processingMethod: String,
  error: String,
  clientInfo: {
    ip: String,
    userAgent: String,
    platform: String,
    language: String,
    screenSize: String
  },
  // Para almacenar datos adicionales variables según el tipo de acción
  additionalData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas frecuentes
auditLogSchema.index({ action: 1, videoCode: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);