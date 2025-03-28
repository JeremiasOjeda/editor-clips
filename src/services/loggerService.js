
/**
 * Servicio para registrar acciones del usuario y datos importantes
 * en archivos de texto para auditoría
 */

// Función que crea un registro en formato texto
const createLogEntry = (logData) => {
    // Fecha y hora actual
    const timestamp = new Date().toISOString();
    
    // Obtener la IP del cliente (en entorno real se obtendría del request)
    // En navegador usamos una función placeholder que debe ser reemplazada en el servidor
    const userIP = getUserIP();
    
    // Información del navegador/dispositivo
    const userAgent = navigator.userAgent;
    
    // Formatear los datos como una entrada de registro
    const logEntry = {
      timestamp,
      userIP,
      userAgent,
      ...logData
    };
    
    // En frontend solo podemos simular la escritura del log
    // Esta función debe ser reemplazada por una llamada a API en producción
    return saveLogToFile(logEntry);
  };
  
  /**
   * Función placeholder para obtener la IP del usuario
   * En un entorno real, la IP estaría disponible en el servidor
   * y no se podría obtener de manera confiable en el cliente
   */
  const getUserIP = () => {
    // Placeholder - en una aplicación real la IP sería capturada por el servidor
    return "CLIENT_IP_UNKNOWN";
  };
  
  /**
   * Guarda los logs en el almacenamiento local del navegador
   * Solución temporal hasta implementar un backend
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
      console.log('LOG ENTRY:', logEntry);
      
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
  
  /**
   * Función para guardar el log
   * En producción, esta función sería reemplazada por una llamada a API
   * que guardaría los datos en un archivo o base de datos en el servidor
   */
  const saveLogToFile = (logEntry) => {
    // Convertir a formato texto amigable
    const logText = formatLogEntryForTxt(logEntry);
    
    // En desarrollo, guardamos en localStorage y mostramos en consola
    console.log('LOG ENTRY (saved to localStorage):', logText);
    
    // Guardar en localStorage
    saveLogToLocalStorage(logEntry);
    
    // Devolver los datos del log para uso potencial
    return {
      success: true,
      logEntry,
      formattedText: logText
    };
  };
  
  /**
   * Formatea una entrada de log para archivo de texto
   */
  const formatLogEntryForTxt = (logEntry) => {
    // Crear una cadena de texto con formato para archivo .txt
    let logLines = [
      `===== LOG ENTRY: ${logEntry.timestamp} =====`,
      `IP: ${logEntry.userIP}`,
      `USER-AGENT: ${logEntry.userAgent}`,
    ];
    
    // Agregar información del video si existe
    if (logEntry.videoCode) {
      logLines.push(`VIDEO CODE: ${logEntry.videoCode}`);
    }
    
    if (logEntry.videoTitle) {
      logLines.push(`VIDEO TITLE: ${logEntry.videoTitle}`);
    }
    
    if (logEntry.videoUrl) {
      logLines.push(`VIDEO URL: ${logEntry.videoUrl}`);
    }
    
    // Agregar información del clip si existe
    if (logEntry.clipStart !== undefined && logEntry.clipEnd !== undefined) {
      logLines.push(`CLIP START: ${logEntry.clipStart}s`);
      logLines.push(`CLIP END: ${logEntry.clipEnd}s`);
      logLines.push(`CLIP DURATION: ${(logEntry.clipEnd - logEntry.clipStart).toFixed(2)}s`);
    }
    
    // Agregar información adicional
    if (logEntry.action) {
      logLines.push(`ACTION: ${logEntry.action}`);
    }
    
    if (logEntry.status) {
      logLines.push(`STATUS: ${logEntry.status}`);
    }
    
    if (logEntry.processingMethod) {
      logLines.push(`PROCESSING METHOD: ${logEntry.processingMethod}`);
    }
    
    if (logEntry.error) {
      logLines.push(`ERROR: ${logEntry.error}`);
    }
    
    // Agregar datos adicionales si existen
    if (logEntry.additionalData) {
      logLines.push('ADDITIONAL DATA:');
      for (const [key, value] of Object.entries(logEntry.additionalData)) {
        logLines.push(`  ${key}: ${value}`);
      }
    }
    
    // Agregar línea final
    logLines.push('='.repeat(40));
    
    // Unir todas las líneas con saltos de línea
    return logLines.join('\n');
  };
  
  // Función específica para registrar acceso a un video
  export const logVideoAccess = (videoData) => {
    return createLogEntry({
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
  export const logClipCreation = (videoData, clipStart, clipEnd, processingMethod, status = 'SUCCESS', error = null, additionalData = {}) => {
    return createLogEntry({
      action: 'CLIP_CREATION',
      videoCode: videoData.code || videoData.id,
      videoTitle: videoData.title,
      videoUrl: videoData.url,
      clipStart,
      clipEnd,
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
    });
  };
  
  // Función para registrar errores
  export const logError = (videoData, action, errorMessage, additionalData = {}) => {
    return createLogEntry({
      action,
      status: 'ERROR',
      error: errorMessage,
      videoCode: videoData?.code || videoData?.id,
      videoTitle: videoData?.title,
      videoUrl: videoData?.url,
      additionalData
    });
  };
  
  // Función para exportar todos los logs a un archivo de texto
  export const exportLogsToFile = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('video_editor_logs') || '[]');
      
      if (logs.length === 0) {
        return { success: false, message: 'No hay logs para exportar' };
      }
      
      // Convertir logs a formato texto
      const logTexts = logs.map(log => formatLogEntryForTxt(log));
      const allLogsText = logTexts.join('\n\n');
      
      // Crear blob y URL para descargar
      const blob = new Blob([allLogsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Crear elemento anchor para descargar
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_editor_logs_${new Date().toISOString().replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar
      URL.revokeObjectURL(url);
      
      return { success: true, count: logs.length };
    } catch (error) {
      console.error('Error al exportar logs:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Función para borrar todos los logs almacenados
  export const clearAllLogs = () => {
    try {
      localStorage.removeItem('video_editor_logs');
      return { success: true };
    } catch (error) {
      console.error('Error al borrar logs:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Función para obtener todos los logs almacenados
  export const getAllLogs = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('video_editor_logs') || '[]');
      return { success: true, logs };
    } catch (error) {
      console.error('Error al obtener logs:', error);
      return { success: false, error: error.message, logs: [] };
    }
  };
  
  const loggerService = {
    logVideoAccess,
    logClipCreation,
    logError,
    createLogEntry,
    exportLogsToFile,
    clearAllLogs,
    getAllLogs
  };
  
  export default loggerService;
  