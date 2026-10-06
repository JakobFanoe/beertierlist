import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffb74d',
      light: '#ffd180',
      dark: '#f57c00',
      contrastText: '#21170b',
    },
    secondary: {
      main: '#90a4ae',
      light: '#cfd8dc',
      dark: '#607d8b',
    },
    background: {
      default: '#101214',
      paper: '#191d20',
    },
    text: {
      primary: '#f2f4f5',
      secondary: '#aab3b9',
    },
    divider: 'rgba(255, 255, 255, 0.10)',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 650,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundColor: '#101214',
          scrollbarColor: '#465057 #101214',
        },
        '#root': {
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: '#191d20',
          color: '#f2f4f5',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.24)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.32)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.2)',
          '&:hover': {
            borderColor: '#ffb74d',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.18)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.36)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffb74d',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '1px solid rgba(255, 255, 255, 0.10)',
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
