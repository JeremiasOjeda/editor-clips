import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, LinearProgress, 
  Paper, CircularProgress, 
  Step, Stepper, StepLabel
} from '@mui/material';

function ProcessingProgress({ status, progress, processingDetails }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  
  // Iniciar/detener el contador de tiempo según el estado
  useEffect(() => {
    if ((status === 'downloading' || status === 'processing') && !startTime) {
      setStartTime(Date.now());
    }
    
    if (status === 'idle' || status === 'complete' || status === 'error') {
      setStartTime(null);
      setElapsedTime(0);
    }
  }, [status, startTime]);
  
  // Actualizar el contador de tiempo
  useEffect(() => {
    let timer;
    if (startTime && (status === 'downloading' || status === 'processing')) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startTime, status]);
  
  // Formatear el tiempo transcurrido
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} seg`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} min`;
  };
  
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
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="textSecondary">
                {Math.round(progress)}%
              </Typography>
              {elapsedTime > 0 && (
                <Typography variant="caption" color="textSecondary">
                  Tiempo: {formatTime(elapsedTime)}
                </Typography>
              )}
            </Box>
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
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              {typeof progress === 'number' && (
                <Typography variant="caption" color="textSecondary">
                  {Math.round(progress)}%
                </Typography>
              )}
              {elapsedTime > 0 && (
                <Typography variant="caption" color="textSecondary">
                  Tiempo: {formatTime(elapsedTime)}
                </Typography>
              )}
            </Box>
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
          <Box>
            <Typography variant="body2" color="error" gutterBottom>
              Error durante el procesamiento. Por favor, intenta de nuevo.
            </Typography>
            {processingDetails && (
              <Typography variant="caption" color="error.light" sx={{ display: 'block', mt: 1 }}>
                Detalles: {processingDetails}
              </Typography>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Determinar el paso activo en el stepper
  const getActiveStep = () => {
    switch (status) {
      case 'idle': return -1;
      case 'initializing': return 0;
      case 'downloading': return 1;
      case 'processing': return 2;
      case 'complete': return 3;
      case 'error': return -1;
      default: return -1;
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="subtitle2" gutterBottom>
          Estado de Procesamiento
        </Typography>
        
        {/* Stepper con círculos más pequeños */}
        {status !== 'idle' && status !== 'error' && (
          <Stepper 
            activeStep={getActiveStep()} 
            sx={{ 
              mb: 2,
              '& .MuiStepLabel-label': {
                fontSize: '0.7rem',  // Texto aún más pequeño
                marginTop: '2px'     // Acercar las etiquetas a los círculos
              },
              '& .MuiStepLabel-iconContainer': {
                paddingRight: '6px'  // Menos espacio entre círculo y etiqueta
              },
              '& .MuiSvgIcon-root': {
                width: 20,            // Círculos más pequeños (por defecto son 24px)
                height: 20
              },
              '& .MuiStep-root': {
                padding: '0 8px'     // Menos espaciado horizontal entre pasos
              }
            }}
          >
            <Step>
              <StepLabel>Inicio</StepLabel>
            </Step>
            <Step>
              <StepLabel>Carga</StepLabel>
            </Step>
            <Step>
              <StepLabel>Corte</StepLabel>
            </Step>
            <Step>
              <StepLabel>Fin</StepLabel>
            </Step>
          </Stepper>
        )}
        
        {renderContent()}
      </Box>
    </Paper>
  );
}

export default ProcessingProgress;