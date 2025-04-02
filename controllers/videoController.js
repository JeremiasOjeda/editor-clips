const Video = require('../models/video');

// Datos de videos predeterminados que se cargarán si se reinicia
const DEFAULT_VIDEOS = [
  {
    code: 'test',
    title: 'Video Test (pequeño)',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1741813694/Videos%20del%20Recinto/cgg12e807zcnzyiayois.mp4',
    duration: 24,
    thumbnail: '',
    isDefault: true
  },
  {
    code: 'demo1',
    title: 'Demo Largo Explicación',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/-CPBR11_-_Palco_Makers_-_01-02-2018_01-00_-_01-45_-_O_movimento_maker_no_interior_de_SP_%E2%80%93.webm',
    duration: 2529,
    thumbnail: '',
    isDefault: true
  },
  {
    code: 'demo2',
    title: 'Elephant Dream (Sample)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/800px-Elephants_Dream_s5_both.jpg',
    isDefault: true
  },
  {
    code: 'demo3',
    title: 'Grabacion de partido',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1741812770/Videos%20del%20Recinto/w8idxnxya7qmbgbwtfc5.mp4',
    duration: 28,
    thumbnail: '',
    isDefault: true
  },
  {
    code: 'demo4',
    title: 'Grabacion de partido 2',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1741813693/Videos%20del%20Recinto/tiscx94szyl6u4ysuhhn.mp4',
    duration: 13,
    thumbnail: '',
    isDefault: true
  },
  {
    code: 'demo5',
    title: 'Grabacion de partido de hoy',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1743190450/partido28-03_para_subir_exhnvb.mp4',
    duration: 7200,
    thumbnail: '',
    isDefault: true
  }
];

// Obtener todos los videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    
    // Transformar a formato de objeto con código como clave (para compatibilidad con frontend)
    const videosObject = {};
    videos.forEach(video => {
      videosObject[video.code] = {
        id: video.code,
        title: video.title,
        url: video.url,
        duration: video.duration,
        thumbnail: video.thumbnail,
        isDefault: video.isDefault
      };
    });
    
    res.status(200).json(videosObject);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener videos', error: error.message });
  }
};

// Obtener un video por su código
exports.getVideoByCode = async (req, res) => {
  try {
    const video = await Video.findOne({ code: req.params.code });
    
    if (!video) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }
    
    // Formato para mantener compatibilidad con frontend
    res.status(200).json({
      id: video.code,
      title: video.title,
      url: video.url,
      duration: video.duration,
      thumbnail: video.thumbnail,
      isDefault: video.isDefault
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el video', error: error.message });
  }
};

// Crear un nuevo video
exports.createVideo = async (req, res) => {
  try {
    const { code, title, url, duration, thumbnail } = req.body;
    
    // Validar datos obligatorios
    if (!code || !title || !url) {
      return res.status(400).json({ message: 'Se requiere código, título y URL' });
    }
    
    // Verificar si ya existe un video con ese código
    const existingVideo = await Video.findOne({ code });
    if (existingVideo) {
      return res.status(400).json({ message: `Ya existe un video con el código: ${code}` });
    }
    
    // Crear nuevo video
    const newVideo = new Video({
      code,
      title,
      url,
      duration: parseInt(duration) || 0,
      thumbnail: thumbnail || '',
      isDefault: false
    });
    
    const savedVideo = await newVideo.save();
    
    res.status(201).json({
      id: savedVideo.code,
      title: savedVideo.title,
      url: savedVideo.url,
      duration: savedVideo.duration,
      thumbnail: savedVideo.thumbnail,
      isDefault: savedVideo.isDefault
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el video', error: error.message });
  }
};

// Actualizar un video existente
exports.updateVideo = async (req, res) => {
  try {
    const { code } = req.params;
    const { title, url, duration, thumbnail } = req.body;
    
    // Buscar video existente
    const video = await Video.findOne({ code });
    
    if (!video) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }
    
    // No permitir modificar videos predeterminados (excepto ciertos campos)
    if (video.isDefault) {
      // Solo permitir actualizar duración y thumbnail para videos predeterminados
      video.duration = parseInt(duration) || video.duration;
      video.thumbnail = thumbnail || video.thumbnail;
    } else {
      // Actualizar todos los campos para videos no predeterminados
      video.title = title || video.title;
      video.url = url || video.url;
      video.duration = parseInt(duration) || video.duration;
      video.thumbnail = thumbnail || video.thumbnail;
    }
    
    video.updatedAt = Date.now();
    const updatedVideo = await video.save();
    
    res.status(200).json({
      id: updatedVideo.code,
      title: updatedVideo.title,
      url: updatedVideo.url,
      duration: updatedVideo.duration, 
      thumbnail: updatedVideo.thumbnail,
      isDefault: updatedVideo.isDefault
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el video', error: error.message });
  }
};

// Eliminar un video
exports.deleteVideo = async (req, res) => {
  try {
    const { code } = req.params;
    
    const video = await Video.findOne({ code });
    
    if (!video) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }
    
    // No permitir eliminar videos predeterminados
    if (video.isDefault) {
      return res.status(400).json({ message: 'No se pueden eliminar videos predeterminados' });
    }
    
    await Video.deleteOne({ code });
    
    res.status(200).json({ 
      message: 'Video eliminado correctamente', 
      deletedVideo: {
        id: video.code,
        title: video.title
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el video', error: error.message });
  }
};

// Resetear a valores predeterminados
exports.resetToDefaults = async (req, res) => {
  try {
    // Eliminar todos los videos excepto los predeterminados
    await Video.deleteMany({ isDefault: false });
    
    // Verificar si existen los videos predeterminados
    const defaultVideosCount = await Video.countDocuments({ isDefault: true });
    
    // Si no hay videos predeterminados, cargarlos
    if (defaultVideosCount === 0) {
      await Video.insertMany(DEFAULT_VIDEOS);
    }
    
    res.status(200).json({ message: 'Videos restablecidos a valores predeterminados' });
  } catch (error) {
    res.status(500).json({ message: 'Error al restablecer videos', error: error.message });
  }
};

// Inicializar videos predeterminados si no existen
exports.initializeDefaultVideos = async () => {
  try {
    const count = await Video.countDocuments();
    
    if (count === 0) {
      console.log('Cargando videos predeterminados...');
      await Video.insertMany(DEFAULT_VIDEOS);
      console.log('Videos predeterminados cargados correctamente');
    }
  } catch (error) {
    console.error('Error al inicializar videos predeterminados:', error);
  }
};