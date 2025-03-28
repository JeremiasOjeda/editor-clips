import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Alert 
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

// En una aplicación real, esto debería estar en un servicio de autenticación
// y utilizar una implementación más segura
const ADMIN_CODE = "admin123"; // Código de ejemplo - cambia esto por tu código preferido

function AdminLogin({ onLoginSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Por favor ingrese el código de administrador');
      return;
    }

    if (code === ADMIN_CODE) {
      // Código correcto - almacenar en localStorage para persistencia
      localStorage.setItem('adminAuthenticated', 'true');
      
      // Llamar al callback de éxito
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setError('Código de administrador incorrecto');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={8} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Acceso de Administrador
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, width: '100%', mt: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Código de Administrador"
              variant="outlined"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              autoFocus
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<LockIcon />}
              sx={{ mt: 3 }}
            >
              Acceder
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminLogin;