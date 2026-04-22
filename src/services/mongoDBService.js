// URL base para la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Función para verificar la conexión a MongoDB
export const checkMongoDBConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-connection`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al verificar la conexión a MongoDB:', error);
    return { status: 'error', message: error.message };
  }
};

// Función para obtener estadísticas generales de la base de datos
export const getDatabaseStats = async () => {
  try {
    // Obtener estadísticas de clips
    const clipsResponse = await fetch(`${API_BASE_URL}/clips/stats/overview`);
    const clipStats = await clipsResponse.json();

    // Obtener estadísticas de auditoría
    const auditResponse = await fetch(`${API_BASE_URL}/audit/stats`);
    const auditStats = await auditResponse.json();

    return {
      success: true,
      clipStats,
      auditStats
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de la base de datos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para obtener clips de un video específico
export const getClipsByVideoCode = async (videoCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clips/video/${videoCode}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener clips del video');
    }
    
    const clips = await response.json();
    return {
      success: true,
      clips
    };
  } catch (error) {
    console.error(`Error al obtener clips del video ${videoCode}:`, error);
    return {
      success: false,
      error: error.message,
      clips: []
    };
  }
};

// Función para obtener logs de auditoría de un video específico
export const getAuditLogsByVideoCode = async (videoCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/audit/video/${videoCode}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener logs de auditoría del video');
    }
    
    const logs = await response.json();
    return {
      success: true,
      logs
    };
  } catch (error) {
    console.error(`Error al obtener logs de auditoría para el video ${videoCode}:`, error);
    return {
      success: false,
      error: error.message,
      logs: []
    };
  }
};

// Función para crear un nuevo clip en la base de datos
export const createClip = async (clipData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clipData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el clip');
    }
    
    const savedClip = await response.json();
    
    return {
      success: true,
      clip: savedClip
    };
  } catch (error) {
    console.error('Error al crear el clip en la base de datos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para obtener todos los clips (con paginación)
export const getAllClips = async (page = 1, limit = 50) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clips?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener clips');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener todos los clips:', error);
    return {
      success: false,
      error: error.message,
      clips: [],
      pagination: {
        totalClips: 0,
        totalPages: 0,
        currentPage: page,
        limit
      }
    };
  }
};

// Función para sincronizar la base de datos local con MongoDB
export const syncDatabase = async () => {
  try {
    // Esta función podría implementarse si se necesita realizar alguna
    // sincronización especial entre los datos locales y MongoDB
    console.log('Función de sincronización de base de datos no implementada');
    return {
      success: true,
      message: 'No hay acciones de sincronización definidas'
    };
  } catch (error) {
    console.error('Error en la sincronización:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Exportar todas las funciones como un servicio
const mongoDBService = {
  checkMongoDBConnection,
  getDatabaseStats,
  getClipsByVideoCode,
  getAuditLogsByVideoCode,
  createClip,
  getAllClips,
  syncDatabase
};

export default mongoDBService;