import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, Grid, Paper, 
  CircularProgress, Alert, FormControlLabel, Switch, Snackbar
} from '@mui/material';
import { Download, ArrowBack, Warning } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import SimpleVideoPlayer from '../components/SimpleVideoPlayer';
import ClipSelector from '../components/ClipSelector';
import ProcessingProgress from '../components/ProcessingProgress';
import { getVideoByCode } from '../services/videoService';
import { clipVideo, isFFmpegSupported } from '../services/ffmpegService';

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
  
  // Estado para notificaciones
  const [notification, setNotification] = useState({ open: false, message: '' });
  
  // Verificar si FFmpeg es compatible con este navegador
  const [ffmpegSupported, setFfmpegSupported] = useState(true);

  useEffect(() => {
    setFfmpegSupported(isFFmpegSupported());
  }, []);
  
  // Función para manejar cambios en la selección de clip
  const handleSelectionChange = (start, end) => {
    setClipStart(start);
    setClipEnd(end);
    
    // Restablecer el estado de procesamiento si cambia la selección
    if (processStatus === 'complete' || processStatus === 'error') {
      setProcessStatus('idle');
      if (clipUrl) {
        URL.revokeObjectURL(clipUrl);
        setClipUrl(null);
      }
    }
  };
  
  // Función para procesar y descargar el clip
  const handleProcessClip = async () => {
    if (!ffmpegSupported) {
      setNotification({
        open: true,
        message: 'Tu navegador no es compatible con FFmpeg. Intenta con Chrome o Firefox reciente.'
      });
      return;
    }
    
    try {
      // Limpiar URL anterior si existe
      if (clipUrl) {
        URL.revokeObjectURL(clipUrl);
      }
      
      setProcessStatus('initializing');
      setProcessProgress(0);
      
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
      
      // Procesar el video
      const result = await clipVideo(
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
          }
        }
      );
      
      // Actualizar estado con la URL del clip
      setClipUrl(result.url);
      setProcessStatus('complete');
      
      // Mostrar notificación de éxito
      setNotification({
        open: true,
        message: 'Clip procesado correctamente. Haz clic en Descargar para guardar.'
      });
      
    } catch (err) {
      console.error('Error al procesar el clip:', err);
      setProcessStatus('error');
      setNotification({
        open: true,
        message: `Error: ${err.message}`
      });
    }
  };
  
  // Función para descargar el clip
  const handleDownloadClip = () => {
    if (!clipUrl) return;
    
    const a = document.createElement('a');
    a.href = clipUrl;
    a.download = `clip-${code}-${formatTimeForFilename(clipStart)}-${formatTimeForFilename(clipEnd)}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Formatear tiempo para nombre de archivo (MM-SS)
  const formatTimeForFilename = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}-${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

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
            Tu navegador no es compatible con el procesamiento de video mediante FFmpeg. 
            La funcionalidad de recorte y descarga puede no estar disponible. 
            Intenta con Chrome o Firefox actualizados.
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
                
                <Box my={2}>
                  <ProcessingProgress 
                    status={processStatus} 
                    progress={processProgress}
                  />
                </Box>
                
                <Box mt={3} display="flex" flexDirection="column" gap={1}>
                  {processStatus !== 'complete' ? (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<Download />}
                      fullWidth
                      onClick={handleProcessClip}
                      disabled={processStatus === 'initializing' || 
                               processStatus === 'downloading' || 
                               processStatus === 'processing' ||
                               !ffmpegSupported}
                    >
                      Procesar Clip
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="success" 
                      startIcon={<Download />}
                      fullWidth
                      onClick={handleDownloadClip}
                    >
                      Descargar Clip
                    </Button>
                  )}
                </Box>
                
                <Typography variant="caption" color="textSecondary" display="block" mt={2}>
                  *El procesamiento puede tardar unos momentos dependiendo del tamaño del clip
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
        message={notification.message}
      />
    </Container>
  );
}

export default VideoPage;