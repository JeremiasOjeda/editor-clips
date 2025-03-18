import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Inicialización de FFmpeg
let ffmpeg = null;

// Función para inicializar FFmpeg si aún no está inicializado
const initFFmpeg = async () => {
  if (!ffmpeg) {
    console.log('Creando instancia de FFmpeg...');
    ffmpeg = createFFmpeg({
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
      // Configuración necesaria para navegadores modernos
      mainName: 'main',
      enableSharedArrayBuffer: true,
      enableWebWorker: true,
      enableCrossOriginIsolation: true,
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
export const clipVideo = async (videoUrl, startTime, endTime, onProgress = () => {}) => {
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
    } catch (error) {
      console.error('Error al descargar el video:', error);
      // Si falla fetchFile, intentar con fetch nativo
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      videoData = new Uint8Array(arrayBuffer);
      onProgress({ type: 'download', progress: 100 });
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
    
    // Ejecutar el comando de recorte
    console.log(`Recortando video desde ${start} con duración ${duration}...`);
    onProgress({ type: 'processing', progress: 0 });
    
    // Configurar el manejo de progreso
    ffmpegInstance.setProgress(({ ratio }) => {
      const progressPercent = Math.round(ratio * 100);
      onProgress({ type: 'processing', progress: progressPercent });
    });
    
    // Ejecutar el comando de recorte
    await ffmpegInstance.run(
      '-i', 'input.mp4',
      '-ss', start,
      '-t', duration,
      '-c:v', 'copy', // Copiar stream de video sin recodificar
      '-c:a', 'copy', // Copiar stream de audio sin recodificar
      'output.mp4'
    );
    
    onProgress({ type: 'processing', progress: 100 });
    console.log('Video recortado correctamente');
    
    // Leer el archivo de salida
    const data = ffmpegInstance.FS('readFile', 'output.mp4');
    
    // Limpiar los archivos del sistema de archivos virtual
    ffmpegInstance.FS('unlink', 'input.mp4');
    ffmpegInstance.FS('unlink', 'output.mp4');
    
    // Crear un blob y una URL para descargar
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    return {
      url,
      blob,
      size: blob.size,
    };
  } catch (error) {
    console.error('Error al recortar el video:', error);
    // Intentar con método alternativo si está disponible
    if (typeof window !== 'undefined' && window.alternativeClipService) {
      console.log('Intentando con método alternativo...');
      return window.alternativeClipService.clipVideoAlternative(videoUrl, startTime, endTime, onProgress);
    }
    throw new Error(`Error al procesar el video: ${error.message}`);
  }
};

// Verificar si FFmpeg está disponible en el navegador
export const isFFmpegSupported = () => {
  // Verificar si estamos en un navegador
  if (typeof window === 'undefined') return false;
  
  // Verificar requisitos de FFmpeg WebAssembly
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const hasWebAssembly = typeof WebAssembly === 'object' 
    && typeof WebAssembly.instantiate === 'function'
    && typeof WebAssembly.compile === 'function';
    
  // Verificar si el navegador tiene crossOriginIsolation habilitado
  const hasCrossOriginIsolation = window.crossOriginIsolated;
    
  // Registrar el estado de compatibilidad
  console.log('Compatibilidad FFmpeg:', {
    hasSharedArrayBuffer,
    hasWebAssembly,
    hasCrossOriginIsolation
  });
  
  // Para desarrollo, podemos ser más permisivos (solo requiere WebAssembly)
  return hasWebAssembly;
};