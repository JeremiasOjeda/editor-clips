import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Grid, Paper,
  CircularProgress, Alert, FormControlLabel, Switch, Snackbar,
  Divider, ButtonGroup
} from '@mui/material';
import {
  Download, ArrowBack, Warning, VideoLibrary,
  Videocam, Link as LinkIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import SimpleVideoPlayer from '../components/SimpleVideoPlayer';
import ClipSelector from '../components/ClipSelector';
import ProcessingProgress from '../components/ProcessingProgress';
import { getVideoByCode } from '../services/videoService';
import { clipVideo, isFFmpegSupported, openVideoWithTimeParams } from '../services/ffmpegService';
// Si has implementado el servicio de MediaRecorder, podrías importarlo así:
// import { clipVideoWithMediaRecorder, isMediaRecorderSupported } from '../services/mediaRecorderService';

function VideoPage() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [video, setVideo] = useState(null);
  const [useAdvancedPlayer, setUseAdvancedPlayer] = useState(false);

  // Estado para la selección de clip
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(30);

  // Estado para el procesamiento
  const [processStatus, setProcessStatus] = useState('idle'); // idle, initializing, downloading, processing, complete, error
  const [processProgress, setProcessProgress] = useState(0);
  const [clipUrl, setClipUrl] = useState(null);
  const [processingError, setProcessingError] = useState(null);

  // Estado para notificaciones
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Verificar compatibilidad de FFmpeg
  const [ffmpegSupported] = useState(isFFmpegSupported());

  // Método para verificar si el navegador admite la descarga directa
  const canUseDownloadAttribute = () => {
    const a = document.createElement('a');
    return typeof a.download !== 'undefined';
  };

  // Función para manejar cambios en la selección de clip
  const handleSelectionChange = (start, end) => {
    setClipStart(start);
    setClipEnd(end);

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

    // Usar la función existente de ffmpegService
    openVideoWithTimeParams(video.url, clipStart, clipEnd);

    setNotification({
      open: true,
      message: 'Se ha abierto el fragmento del video en una nueva pestaña.',
      severity: 'info'
    });
  };

  // Método mejorado para la descarga directa
  const handleDirectDownload = () => {
    if (!video || !video.url) return;

    try {
      // Crear URL con parámetros de tiempo
      const separator = video.url.includes('?') ? '&' : '#';
      const clipUrl = `${video.url}${separator}t=${clipStart},${clipEnd}`;

      // Formatear nombre de archivo
      const safeTitle = code.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `clip_${safeTitle}_${formatTimeForFilename(clipStart)}-${formatTimeForFilename(clipEnd)}.mp4`;

      // Verificamos si podemos usar el atributo download
      if (canUseDownloadAttribute()) {
        // Crear elemento de enlace para descarga (puede no funcionar para videos cross-origin)
        const a = document.createElement('a');
        a.href = clipUrl;
        a.download = fileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Indicamos al usuario que esto puede abrir una nueva pestaña en lugar de descargar
        setNotification({
          open: true,
          message: 'Intentando descargar fragmento. Si se abre en el navegador en lugar de descargarse, prueba el método avanzado.',
          severity: 'info'
        });
      } else {
        // Si no podemos usar download, abrimos en una nueva ventana
        window.open(clipUrl, '_blank');
        setNotification({
          open: true,
          message: 'Tu navegador no soporta descarga directa. Se ha abierto el fragmento en una nueva pestaña.',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error al intentar descarga directa:', error);

      // Si falla, intentar abrir en una nueva ventana
      handleOpenDirectClip();

      setNotification({
        open: true,
        message: 'No se pudo descargar directamente. Se ha abierto en una nueva pestaña.',
        severity: 'warning'
      });
    }
  };

  // Formatear tiempo para nombres de archivo (MMSS format)
  const formatTimeForFilename = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Método mejorado para el procesamiento con FFmpeg
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
      
      // Verificar si el clip es demasiado largo (más de 2 minutos podría causar problemas)
      const clipDuration = clipEnd - clipStart;
      if (clipDuration > 120) {
        setNotification({
          open: true,
          message: 'El clip seleccionado es muy largo (>2 min). El procesamiento puede tardar o fallar. Considera usar un fragmento más corto.',
          severity: 'warning'
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
      
      // Procesar el video con manejo mejorado de errores
      try {
        const result = await clipVideo(
          video.url,
          clipStart,
          clipEnd,
          (progress) => {
            if (progress.type === 'download') {
              setProcessStatus('downloading');
              setProcessProgress(progress.progress);
              console.log('Progreso de descarga:', progress.progress);
            } else if (progress.type === 'processing') {
              setProcessStatus('processing');
              setProcessProgress(progress.progress);
              console.log('Progreso de procesamiento:', progress.progress);
            }
          }
        );
        
        console.log('Procesamiento completado. Tamaño del blob:', result.blob.size, 'bytes');
        
        if (result.blob.size < 1000) {
          throw new Error('El archivo generado es demasiado pequeño, posiblemente hubo un error en el procesamiento');
        }
        
        // Actualizar estado con la URL del clip
        setClipUrl(result.url);
        setProcessStatus('complete');
        
        // Mostrar notificación de éxito
        setNotification({
          open: true,
          message: 'Clip procesado correctamente. Haz clic en Descargar para guardar.',
          severity: 'success'
        });
      } catch (processingError) {
        console.error('Error específico del procesamiento:', processingError);
        setProcessingError(processingError.message || 'Error durante el procesamiento');
        setProcessStatus('error');
        
        setNotification({
          open: true,
          message: `Error al procesar: ${processingError.message}. Verifica que tu navegador soporte la función de procesamiento de video.`,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error general al procesar el clip:', err);
      setProcessStatus('error');
      setProcessingError(err.message || 'Error desconocido al procesar el video');
      
      setNotification({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Método mejorado para la descarga del clip procesado
  const handleDownloadClip = () => {
    if (!clipUrl) {
      setNotification({
        open: true,
        message: 'No hay clip disponible para descargar. Procesa primero el video.',
        severity: 'warning'
      });
      return;
    }
    
    try {
      console.log('Iniciando descarga del clip desde URL:', clipUrl);
      
      const a = document.createElement('a');
      a.href = clipUrl;
      a.download = `clip-${code}-${formatTimeForFilename(clipStart)}-${formatTimeForFilename(clipEnd)}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setNotification({
        open: true,
        message: 'Descarga iniciada. Si no funciona, haz clic derecho en el botón y selecciona "Guardar enlace como..."',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al descargar el clip:', error);
      
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
      
      const downloadLink = document.createElement('a');
      downloadLink.href = clipUrl;
      downloadLink.download = `clip-${code}-${formatTimeForFilename(clipStart)}-${formatTimeForFilename(clipEnd)}.mp4`;
      downloadLink.textContent = 'Haz clic aquí para descargar';
      downloadLink.style.color = 'blue';
      downloadLink.style.textDecoration = 'underline';
      
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
  };

  // Reemplaza el useEffect existente con esta versión corregida

  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Intentando cargar video con código: ${code}`);
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
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error al cargar el video:', err);
          setError(err.message || 'No se pudo cargar el video');
          setLoading(false);
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
  }, [code, clipUrl]); // Añadimos clipUrl como dependencia


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
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            {video.title}
          </Typography>
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
            Tu navegador puede tener limitaciones para el procesamiento avanzado de video.
            Si el método avanzado no funciona, utiliza el método directo.
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useAdvancedPlayer}
                    onChange={() => setUseAdvancedPlayer(!useAdvancedPlayer)}
                    name="playerToggle"
                    color="primary"
                  />
                }
                label="Usar reproductor avanzado (experimental)"
              />
            </Box>
            {useAdvancedPlayer ? (
              <VideoPlayer videoSrc={video.url} />
            ) : (
              <SimpleVideoPlayer videoSrc={video.url} />
            )}
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

                {/* Método directo - Actualizar descripción */}
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

                {/* Método avanzado - Destacar más */}
                <Box my={2}>
                  <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                    Método de Descarga Real
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    <strong>Recomendado:</strong> Procesa el video para crear un nuevo archivo que contiene exactamente el fragmento seleccionado.
                  </Typography>

                  <Box my={2}>
                    <ProcessingProgress
                      status={processStatus}
                      progress={processProgress}
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