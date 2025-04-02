import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Tooltip, Pagination, 
  CircularProgress, Alert, Switch, FormControlLabel, 
  Select, MenuItem, InputLabel, FormControl,
  Chip
} from '@mui/material';
import { 
  Download, Delete, Refresh, Info, 
  FilterAlt, CloudDownload, Storage
} from '@mui/icons-material';

import loggerService from '../services/loggerService';
import mongoDBService from '../services/mongoDBService';
import { isApiAvailable } from '../config/apiConfig';

function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [localLogs, setLocalLogs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('api'); // 'api' o 'local'
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 50,
    totalLogs: 0
  });
  const [apiAvailable, setApiAvailable] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterVideoCode, setFilterVideoCode] = useState('');

  // Cargar logs al montar el componente
  useEffect(() => {
    checkApiAndLoadLogs();
  }, []);

  // Cargar logs cuando cambia la página o filtros
  useEffect(() => {
    if (dataSource === 'api' && apiAvailable) {
      loadLogsFromApi();
    }
  }, [pagination.page, filterAction, filterVideoCode, dataSource]);

  // Verificar API y cargar logs iniciales
  const checkApiAndLoadLogs = async () => {
    setLoading(true);
    try {
      // Verificar si la API está disponible
      const isAvailable = await isApiAvailable();
      setApiAvailable(isAvailable);
      
      // Cargar los logs locales de todos modos
      loadLocalLogs();
      
      // Si la API está disponible, cargar desde allí
      if (isAvailable) {
        setDataSource('api');
        await loadLogsFromApi();
      } else {
        setDataSource('local');
      }
    } catch (error) {
      console.error('Error al verificar API:', error);
      setApiAvailable(false);
      setDataSource('local');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar logs desde la API
  const loadLogsFromApi = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (filterAction) filter.action = filterAction;
      if (filterVideoCode) filter.videoCode = filterVideoCode;
      
      const response = await loggerService.getAllLogs(
        pagination.page, 
        pagination.limit,
        filter
      );
      
      if (response.success) {
        setLogs(response.logs);
        setPagination({
          ...pagination,
          totalPages: response.pagination.totalPages,
          totalLogs: response.pagination.totalLogs
        });
      } else {
        // Si hay error en la API, cambiar a logs locales
        setDataSource('local');
        setApiAvailable(false);
      }
    } catch (error) {
      console.error('Error al cargar logs desde API:', error);
      setDataSource('local');
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar logs desde localStorage
  const loadLocalLogs = () => {
    try {
      const allLogs = JSON.parse(localStorage.getItem('video_editor_logs') || '[]');
      setLocalLogs(allLogs);
    } catch (error) {
      console.error('Error al cargar logs locales:', error);
      setLocalLogs([]);
    }
  };

  // Cambiar página
  const handlePageChange = (event, value) => {
    setPagination({
      ...pagination,
      page: value
    });
  };

  // Cambiar fuente de datos
  const handleDataSourceChange = (event) => {
    const newSource = event.target.checked ? 'api' : 'local';
    setDataSource(newSource);
    
    // Si cambia a API y no tenemos logs, cargarlos
    if (newSource === 'api' && apiAvailable && logs.length === 0) {
      loadLogsFromApi();
    }
    
    // Reset pagination when switching sources
    setPagination({
      ...pagination,
      page: 1
    });
  };

  // Filtrar logs locales según la entrada del usuario
  const filteredLocalLogs = localLogs.filter(log => {
    // Aplicar filtro de texto
    const textMatch = !filter || JSON.stringify(log).toLowerCase().includes(filter.toLowerCase());
    
    // Aplicar filtro de acción
    const actionMatch = !filterAction || log.action === filterAction;
    
    // Aplicar filtro de videoCode
    const videoMatch = !filterVideoCode || log.videoCode === filterVideoCode;
    
    return textMatch && actionMatch && videoMatch;
  });

  // Mostrar detalles de un log
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  // Descargar todos los logs como archivo JSON
  const handleDownloadLogs = async () => {
    try {
      if (dataSource === 'api' && apiAvailable) {
        // Descargar desde la API
        await loggerService.exportLogs('json', 30, filterVideoCode);
      } else {
        // Descargar desde localStorage
        const logsJson = JSON.stringify(filteredLocalLogs, null, 2);
        const blob = new Blob([logsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_editor_logs_${new Date().toISOString().replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al descargar logs:', error);
      alert('Error al descargar los logs: ' + error.message);
    }
  };

  // Sincronizar logs locales con la API
  const handleSyncLogs = async () => {
    if (!apiAvailable) {
      alert('La API no está disponible. No se pueden sincronizar los logs.');
      return;
    }
    
    try {
      setLoading(true);
      const result = await loggerService.syncLocalLogs();
      
      if (result.success) {
        alert(`Sincronización exitosa. ${result.syncedCount} logs sincronizados.`);
        // Refrescar datos
        loadLocalLogs();
        loadLogsFromApi();
      } else {
        alert('Error en la sincronización: ' + result.error);
      }
    } catch (error) {
      console.error('Error al sincronizar logs:', error);
      alert('Error al sincronizar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener acciones únicas de los logs locales (para el filtro)
  const getUniqueActions = () => {
    const actions = new Set();
    
    if (dataSource === 'local') {
      localLogs.forEach(log => {
        if (log.action) actions.add(log.action);
      });
    } else {
      logs.forEach(log => {
        if (log.action) actions.add(log.action);
      });
    }
    
    return Array.from(actions).sort();
  };

  // Obtener códigos de video únicos de los logs (para el filtro)
  const getUniqueVideoCodes = () => {
    const codes = new Set();
    
    if (dataSource === 'local') {
      localLogs.forEach(log => {
        if (log.videoCode) codes.add(log.videoCode);
      });
    } else {
      logs.forEach(log => {
        if (log.videoCode) codes.add(log.videoCode);
      });
    }
    
    return Array.from(codes).sort();
  };

  // Borrar todos los logs locales
  const handleClearLocalLogs = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los logs guardados localmente? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('video_editor_logs');
      setLocalLogs([]);
    }
  };

  // Los logs que se muestran dependen de la fuente de datos
  const displayedLogs = dataSource === 'api' ? logs : filteredLocalLogs;

  return (
    <Paper elevation={2} sx={{ p: 3, my: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Registros de Auditoría</Typography>
        <Box>
          <Tooltip title="Actualizar registros">
            <IconButton 
              onClick={dataSource === 'api' ? loadLogsFromApi : loadLocalLogs} 
              size="small" 
              sx={{ mr: 1 }}
              disabled={loading}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Download />} 
            onClick={handleDownloadLogs}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Exportar
          </Button>
          
          {apiAvailable && (
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<CloudDownload />} 
              onClick={handleSyncLogs}
              sx={{ mr: 1 }}
              disabled={loading || dataSource === 'api'}
            >
              Sincronizar
            </Button>
          )}
          
          {dataSource === 'local' && (
            <Button 
              variant="outlined" 
              color="error" 
              size="small" 
              startIcon={<Delete />} 
              onClick={handleClearLocalLogs}
              disabled={loading || localLogs.length === 0}
            >
              Limpiar Local
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Panel de Filtros y Opciones */}
      <Box mb={3}>
        <FormControlLabel
          control={
            <Switch 
              checked={dataSource === 'api'} 
              onChange={handleDataSourceChange}
              disabled={!apiAvailable}
            />
          }
          label={
            <Box display="flex" alignItems="center">
              <Storage fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {dataSource === 'api' ? 'Datos de MongoDB' : 'Datos Locales'}
              </Typography>
            </Box>
          }
        />
        
        {!apiAvailable && (
          <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
            La conexión a la API no está disponible. Se están mostrando datos guardados localmente.
          </Alert>
        )}
        
        <Box display="flex" gap={2} mt={2} flexWrap="wrap">
          <TextField 
            label="Buscar en logs" 
            variant="outlined" 
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '200px' }}
          />
          
          <FormControl size="small" sx={{ minWidth: '180px' }}>
            <InputLabel id="action-filter-label">Acción</InputLabel>
            <Select
              labelId="action-filter-label"
              value={filterAction}
              label="Acción"
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {getUniqueActions().map(action => (
                <MenuItem key={action} value={action}>{action}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: '180px' }}>
            <InputLabel id="video-filter-label">Código de Video</InputLabel>
            <Select
              labelId="video-filter-label"
              value={filterVideoCode}
              label="Código de Video"
              onChange={(e) => setFilterVideoCode(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {getUniqueVideoCodes().map(code => (
                <MenuItem key={code} value={code}>{code}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Acción</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Video</TableCell>
                  <TableCell>Datos de Clip</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedLogs.length > 0 ? (
                  displayedLogs.map((log, index) => (
                    <TableRow key={log._id || index} hover>
                      <TableCell>
                        <Chip 
                          label={log.action || 'N/A'} 
                          size="small" 
                          color={
                            log.status === 'ERROR' ? 'error' :
                            log.status === 'WARNING' ? 'warning' :
                            log.status === 'SUCCESS' ? 'success' :
                            'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.videoCode || log.videoTitle ? 
                          `${log.videoCode || ''} ${log.videoTitle ? `(${log.videoTitle})` : ''}` : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        {log.clipStart !== undefined && log.clipEnd !== undefined ? 
                          `${log.clipStart}s - ${log.clipEnd}s (${log.clipEnd - log.clipStart}s)` : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        {log.status || (log.error ? 'ERROR' : 'N/A')}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleViewDetails(log)}>
                          <Info fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No hay registros disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Paginación para datos de API */}
          {dataSource === 'api' && pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination 
                count={pagination.totalPages} 
                page={pagination.page}
                onChange={handlePageChange}
                color="primary" 
              />
            </Box>
          )}
          
          <Typography variant="caption" color="textSecondary" mt={1} display="block">
            {dataSource === 'api' ? 
              `${pagination.totalLogs} registros totales, mostrando página ${pagination.page} de ${pagination.totalPages}` : 
              `${filteredLocalLogs.length} registros en almacenamiento local${filter ? ', filtrados de ' + localLogs.length : ''}`
            }
          </Typography>
        </>
      )}
      
      {/* Diálogo para mostrar detalles */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Detalles del Registro</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default LogViewer;