import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Inicialización de FFmpeg
let ffmpeg = null;

// Función para abrir el video con parámetros de tiempo
export const openVideoWithTimeParams = (videoUrl, startTime, endTime) => {
  // Añadir parámetros de tiempo a la URL
  const separator = videoUrl.includes('?') ? '&' : '#';
  const urlWithTimeParams = `${videoUrl}${separator}t=${startTime},${endTime}`;

  // Abrir en nueva ventana
  window.open(urlWithTimeParams, '_blank');
  return urlWithTimeParams;
};

// Función para inicializar FFmpeg
const initFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = createFFmpeg({
      log: true, // Activar logs para depuración
      corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
      // Configuraciones importantes
      mainName: 'main',
      enableSharedArrayBuffer: true,
      enableWebWorker: true,
    });
  }

  try {
    if (!ffmpeg.isLoaded()) {
      console.log('Cargando FFmpeg...');
      await ffmpeg.load();
      console.log('FFmpeg cargado correctamente');
    }
    return ffmpeg;
  } catch (error) {
    console.error('Error al cargar FFmpeg:', error);
    throw new Error(`No se pudo cargar FFmpeg: ${error.message}`);
  }
};

// Función para recortar un video usando FFmpeg - ULTRA SIMPLIFICADA
export const clipVideo = async (videoUrl, startTime, endTime, onProgress = () => { }) => {
  try {
    // Primero intentamos el enfoque más básico posible con FFmpeg
    console.log('Iniciando procesamiento de video con método ultra-simplificado...');
    const ffmpegInstance = await initFFmpeg();
    
    // Notificar proceso
    onProgress({ type: 'download', progress: 0 });
    
    // Descarga simplificada
    console.log('Descargando video...');
    let videoData;
    try {
      videoData = await fetchFile(videoUrl);
    } catch (fetchError) {
      console.log('Error en fetchFile, intentando fetch nativo');
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      videoData = new Uint8Array(arrayBuffer);
    }
    
    onProgress({ type: 'download', progress: 100 });
    
    // Comprobar el tamaño y mostrar información al usuario
    const videoSizeInMB = videoData.length / (1024 * 1024);
    console.log(`Tamaño del video: ${videoSizeInMB.toFixed(2)}MB`);
    
    if (videoSizeInMB > 200) {
      onProgress({ 
        type: 'warning', 
        message: `Video grande (${videoSizeInMB.toFixed(2)}MB). El procesamiento puede tardar más de lo normal.`
      });
    }
    
    // Escribir el archivo en el sistema de archivos virtual
    ffmpegInstance.FS('writeFile', 'input.mp4', videoData);
    
    // Notificar procesamiento
    onProgress({ type: 'processing', progress: 0 });
    
    console.log('Aplicando enfoque ultra-simplificado para evitar errores de compatibilidad');
    
    // Configurar progreso
    ffmpegInstance.setProgress(({ ratio }) => {
      if (ratio && !isNaN(ratio)) {
        const progressPercent = Math.min(100, Math.round(ratio * 100));
        onProgress({ type: 'processing', progress: progressPercent });
      }
    });
    
    // COMANDO ULTRA BÁSICO - Solo tomar un segmento del input
    try {
      // Convertir tiempos a enteros
      const startSeconds = Math.floor(startTime);
      const durationSeconds = Math.floor(endTime - startTime);
      
      // Comando lo más simple posible
      await ffmpegInstance.run('-i', 'input.mp4', '-ss', `${startSeconds}`, '-t', `${durationSeconds}`, 'output.mp4');
      
      console.log('Procesamiento básico completado');
    } catch (ffmpegError) {
      console.error('Error en procesamiento básico:', ffmpegError);
      
      // Si falla, caemos al método alternativo inmediatamente
      throw new Error('Método básico falló, usando alternativa');
    }
    
    // Completar procesamiento
    onProgress({ type: 'processing', progress: 100 });
    
    // Leer resultado
    const data = ffmpegInstance.FS('readFile', 'output.mp4');
    
    // Limpiar
    try {
      ffmpegInstance.FS('unlink', 'input.mp4');
      ffmpegInstance.FS('unlink', 'output.mp4');
    } catch (e) {}
    
    // Crear blob y URL
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    return {
      url,
      blob,
      size: blob.size,
      format: 'video/mp4'
    };
    
  } catch (error) {
    console.error('FFmpeg falló completamente. Usando método alternativo:', error);
    
    // Si todo falla, usar el método alternativo simple
    return clipVideoSimple(videoUrl, startTime, endTime, onProgress);
  }
};

// Verificar si FFmpeg está disponible en el navegador
export const isFFmpegSupported = () => {
  try {
    return typeof WebAssembly !== 'undefined' && 
           typeof SharedArrayBuffer !== 'undefined' && 
           typeof Blob !== 'undefined' && 
           typeof URL !== 'undefined';
  } catch (error) {
    return false;
  }
};

// Función simplificada para recortar videos sin FFmpeg
export const clipVideoSimple = async (videoUrl, startTime, endTime, onProgress = () => { }) => {
  return new Promise((resolve, reject) => {
    try {
      // Notificar proceso
      onProgress({ type: 'initializing', progress: 0 });
      console.log('Iniciando método simplificado de recorte...');

      // Simular progreso
      onProgress({ type: 'download', progress: 50 });
      setTimeout(() => onProgress({ type: 'download', progress: 100 }), 500);
      
      setTimeout(() => {
        onProgress({ type: 'processing', progress: 50 });
        
        // Generar URL con parámetros de tiempo
        const urlWithTimeParams = `${videoUrl}#t=${startTime},${endTime}`;
        
        setTimeout(() => {
          onProgress({ type: 'processing', progress: 100 });
          
          // Mostrar mensaje informativo
          onProgress({ 
            type: 'warning', 
            message: 'Usando método alternativo que abre el video en el tiempo seleccionado.'
          });

          // Devolver la URL modificada
          resolve({
            url: urlWithTimeParams,
            isDirectURL: true,
            isSimpleMethod: true,
            size: 0,
            format: 'video/mp4'
          });
        }, 500);
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
};