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
  createdAt: {
    type: Date,
    default: Date.now
  },
  clientInfo: {
    ip: String,
    userAgent: String,
    platform: String
  }
}, { 
  timestamps: true 
});

// Para añadir a la API, agrega estas rutas en tu server.js después de la conexión a MongoDB

/*
// Importar modelo
const VideoClip = require('./models/videoClip');

// Ruta para guardar un clip de video
app.post('/api/clips', async (req, res) => {
  try {
    const clipData = req.body;
    const newClip = new VideoClip(clipData);
    const savedClip = await newClip.save();
    res.status(201).json(savedClip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ruta para obtener todos los clips
app.get('/api/clips', async (req, res) => {
  try {
    const clips = await VideoClip.find().sort({ createdAt: -1 });
    res.status(200).json(clips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para obtener clips por código de video
app.get('/api/clips/video/:videoCode', async (req, res) => {
  try {
    const clips = await VideoClip.find({ videoCode: req.params.videoCode }).sort({ createdAt: -1 });
    res.status(200).json(clips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/

module.exports = mongoose.model('VideoClip', videoClipSchema);