import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Grid, CircularProgress,
  Tabs, Tab, Divider, Alert, Card, CardContent, List,
  ListItem, ListItemText, Chip, Switch, FormControlLabel
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  ViewList as ListIcon,
  Timeline as StatsIcon
} from '@mui/icons-material';

import loggerService from '../services/loggerService';
import mongoDBService from '../services/mongoDBService';
import { isApiAvailable } from '../config/apiConfig';

// Panel para administrar la base de datos MongoDB
function DatabaseAdminPanel() {
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [autoSync, setAutoSync] = useState(localStorage.getItem('autoSyncEnabled') === 'true');
  
  // Verificar conexión a MongoDB al cargar el componente
  useEffect(() => {
    checkConnection();
    
    // Si autoSync está habilitado, intentar sincronizar datos locales
    if (autoSync) {
      syncLocalData();
    }
  }, []);
  
  // Función para verificar la conexión a MongoDB
  const checkConnection = async () => {
    setLoading(true);
    try {
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        setConnectionStatus({
          status: 'error',
          message: 'No se pudo conectar al servidor de la API'
        });
        setLoading(false);
        return;
      }
      
      const result = await mongoDBService.checkMongoDBConnection();
      setConnectionStatus(result);
      
      if (result.status === 'connected') {
        // Si está conectado, cargar estadísticas
        loadStats();
      }
    } catch (error) {
      console.error('Error al verificar conexión:', error);
      setConnectionStatus({
        status: 'error',
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar estadísticas
  const loadStats = async () => {
    try {
      const statsData = await mongoDBService.getDatabaseStats();
      if (statsData.success) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };
  
  // Función para sincronizar datos locales con MongoDB
  const syncLocalData = async () => {
    setLoading(true);
    setSyncStatus({
      status: 'syncing',
      message: 'Sincronizando datos locales con MongoDB...'
    });
    
    try {
      // Sincronizar logs de auditoría
      const syncResult = await loggerService.syncLocalLogs();
      
      setSyncStatus({
        status: 'success',
        message: `Sincronización completada. ${syncResult.syncedCount} registros sincronizados.`,
        details: syncResult
      });
      
      // Actualizar estadísticas
      if (connectionStatus?.status === 'connected') {
        loadStats();
      }
    } catch (error) {
      console.error('Error al sincronizar datos:', error);
      setSyncStatus({
        status: 'error',
        message: `Error al sincronizar: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar cambio en las pestañas
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  
  // Manejar cambio en autoSync
  const handleAutoSyncChange = (event) => {
    const newValue = event.target.checked;
    setAutoSync(newValue);
    localStorage.setItem('autoSyncEnabled', newValue);
  };
  
  // Renderizar contenido según la pestaña seleccionada
  const renderTabContent = () => {
    switch (tabIndex) {
      case 0: // Resumen
        return (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Resumen de la Base de Datos
            </Typography>
            
            {stats ? (
              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Clips de Video
                      </Typography>
                      <Typography variant="h4">
                        {stats.clipStats?.totalClips || 0}
                      </Typography>
                      
                      <Typography variant="subtitle2" mt={2}>
                        Top Videos:
                      </Typography>
                      <List dense>
                        {stats.clipStats?.videosWithMostClips?.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={item.title} 
                              secondary={`${item.count} clips - Duración promedio: ${Math.round(item.averageDuration)}s`}
                            />
                          </ListItem>
                        )) || <ListItem><ListItemText primary="No hay datos disponibles" /></ListItem>}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Registros de Auditoría
                      </Typography>
                      <Typography variant="h4">
                        {stats.auditStats?.totalLogs || 0}
                      </Typography>
                      
                      <Typography variant="subtitle2" mt={2}>
                        Acciones más frecuentes:
                      </Typography>
                      <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                        {stats.auditStats?.actionStats?.map((item, index) => (
                          <Chip 
                            key={index}
                            label={`${item._id}: ${item.count}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )) || <Typography variant="body2">No hay datos disponibles</Typography>}
                      </Box>
                      
                      <Typography variant="subtitle2" mt={2}>
                        Videos más accedidos:
                      </Typography>
                      <List dense>
                        {stats.auditStats?.topVideos?.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={item.title || item._id} 
                              secondary={`${item.count} accesos`}
                            />
                          </ListItem>
                        )) || <ListItem><ListItemText primary="No hay datos disponibles" /></ListItem>}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No hay estadísticas disponibles
              </Typography>
            )}
          </Box>
        );
      
      case 1: // Sincronización
        return (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Sincronización de Datos
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Esta función sincroniza los registros guardados localmente con la base de datos MongoDB.
              Es útil cuando la aplicación ha funcionado sin conexión.
            </Alert>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={autoSync} 
                  onChange={handleAutoSyncChange}
                  color="primary"
                />
              }
              label="Sincronización automática al iniciar"
            />
            
            {syncStatus && (
              <Alert 
                severity={
                  syncStatus.status === 'syncing' ? 'info' : 
                  syncStatus.status === 'success' ? 'success' : 'error'
                }
                sx={{ mt: 2, mb: 2 }}
              >
                {syncStatus.message}
              </Alert>
            )}
            
            <Box display="flex" gap={2} mt={3}>
              <Button
                variant="contained"
                startIcon={<SyncIcon />}
                onClick={syncLocalData}
                disabled={loading}
              >
                Sincronizar Datos
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => loggerService.exportLogs()}
                disabled={loading}
              >
                Exportar Logs Locales
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return <Typography>Contenido no disponible</Typography>;
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Administración de Base de Datos MongoDB
      </Typography>
      
      {/* Estado de conexión */}
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
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={checkConnection}
            disabled={loading}
            sx={{ mt: 1, mb: 3 }}
          >
            Verificar Conexión
          </Button>
        </>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Pestañas */}
      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab icon={<StatsIcon />} label="Resumen" />
        <Tab icon={<SyncIcon />} label="Sincronización" />
      </Tabs>
      
      {/* Contenido de la pestaña actual */}
      {renderTabContent()}
    </Paper>
  );
}

export default DatabaseAdminPanel;