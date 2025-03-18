// Propuesta para un método alternativo de descarga utilizando MediaRecorder API
// Este archivo puede ser añadido como src/services/mediaRecorderService.js

/**
 * Implementación alternativa para recortar clips cuando FFmpeg falla
 * Usa la API MediaRecorder para grabar un fragmento mientras se reproduce
 */

// Función principal para recortar videos usando MediaRecorder
export const clipVideoWithMediaRecorder = (videoUrl, startTime, endTime, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      // Comprobamos si la API es compatible
      if (!window.MediaRecorder) {
        reject(new Error('Tu navegador no soporta MediaRecorder, necesario para este método.'));
        return;
      }
  
      // Notificar inicio
      onProgress({ type: 'initializing', progress: 0 });
      console.log('Iniciando método MediaRecorder...');
      
      // Crear un elemento de video
      const videoElement = document.createElement('video');
      videoElement.style.display = 'none'; // Invisible
      videoElement.crossOrigin = 'anonymous'; // Intentar permitir CORS
      videoElement.muted = false; // Intentamos capturar audio
      document.body.appendChild(videoElement);
      
      // Variables para el proceso
      let mediaRecorder = null;
      let recordedChunks = [];
      
      // Función de limpieza
      const cleanup = () => {
        if (videoElement) {
          if (videoElement.src) {
            videoElement.pause();
            videoElement.src = '';
            videoElement.load();
          }
          videoElement.remove();
        }
      };
      
      // Cuando ocurre un error en el video
      videoElement.onerror = (error) => {
        cleanup();
        reject(new Error(`Error al cargar el video: ${error.target.error?.message || 'Desconocido'}`));
      };
      
      // Cuando el video está listo para reproducirse
      videoElement.oncanplay = async () => {
        try {
          onProgress({ type: 'download', progress: 100 });
          console.log('Video listo para procesar');
          
          // Obtenemos el stream del video
          let videoStream;
          try {
            // Intentamos diferentes métodos para capturar el stream
            if (videoElement.captureStream) {
              videoStream = videoElement.captureStream();
            } else if (videoElement.mozCaptureStream) {
              videoStream = videoElement.mozCaptureStream();
            } else {
              throw new Error('Captura de stream no soportada en este navegador');
            }
          } catch (streamError) {
            cleanup();
            reject(new Error(`No se pudo capturar el stream de video: ${streamError.message}`));
            return;
          }
          
          // Configuramos el MediaRecorder
          try {
            // Buscamos el formato más compatible
            const mimeTypes = [
              'video/webm;codecs=vp9,opus',
              'video/webm;codecs=vp8,opus',
              'video/webm',
              'video/mp4'
            ];
            
            let selectedType = '';
            for (const type of mimeTypes) {
              if (MediaRecorder.isTypeSupported(type)) {
                selectedType = type;
                break;
              }
            }
            
            if (!selectedType) {
              throw new Error('Ningún formato de video compatible encontrado');
            }
            
            // Creamos el MediaRecorder
            const recorderOptions = { mimeType: selectedType };
            mediaRecorder = new MediaRecorder(videoStream, recorderOptions);
          } catch (recorderError) {
            cleanup();
            reject(new Error(`Error al crear MediaRecorder: ${recorderError.message}`));
            return;
          }
          
          // Cuando tenemos datos disponibles
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunks.push(e.data);
              console.log(`Fragmento grabado: ${Math.round(e.data.size / 1024)} KB`);
            }
          };
          
          // Cuando se completa la grabación
          mediaRecorder.onstop = () => {
            try {
              if (recordedChunks.length === 0) {
                throw new Error('No se recibieron datos durante la grabación');
              }
              
              // Crear el blob con todos los fragmentos
              const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
              const url = URL.createObjectURL(blob);
              
              console.log(`Clip creado: ${Math.round(blob.size / 1024)} KB`);
              
              // Limpiar
              cleanup();
              onProgress({ type: 'processing', progress: 100 });
              
              // Devolver resultado
              resolve({
                url,
                blob,
                size: blob.size,
                format: mediaRecorder.mimeType
              });
            } catch (finalizeError) {
              cleanup();
              reject(new Error(`Error al finalizar la grabación: ${finalizeError.message}`));
            }
          };
          
          // Si ocurre un error durante la grabación
          mediaRecorder.onerror = (recError) => {
            cleanup();
            reject(new Error(`Error durante la grabación: ${recError.error?.message || 'Desconocido'}`));
          };
          
          // Comenzamos el proceso
          onProgress({ type: 'processing', progress: 0 });
          
          // Ir al punto de inicio
          videoElement.currentTime = startTime;
          
          videoElement.onseeked = () => {
            // Quitamos el handler para evitar múltiples llamadas
            videoElement.onseeked = null;
            
            console.log(`Comenzando grabación desde ${startTime}s hasta ${endTime}s`);
            
            // Iniciamos la grabación
            mediaRecorder.start(1000); // 1 segundo por chunk
            videoElement.play();
            
            // Calculamos la duración
            const clipDuration = endTime - startTime;
            let elapsedTime = 0;
            
            // Función para actualizar el progreso
            const updateProgress = () => {
              if (!videoElement || videoElement.paused) return;
              
              elapsedTime = videoElement.currentTime - startTime;
              const progress = Math.min(100, (elapsedTime / clipDuration) * 100);
              onProgress({ type: 'processing', progress });
              
              // Detener cuando llegamos al final
              if (videoElement.currentTime >= endTime) {
                videoElement.pause();
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                  mediaRecorder.stop();
                }
                return;
              }
              
              // Actualizar progreso cada 100ms
              setTimeout(updateProgress, 100);
            };
            
            // Iniciar actualización de progreso
            updateProgress();
            
            // Configurar un temporizador para detener la grabación cuando se alcance el tiempo final
            const recordingTimeout = setTimeout(() => {
              if (videoElement && !videoElement.paused) {
                videoElement.pause();
              }
              if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
              }
            }, (clipDuration * 1000) + 500); // Añadimos 500ms de margen
            
            // Si el video termina antes (por error o porque es más corto)
            videoElement.onended = () => {
              clearTimeout(recordingTimeout);
              if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
              }
            };
          };
        } catch (error) {
          cleanup();
          reject(new Error(`Error en el proceso de captura: ${error.message}`));
        }
      };
      
      // Cargamos el video
      onProgress({ type: 'download', progress: 0 });
      videoElement.src = videoUrl;
      videoElement.load();
    });
  };
  
  // Función para verificar si este método es compatible con el navegador
  export const isMediaRecorderSupported = () => {
    return !!window.MediaRecorder && 
           (typeof HTMLVideoElement.prototype.captureStream === 'function' || 
            typeof HTMLVideoElement.prototype.mozCaptureStream === 'function');
  };