import React, { useState, useEffect } from 'react';
import { 
  Box, Slider, Typography, Paper, Grid, 
  TextField, Button, Stack 
} from '@mui/material';

function ClipSelector({ totalDuration = 60, onSelectionChange }) {
  const [range, setRange] = useState([0, Math.min(30, totalDuration)]);
  const [manualStartTime, setManualStartTime] = useState('00:00');
  const [manualEndTime, setManualEndTime] = useState('00:30');

  // Función para generar marcas en cada hora para el slider
  const generateHourMarks = (duration) => {
    const marks = [];
    const hours = Math.floor(duration / 3600);
    
    for (let i = 0; i <= hours; i++) {
      marks.push({
        value: i * 3600,
        label: `${i}h`
      });
    }
    
    return marks;
  };

  // Actualizar el rango cuando cambie la duración total
  useEffect(() => {
    const endTime = Math.min(30, totalDuration);
    setRange([0, endTime]);
    setManualEndTime(formatTimeInput(endTime));
  }, [totalDuration]);

  // Actualizar los campos de texto cuando cambie el rango
  useEffect(() => {
    setManualStartTime(formatTimeInput(range[0]));
    setManualEndTime(formatTimeInput(range[1]));
  }, [range]);

  const handleSliderChange = (event, newValue) => {
    setRange(newValue);
    // Notificar al componente padre sobre el cambio
    if (onSelectionChange) {
      onSelectionChange(newValue[0], newValue[1]);
    }
  };

  // Formatear segundos a MM:SS o HH:MM:SS para mostrar en la interfaz
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    } else {
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
  };

  // Formatear segundos a MM:SS o HH:MM:SS para los campos de entrada
  const formatTimeInput = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (totalDuration >= 3600 || hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  // Convertir formato MM:SS o HH:MM:SS a segundos
  const parseTimeInput = (timeString) => {
    const parts = timeString.split(':').map(part => parseInt(part, 10));
    
    if (parts.length === 3) {
      // Formato HH:MM:SS
      const [hours, minutes, seconds] = parts;
      return (isNaN(hours) ? 0 : hours) * 3600 + 
             (isNaN(minutes) ? 0 : minutes) * 60 + 
             (isNaN(seconds) ? 0 : seconds);
    } else if (parts.length === 2) {
      // Formato MM:SS
      const [minutes, seconds] = parts;
      return (isNaN(minutes) ? 0 : minutes) * 60 + 
             (isNaN(seconds) ? 0 : seconds);
    }
    
    return 0;
  };

  // Manejar cambios en el campo de tiempo de inicio
  const handleStartTimeChange = (e) => {
    const timeString = e.target.value;
    setManualStartTime(timeString);
    
    // Validar formato de tiempo según la duración del video
    const timeRegex = totalDuration >= 3600 ? 
      /^\d{1,2}:\d{1,2}:\d{1,2}$/ : /^\d{1,2}:\d{1,2}$/;
    
    // Solo actualizar el rango si el formato es válido
    if (timeRegex.test(timeString)) {
      const newStartTime = parseTimeInput(timeString);
      if (newStartTime < range[1] && newStartTime >= 0 && newStartTime <= totalDuration) {
        setRange([newStartTime, range[1]]);
        if (onSelectionChange) {
          onSelectionChange(newStartTime, range[1]);
        }
      }
    }
  };

  // Manejar cambios en el campo de tiempo de fin
  const handleEndTimeChange = (e) => {
    const timeString = e.target.value;
    setManualEndTime(timeString);
    
    // Validar formato de tiempo según la duración del video
    const timeRegex = totalDuration >= 3600 ? 
      /^\d{1,2}:\d{1,2}:\d{1,2}$/ : /^\d{1,2}:\d{1,2}$/;
    
    // Solo actualizar el rango si el formato es válido
    if (timeRegex.test(timeString)) {
      const newEndTime = parseTimeInput(timeString);
      if (newEndTime > range[0] && newEndTime <= totalDuration) {
        setRange([range[0], newEndTime]);
        if (onSelectionChange) {
          onSelectionChange(range[0], newEndTime);
        }
      }
    }
  };

  // Establecer duración máxima de clip (30 segundos)
  const handleSet30s = () => {
    const startTime = range[0];
    const endTime = Math.min(startTime + 30, totalDuration);
    setRange([startTime, endTime]);
    setManualEndTime(formatTimeInput(endTime));
    if (onSelectionChange) {
      onSelectionChange(startTime, endTime);
    }
  };

  // Establecer duración máxima de clip (1 minuto)
  const handleSet1m = () => {
    const startTime = range[0];
    const endTime = Math.min(startTime + 60, totalDuration);
    setRange([startTime, endTime]);
    setManualEndTime(formatTimeInput(endTime));
    if (onSelectionChange) {
      onSelectionChange(startTime, endTime);
    }
  };

  // Establecer duración de 5 minutos para videos largos
  const handleSet5m = () => {
    const startTime = range[0];
    const endTime = Math.min(startTime + 300, totalDuration);
    setRange([startTime, endTime]);
    setManualEndTime(formatTimeInput(endTime));
    if (onSelectionChange) {
      onSelectionChange(startTime, endTime);
    }
  };

  return (
    <Paper elevation={2}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Seleccionar Fragmento de Video
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Duración total del video: {formatTimeInput(totalDuration)}
        </Typography>
        
        {totalDuration >= 3600 && (
          <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 2 }}>
            Este es un video largo (más de una hora). Para mejor rendimiento, selecciona fragmentos cortos.
          </Typography>
        )}
        
        <Box px={2} mt={4}>
          <Slider
            value={range}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            min={0}
            max={totalDuration}
            valueLabelFormat={formatTime}
            marks={totalDuration >= 3600 ? generateHourMarks(totalDuration) : undefined}
            sx={{ mb: 4 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Tiempo de inicio:
              </Typography>
              <TextField
                fullWidth
                value={manualStartTime}
                onChange={handleStartTimeChange}
                placeholder={totalDuration >= 3600 ? "00:00:00" : "00:00"}
                size="small"
                inputProps={{ 
                  pattern: totalDuration >= 3600 ? "[0-9]{1,2}:[0-9]{2}:[0-9]{2}" : "[0-9]{1,2}:[0-9]{2}",
                  title: totalDuration >= 3600 ? "Formato: HH:MM:SS" : "Formato: MM:SS" 
                }}
                helperText={totalDuration >= 3600 ? "Formato: HH:MM:SS" : "Formato: MM:SS"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Tiempo de fin:
              </Typography>
              <TextField
                fullWidth
                value={manualEndTime}
                onChange={handleEndTimeChange}
                placeholder={totalDuration >= 3600 ? "00:00:00" : "00:00"}
                size="small"
                inputProps={{ 
                  pattern: totalDuration >= 3600 ? "[0-9]{1,2}:[0-9]{2}:[0-9]{2}" : "[0-9]{1,2}:[0-9]{2}",
                  title: totalDuration >= 3600 ? "Formato: HH:MM:SS" : "Formato: MM:SS"
                }}
                helperText={totalDuration >= 3600 ? "Formato: HH:MM:SS" : "Formato: MM:SS"}
              />
            </Grid>
          </Grid>
          
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Duración seleccionada: {formatTime(range[1] - range[0])} 
            </Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleSet30s}
              >
                30s
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleSet1m}
              >
                1m
              </Button>
              {totalDuration >= 300 && (
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleSet5m}
                >
                  5m
                </Button>
              )}
            </Stack>
            
            {(range[1] - range[0]) > 300 && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 2 }}>
                ⚠️ Clip largo seleccionado ({formatTime(range[1] - range[0])}). El procesamiento puede tardar más tiempo.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export default ClipSelector;