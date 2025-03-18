import React, { useState, useEffect } from 'react';
import { 
  Box, Slider, Typography, Paper, Grid, 
  TextField, Button, Stack 
} from '@mui/material';
import { ContentCut } from '@mui/icons-material';

function ClipSelector({ totalDuration = 60, onSelectionChange }) {
  const [range, setRange] = useState([0, Math.min(30, totalDuration)]);
  const [manualStartTime, setManualStartTime] = useState('00:00');
  const [manualEndTime, setManualEndTime] = useState('00:30');

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

  // Formatear segundos a MM:SS para mostrar en la interfaz
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Formatear segundos a MM:SS para los campos de entrada
  const formatTimeInput = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Convertir formato MM:SS a segundos
  const parseTimeInput = (timeString) => {
    const [minutes, seconds] = timeString.split(':').map(part => parseInt(part, 10));
    return (isNaN(minutes) ? 0 : minutes) * 60 + (isNaN(seconds) ? 0 : seconds);
  };

  // Manejar cambios en el campo de tiempo de inicio
  const handleStartTimeChange = (e) => {
    const timeString = e.target.value;
    setManualStartTime(timeString);
    
    // Solo actualizar el rango si el formato es válido
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
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
    
    // Solo actualizar el rango si el formato es válido
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      const newEndTime = parseTimeInput(timeString);
      if (newEndTime > range[0] && newEndTime <= totalDuration) {
        setRange([range[0], newEndTime]);
        if (onSelectionChange) {
          onSelectionChange(range[0], newEndTime);
        }
      }
    }
  };

  // Establecer duración máxima de clip (30 segundos por defecto)
  const handleSet30s = () => {
    const startTime = range[0];
    const endTime = Math.min(startTime + 30, totalDuration);
    setRange([startTime, endTime]);
    setManualEndTime(formatTimeInput(endTime));
    if (onSelectionChange) {
      onSelectionChange(startTime, endTime);
    }
  };

  // Establecer duración máxima de clip (1 minuto por defecto)
  const handleSet1m = () => {
    const startTime = range[0];
    const endTime = Math.min(startTime + 60, totalDuration);
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
        
        <Box px={2} mt={4}>
          <Slider
            value={range}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            min={0}
            max={totalDuration}
            valueLabelFormat={formatTime}
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
                placeholder="00:00"
                size="small"
                inputProps={{ 
                  pattern: "[0-9]{1,2}:[0-9]{2}",
                  title: "Formato: MM:SS" 
                }}
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
                placeholder="00:00"
                size="small"
                inputProps={{ 
                  pattern: "[0-9]{1,2}:[0-9]{2}",
                  title: "Formato: MM:SS" 
                }}
              />
            </Grid>
          </Grid>
          
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Duración seleccionada: {formatTime(range[1] - range[0])} 
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleSet30s}
              >
                Establecer 30s
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleSet1m}
              >
                Establecer 1m
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export default ClipSelector;