import React from 'react';
import { 
  Box, Typography, LinearProgress, 
  Paper, CircularProgress 
} from '@mui/material';

function ProcessingProgress({ status, progress }) {
  // Función para renderizar el contenido según el estado
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <Typography variant="body2" color="textSecondary">
            Presiona el botón "Descargar Clip" para comenzar
          </Typography>
        );
      
      case 'initializing':
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Inicializando FFmpeg...
            </Typography>
          </Box>
        );
      
      case 'downloading':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              Descargando video...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="textSecondary" align="right" display="block" mt={0.5}>
              {Math.round(progress)}%
            </Typography>
          </Box>
        );
      
      case 'processing':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              Procesando video...
            </Typography>
            <LinearProgress 
              variant={typeof progress === 'number' ? "determinate" : "indeterminate"} 
              value={typeof progress === 'number' ? progress : undefined}
              sx={{ height: 8, borderRadius: 4 }}
            />
            {typeof progress === 'number' && (
              <Typography variant="caption" color="textSecondary" align="right" display="block" mt={0.5}>
                {Math.round(progress)}%
              </Typography>
            )}
          </Box>
        );
      
      case 'complete':
        return (
          <Typography variant="body2" color="success.main">
            ¡Procesamiento completado! El video está listo para descargar.
          </Typography>
        );
      
      case 'error':
        return (
          <Typography variant="body2" color="error">
            Error durante el procesamiento. Por favor, intenta de nuevo.
          </Typography>
        );
      
      default:
        return null;
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="subtitle2" gutterBottom>
          Estado de Procesamiento
        </Typography>
        {renderContent()}
      </Box>
    </Paper>
  );
}

export default ProcessingProgress;