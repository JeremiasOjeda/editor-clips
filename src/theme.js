import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Verde oscuro - color primario
      light: '#4caf50', // Verde medio 
      dark: '#1b5e20', // Verde muy oscuro
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00796b', // Verde azulado para el color secundario
      light: '#48a999',
      dark: '#004c40',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50', // Verde para acciones exitosas
    },
    background: {
      default: '#f8f9fa', // Un fondo ligeramente gris para más contraste
      paper: '#ffffff',   // Fondo blanco para componentes de papel
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Bordes más redondeados
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Evita texto en mayúsculas en los botones
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12, // Bordes más redondeados para Papers
        },
        elevation1: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
        elevation4: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.07)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;