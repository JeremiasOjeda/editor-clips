import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
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
      </Box>
    </Container>
  );
}

export default HomePage;