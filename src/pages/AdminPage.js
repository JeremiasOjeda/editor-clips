import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, Divider, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowBack, SaveAlt, Security } from '@mui/icons-material';
import LogViewer from '../components/LogViewer';
import loggerService from '../services/loggerService';

/**
 * Página de administración para visualizar y exportar logs de auditoría
 * Esta página se puede proteger con autenticación en una implementación real
 */
function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Función simple de autenticación (en una aplicación real se haría en el servidor)
  const handleAuthenticate = () => {
    // En una aplicación real, NUNCA se haría esto - las contraseñas deben validarse en el servidor
    // Esto es solo para demostración
    if (password === 'admin123') {
      setAuthenticated(true);
      setError('');
      
      // Registrar inicio de sesión exitoso
      loggerService.createLogEntry({
        action: 'ADMIN_LOGIN',
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      });
    } else {
      setError('Contraseña incorrecta');
      
      // Registrar intento fallido de inicio de sesión
      loggerService.createLogEntry({
        action: 'ADMIN_LOGIN_ATTEMPT',
        status: 'FAILED',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Exportar logs como archivo de texto
  const handleExportLogs = () => {
    const result = loggerService.exportLogsToFile();
    if (result.success) {
      alert(`Se exportaron ${result.count} registros correctamente.`);
    } else {
      alert(`Error al exportar: ${result.message || result.error}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            Panel de Administración
          </Typography>
        </Box>

        {!authenticated ? (
          <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Security color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Acceso Restringido</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" paragraph>
              Ingrese la contraseña de administrador para acceder a los registros de auditoría.
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ mb: 2 }}
              onKeyPress={(e) => e.key === 'Enter' && handleAuthenticate()}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAuthenticate}
              fullWidth
            >
              Acceder
            </Button>
          </Paper>
        ) : (
          <Box>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Registro de Auditoría
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Esta página muestra los registros de actividad almacenados localmente en su navegador.
                En un entorno de producción, estos registros estarían almacenados en el servidor.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                startIcon={<SaveAlt />}
                onClick={handleExportLogs}
              >
                Exportar Todos los Registros
              </Button>
            </Paper>

            <LogViewer />
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default AdminPage;