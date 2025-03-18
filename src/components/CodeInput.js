import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Chip, Stack } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { getValidCodes } from '../services/videoService';

function CodeInput() {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const validCodes = getValidCodes();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      setError(false);
      navigate(`/video/${code}`);
    } else {
      setError(true);
    }
  };

  const handleDemoClick = (demoCode) => {
    setCode(demoCode);
    navigate(`/video/${demoCode}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Ingrese el código del video
        </Typography>
        <TextField
          fullWidth
          label="Código de video"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={error}
          helperText={error ? "Por favor ingrese un código válido" : ""}
          margin="normal"
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          size="large" 
          fullWidth 
          startIcon={<PlayArrow />}
          sx={{ mt: 2 }}
        >
          Continuar
        </Button>
      </Box>
      
      <Box mt={4}>
        <Typography variant="subtitle2" gutterBottom>
          O prueba con estos videos de demostración:
        </Typography>
        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
          {validCodes.map((demoCode) => (
            <Chip 
              key={demoCode}
              label={demoCode}
              onClick={() => handleDemoClick(demoCode)}
              color="primary"
              variant="outlined"
              clickable
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default CodeInput;