import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Alert, 
  useTheme,
  Fade,
  alpha
} from '@mui/material';
import { 
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// En una aplicación real, esto debería estar en un servicio de autenticación
// y utilizar una implementación más segura
const ADMIN_CODE = "admin123"; // Código de ejemplo - cambia esto por tu código preferido

function AdminLogin({ onLoginSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();

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
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 4,
        background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center"
          >
            {/* Botón para volver */}
            <Box alignSelf="flex-start" mb={2}>
              <Button
                component={Link}
                to="/"
                startIcon={<ArrowBackIcon />}
                sx={{ ml: -1 }}
              >
                Volver a Inicio
              </Button>
            </Box>
            
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              color="primary"
              fontWeight="medium"
              textAlign="center"
            >
              Acceso de Administrador
            </Typography>
            
            <Paper 
              elevation={4} 
              sx={{ 
                p: 4, 
                width: '100%', 
                mt: 4,
                borderRadius: 2,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }}
            >
              {/* Ícono de bloqueo centrado */}
              <Box display="flex" justifyContent="center" mb={3}>
                <Box 
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: '50%',
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LockIcon color="primary" sx={{ fontSize: 36 }} />
                </Box>
              </Box>
              
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
                  sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                >
                  Acceder
                </Button>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default AdminLogin;