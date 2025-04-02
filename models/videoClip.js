const mongoose = require('mongoose');

// Esquema para clips de video
const videoClipSchema = new mongoose.Schema({
  videoCode: {
    type: String,
    required: true,
    index: true
  },
  videoTitle: {
    type: String,
    required: true
  },
  clipStart: {
    type: Number,
    required: true
  },
  clipEnd: {
    type: Number,
    required: true
  },
  createdBy: {
    type: String,
    default: 'anonymous'
  },
  processingMethod: {
    type: String,
    enum: ['FFMPEG', 'URL_PARAMETERS', 'MEDIA_RECORDER', 'ALTERNATIVE'],
    default: 'URL_PARAMETERS'
  },
  clientInfo: {
    ip: String,
    userAgent: String,
    platform: String
  },
  downloadSuccess: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: Number,
    default: 0
  },
  format: {
    type: String,
    default: 'video/mp4'
  },
  notes: String
}, { 
  timestamps: true 
});

// Crear índices para consultas frecuentes
videoClipSchema.index({ videoCode: 1, createdAt: -1 });
videoClipSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VideoClip', videoClipSchema);