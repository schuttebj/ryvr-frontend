import { createTheme } from '@mui/material/styles';

// RYVR Brand Colors
export const colors = {
  primary: {
    dark: '#2e3142',
    main: '#5f5fff',
    light: '#b8cdf8',
  },
  secondary: {
    main: '#5a6577',
    light: '#f8f9fb',
  },
  background: {
    default: '#f8f9fb',
    paper: '#ffffff',
  },
  text: {
    primary: '#2e3142',
    secondary: '#5a6577',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,
      dark: colors.primary.dark,
      light: colors.primary.light,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.text.primary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: colors.text.primary,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: colors.text.primary,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: colors.text.primary,
    },
    body1: {
      fontSize: '1rem',
      color: colors.text.primary,
    },
    body2: {
      fontSize: '0.875rem',
      color: colors.text.secondary,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(95, 95, 255, 0.15)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(46, 49, 66, 0.08)',
          borderRadius: 16,
          border: `1px solid ${colors.secondary.light}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
          boxShadow: '0 1px 3px rgba(46, 49, 66, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.paper,
          borderRight: `1px solid ${colors.secondary.light}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        filled: {
          backgroundColor: colors.primary.light,
          color: colors.primary.dark,
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
    // Fix z-index issues for dropdowns that appear over high z-index panels
    MuiMenu: {
      styleOverrides: {
        root: {
          zIndex: 10100, // Higher than NodeSettingsPanel (10000)
        },
        paper: {
          zIndex: 10100,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        root: {
          zIndex: 10100,
        },
        paper: {
          zIndex: 10100,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiMenu-root': {
            zIndex: 10100,
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          zIndex: 10050, // Slightly lower than menus but higher than panels
        },
      },
    },
  },
});

export default theme; 