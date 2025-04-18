import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';

// Un reproductor de video simple usando el elemento nativo de HTML5
function SimpleVideoPlayer({ videoSrc }) {
  const videoRef = useRef(null);
  
  // Efecto para manejar la carga del video
  useEffect(() => {
    // Si hay una referencia al video y una URL válida
    if (videoRef.current && videoSrc) {
      // Guardamos la referencia en una variable dentro del efecto
      // para evitar problemas con el cleanup de React
      const currentVideoElement = videoRef.current;
      
      // Forzar recarga del video cuando cambia la fuente
      currentVideoElement.load();
      
      // Log para debug
      console.log("Cargando video:", videoSrc);
      
      // Manejar errores de carga
      const handleError = (e) => {
        console.error("Error al cargar el video:", e);
      };
      
      currentVideoElement.addEventListener('error', handleError);
      
      // Función de limpieza que usa la variable local
      return () => {
        // Verificamos si el elemento todavía existe antes de quitar el listener
        if (currentVideoElement) {
          currentVideoElement.removeEventListener('error', handleError);
        }
      };
    }
  }, [videoSrc]); // Solo se ejecuta cuando cambia videoSrc

  if (!videoSrc) {
    return (
      <Paper elevation={2}>
        <Box bgcolor="black" color="white" p={4} textAlign="center">
          <Typography variant="body1">
            No hay video disponible. Por favor, seleccione un código válido.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2}>
      <Box p={0} bgcolor="black">
        <video
          ref={videoRef}
          controls
          width="100%"
          height="auto"
          src={videoSrc}
          crossOrigin="anonymous"
          preload="auto"
          style={{ maxHeight: '70vh' }}
        >
          <source src={videoSrc} type="video/mp4" />
          Tu navegador no soporta el elemento de video HTML5.
        </video>
      </Box>
    </Paper>
  );
}

export default SimpleVideoPlayer;