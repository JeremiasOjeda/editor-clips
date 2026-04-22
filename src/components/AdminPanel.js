import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, TextField, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Snackbar, Alert, Tooltip, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  RestartAlt as ResetIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import {
  getAllVideos,
  addVideo,
  removeVideo,
  updateVideo,
  estimateVideoDuration,
  resetToDefaults
} from '../services/videoService';

// Componente principal del panel de administración
function AdminPanel() {
  const [videos, setVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, videoCode: null });
  const [resetConfirmDialog, setResetConfirmDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [processingDuration, setProcessingDuration] = useState(false);
  
  // Estado del formulario de añadir/editar video
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    url: '',
    duration: 0,
    thumbnail: ''
  });
  
  // Mostrar notificación
  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);
  
  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const allVideos = await getAllVideos(); // Añadir await aquí
      setVideos(allVideos);
    } catch (error) {
      console.error('Error al cargar videos:', error);
      showNotification(`Error al cargar videos: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  // Cargar todos los videos al iniciar
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Abrir diálogo para añadir video
  const handleOpenAddDialog = () => {
    setFormData({
      code: '',
      title: '',
      url: '',
      duration: 0,
      thumbnail: ''
    });
    setEditMode(false);
    setOpenDialog(true);
  };
  
  // Abrir diálogo para editar video
  const handleOpenEditDialog = (videoCode) => {
    const video = videos[videoCode];
    setFormData({
      code: video.id,
      title: video.title,
      url: video.url,
      duration: video.duration,
      thumbnail: video.thumbnail || ''
    });
    setEditMode(true);
    setOpenDialog(true);
  };
  
  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setProcessingDuration(false);
  };
  
  // Función para detectar automáticamente la duración del video
  const handleDetectDuration = async () => {
    if (!formData.url) {
      showNotification('Por favor, ingresa una URL de video válida primero', 'warning');
      return;
    }
    
    setProcessingDuration(true);
    
    try {
      const duration = await estimateVideoDuration(formData.url);
      
      if (duration > 0) {
        setFormData({
          ...formData,
          duration
        });
        showNotification(`Duración detectada: ${formatDuration(duration)}`, 'success');
      } else {
        showNotification('No se pudo detectar la duración. Por favor, ingresa el valor manualmente.', 'warning');
      }
    } catch (error) {
      console.error('Error al detectar duración:', error);
      showNotification(`Error al detectar duración: ${error.message}`, 'error');
    } finally {
      setProcessingDuration(false);
    }
  };
  
  // Guardar video (añadir o actualizar)
  const handleSaveVideo = () => {
    try {
      // Validar datos
      if (!formData.code || !formData.title || !formData.url) {
        showNotification('Por favor completa los campos obligatorios: código, título y URL', 'warning');
        return;
      }
      
      if (editMode) {
        // Modo edición
        const updatedVideo = updateVideo(formData.code, {
          id: formData.code,
          title: formData.title,
          url: formData.url,
          duration: parseInt(formData.duration) || 0,
          thumbnail: formData.thumbnail
        });
        
        showNotification(`Video "${updatedVideo.title}" actualizado correctamente`, 'success');
      } else {
        // Modo añadir nuevo
        const newVideo = addVideo(
          formData.code,
          formData.title,
          formData.url,
          parseInt(formData.duration) || 0,
          formData.thumbnail
        );
        
        showNotification(`Video "${newVideo.title}" añadido correctamente`, 'success');
      }
      
      handleCloseDialog();
      loadVideos(); // Recargar la lista
      
    } catch (error) {
      console.error('Error al guardar video:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };
  
  // Confirmar eliminación de video
  const handleConfirmDelete = (videoCode) => {
    setDeleteConfirmDialog({
      open: true,
      videoCode
    });
  };
  
  // Eliminar video
  const handleDeleteVideo = () => {
    try {
      const videoCode = deleteConfirmDialog.videoCode;
      if (!videoCode) return;
      
      const deletedVideo = removeVideo(videoCode);
      
      showNotification(`Video "${deletedVideo.title}" eliminado correctamente`, 'success');
      loadVideos(); // Recargar la lista
      
    } catch (error) {
      console.error('Error al eliminar video:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setDeleteConfirmDialog({ open: false, videoCode: null });
    }
  };
  
  // Confirmar reset a valores predeterminados
  const handleConfirmReset = () => {
    setResetConfirmDialog(true);
  };
  
  // Resetear a valores predeterminados
  const handleResetToDefaults = () => {
    try {
      resetToDefaults();
      loadVideos();
      showNotification('Videos restablecidos a valores predeterminados', 'success');
    } catch (error) {
      console.error('Error al restablecer videos:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setResetConfirmDialog(false);
    }
  };
  
  // Copiar código al portapapeles
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        showNotification(`Código "${code}" copiado al portapapeles`, 'success');
      })
      .catch((error) => {
        console.error('Error al copiar:', error);
        showNotification('Error al copiar código', 'error');
      });
  };
  
  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Formatear duración para mostrar
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };
  
  // Previsualizar video
  const handlePreviewVideo = (url) => {
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Box mt={4} mb={6}>
        <Typography variant="h4" component="h1" gutterBottom>
          Panel de Administración de Videos
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Gestiona los videos disponibles para la aplicación de recorte
        </Typography>
        
        <Box mt={4} mb={3} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Añadir Nuevo Video
          </Button>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadVideos}
              sx={{ mr: 1 }}
            >
              Actualizar
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<ResetIcon />}
              onClick={handleConfirmReset}
            >
              Restablecer
            </Button>
          </Box>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(videos).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No hay videos disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.keys(videos).map((code) => (
                    <TableRow key={code}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {code}
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCode(code)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>{videos[code].title}</TableCell>
                      <TableCell>
                        <Tooltip title={videos[code].url}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 250,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {videos[code].url}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatDuration(videos[code].duration)}</TableCell>
                      <TableCell>{videos[code].isDefault ? 'Predeterminado' : 'Personalizado'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="info"
                          onClick={() => handlePreviewVideo(videos[code].url)}
                        >
                          <PlayIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(code)}
                        >
                          <EditIcon />
                        </IconButton>
                        {!videos[code].isDefault && (
                          <IconButton
                            color="error"
                            onClick={() => handleConfirmDelete(code)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        

      </Box>
      
      {/* Diálogo para añadir/editar video */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Editar Video' : 'Añadir Nuevo Video'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="code"
                label="Código"
                fullWidth
                value={formData.code}
                onChange={handleInputChange}
                disabled={editMode && videos[formData.code]?.isDefault}
                required
                helperText="Identificador único para el video"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="title"
                label="Título"
                fullWidth
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="url"
                label="URL del Video"
                fullWidth
                value={formData.url}
                onChange={handleInputChange}
                required
                helperText="URL completa del archivo de video (MP4, WebM, etc.)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="duration"
                label="Duración (segundos)"
                type="number"
                fullWidth
                value={formData.duration}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleDetectDuration}
                      disabled={processingDuration}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {processingDuration ? <CircularProgress size={24} /> : 'Detectar'}
                    </Button>
                  )
                }}
                helperText={`Duración formateada: ${formatDuration(formData.duration)}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="thumbnail"
                label="URL de Miniatura (opcional)"
                fullWidth
                value={formData.thumbnail}
                onChange={handleInputChange}
                helperText="URL de una imagen de previsualización"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveVideo}
            variant="contained"
            color="primary"
          >
            {editMode ? 'Actualizar' : 'Añadir'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, videoCode: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el video con código "{deleteConfirmDialog.videoCode}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmDialog({ open: false, videoCode: null })}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteVideo}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmación para resetear */}
      <Dialog
        open={resetConfirmDialog}
        onClose={() => setResetConfirmDialog(false)}
      >
        <DialogTitle>Confirmar Restablecimiento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas restablecer todos los videos a los valores predeterminados?
            Se eliminarán todos los videos personalizados que hayas añadido.
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResetConfirmDialog(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleResetToDefaults}
          >
            Restablecer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminPanel;