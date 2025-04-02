import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { checkMongoDBConnection } from '../services/mongoDBService';

function MongoDBConnection() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await checkMongoDBConnection();
      setConnectionStatus(result);
    } catch (err) {
      setError('Error al verificar la conexión: ' + err.message);
      setConnectionStatus({ status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar la conexión al cargar el componente
    checkConnection();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Estado de Conexión a MongoDB
      </Typography>
      
      {loading ? (
        <Box display="flex" alignItems="center" mt={2}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Verificando conexión...</Typography>
        </Box>
      ) : (
        <>
          {connectionStatus && (
            <Alert 
              severity={
                connectionStatus.status === 'connected' 
                  ? 'success' 
                  : connectionStatus.status === 'error' 
                    ? 'error' 
                    : 'warning'
              }
              sx={{ mt: 2, mb: 2 }}
            >
              {connectionStatus.message}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={checkConnection}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Verificar Conexión
          </Button>
        </>
      )}
    </Paper>
  );
}

export default MongoDBConnection;