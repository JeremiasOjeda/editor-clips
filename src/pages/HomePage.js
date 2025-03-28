import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import CodeInput from '../components/CodeInput';

function HomePage() {
  return (
    <Container maxWidth="sm">
      <Box my={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Editor de Clips de Video
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
          Recorta y descarga fragmentos específicos de videos largos
        </Typography>
        <Paper elevation={3} style={{ width: '100%', padding: '24px', marginTop: '24px' }}>
          <CodeInput />
        </Paper>
        
        {/* Enlace al panel de administración */}
        <Box mt={4} textAlign="center">
          <Button
            component={Link}
            to="/admin"
            variant="outlined"
            size="small"
            startIcon={<AdminIcon />}
            sx={{ mt: 2 }}
          >
            Panel de Administración
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage;