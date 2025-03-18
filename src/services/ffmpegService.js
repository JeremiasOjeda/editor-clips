import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Inicialización de FFmpeg
let ffmpeg = null;

// Función para inicializar FFmpeg si aún no está inicializado
const initFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = createFFmpeg({
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
    });
  }
  
  if (!ffmpeg.isLoaded()) {
    console.log('Cargando FFmpeg...');
    await ffmpeg.load();
    console.log('FFmpeg cargado correctamente');
  }
  
  return ffmpeg;
};

// Función para recortar un video usando FFmpeg
export const clipVideo = async (videoUrl, startTime, endTime, onProgress = () => {}) => {
  try {
    // Inicializar FFmpeg
    const ffmpegInstance = await initFFmpeg();
    
    // Obtener el archivo de video
    console.log('Descargando video...');
    onProgress({ type: 'download', progress: 0 });
    
    const videoData = await fetchFile(videoUrl);
    
    // Escribir el archivo en el sistema de archivos virtual de FFmpeg
    console.log('Preparando video para procesamiento...');
    onProgress({ type: 'download', progress: 100 });
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
    
    await ffmpegInstance.run(
      '-i', 'input.mp4',
      '-ss', start,
      '-t', duration,
      '-c:v', 'copy',
      '-c:a', 'copy',
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
    throw new Error(`Error al procesar el video: ${error.message}`);
  }
};

// Verificar si FFmpeg está disponible en el navegador
export const isFFmpegSupported = () => {
  // Verificar si estamos en un navegador
  if (typeof window === 'undefined') return false;
  
  // Verificar si SharedArrayBuffer está disponible (necesario para WebAssembly threading)
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  
  // Verificar si WebAssembly está disponible
  const hasWebAssembly = typeof WebAssembly === 'object' 
    && typeof WebAssembly.instantiate === 'function'
    && typeof WebAssembly.compile === 'function';
  
  return hasWebAssembly && hasSharedArrayBuffer;
};