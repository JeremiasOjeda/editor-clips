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

// Función para recortar un video usando FFmpeg
export const clipVideo = async (videoUrl, startTime, endTime, onProgress = () => { }) => {
  try {
    // Inicializar FFmpeg
    const ffmpegInstance = await initFFmpeg();

    // Obtener el archivo de video
    console.log('Descargando video...');
    onProgress({ type: 'download', progress: 0 });

    let videoData;
    try {
      videoData = await fetchFile(videoUrl);
      onProgress({ type: 'download', progress: 100 });
    } catch (fetchError) {
      console.warn('Error con fetchFile, intentando fetch nativo:', fetchError);

      try {
        // Intentar con fetch nativo
        const response = await fetch(videoUrl, {
          mode: 'cors', // Intentar con CORS explícito
          cache: 'no-cache' // Evitar problemas de caché
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        videoData = new Uint8Array(arrayBuffer);
        onProgress({ type: 'download', progress: 100 });
      } catch (nativeFetchError) {
        throw new Error(`No se pudo descargar el video: ${nativeFetchError.message}`);
      }
    }

    // Comprobar si el video es muy grande para procesar en el navegador (>50MB)
    const videoSizeInMB = videoData.length / (1024 * 1024);
    console.log(`Tamaño del video: ${videoSizeInMB.toFixed(2)}MB`);

    // Verificar tamaño del video
    if (videoSizeInMB > 200) {
      // Demasiado grande para procesar con seguridad
      throw new Error(`El video es extremadamente grande (${videoSizeInMB.toFixed(2)}MB) y no puede procesarse en el navegador. Usa el método directo.`);
    } else if (videoSizeInMB > 50) {
      // Grande pero podemos intentarlo
      console.warn(`Video grande (${videoSizeInMB.toFixed(2)}MB). El procesamiento puede ser lento o fallar.`);

      // Verificar si tenemos espacio para procesar (al menos 3 veces el tamaño del video)
      const clipDuration = endTime - startTime;
      const totalDuration = videoData.length / videoSizeInMB; // estimación aproximada

      // Si el clip es proporcionalmente pequeño, podemos intentarlo
      if (clipDuration && totalDuration && (clipDuration / totalDuration < 0.3)) {
        console.log(`Clip seleccionado (${clipDuration}s) es proporcionalmente pequeño. Intentando procesar.`);
      } else {
        // Advertir pero continuar
        console.warn(`Procesando un video grande. Esto puede fallar si no hay suficiente memoria disponible.`);
      }
    }

    // Escribir el archivo en el sistema de archivos virtual de FFmpeg
    console.log('Preparando video para procesamiento...');
    ffmpegInstance.FS('writeFile', 'input.mp4', videoData);

    // Formatear los tiempos para FFmpeg (HH:MM:SS.mmm)
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    };

    const start = formatTime(startTime);
    const duration = formatTime(endTime - startTime);

    // Ejecutar el comando de recorte con una estrategia optimizada para navegadores
    console.log(`Recortando video desde ${start} con duración ${duration}...`);
    onProgress({ type: 'processing', progress: 0 });

    // Configurar el manejo de progreso
    ffmpegInstance.setProgress(({ ratio }) => {
      if (ratio && !isNaN(ratio)) {
        const progressPercent = Math.min(100, Math.round(ratio * 100));
        onProgress({ type: 'processing', progress: progressPercent });
      }
    });

    try {
      // Primer intento: método rápido sin recodificar (solo copia)
      await ffmpegInstance.run(
        '-ss', start,        // Poner el -ss antes de -i es más eficiente
        '-i', 'input.mp4',
        '-t', duration,
        '-c', 'copy',        // Solo copiar sin recodificar
        '-avoid_negative_ts', 'make_zero',  // Corregir timestamps negativos
        '-reset_timestamps', '1',           // Resetear timestamps para mejor compatibilidad
        'output.mp4'
      );
    } catch (ffmpegError) {
      console.warn('Primer método falló, intentando método alternativo:', ffmpegError);

      // Método alternativo: recodificar para mayor compatibilidad
      await ffmpegInstance.run(
        '-i', 'input.mp4',
        '-ss', start,
        '-t', duration,
        '-c:v', 'libx264',     // Recodificar video para mayor compatibilidad
        '-c:a', 'aac',         // Recodificar audio para mayor compatibilidad
        '-strict', 'experimental',
        '-b:a', '128k',        // Bitrate de audio razonable
        '-preset', 'ultrafast', // Procesamiento más rápido
        'output.mp4'
      );
    }

    onProgress({ type: 'processing', progress: 100 });
    console.log('Video recortado correctamente');

    // Leer el archivo de salida
    const data = ffmpegInstance.FS('readFile', 'output.mp4');

    // Limpiar memoria después de procesar
    try {
      ffmpegInstance.FS('unlink', 'input.mp4');
      ffmpegInstance.FS('unlink', 'output.mp4');
    } catch (cleanupError) {
      console.warn('Error al limpiar archivos temporales:', cleanupError);
    }

    // Crear un blob y una URL para descargar
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    return {
      url,
      blob,
      size: blob.size,
      format: 'video/mp4'
    };
  } catch (error) {
    console.error('Error en procesamiento de video:', error);
    throw error;
  }
};

// Verificar si FFmpeg está disponible en el navegador
export const isFFmpegSupported = () => {
  try {
    // Verificar soporte para WebAssembly
    if (typeof WebAssembly === 'undefined') {
      console.warn('WebAssembly no está soportado en este navegador');
      return false;
    }

    // Verificar soporte para SharedArrayBuffer (necesario para trabajar con hilos)
    if (typeof SharedArrayBuffer === 'undefined') {
      console.warn('SharedArrayBuffer no está soportado en este navegador');
      return false;
    }

    // Verificar soporte para las APIs necesarias
    const requiredApis = [
      'Blob',
      'URL',
      'Promise',
      'File',
      'FileReader',
      'fetch'
    ];

    for (const api of requiredApis) {
      if (typeof window[api] === 'undefined') {
        console.warn(`API ${api} no está soportada en este navegador`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error al verificar compatibilidad:', error);
    return false;
  }
};

// NUEVO: Función alternativa simplificada para recortar videos sin FFmpeg
export const clipVideoSimple = async (videoUrl, startTime, endTime, onProgress = () => { }) => {
  return new Promise((resolve, reject) => {
    try {
      // Notificar proceso
      onProgress({ type: 'initializing', progress: 0 });
      console.log('Iniciando método simplificado de recorte...');

      // Mostrar progreso simulado
      onProgress({ type: 'download', progress: 50 });

      // Crear una URL con parámetros de tiempo
      let urlWithTimeParams = videoUrl;

      // Agregar parámetros de tiempo a la URL
      if (videoUrl.includes('?')) {
        urlWithTimeParams = `${videoUrl}&t=${startTime}`;
      } else {
        urlWithTimeParams = `${videoUrl}#t=${startTime},${endTime}`;
      }

      console.log('URL con parámetros de tiempo:', urlWithTimeParams);

      onProgress({ type: 'processing', progress: 100 });

      // Devolver la URL modificada con una advertencia
      resolve({
        url: urlWithTimeParams,
        isDirectURL: true,
        isSimpleMethod: true,
        size: 0,
        format: 'video/mp4'
      });
    } catch (error) {
      console.error('Error en el método simple de recorte:', error);
      reject(error);
    }
  });
};