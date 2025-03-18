import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import { Download, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import ClipSelector from '../components/ClipSelector';
import { getVideoByCode } from '../services/videoService';

function VideoPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const videoData = await getVideoByCode(code);
        
        if (isMounted) {
          setVideo(videoData);
          setLoading(false);
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
    };
  }, [code]);

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

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <VideoPlayer videoSrc={video.url} />
          </Grid>
          <Grid item xs={12} md={8}>
            <ClipSelector totalDuration={video.duration} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Descargar Clip
                </Typography>
                <Typography variant="body2" paragraph>
                  El clip seleccionado se descargará en formato MP4.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Download />}
                  fullWidth
                  disabled
                >
                  Descargar Clip
                </Button>
                <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                  *La funcionalidad de descarga estará disponible en próximos sprints
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default VideoPage;