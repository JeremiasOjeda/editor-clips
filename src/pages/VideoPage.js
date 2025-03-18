import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { Download, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import ClipSelector from '../components/ClipSelector';

function VideoPage() {
  const { code } = useParams();
  
  // En un escenario real, obtendríamos el video basado en este código
  const videoUrl = `https://example.com/videos/${code}.mp4`;

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
            Editor de Clips
          </Typography>
        </Box>

        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Código del video: {code}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <VideoPlayer videoSrc={videoUrl} />
          </Grid>
          <Grid item xs={12} md={8}>
            <ClipSelector />
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