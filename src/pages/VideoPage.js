import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Grid, Paper,
  CircularProgress, Alert, Snackbar,
  Divider, ButtonGroup
} from '@mui/material';
import {
  Download, ArrowBack, Warning, VideoLibrary,
  Videocam
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import SimpleVideoPlayer from '../components/SimpleVideoPlayer';
import ClipSelector from '../components/ClipSelector';
import ProcessingProgress from '../components/ProcessingProgress';
import { getVideoByCode } from '../services/videoService';
import {
  clipVideo,
  clipVideoSimple,
  isFFmpegSupported,
  openVideoWithTimeParams
} from '../services/ffmpegService';
import loggerService from '../services/loggerService'; // Importar el servicio de logs

// Función para intentar obtener la IP del cliente (no funcionará completamente en el cliente)
const getClientInfo = async () => {
  try {
    // Nota: Esto no obtiene la IP real del cliente, solo una estimación para desarrollo
    // En producción, la IP debe ser capturada en el servidor
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return {
      ip: data.ip,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.log('No se pudo obtener información del cliente:', error);
    return {
      ip: "unknown",
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }
};

function VideoPage() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [video, setVideo] = useState(null);

  // Estado para la selección de clip
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(30);

  // Estado para el procesamiento
  const [processStatus, setProcessStatus] = useState('idle'); // idle, initializing, downloading, processing, complete, error
  const [processProgress, setProcessProgress] = useState(0);
  const [clipUrl, setClipUrl] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  const [processWarning, setProcessWarning] = useState(null);

  // Estado para notificaciones
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Verificar compatibilidad de FFmpeg
  const [ffmpegSupported] = useState(isFFmpegSupported());

  // Función para manejar cambios en la selección de clip
  const handleSelectionChange = (start, end) => {
    setClipStart(start);
    setClipEnd(end);

    // Registrar cambio en la selección de clip
    if (video) {
      loggerService.createLogEntry({
        action: 'CLIP_SELECTION_CHANGE',
        videoCode: code,
        videoTitle: video.title,
        clipStart: start,
        clipEnd: end,
        clipDuration: end - start
      });
    }

    // Restablecer el estado de procesamiento si cambia la selección
    if (processStatus === 'complete' || processStatus === 'error') {
      setProcessStatus('idle');
      setProcessingError(null);
      if (clipUrl) {
        URL.revokeObjectURL(clipUrl);
        setClipUrl(null);
      }
    }
  };

  // Método directo simplificado para abrir clip en una nueva ventana
  const handleOpenDirectClip = () => {
    if (!video || !video.url) return;

    // Registrar acción de apertura directa
    loggerService.createLogEntry({
      action: 'OPEN_DIRECT_CLIP',
      videoCode: code,
      videoTitle: video.title,
      videoUrl: video.url,
      clipStart,
      clipEnd,
      method: 'URL_PARAMETERS'
    });

    // Usar la función existente de ffmpegService
    openVideoWithTimeParams(video.url, clipStart, clipEnd);

    setNotification({
      open: true,
      message: 'Se ha abierto el fragmento del video en una nueva pestaña.',
      severity: 'info'
    });
  };

  // Formatear tiempo para nombres de archivo (MMSS format)
  const formatTimeForFilename = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleProcessClip = async () => {
    try {
      // Limpiar URL anterior si existe
      if (clipUrl) {
        URL.revokeObjectURL(clipUrl);
        setClipUrl(null);
      }
  
      setProcessStatus('initializing');
      setProcessProgress(0);
      setProcessingError(null);
      setProcessWarning(null); // Resetear advertencias
  
      // Registrar inicio del procesamiento
      loggerService.createLogEntry({
        action: 'CLIP_PROCESSING_START',
        videoCode: code,
        videoTitle: video.title,
        videoUrl: video.url,
        clipStart,
        clipEnd,
        clipDuration: clipEnd - clipStart,
        ffmpegSupported: isFFmpegSupported(),
        additionalData: {
          userIP: 'CLIENT_SIDE', // Será reemplazado por IP real en el servidor
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`
        }
      });
  
      // Verificar si FFmpeg es compatible con este navegador
      const ffmpegAvailable = isFFmpegSupported();
  
      if (!ffmpegAvailable) {
        setNotification({
          open: true,
          message: 'Tu navegador no es compatible con el procesamiento avanzado de video (SharedArrayBuffer). Se usará un método alternativo con limitaciones.',
          severity: 'warning'
        });
  
        // Registrar uso de método alternativo
        loggerService.createLogEntry({
          action: 'USING_ALTERNATIVE_METHOD',
          videoCode: code,
          videoTitle: video.title,
          reason: 'FFMPEG_NOT_SUPPORTED',
          browserInfo: navigator.userAgent
        });
  
        // Intentar con el método alternativo simplificado
        try {
          const result = await clipVideoSimple(
            video.url,
            clipStart,
            clipEnd,
            (progress) => {
              if (progress.type === 'download') {
                setProcessStatus('downloading');
                setProcessProgress(progress.progress);
              } else if (progress.type === 'processing') {
                setProcessStatus('processing');
                setProcessProgress(progress.progress);
              } else if (progress.type === 'warning') {
                // Manejar mensajes de advertencia
                setProcessWarning(progress.message);
              }
            }
          );
  
          // Verificar si se usó el método simple
          if (result.isSimpleMethod) {
            // Si es el método simple, cambiar a estado completo pero mostrar advertencia
            setClipUrl(result.url);
            setProcessStatus('complete');
  
            // Registrar éxito con método alternativo
            loggerService.logClipCreation(
              video,
              clipStart,
              clipEnd,
              'SIMPLE_URL_METHOD',
              'SUCCESS'
            );
  
            setNotification({
              open: true,
              message: 'Advertencia: Se ha utilizado un método simplificado. El enlace abrirá el video en el tiempo seleccionado, pero no es un archivo recortado real.',
              severity: 'warning'
            });
          }
  
          return;
        } catch (simpleError) {
          console.error('Error en método alternativo:', simpleError);
          
          // Registrar error en método alternativo
          loggerService.logError(
            video,
            'ALTERNATIVE_METHOD_ERROR',
            simpleError.message,
            { clipStart, clipEnd }
          );
          
          throw new Error(`No se pudo procesar el video: ${simpleError.message}`);
        }
      }
  
      // Registrar datos de auditoría (esto sería una llamada a una API en una aplicación real)
      const auditData = {
        videoCode: code,
        videoTitle: video.title,
        clipStart,
        clipEnd,
        device: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      console.log('Datos de auditoría:', auditData);
  
      // Verificar si el clip es demasiado largo (más de 3 minutos podría causar problemas)
      const clipDuration = clipEnd - clipStart;
      if (clipDuration > 180) {
        setNotification({
          open: true,
          message: 'El clip seleccionado es muy largo (>3 min). El procesamiento puede tardar bastante. Para archivos grandes, considera usar un fragmento más corto.',
          severity: 'warning'
        });
        
        // Registrar advertencia de clip largo
        loggerService.createLogEntry({
          action: 'LONG_CLIP_WARNING',
          videoCode: code,
          videoTitle: video.title,
          clipStart,
          clipEnd,
          clipDuration,
          warning: 'Clip muy largo (>3 min)'
        });
      }
  
      // Mensajes detallados para el usuario
      setNotification({
        open: true,
        message: 'Iniciando procesamiento del video. Esto puede tardar unos momentos, por favor espera...',
        severity: 'info'
      });
  
      console.log('Procesando clip desde', clipStart, 'hasta', clipEnd, 'segundos');
      console.log('URL del video fuente:', video.url);
  
      // Procesar el video con FFmpeg
      try {
        const result = await clipVideo(
          video.url,
          clipStart,
          clipEnd,
          (progress) => {
            if (progress.type === 'download') {
              setProcessStatus('downloading');
              setProcessProgress(progress.progress);
              
              // Registrar progreso de descarga en puntos clave
              if (progress.progress % 25 === 0) {
                loggerService.createLogEntry({
                  action: 'DOWNLOAD_PROGRESS',
                  videoCode: code,
                  videoTitle: video.title,
                  progress: progress.progress,
                  timestamp: new Date().toISOString()
                });
              }
              
              console.log('Progreso de descarga:', progress.progress);
            } else if (progress.type === 'processing') {
              setProcessStatus('processing');
              setProcessProgress(progress.progress);
              
              // Registrar progreso de procesamiento en puntos clave
              if (progress.progress % 25 === 0) {
                loggerService.createLogEntry({
                  action: 'PROCESSING_PROGRESS',
                  videoCode: code,
                  videoTitle: video.title,
                  progress: progress.progress,
                  timestamp: new Date().toISOString()
                });
              }
              
              console.log('Progreso de procesamiento:', progress.progress);
            } else if (progress.type === 'warning') {
              // Manejar mensajes de advertencia
              setProcessWarning(progress.message);
              
              // Registrar advertencias
              loggerService.createLogEntry({
                action: 'PROCESSING_WARNING',
                videoCode: code,
                videoTitle: video.title,
                warningMessage: progress.message,
                timestamp: new Date().toISOString()
              });
              
              console.log('Advertencia:', progress.message);
              
              // Mostrar notificación al usuario
              setNotification({
                open: true,
                message: progress.message,
                severity: 'warning'
              });
            }
          }
        );
  
        // Verificar resultado
        if (result.isSimpleMethod) {
          // Si se usó el método simple, mostrar advertencia pero permitir continuar
          setClipUrl(result.url);
          setProcessStatus('complete');
          
          // Registrar proceso completado con método alternativo
          loggerService.logClipCreation(
            video,
            clipStart,
            clipEnd,
            'URL_PARAMETERS_METHOD',
            'SUCCESS',
            null
          );
          
          setNotification({
            open: true,
            message: 'Se ha usado un método alternativo. El enlace abrirá el video en el tiempo seleccionado, no es un archivo recortado.',
            severity: 'warning'
          });
        } else {
          // Si es el método normal, verificar tamaño del archivo
          if (result.blob && result.blob.size < 1000) {
            // Registrar error por archivo demasiado pequeño
            loggerService.logError(
              video,
              'CLIP_SIZE_ERROR',
              'El archivo generado es demasiado pequeño',
              { 
                clipStart, 
                clipEnd, 
                fileSize: result.blob.size,
                timestamp: new Date().toISOString()
              }
            );
            
            throw new Error('El archivo generado es demasiado pequeño, posiblemente hubo un error en el procesamiento');
          }
  
          // Actualizar estado con la URL del clip
          setClipUrl(result.url);
          setProcessStatus('complete');
          
          // Registrar proceso completado exitosamente
          loggerService.logClipCreation(
            video,
            clipStart,
            clipEnd,
            'FFMPEG_COMPLETE',
            'SUCCESS',
            null,
            {
              fileSize: result.blob.size,
              format: result.format || 'video/mp4',
              processingTime: new Date().toISOString()
            }
          );
  
          // Mostrar notificación de éxito
          setNotification({
            open: true,
            message: 'Clip procesado correctamente. Haz clic en Descargar para guardar.',
            severity: 'success'
          });
        }
      } catch (processingError) {
        console.error('Error en procesamiento de video:', processingError);
        
        // Intentar método alternativo automáticamente
        try {
          setNotification({
            open: true,
            message: 'El método principal falló. Intentando método alternativo...',
            severity: 'warning'
          });
          
          // Registrar fallo y intento de método alternativo
          loggerService.createLogEntry({
            action: 'PRIMARY_METHOD_FAILED',
            videoCode: code,
            videoTitle: video.title,
            error: processingError.message,
            attempting: 'ALTERNATIVE_METHOD',
            timestamp: new Date().toISOString()
          });
          
          const alternativeResult = await clipVideoSimple(
            video.url,
            clipStart,
            clipEnd,
            (progress) => {
              if (progress.type === 'processing') {
                setProcessStatus('processing');
                setProcessProgress(progress.progress);
              }
            }
          );
          
          // Si llega aquí, el método alternativo funcionó
          setClipUrl(alternativeResult.url);
          setProcessStatus('complete');
          
          // Registrar éxito del método alternativo
          loggerService.logClipCreation(
            video,
            clipStart,
            clipEnd,
            'ALTERNATIVE_METHOD_SUCCESS',
            'SUCCESS'
          );
          
          setNotification({
            open: true,
            message: 'Se ha usado un método alternativo. El enlace abrirá el video en el tiempo seleccionado.',
            severity: 'info'
          });
          
        } catch (fallbackError) {
          // Si también falla el fallback, mostramos error
          setProcessingError('No se pudo procesar el video con ningún método. Intenta con un clip más corto.');
          setProcessStatus('error');
          
          // Registrar error completo
          loggerService.logError(
            video,
            'ALL_METHODS_FAILED',
            `Principal: ${processingError.message}, Alternativo: ${fallbackError.message}`,
            {
              clipStart,
              clipEnd,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          );
          
          setNotification({
            open: true,
            message: 'Error en todos los métodos de procesamiento. Intenta con un clip más corto.',
            severity: 'error'
          });
        }
      }
    } catch (err) {
      console.error('Error general al procesar el clip:', err);
      setProcessStatus('error');
      setProcessingError(err.message || 'Error desconocido al procesar el video');
      
      // Registrar error general
      loggerService.logError(
        video,
        'GENERAL_PROCESSING_ERROR',
        err.message || 'Error desconocido',
        {
          clipStart,
          clipEnd,
          timestamp: new Date().toISOString()
        }
      );
  
      setNotification({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Método mejorado para la descarga del clip procesado
  const handleDownloadClip = async () => {
    if (!clipUrl) {
      setNotification({
        open: true,
        message: 'No hay clip disponible para descargar. Procesa primero el video.',
        severity: 'warning'
      });
      
      // Registrar intento de descarga sin clip disponible
      loggerService.createLogEntry({
        action: 'DOWNLOAD_ATTEMPT_NO_CLIP',
        videoCode: code,
        videoTitle: video?.title,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      return;
    }

    // Si la URL empieza con blob:, es un archivo procesado real
    // Si empieza con http o https, es probablemente el método simple
    const isRealClip = clipUrl.startsWith('blob:');
    
    // Obtener información del cliente para el registro
    const clientInfo = await getClientInfo();

    // Registrar intento de descarga
    loggerService.createLogEntry({
      action: 'CLIP_DOWNLOAD_ATTEMPT',
      videoCode: code,
      videoTitle: video?.title,
      clipStart,
      clipEnd,
      clipDuration: clipEnd - clipStart,
      downloadMethod: isRealClip ? 'PROCESSED_FILE' : 'URL_PARAMETERS',
      clientInfo,
      timestamp: new Date().toISOString()
    });

    if (!isRealClip) {
      // Abrir en nueva ventana para el método simple
      window.open(clipUrl, '_blank');
      
      // Registrar apertura de clip con método simple
      loggerService.createLogEntry({
        action: 'CLIP_OPENED_NEW_WINDOW',
        videoCode: code,
        videoTitle: video?.title,
        clipStart,
        clipEnd,
        clipUrl,
        method: 'URL_PARAMETERS',
        timestamp: new Date().toISOString()
      });

      setNotification({
        open: true,
        message: 'Se ha abierto el fragmento en una nueva ventana. Para obtener un archivo recortado real, necesitas un navegador compatible con procesamiento avanzado.',
        severity: 'info'
      });
      return;
    }

    // Para clips reales, permitir descarga
    try {
      console.log('Iniciando descarga del clip desde URL:', clipUrl);

      const filename = `clip-${code}-${formatTimeForFilename(clipStart)}-${formatTimeForFilename(clipEnd)}.mp4`;
      
      const a = document.createElement('a');
      a.href = clipUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Registrar descarga exitosa
      loggerService.createLogEntry({
        action: 'CLIP_DOWNLOAD_SUCCESS',
        videoCode: code,
        videoTitle: video?.title,
        clipStart,
        clipEnd,
        filename,
        downloadMethod: 'BLOB_URL',
        timestamp: new Date().toISOString(),
        clientInfo
      });

      setNotification({
        open: true,
        message: 'Descarga iniciada. Si no funciona, haz clic derecho en el botón y selecciona "Guardar enlace como..."',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al descargar el clip:', error);
      
      // Registrar error de descarga
      loggerService.logError(
        video,
        'CLIP_DOWNLOAD_ERROR',
        error.message,
        {
          clipStart,
          clipEnd, 
          timestamp: new Date().toISOString(),
          clientInfo
        }
      );

      // Proporcionar un método alternativo de descarga
      setNotification({
        open: true,
        message: `Error al descargar: ${error.message}. Intenta hacer clic derecho y "Guardar enlace como..."`,
        severity: 'error'
      });

      // Crear un enlace visible como alternativa
      const downloadDiv = document.createElement('div');
      downloadDiv.style.position = 'fixed';
      downloadDiv.style.top = '20px';
      downloadDiv.style.right = '20px';
      downloadDiv.style.backgroundColor = 'white';
      downloadDiv.style.padding = '15px';
      downloadDiv.style.borderRadius = '5px';
      downloadDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      downloadDiv.style.zIndex = '9999';

      const filename = `clip-${code}-${formatTimeForFilename(clipStart)}-${formatTimeForFilename(clipEnd)}.mp4`;
      const downloadLink = document.createElement('a');
      downloadLink.href = clipUrl;
      downloadLink.download = filename;
      downloadLink.textContent = 'Haz clic aquí para descargar';
      downloadLink.style.color = 'blue';
      downloadLink.style.textDecoration = 'underline';
      
      // Registrar uso de método alternativo de descarga
      downloadLink.onclick = () => {
        loggerService.createLogEntry({
          action: 'CLIP_DOWNLOAD_ALTERNATIVE_METHOD',
          videoCode: code,
          videoTitle: video?.title,
          clipStart,
          clipEnd,
          filename,
          method: 'ALTERNATIVE_LINK',
          timestamp: new Date().toISOString()
        });
      };

      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'X';
      closeBtn.style.marginLeft = '10px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = () => document.body.removeChild(downloadDiv);

      downloadDiv.appendChild(downloadLink);
      downloadDiv.appendChild(closeBtn);
      document.body.appendChild(downloadDiv);
    }
  };

  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
    
    // Registrar cierre de notificación si es relevante
    if (notification.severity === 'error' || notification.severity === 'warning') {
      loggerService.createLogEntry({
        action: 'NOTIFICATION_CLOSED',
        videoCode: code,
        notificationType: notification.severity,
        notificationMessage: notification.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Intentando cargar video con código: ${code}`);
        
        // Obtener información del cliente para el registro
        const clientInfo = await getClientInfo();
        
        // Registrar intento de acceso al video
        loggerService.createLogEntry({
          action: 'VIDEO_ACCESS_ATTEMPT',
          videoCode: code,
          clientInfo,
          timestamp: new Date().toISOString()
        });
        
        const videoData = await getVideoByCode(code);

        if (isMounted) {
          console.log('Video cargado correctamente:', videoData);
          setVideo(videoData);
          setLoading(false);

          // Inicializar tiempos de clip
          if (videoData.duration) {
            const endTime = Math.min(30, videoData.duration);
            setClipStart(0);
            setClipEnd(endTime);
          }
          
          // Registrar acceso exitoso al video
          loggerService.logVideoAccess({
            ...videoData,
            code, // Aseguramos que el código esté incluido
            clientInfo,
            accessTime: new Date().toISOString()
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error al cargar el video:', err);
          setError(err.message || 'No se pudo cargar el video');
          setLoading(false);
          
          // Registrar error de acceso
          loggerService.logError(
            { code }, 
            'VIDEO_LOAD_ERROR', 
            err.message,
            { 
              timestamp: new Date().toISOString(),
              browserInfo: navigator.userAgent
            }
          );
        }
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
      // Limpiar URL si existe
      if (clipUrl) {
        URL.revokeObjectURL(clipUrl);
      }
    };
  }, [code, clipUrl]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box my={4}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ mb: 2 }}
          >
            Volver al inicio
          </Button>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
            onClick={() => {
              // Registrar navegación de regreso
              loggerService.createLogEntry({
                action: 'NAVIGATE_BACK',
                fromPage: 'VideoPage',
                videoCode: code,
                timestamp: new Date().toISOString()
              });
            }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            {video.title}
          </Typography>
          
          {/* Añadir enlace a página de administración - solo visible para desarrollo/depuración */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              component={Link}
              to="/admin"
              size="small"
              sx={{ ml: 'auto', fontSize: '0.7rem' }}
              variant="outlined"
            >
              Admin
            </Button>
          )}
        </Box>

        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Código del video: {code}
        </Typography>

        {!ffmpegSupported && (
          <Alert
            severity="warning"
            icon={<Warning />}
            sx={{ mb: 3 }}
          >
            Tu navegador no soporta el procesamiento avanzado de video (SharedArrayBuffer).
            Algunas funciones estarán limitadas. Se usará un método alternativo para abrir clips.
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SimpleVideoPlayer videoSrc={video.url} />
          </Grid>
          <Grid item xs={12} md={8}>
            <ClipSelector
              totalDuration={video.duration}
              onSelectionChange={handleSelectionChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Descargar Clip
                </Typography>

                {/* Método directo - Actualizado */}
                <Box my={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Método Rápido
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Abre el fragmento seleccionado en una nueva ventana. <strong>No descarga un archivo recortado</strong>.
                  </Typography>
                  <ButtonGroup variant="outlined" fullWidth>
                    <Button
                      startIcon={<Videocam />}
                      onClick={handleOpenDirectClip}
                      fullWidth
                    >
                      Abrir Fragmento
                    </Button>
                  </ButtonGroup>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Método avanzado - Destacado */}
                <Box my={2}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    color="primary"
                    sx={{ fontWeight: 'bold' }}
                  >
                    Método de Descarga Real
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    <strong>Recomendado:</strong> Procesa el video para crear un nuevo archivo que contiene exactamente el fragmento seleccionado.
                    {!ffmpegSupported && (
                      <span style={{ color: '#f44336', display: 'block', marginTop: '8px' }}>
                        (Tu navegador tiene limitaciones, se usará un método alternativo)
                      </span>
                    )}
                  </Typography>

                  <Box my={2}>
                    <ProcessingProgress
                      status={processStatus}
                      progress={processProgress}
                      processingDetails={processingError}
                      warningMessage={processWarning}
                    />
                  </Box>

                  {processingError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {processingError}
                    </Alert>
                  )}

                  <Box mt={2}>
                    {processStatus !== 'complete' ? (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<VideoLibrary />}
                        fullWidth
                        onClick={handleProcessClip}
                        disabled={processStatus === 'initializing' ||
                          processStatus === 'downloading' ||
                          processStatus === 'processing'}
                        sx={{ py: 1.5 }} // Hacerlo más grande
                      >
                        Procesar y Preparar para Descargar
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Download />}
                        fullWidth
                        onClick={handleDownloadClip}
                        sx={{ py: 1.5 }} // Hacerlo más grande
                      >
                        Descargar Clip Procesado
                      </Button>
                    )}
                  </Box>
                </Box>

                <Typography variant="caption" color="textSecondary" display="block" mt={3}>
                  *El método de descarga real crea un archivo nuevo que contiene exactamente el fragmento seleccionado, ideal para compartir o editar posteriormente.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity || 'info'}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default VideoPage;