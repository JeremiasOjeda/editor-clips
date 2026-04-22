// Servicio para manejar la obtención de videos
// Usa API para obtener los videos desde MongoDB

// URL base para la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Videos en caché para rendimiento
let VIDEOS_CACHE = {};

// Función para obtener un video por su código
export const getVideoByCode = async (code) => {
  try {
    // Buscar en caché primero
    if (VIDEOS_CACHE[code]) {
      console.log(`Video encontrado en caché para código ${code}:`, VIDEOS_CACHE[code]);
      return VIDEOS_CACHE[code];
    }

    console.log(`Solicitando video con código ${code} a la API...`);
    const response = await fetch(`${API_BASE_URL}/videos/${code}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `No se encontró ningún video con el código: ${code}`);
    }
    
    const video = await response.json();
    
    // Guardar en caché para futuras solicitudes
    VIDEOS_CACHE[code] = video;
    
    console.log(`Video obtenido de la API para código ${code}:`, video);
    return video;
  } catch (error) {
    console.error(`Error al obtener el video con código ${code}:`, error);
    throw error;
  }
};

// Función para obtener todos los videos (para el panel de administración)
export const getAllVideos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener los videos');
    }
    
    const videos = await response.json();
    
    // Actualizar caché
    VIDEOS_CACHE = { ...videos };
    
    return videos;
  } catch (error) {
    console.error('Error al obtener todos los videos:', error);
    // Si hay un error de conexión, intentar usar la caché
    if (Object.keys(VIDEOS_CACHE).length > 0) {
      console.log('Usando videos en caché debido a un error de conexión');
      return { ...VIDEOS_CACHE };
    }
    throw error;
  }
};

// Función para añadir un nuevo video (desde el panel de administración)
export const addVideo = async (code, title, url, duration, thumbnail = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        title,
        url,
        duration: parseInt(duration) || 0,
        thumbnail
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al añadir el video');
    }
    
    const newVideo = await response.json();
    
    // Actualizar caché
    VIDEOS_CACHE[newVideo.id] = newVideo;
    
    return newVideo;
  } catch (error) {
    console.error('Error al añadir el video:', error);
    throw error;
  }
};

// Función para eliminar un video (desde el panel de administración)
export const removeVideo = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${code}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al eliminar el video con código ${code}`);
    }
    
    const result = await response.json();
    
    // Eliminar de la caché
    if (VIDEOS_CACHE[code]) {
      delete VIDEOS_CACHE[code];
    }
    
    return result.deletedVideo;
  } catch (error) {
    console.error('Error al eliminar el video:', error);
    throw error;
  }
};

// Función para actualizar un video existente
export const updateVideo = async (code, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${code}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al actualizar el video con código ${code}`);
    }
    
    const updatedVideo = await response.json();
    
    // Actualizar caché
    VIDEOS_CACHE[updatedVideo.id] = updatedVideo;
    
    return updatedVideo;
  } catch (error) {
    console.error('Error al actualizar el video:', error);
    throw error;
  }
};

// Función para estimar la duración de un video a partir de su URL
// Esto es un placeholder - en una implementación real, podrías usar la API de mediainfo.js o similar
export const estimateVideoDuration = async (url) => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.style.display = 'none';
      video.crossOrigin = 'anonymous';
      
      // Evento cuando los metadatos estén cargados
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        const duration = Math.round(video.duration);
        video.remove();
        resolve(duration);
      };
      
      // Evento de error
      video.onerror = () => {
        video.remove();
        reject(new Error('No se pudo cargar el video para obtener su duración'));
      };
      
      // Establecer un timeout por si los metadatos nunca cargan
      const timeout = setTimeout(() => {
        video.remove();
        resolve(0); // Valor predeterminado
      }, 5000);
      
      // Iniciar carga
      video.src = url;
      document.body.appendChild(video);
      
    } catch (error) {
      reject(error);
    }
  });
};

// Función para reiniciar a los valores predeterminados (para el panel de admin)
export const resetToDefaults = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/reset/defaults`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al restablecer los videos');
    }
    
    // Limpiar caché y volver a cargar videos
    VIDEOS_CACHE = {};
    return await getAllVideos();
  } catch (error) {
    console.error('Error al restablecer los videos:', error);
    throw error;
  }
};

const videoService = {
  getVideoByCode,
  getAllVideos,
  addVideo,
  removeVideo,
  updateVideo,
  estimateVideoDuration,
  resetToDefaults
};

export default videoService;