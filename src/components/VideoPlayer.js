import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

// Este es un componente temporal que será reemplazado por el reproductor real
function VideoPlayer({ videoSrc }) {
  return (
    <Paper elevation={2}>
      <Box p={2} bgcolor="black" color="white" textAlign="center">
        <Typography variant="h6">
          Reproductor de Video
        </Typography>
        <Box 
          mt={2} 
          height="240px" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bgcolor="#333"
        >
          <Typography variant="body2">
            El reproductor de video se implementará en el próximo sprint
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default VideoPlayer;