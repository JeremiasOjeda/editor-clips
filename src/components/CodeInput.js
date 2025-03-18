import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

function CodeInput() {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      setError(false);
      navigate(`/video/${code}`);
    } else {
      setError(true);
    }
  };

  return (
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
  );
}

export default CodeInput;