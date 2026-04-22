/**
 * Descarga un fragmento de video usando el método más simple posible:
 * abrir una nueva ventana con los parámetros de tiempo en la URL.
 * 
 * @param {string} videoUrl - URL del video original
 * @param {number} startTime - Tiempo de inicio en segundos
 * @param {number} endTime - Tiempo de fin en segundos
 * @param {string} title - Título para el archivo descargado
 */
export const downloadVideoSegment = (videoUrl, startTime, endTime, title = 'clip') => {
    try {
      // Construir URL con parámetros de tiempo
      const separator = videoUrl.includes('?') ? '&' : '#';
      const clipUrl = `${videoUrl}${separator}t=${startTime},${endTime}`;
      
      // Formatear nombre de archivo seguro
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${safeTitle}_${formatTimeForFilename(startTime)}-${formatTimeForFilename(endTime)}.mp4`;
      
      // Crear elemento de enlace para descarga
      const a = document.createElement('a');
      a.href = clipUrl;
      a.download = fileName; // Esto puede no funcionar para videos cross-origin
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      
      // Intentar descargar directamente (puede fallar por restricciones de CORS)
      try {
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        return true;
      } catch (err) {
        console.warn('Error en descarga directa:', err);
        
        // Plan B: Abrir en nueva ventana
        window.open(clipUrl, '_blank');
        return true;
      }
    } catch (error) {
      console.error('Error al descargar segmento:', error);
      return false;
    }
  };
  
  /**
   * Abre el video en una nueva ventana/pestaña posicionado 
   * en el tiempo de inicio especificado
   */
  export const openVideoSegment = (videoUrl, startTime, endTime) => {
    try {
      // Construir URL con parámetros de tiempo
      const separator = videoUrl.includes('?') ? '&' : '#';
      const clipUrl = `${videoUrl}${separator}t=${startTime},${endTime}`;
      
      // Abrir en nueva ventana
      window.open(clipUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Error al abrir segmento:', error);
      return false;
    }
  };
  
  /**
   * Formatear tiempo para nombre de archivo (MM-SS)
   */
  export const formatTimeForFilename = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  /**
   * Formatear tiempo para visualización (MM:SS)
   */
  export const formatTimeForDisplay = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };