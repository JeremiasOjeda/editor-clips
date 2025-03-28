import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button, 
  Box 
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import AdminPanel from '../components/AdminPanel';

function AdminPage() {
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
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        <Box my={4}>
          <AdminPanel />
        </Box>
      </Container>
    </>
  );
}

export default AdminPage;