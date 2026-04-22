import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Button, Grid, 
  Card, CardContent, CardMedia, CardActionArea, Zoom,
  Fade, useTheme, alpha
} from '@mui/material';
import { 
  AdminPanelSettings as AdminIcon,
  VideoLibrary as VideoIcon,
  ContentCut as ScissorsIcon,
  CloudDownload as DownloadIcon,
  DevicesOther as DeviceIcon
} from '@mui/icons-material';
import CodeInput from '../components/CodeInput';

function HomePage() {
  const theme = useTheme();

  // Características del editor para mostrar en las tarjetas
  const features = [
    {
      title: "Visualización de videos largos",
      description: "Reproduce videos de cualquier duración con controles avanzados de reproducción",
      icon: <VideoIcon fontSize="large" style={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Recorte preciso",
      description: "Selecciona con precisión los puntos de inicio y fin para tus clips",
      icon: <ScissorsIcon fontSize="large" style={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Descarga simple",
      description: "Descarga fragmentos específicos en formato MP4 compatible con todos los dispositivos",
      icon: <DownloadIcon fontSize="large" style={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Compatible con dispositivos móviles",
      description: "Funciona perfectamente en smartphones y tablets",
      icon: <DeviceIcon fontSize="large" style={{ color: theme.palette.primary.main }} />,
    }
  ];

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
        py: 4
      }}
    >
      <Container>
        {/* Cabecera con animación */}
        <Fade in={true} timeout={1000}>
          <Box my={4} display="flex" flexDirection="column" alignItems="center" textAlign="center">
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 2,
                textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              Editor de Clips de Video
            </Typography>
            <Typography 
              variant="h5" 
              color="textSecondary" 
              paragraph
              sx={{ maxWidth: '700px', mb: 4 }}
            >
              Recorta y descarga fragmentos específicos de videos largos con facilidad y precisión
            </Typography>
          </Box>
        </Fade>

        {/* Sección principal con entrada de código */}
        <Zoom in={true} timeout={800} style={{ transitionDelay: '300ms' }}>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 4, 
              mb: 5, 
              borderRadius: 2,
              backgroundColor: 'white',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }}
          >
            <Box textAlign="center" mb={3}>
              <VideoIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="medium">
                Ingresa el código del video para comenzar
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Introduce el código del video que deseas recortar
              </Typography>
            </Box>
            <CodeInput />
          </Paper>
        </Zoom>

        {/* Características */}
        <Box my={8}>
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 5, 
              color: theme.palette.primary.dark,
              fontWeight: 'medium'
            }}
          >
            Características
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in={true} style={{ transitionDelay: `${index * 150}ms` }}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer con enlace de administrador */}
        <Box mt={8} mb={4} textAlign="center">
          <Button
            component={Link}
            to="/admin"
            variant="outlined"
            size="medium"
            startIcon={<AdminIcon />}
            sx={{ 
              borderRadius: 2,
              py: 1,
              px: 3
            }}
          >
            Panel de Administración
          </Button>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
            © {new Date().getFullYear()} Editor de Clips de Video. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;