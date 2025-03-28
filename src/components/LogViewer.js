import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Tooltip
} from '@mui/material';
import { Download, Delete, Refresh, Info } from '@mui/icons-material';

/**
 * Componente para visualizar y exportar los logs almacenados en localStorage
 * Útil para desarrollo/depuración antes de implementar una solución en servidor
 */
function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filter, setFilter] = useState('');

  // Cargar logs al montar el componente
  useEffect(() => {
    loadLogs();
  }, []);

  // Función para cargar logs desde localStorage
  const loadLogs = () => {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('video_editor_logs') || '[]');
      setLogs(storedLogs);
    } catch (error) {
      console.error('Error al cargar logs:', error);
      setLogs([]);
    }
  };

  // Filtrar logs según la entrada del usuario
  const filteredLogs = logs.filter(log => {
    if (!filter) return true;
    
    // Buscar en todas las propiedades del log
    return Object.values(log).some(value => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(filter.toLowerCase());
      }
      return false;
    });
  });

  // Mostrar detalles de un log
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  // Descargar todos los logs como archivo JSON
  const handleDownloadLogs = () => {
    try {
      const logsJson = JSON.stringify(logs, null, 2);
      const blob = new Blob([logsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_editor_logs_${new Date().toISOString().replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar logs:', error);
      alert('Error al descargar los logs: ' + error.message);
    }
  };

  // Descargar logs como archivo de texto
  const handleDownloadTxt = () => {
    try {
      // Convertir logs a formato texto
      const logLines = logs.map(log => {
        const timestamp = log.timestamp || new Date().toISOString();
        let lines = [`===== LOG ENTRY: ${timestamp} =====`];
        
        // Añadir todas las propiedades del log
        for (const [key, value] of Object.entries(log)) {
          if (key === 'timestamp') continue; // Ya incluido arriba
          
          if (typeof value === 'object' && value !== null) {
            lines.push(`${key.toUpperCase()}: ${JSON.stringify(value)}`);
          } else {
            lines.push(`${key.toUpperCase()}: ${value}`);
          }
        }
        
        lines.push('='.repeat(40)); // Separador
        return lines.join('\n');
      });
      
      const txtContent = logLines.join('\n\n');
      const blob = new Blob([txtContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_editor_logs_${new Date().toISOString().replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar logs como texto:', error);
      alert('Error al descargar los logs: ' + error.message);
    }
  };

  // Borrar todos los logs
  const handleClearLogs = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los logs? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('video_editor_logs');
      setLogs([]);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, my: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Registros de Auditoría (Local)</Typography>
        <Box>
          <Tooltip title="Actualizar registros">
            <IconButton onClick={loadLogs} size="small" sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Download />} 
            onClick={handleDownloadLogs}
            sx={{ mr: 1 }}
          >
            JSON
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Download />} 
            onClick={handleDownloadTxt}
            sx={{ mr: 1 }}
          >
            TXT
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            startIcon={<Delete />} 
            onClick={handleClearLogs}
          >
            Limpiar
          </Button>
        </Box>
      </Box>
      
      <TextField 
        fullWidth 
        label="Filtrar logs" 
        variant="outlined" 
        size="small"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <TableContainer sx={{ maxHeight: 400 }}>
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
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <TableRow key={index} hover>
                  <TableCell>{log.action || 'N/A'}</TableCell>
                  <TableCell>{log.timestamp || 'N/A'}</TableCell>
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
      
      <Typography variant="caption" color="textSecondary" mt={1} display="block">
        {logs.length} registros en total. {filter ? `${filteredLogs.length} registros mostrados con el filtro actual.` : ''}
      </Typography>
      
      {/* Diálogo para mostrar detalles */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
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