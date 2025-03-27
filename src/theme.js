import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Verde oscuro - color primario
      light: '#4caf50', // Verde medio 
      dark: '#1b5e20', // Verde muy oscuro
    },
    secondary: {
      main: '#00796b', // Verde azulado para el color secundario
    },
    success: {
      main: '#4caf50', // Verde para acciones exitosas
    },
    background: {
      default: '#ffffff', // Fondo blanco
      paper: '#ffffff',   // Fondo blanco para componentes de papel
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  },
});

export default theme;