const VideoClip = require('../models/videoClip');

// Obtener todos los clips
exports.getAllClips = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    // Calcular skip para paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const clips = await VideoClip.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Obtener el conteo total para metadatos de paginación
    const totalClips = await VideoClip.countDocuments();
    
    res.status(200).json({
      clips,
      pagination: {
        totalClips,
        totalPages: Math.ceil(totalClips / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clips', error: error.message });
  }
};

// Obtener clips por código de video
exports.getClipsByVideo = async (req, res) => {
  try {
    const { videoCode } = req.params;
    
    const clips = await VideoClip.find({ videoCode })
      .sort({ createdAt: -1 });
    
    res.status(200).json(clips);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clips por video', error: error.message });
  }
};

// Crear un nuevo clip
exports.createClip = async (req, res) => {
  try {
    // Obtener información del cliente
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    const clipData = {
      ...req.body,
      clientInfo: {
        ip: clientIp,
        userAgent: req.headers['user-agent'],
        platform: req.body.clientInfo?.platform || '',
        ...req.body.clientInfo
      }
    };
    
    // Validar datos requeridos
    if (!clipData.videoCode || !clipData.videoTitle || 
        clipData.clipStart === undefined || clipData.clipEnd === undefined) {
      return res.status(400).json({ 
        message: 'Se requieren videoCode, videoTitle, clipStart y clipEnd' 
      });
    }
    
    const newClip = new VideoClip(clipData);
    const savedClip = await newClip.save();
    
    res.status(201).json(savedClip);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el clip', error: error.message });
  }
};

// Obtener un clip específico por ID
exports.getClipById = async (req, res) => {
  try {
    const clip = await VideoClip.findById(req.params.id);
    
    if (!clip) {
      return res.status(404).json({ message: 'Clip no encontrado' });
    }
    
    res.status(200).json(clip);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el clip', error: error.message });
  }
};

// Eliminar un clip
exports.deleteClip = async (req, res) => {
  try {
    const clip = await VideoClip.findById(req.params.id);
    
    if (!clip) {
      return res.status(404).json({ message: 'Clip no encontrado' });
    }
    
    await VideoClip.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Clip eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el clip', error: error.message });
  }
};

// Obtener estadísticas de clips
exports.getClipStats = async (req, res) => {
  try {
    // Total de clips
    const totalClips = await VideoClip.countDocuments();
    
    // Clips por método de procesamiento
    const processingMethodStats = await VideoClip.aggregate([
      { $group: { _id: "$processingMethod", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Videos con más clips
    const videosWithMostClips = await VideoClip.aggregate([
      { $group: { 
        _id: "$videoCode", 
        title: { $first: "$videoTitle" }, 
        count: { $sum: 1 },
        averageDuration: { $avg: { $subtract: ["$clipEnd", "$clipStart"] } } 
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Clips más recientes
    const recentClips = await VideoClip.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('videoCode videoTitle clipStart clipEnd createdAt');
    
    res.status(200).json({
      totalClips,
      processingMethodStats,
      videosWithMostClips,
      recentClips
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};