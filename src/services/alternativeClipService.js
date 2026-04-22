// Servicio alternativo para recortar videos cuando FFmpeg no está disponible
// Usa MediaRecorder API para grabar un fragmento del video mientras se reproduce

// Función para recortar un video usando MediaRecorder
export const clipVideoAlternative = async (videoUrl, startTime, endTime, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
      try {
        // Notificar que estamos inicializando
        onProgress({ type: 'initializing', progress: 0 });
        console.log('Iniciando método alternativo de recorte...');
        
        // Crear un elemento de video oculto
        const videoElement = document.createElement('video');
        videoElement.style.position = 'fixed';
        videoElement.style.top = '-9999px';
        videoElement.style.left = '-9999px';
        videoElement.muted = false; // Intentar capturar audio
        videoElement.crossOrigin = 'anonymous';
        videoElement.controls = false;
        document.body.appendChild(videoElement);
        
        // Crear un contenedor para registro en la página
        const logContainer = document.createElement('div');
        logContainer.style.position = 'fixed';
        logContainer.style.zIndex = '9999';
        logContainer.style.bottom = '10px';
        logContainer.style.right = '10px';
        logContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
        logContainer.style.color = 'white';
        logContainer.style.padding = '10px';
        logContainer.style.borderRadius = '5px';
        logContainer.style.fontFamily = 'monospace';
        logContainer.style.fontSize = '12px';
        logContainer.style.maxWidth = '400px';
        logContainer.style.maxHeight = '200px';
        logContainer.style.overflow = 'auto';
        document.body.appendChild(logContainer);
        
        const log = (message) => {
          console.log(`[AlternativeClipService] ${message}`);
          const line = document.createElement('div');
          line.textContent = message;
          logContainer.appendChild(line);
          logContainer.scrollTop = logContainer.scrollHeight;
        };
        
        // Limpieza de elementos
        const cleanup = () => {
          videoElement.remove();
          logContainer.remove();
          
          // Si hay algún blob URL pendiente, revocarlo
          if (videoElement.src && videoElement.src.startsWith('blob:')) {
            URL.revokeObjectURL(videoElement.src);
          }
        };
        
        log(`Preparando para recortar video desde ${startTime}s hasta ${endTime}s`);
        onProgress({ type: 'download', progress: 0 });
        
        // Manejar errores
        videoElement.onerror = (e) => {
          log(`Error de video: ${e.target.error ? e.target.error.message : 'Desconocido'}`);
          cleanup();
          reject(new Error(`Error al cargar el video: ${e.target.error ? e.target.error.message : 'Desconocido'}`));
        };
        
        // Cuando el video esté listo para reproducirse
        videoElement.oncanplay = () => {
          log('Video listo para reproducir');
          onProgress({ type: 'download', progress: 100 });
          
          try {
            // Crear un canvas del mismo tamaño que el video
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const ctx = canvas.getContext('2d');
            
            log(`Dimensiones de video: ${canvas.width}x${canvas.height}`);
            
            // Capturar el stream del canvas
            let stream;
            try {
              stream = canvas.captureStream(30); // 30 FPS
              log('Stream de canvas creado');
            } catch (e) {
              log(`Error al capturar stream: ${e.message}`);
              cleanup();
              reject(new Error(`No se pudo capturar el stream de canvas: ${e.message}`));
              return;
            }
            
            // Intentar capturar el audio del video
            try {
              const audioTracks = videoElement.mozCaptureStream 
                ? videoElement.mozCaptureStream().getAudioTracks() 
                : (videoElement.captureStream ? videoElement.captureStream().getAudioTracks() : []);
              
              if (audioTracks.length > 0) {
                log('Audio capturado del video');
                stream.addTrack(audioTracks[0]);
              } else {
                log('No se encontraron pistas de audio');
              }
            } catch (e) {
              log(`Error al capturar audio: ${e.message}`);
              // Continuamos sin audio
            }
            
            // Configurar el MediaRecorder
            log('Configurando MediaRecorder');
            let recorder;
            let mimeType = '';
            
            // Intentar diferentes formatos
            const formats = [
              'video/webm;codecs=vp9,opus',
              'video/webm;codecs=vp8,opus',
              'video/webm',
              'video/mp4'
            ];
            
            for (const format of formats) {
              if (MediaRecorder.isTypeSupported(format)) {
                mimeType = format;
                log(`Formato soportado: ${format}`);
                break;
              }
            }
            
            if (!mimeType) {
              log('Ningún formato de video es soportado');
              cleanup();
              reject(new Error('Tu navegador no soporta ningún formato de grabación de video'));
              return;
            }
            
            try {
              recorder = new MediaRecorder(stream, { mimeType });
              log('MediaRecorder inicializado');
            } catch (e) {
              log(`Error al crear MediaRecorder: ${e.message}`);
              cleanup();
              reject(new Error(`No se pudo crear MediaRecorder: ${e.message}`));
              return;
            }
            
            const chunks = [];
            
            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                chunks.push(e.data);
                log(`Chunk de datos recibido: ${(e.data.size / 1024).toFixed(2)} KB`);
              }
            };
            
            recorder.onstop = () => {
              log('Grabación finalizada');
              
              if (chunks.length === 0) {
                log('No se recibieron datos de grabación');
                cleanup();
                reject(new Error('No se recibieron datos durante la grabación'));
                return;
              }
              
              const blob = new Blob(chunks, { type: mimeType });
              const url = URL.createObjectURL(blob);
              
              log(`Blob creado: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
              
              cleanup();
              onProgress({ type: 'processing', progress: 100 });
              
              resolve({
                url,
                blob,
                size: blob.size,
                format: mimeType
              });
            };
            
            // Mover el video al tiempo de inicio
            videoElement.currentTime = startTime;
            log(`Posicionando en tiempo de inicio: ${startTime}s`);
            
            videoElement.onseeked = function seekHandler() {
              // Remover este handler para evitar múltiples llamadas
              videoElement.onseeked = null;
              
              log('Comenzando grabación');
              recorder.start(1000); // Generar chunks cada segundo
              videoElement.play();
              onProgress({ type: 'processing', progress: 0 });
              
              // Duración del clip en segundos
              const duration = endTime - startTime;
              
              // Función para actualizar el canvas con el frame actual del video
              const drawFrame = () => {
                if (videoElement.currentTime >= endTime || videoElement.ended) {
                  log(`Finalizando en tiempo ${videoElement.currentTime}s`);
                  videoElement.pause();
                  recorder.stop();
                  return;
                }
                
                // Dibujar el frame actual en el canvas
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                
                // Calcular y mostrar progreso
                const elapsed = videoElement.currentTime - startTime;
                const progress = Math.min(100, (elapsed / duration) * 100);
                onProgress({ type: 'processing', progress });
                
                // Continuar con el siguiente frame
                requestAnimationFrame(drawFrame);
              };
              
              // Iniciar el bucle de dibujo
              drawFrame();
            };
            
          } catch (e) {
            log(`Error interno: ${e.message}`);
            cleanup();
            reject(new Error(`Error durante el proceso de recorte: ${e.message}`));
          }
        };
        
        // Iniciar carga del video
        log('Cargando video desde URL');
        videoElement.src = videoUrl;
        videoElement.load();
        
      } catch (error) {
        console.error('Error en el proceso de recorte alternativo:', error);
        reject(error);
      }
    });
  };
  
  // Verificar si la solución alternativa es compatible con este navegador
  export const isAlternativeMethodSupported = () => {
    // Forzar compatibilidad para permitir al usuario intentarlo
    // incluso si algunas características no se detectan automáticamente
    console.log("Verificando compatibilidad del método alternativo...");
    console.log("MediaRecorder disponible:", typeof MediaRecorder !== 'undefined');
    console.log("Canvas.captureStream disponible:", typeof document.createElement('canvas').captureStream === 'function');
    console.log("Canvas.mozCaptureStream disponible:", typeof document.createElement('canvas').mozCaptureStream === 'function');
    
    // En lugar de detectar todo, simplemente verificamos si MediaRecorder está disponible
    // que es lo mínimo necesario para intentar la captura
    return typeof MediaRecorder !== 'undefined';
  };