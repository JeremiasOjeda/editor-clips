import React from 'react';
import { Box, Slider, Typography, Paper } from '@mui/material';

function ClipSelector() {
  const [range, setRange] = React.useState([10, 30]);

  const handleChange = (event, newValue) => {
    setRange(newValue);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Paper elevation={2}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Seleccionar Fragmento
        </Typography>
        <Box px={2} mt={4}>
          <Slider
            value={range}
            onChange={handleChange}
            valueLabelDisplay="on"
            aria-labelledby="range-slider"
            min={0}
            max={60}
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
        </Box>
      </Box>
    </Paper>
  );
}

export default ClipSelector;