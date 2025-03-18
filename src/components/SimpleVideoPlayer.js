import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

// Un reproductor de video simple usando el elemento nativo de HTML5
function SimpleVideoPlayer({ videoSrc }) {
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
          controls
          width="100%"
          height="auto"
          src={videoSrc}
          style={{ maxHeight: '70vh' }}
        >
          Tu navegador no soporta el elemento de video HTML5.
        </video>
      </Box>
    </Paper>
  );
}

export default SimpleVideoPlayer;