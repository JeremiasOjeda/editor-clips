import React, { useState, useEffect } from 'react';
import { Box, Slider, Typography, Paper } from '@mui/material';

function ClipSelector({ totalDuration = 60 }) {
  const [range, setRange] = useState([0, totalDuration > 30 ? 30 : totalDuration]);

  // Actualizar el rango cuando cambie la duración total
  useEffect(() => {
    setRange([0, Math.min(30, totalDuration)]);
  }, [totalDuration]);

  const handleChange = (event, newValue) => {
    setRange(newValue);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Paper elevation={2}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Seleccionar Fragmento
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Duración total: {formatTime(totalDuration)}
        </Typography>
        <Box px={2} mt={4}>
          <Slider
            value={range}
            onChange={handleChange}
            valueLabelDisplay="on"
            aria-labelledby="range-slider"
            min={0}
            max={totalDuration}
            valueLabelFormat={formatTime}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2" color="textSecondary">
              Inicio: {formatTime(range[0])}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Fin: {formatTime(range[1])}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" mt={2}>
            Duración del clip: {formatTime(range[1] - range[0])}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default ClipSelector;