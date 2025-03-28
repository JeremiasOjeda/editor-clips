import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button, 
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import AdminPanel from '../components/AdminPanel';
import AdminLogin from '../components/AdminLogin';

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  
  useEffect(() => {
    // Verificar si ya está autenticado en localStorage
    const hasAuth = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(hasAuth);
  }, []);
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    setLogoutDialog(false);
  };
  
  // Si no está autenticado, mostrar pantalla de inicio de sesión
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }
  
  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Button 
            component={Link} 
            to="/" 
            color="inherit" 
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Panel de Administración
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={() => setLogoutDialog(true)}
            title="Cerrar sesión"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        <Box my={4}>
          <AdminPanel />
        </Box>
      </Container>
      
      {/* Diálogo de confirmación de cierre de sesión */}
      <Dialog
        open={logoutDialog}
        onClose={() => setLogoutDialog(false)}
      >
        <DialogTitle>Cerrar Sesión</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas cerrar la sesión de administrador?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)}>Cancelar</Button>
          <Button onClick={handleLogout} color="primary">Cerrar Sesión</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminPage;