/**
 * Servicio para registrar acciones del usuario y datos importantes
 * Ahora usa una API para almacenar los logs en MongoDB
 */

// URL base para la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Función que crea un registro a través de la API
const createLogEntry = async (logData) => {
  try {
    // Fecha y hora actual
    const timestamp = new Date().toISOString();
    
    // Información del navegador/dispositivo
    const userAgent = navigator.userAgent;
    
    // Formatear los datos como una entrada de registro
    const logEntry = {
      timestamp,
      userAgent,
      ...logData
    };
    
    // Enviar a la API
    const response = await fetch(`${API_BASE_URL}/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logEntry)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al guardar log en la API:', errorData);
      
      // Si hay un error, guardar en localStorage como fallback
      saveLogToLocalStorage(logEntry);
      
      return {
        success: false,
        error: errorData.message,
        savedLocally: true
      };
    }
    
    const result = await response.json();
    
    // También guardar en consola para depuración
    console.log('LOG ENTRY (saved to API):', logEntry);
    
    return {
      success: true,
      logEntry: result
    };
  } catch (error) {
    console.error('Error al enviar log a la API:', error);
    
    // Si hay un error de red, guardar en localStorage como fallback
    saveLogToLocalStorage(logData);
    
    return {
      success: false,
      error: error.message,
      savedLocally: true
    };
  }
};

/**
 * Guarda los logs en el almacenamiento local del navegador como fallback
 * cuando la API no está disponible
 */
const saveLogToLocalStorage = (logEntry) => {
  try {
    // Obtener logs existentes
    const existingLogs = JSON.parse(localStorage.getItem('video_editor_logs') || '[]');
    
    // Añadir nuevo log con timestamp si no tiene uno
    if (!logEntry.timestamp) {
      logEntry.timestamp = new Date().toISOString();
    }
    
    // Añadir nuevo log
    existingLogs.push(logEntry);
    
    // Si hay demasiados logs, eliminar los más antiguos
    // Esto es para evitar superar el límite de localStorage (generalmente 5-10MB)
    if (existingLogs.length > 1000) {
      // Mantener solo los 1000 registros más recientes
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    // Guardar logs actualizados
    localStorage.setItem('video_editor_logs', JSON.stringify(existingLogs));
    
    // También guardar en consola para depuración
    console.log('LOG ENTRY (saved to localStorage as fallback):', logEntry);
    
    // Devolver los datos para uso potencial
    return {
      success: true,
      logEntry,
      totalLogs: existingLogs.length
    };
  } catch (error) {
    console.error('Error al guardar log en localStorage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para sincronizar logs locales con la API
export const syncLocalLogs = async () => {
  try {
    const localLogs = JSON.parse(localStorage.getItem('video_editor_logs') || '[]');
    
    if (localLogs.length === 0) {
      return { success: true, message: 'No hay logs locales para sincronizar', syncedCount: 0 };
    }
    
    console.log(`Intentando sincronizar ${localLogs.length} logs locales con la API...`);
    
    let syncedCount = 0;
    let failedCount = 0;
    
    // Enviar cada log a la API
    for (const log of localLogs) {
      try {
        const response = await fetch(`${API_BASE_URL}/audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(log)
        });
        
        if (response.ok) {
          syncedCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }
    }
    
    // Si todos se sincronizaron, limpiar localStorage
    if (failedCount === 0) {
      localStorage.removeItem('video_editor_logs');
      console.log(`Todos los ${syncedCount} logs fueron sincronizados correctamente y eliminados del almacenamiento local.`);
    } else {
      // Si algunos fallaron, mantener solo los que fallaron
      const remainingLogs = localLogs.slice(syncedCount);
      localStorage.setItem('video_editor_logs', JSON.stringify(remainingLogs));
      console.log(`Se sincronizaron ${syncedCount} logs, pero fallaron ${failedCount}. Se mantienen ${remainingLogs.length} logs en almacenamiento local.`);
    }
    
    return {
      success: true,
      syncedCount,
      failedCount,
      remainingCount: failedCount
    };
  } catch (error) {
    console.error('Error al sincronizar logs locales:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función específica para registrar acceso a un video
export const logVideoAccess = async (videoData) => {
  return await createLogEntry({
    action: 'VIDEO_ACCESS',
    videoCode: videoData.code || videoData.id,
    videoTitle: videoData.title,
    videoUrl: videoData.url,
    additionalData: {
      videoDuration: videoData.duration,
      timestamp: new Date().toISOString()
    }
  });
};

// Función para registrar la creación/descarga de un clip
export const logClipCreation = async (videoData, clipStart, clipEnd, processingMethod, status = 'SUCCESS', error = null, additionalData = {}) => {
  const logData = {
    action: 'CLIP_CREATION',
    videoCode: videoData.code || videoData.id,
    videoTitle: videoData.title,
    videoUrl: videoData.url,
    clipStart,
    clipEnd,
    clipDuration: clipEnd - clipStart,
    processingMethod,
    status,
    error,
    additionalData: {
      browserInfo: {
        ffmpegSupported: typeof SharedArrayBuffer !== 'undefined',
        mediaRecorderSupported: typeof MediaRecorder !== 'undefined',
        userAgent: navigator.userAgent
      },
      timestamp: new Date().toISOString(),
      ...additionalData
    }
  };
  
  // Crear entrada de log
  await createLogEntry(logData);
  
  // Si el clip se creó exitosamente, crear también un registro en la colección de clips
  if (status === 'SUCCESS' && !error) {
    try {
      const clipData = {
        videoCode: videoData.code || videoData.id,
        videoTitle: videoData.title,
        clipStart,
        clipEnd,
        processingMethod,
        fileSize: additionalData.fileSize || 0,
        format: additionalData.format || 'video/mp4',
        clientInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      };
      
      // Enviar a la API de clips
      await fetch(`${API_BASE_URL}/clips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clipData)
      });
    } catch (error) {
      console.error('Error al registrar clip en base de datos:', error);
    }
  }
  
  return logData;
};

// Función para registrar errores
export const logError = async (videoData, action, errorMessage, additionalData = {}) => {
  return await createLogEntry({
    action,
    status: 'ERROR',
    error: errorMessage,
    videoCode: videoData?.code || videoData?.id,
    videoTitle: videoData?.title,
    videoUrl: videoData?.url,
    additionalData
  });
};

// Función para obtener todos los logs desde la API
export const getAllLogs = async (page = 1, limit = 100, filter = {}) => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filter
    });
    
    console.log(`Solicitando logs a: ${API_BASE_URL}/audit?${queryParams.toString()}`);
    
    const response = await fetch(`${API_BASE_URL}/audit?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener logs de auditoría');
    }
    
    const data = await response.json();
    console.log("Datos recibidos de la API:", data);
    
    return data;
  } catch (error) {
    console.error('Error al obtener logs:', error);
    
    // Si falla la API, intentar obtener del localStorage como fallback
    try {
      const logs = JSON.parse(localStorage.getItem('video_editor_logs') || '[]');
      return { 
        success: true, 
        logs,
        pagination: {
          totalLogs: logs.length,
          currentPage: 1,
          totalPages: 1
        },
        source: 'localStorage'
      };
    } catch (localError) {
      return { success: false, error: error.message, logs: [] };
    }
  }
};

// Función para exportar logs desde la API
export const exportLogs = async (format = 'json', days = 30, videoCode = null) => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams({
      days,
      format
    });
    
    if (videoCode) {
      queryParams.append('videoCode', videoCode);
    }
    
    const response = await fetch(`${API_BASE_URL}/audit/export?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Error al exportar logs');
    }
    
    const data = await response.json();
    
    // Crear archivo para descargar
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { success: true, count: data.length };
  } catch (error) {
    console.error('Error al exportar logs:', error);
    
    // Si falla, intentar exportar desde localStorage
    try {
      const logs = JSON.parse(localStorage.getItem('video_editor_logs') || '[]');
      
      // Filtrar por videoCode si se proporciona
      const filteredLogs = videoCode 
        ? logs.filter(log => log.videoCode === videoCode) 
        : logs;
      
      // Crear blob y URL para descargar
      const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_editor_logs_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, count: filteredLogs.length, source: 'localStorage' };
    } catch (localError) {
      return { success: false, error: error.message };
    }
  }
};

const loggerService = {
  logVideoAccess,
  logClipCreation,
  logError,
  createLogEntry,
  syncLocalLogs,
  getAllLogs,
  exportLogs
};

export default loggerService;