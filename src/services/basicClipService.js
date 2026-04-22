// Servicio básico que permite descargar videos mediante URL con parámetros de tiempo
// Este método funciona pasando parámetros de tiempo a la URL del video

export const clipVideoBasic = async (videoUrl, startTime, endTime, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      try {
        // Notificar proceso
        onProgress({ type: 'initializing', progress: 0 });
        console.log('Iniciando método básico de recorte...');
        
        // Simulamos un pequeño retraso para mostrar progreso
        setTimeout(() => {
          onProgress({ type: 'processing', progress: 50 });
          
          // Crear una URL con parámetros de tiempo
          // Esto funciona en la mayoría de reproductores HTML5
          let urlWithTimeParams = videoUrl;
          
          // Agregar parámetros de tiempo a la URL
          if (videoUrl.includes('?')) {
            urlWithTimeParams = `${videoUrl}&t=${startTime}`;
          } else {
            urlWithTimeParams = `${videoUrl}#t=${startTime},${endTime}`;
          }
          
          console.log('URL con parámetros de tiempo:', urlWithTimeParams);
          
          // Simulamos un poco más de progreso
          setTimeout(() => {
            onProgress({ type: 'processing', progress: 100 });
            
            // Devolver la URL modificada
            resolve({
              url: urlWithTimeParams,
              isDirectURL: true,
              size: 0,
              format: 'video/mp4'
            });
          }, 500);
        }, 1000);
        
      } catch (error) {
        console.error('Error en el método básico de recorte:', error);
        reject(error);
      }
    });
  };
  
  // Este método siempre está soportado
  export const isBasicMethodSupported = () => true;