// Servicio para manejar la obtención de videos
// Usa localStorage para persistir los videos añadidos dinámicamente

// Videos de ejemplo de dominio público (predeterminados)
const DEFAULT_VIDEOS = {
  'test': {
    id: 'test',
    title: 'Video Test (pequeño)',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1741813694/Videos%20del%20Recinto/cgg12e807zcnzyiayois.mp4',
    duration: 24, // 24 segundos
    thumbnail: '',
    isDefault: true
  },
  'demo1': {
    id: 'demo1',
    title: 'Demo Largo Explicación',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/-CPBR11_-_Palco_Makers_-_01-02-2018_01-00_-_01-45_-_O_movimento_maker_no_interior_de_SP_%E2%80%93.webm',
    duration: 2529, // 42:09 en segundos
    thumbnail: '',
    isDefault: true
  },
  'demo2': {
    id: 'demo2',
    title: 'Elephant Dream (Sample)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653, // 10:53 en segundos
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/800px-Elephants_Dream_s5_both.jpg',
    isDefault: true
  },
  'demo3': {
    id: 'demo3',
    title: 'Grabacion de partido',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1741812770/Videos%20del%20Recinto/w8idxnxya7qmbgbwtfc5.mp4',
    duration: 28, // 00:28 en segundos
    thumbnail: '',
    isDefault: true
  },
  'demo4': {
    id: 'demo4',
    title: 'Grabacion de partido 2',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1741813693/Videos%20del%20Recinto/tiscx94szyl6u4ysuhhn.mp4',
    duration: 13, // 12:14 en segundos
    thumbnail: '',
    isDefault: true
  },
  'demo5': {
    id: 'demo5',
    title: 'Grabacion de partido de hoy',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1743190450/partido28-03_para_subir_exhnvb.mp4',
    duration: 7200, // 2 horas en segundos
    thumbnail: '',
    isDefault: true
  }
};

// Clave para el localStorage
const VIDEOS_STORAGE_KEY = 'editor_clips_videos';

// Función para cargar todos los videos (predeterminados + los agregados por el administrador)
const loadAllVideos = () => {
  try {
    // Intentar obtener videos guardados
    const savedVideosJSON = localStorage.getItem(VIDEOS_STORAGE_KEY);
    const savedVideos = savedVideosJSON ? JSON.parse(savedVideosJSON) : {};
    
    // Combinar con los videos predeterminados (los guardados tienen prioridad)
    return { ...DEFAULT_VIDEOS, ...savedVideos };
  } catch (error) {
    console.error('Error al cargar videos desde localStorage:', error);
    return { ...DEFAULT_VIDEOS };
  }
};

// Cargar videos al iniciar
let VIDEOS_CACHE = loadAllVideos();

// Función para guardar la caché actual en localStorage
const saveVideosToStorage = () => {
  try {
    // Filtramos para guardar solo los videos añadidos (no los predeterminados)
    const customVideos = {};
    
    Object.keys(VIDEOS_CACHE).forEach(code => {
      if (!VIDEOS_CACHE[code].isDefault) {
        customVideos[code] = VIDEOS_CACHE[code];
      }
    });
    
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(customVideos));
    return true;
  } catch (error) {
    console.error('Error al guardar videos en localStorage:', error);
    return false;
  }
};

// Función para obtener un video por su código
export const getVideoByCode = (code) => {
  // En una aplicación real, esto haría una petición a una API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const video = VIDEOS_CACHE[code];
      if (video) {
        console.log(`Video encontrado para código ${code}:`, video);
        resolve(video);
      } else {
        console.error(`No se encontró ningún video con el código: ${code}`);
        reject(new Error(`No se encontró ningún video con el código: ${code}`));
      }
    }, 500); // Simula un pequeño retraso de red
  });
};

// Función para obtener todos los códigos válidos
export const getValidCodes = () => {
  return Object.keys(VIDEOS_CACHE);
};

// Función para obtener todos los videos (para el panel de administración)
export const getAllVideos = () => {
  return { ...VIDEOS_CACHE };
};

// Función para añadir un nuevo video (desde el panel de administración)
export const addVideo = (code, title, url, duration, thumbnail = '') => {
  // Validar parámetros
  if (!code || !title || !url) {
    throw new Error('Se requieren código, título y URL para añadir un video.');
  }
  
  // Normalizar el código (eliminar espacios, convertir a minúsculas)
  const normalizedCode = code.trim().toLowerCase().replace(/\s+/g, '_');
  
  // Verificar si ya existe un video con ese código
  if (VIDEOS_CACHE[normalizedCode]) {
    throw new Error(`Ya existe un video con el código: ${normalizedCode}`);
  }
  
  // Crear el nuevo video
  const newVideo = {
    id: normalizedCode,
    title: title.trim(),
    url: url.trim(),
    duration: parseInt(duration) || 0,
    thumbnail: thumbnail.trim(),
    isDefault: false,
    addedAt: new Date().toISOString()
  };
  
  // Añadir a la caché
  VIDEOS_CACHE[normalizedCode] = newVideo;
  
  // Guardar en localStorage
  saveVideosToStorage();
  
  return newVideo;
};

// Función para eliminar un video (desde el panel de administración)
export const removeVideo = (code) => {
  // Verificar si existe
  if (!VIDEOS_CACHE[code]) {
    throw new Error(`No existe un video con el código: ${code}`);
  }
  
  // No permitir eliminar videos predeterminados
  if (VIDEOS_CACHE[code].isDefault) {
    throw new Error(`No se pueden eliminar videos predeterminados: ${code}`);
  }
  
  // Eliminar de la caché
  const deletedVideo = VIDEOS_CACHE[code];
  delete VIDEOS_CACHE[code];
  
  // Guardar en localStorage
  saveVideosToStorage();
  
  return deletedVideo;
};

// Función para actualizar un video existente
export const updateVideo = (code, updates) => {
  // Verificar si existe
  if (!VIDEOS_CACHE[code]) {
    throw new Error(`No existe un video con el código: ${code}`);
  }
  
  // No permitir cambiar el ID en videos predeterminados
  if (VIDEOS_CACHE[code].isDefault && updates.id && updates.id !== code) {
    throw new Error(`No se puede cambiar el ID de videos predeterminados: ${code}`);
  }
  
  // Actualizar propiedades
  const updatedVideo = {
    ...VIDEOS_CACHE[code],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  // Si se cambió el ID, eliminar el antiguo y añadir con el nuevo ID
  if (updates.id && updates.id !== code) {
    delete VIDEOS_CACHE[code];
    VIDEOS_CACHE[updates.id] = updatedVideo;
  } else {
    VIDEOS_CACHE[code] = updatedVideo;
  }
  
  // Guardar en localStorage
  saveVideosToStorage();
  
  return updatedVideo;
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
export const resetToDefaults = () => {
  VIDEOS_CACHE = { ...DEFAULT_VIDEOS };
  localStorage.removeItem(VIDEOS_STORAGE_KEY);
  return VIDEOS_CACHE;
};

// Exportar todas las funciones para uso en el panel de administración
export default {
  getVideoByCode,
  getValidCodes,
  getAllVideos,
  addVideo,
  removeVideo,
  updateVideo,
  estimateVideoDuration,
  resetToDefaults
};