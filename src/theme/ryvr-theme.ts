// MUI Imports
import { createTheme, type Theme } from '@mui/material/styles'

// Scrollbar Imports
import { globalScrollbarStyles, createScrollbarStyles } from './scrollbar'

// Type Imports
export interface RyvrThemeColors {
  primary: string
  secondary: string
  success: string
  info: string
  lightBackground: string
  darkBackground: string
}

export interface WhiteLabelConfig {
  primaryColor?: string
  secondaryColor?: string
  logo?: string
  favicon?: string
  fontFamily?: string
  brandName?: string
}

// RYVR Brand Colors - Muted/Flat Design Palette
export const RYVR_COLORS: RyvrThemeColors = {
  primary: '#6366f1',      // Muted indigo for main brand actions
  secondary: '#6b7280',    // Neutral gray for secondary elements
  success: '#10b981',      // Muted emerald for success states
  info: '#8b5cf6',         // Muted purple for info states
  lightBackground: '#f9fafb', // Very light gray for light mode
  darkBackground: '#1f2937',  // Dark gray for dark mode
}

// Create base theme with RYVR colors
export const createRyvrTheme = (
  mode: 'light' | 'dark' = 'light',
  whiteLabelConfig?: WhiteLabelConfig
): Theme => {
  const isDark = mode === 'dark'
  
  // Use white-label colors if provided, otherwise use RYVR defaults
  const colors = {
    primary: whiteLabelConfig?.primaryColor || RYVR_COLORS.primary,
    secondary: whiteLabelConfig?.secondaryColor || RYVR_COLORS.secondary,
    success: RYVR_COLORS.success,
    info: RYVR_COLORS.info,
  }

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: lightenColor(colors.primary, 0.2),
        dark: darkenColor(colors.primary, 0.2),
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary,
        light: lightenColor(colors.secondary, 0.2),
        dark: darkenColor(colors.secondary, 0.2),
        contrastText: '#ffffff',
      },
      success: {
        main: colors.success,
        light: lightenColor(colors.success, 0.2),
        dark: darkenColor(colors.success, 0.2),
        contrastText: '#ffffff',
      },
      info: {
        main: colors.info,
        light: lightenColor(colors.info, 0.2),
        dark: darkenColor(colors.info, 0.2),
        contrastText: '#ffffff',
      },
      error: {
        main: '#FF4C51',
        light: '#FF7074',
        dark: '#E64449',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FFB400',
        light: '#FFC333',
        dark: '#E6A200',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#111827' : '#f9fafb',
        paper: isDark ? '#1f2937' : '#ffffff',
      },
      text: {
        primary: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(45, 49, 66, 0.9)',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(45, 49, 66, 0.7)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(45, 49, 66, 0.4)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(45, 49, 66, 0.12)',
      action: {
        active: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(45, 49, 66, 0.6)',
        hover: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(45, 49, 66, 0.04)',
        selected: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(45, 49, 66, 0.08)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(45, 49, 66, 0.3)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(45, 49, 66, 0.12)',
      },
    },
    typography: {
      fontFamily: whiteLabelConfig?.fontFamily || '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      h1: {
        fontSize: '2.875rem',
        fontWeight: 600,
        lineHeight: 1.21,
        fontFamily: '"Poppins", sans-serif',
      },
      h2: {
        fontSize: '2.375rem',
        fontWeight: 600,
        lineHeight: 1.26,
        fontFamily: '"Poppins", sans-serif',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.36,
        fontFamily: '"Poppins", sans-serif',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.42,
        fontFamily: '"Poppins", sans-serif',
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.56,
        fontFamily: '"Poppins", sans-serif',
      },
      h6: {
        fontSize: '0.9375rem',
        fontWeight: 600,
        lineHeight: 1.6,
        fontFamily: '"Poppins", sans-serif',
      },
      subtitle1: {
        fontSize: '0.9375rem',
        fontWeight: 400,
        lineHeight: 1.6,
      },
      subtitle2: {
        fontSize: '0.8125rem',
        fontWeight: 500,
        lineHeight: 1.54,
      },
      body1: {
        fontSize: '0.9375rem',
        fontWeight: 400,
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.8125rem',
        fontWeight: 400,
        lineHeight: 1.54,
      },
      button: {
        fontSize: '0.9375rem',
        fontWeight: 500,
        lineHeight: 1.6,
        textTransform: 'none' as const,
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.5px',
        textTransform: 'uppercase' as const,
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      /* 
       * FLAT MODERN DESIGN SYSTEM:
       * 
       * 🎨 Background: Solid colors, no gradients
       *    - Light mode: Clean white (#ffffff) with light gray borders
       *    - Dark mode: Dark gray backgrounds with subtle borders
       * 
       * 📦 Flat Components:
       *    - Cards: Solid backgrounds with light gray borders, NO shadows
       *    - Buttons: Flat colors, minimal styling
       *    - Sidebar: Clean solid background with borders
       *    - Content area: Clean solid backgrounds
       *    - Light gray borders (#e5e7eb for light, #374151 for dark)
       *    - Consistent 8px border radius
       */
      
      // Global CSS overrides for solid background
      MuiCssBaseline: {
        styleOverrides: {
          ...(() => {
            const scrollbarStyles = globalScrollbarStyles({ palette: { mode } } as Theme);
            const solidBackground = isDark ? '#111827' : '#f9fafb';
            
            return {
              ...scrollbarStyles,
              html: {
                ...scrollbarStyles.html,
                height: '100%',
                backgroundColor: solidBackground,
              },
              body: {
                ...scrollbarStyles.body,
                height: '100%',
                margin: 0,
                padding: 0,
                backgroundColor: solidBackground,
                minHeight: '100vh',
              },
              '#root': {
                height: '100%',
                minHeight: '100vh',
                backgroundColor: solidBackground,
              },
            };
          })(),
        },
      },
      
      // Flat Button Design
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            padding: '8px 16px',
            boxShadow: 'none',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            '&:hover': {
              boxShadow: 'none',
              transform: 'none',
            },
          },
          contained: {
            backgroundColor: colors.primary,
            color: '#ffffff',
            border: `1px solid ${colors.primary}`,
            '&:hover': {
              backgroundColor: darkenColor(colors.primary, 0.1),
              border: `1px solid ${darkenColor(colors.primary, 0.1)}`,
              boxShadow: 'none',
            },
          },
          outlined: {
            backgroundColor: 'transparent',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            color: isDark ? '#d1d5db' : '#374151',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDark ? '#4b5563' : '#d1d5db',
              boxShadow: 'none',
            },
          },
          text: {
            color: colors.primary,
            border: `1px solid transparent`,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              boxShadow: 'none',
            },
          },
        },
      },
      
      // Flat Card Design
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: 'none',
          },
        },
      },
      
      // Flat Paper Design
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: 'none',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          },
          elevation1: {
            boxShadow: 'none',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          },
          elevation2: {
            boxShadow: 'none',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          },
          elevation3: {
            boxShadow: 'none',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          },
        },
      },
      
      // Flat TextField Design
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderRadius: 8,
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: isDark ? '#374151' : '#e5e7eb',
                borderWidth: '1px',
              },
              '&:hover': {
                '& fieldset': {
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                },
              },
              '&.Mui-focused': {
                '& fieldset': {
                  borderColor: colors.primary,
                  borderWidth: '1px',
                },
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.875rem',
            },
          },
        },
      },
      
      // Flat AppBar Design (minimal use - mostly sidebar navigation)
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: 'none',
            borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
            color: isDark ? '#ffffff' : '#1f2937',
            boxShadow: 'none',
          },
        },
      },
      
      // Flat Chip Design
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#374151' : '#f3f4f6',
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            borderRadius: 6,
            fontWeight: 500,
            fontSize: '0.75rem',
            color: isDark ? '#d1d5db' : '#374151',
            height: 28,
            boxShadow: 'none',
          },
          filled: {
            backgroundColor: `rgba(${hexToRgb(colors.primary)}, 0.08)`,
            color: colors.primary,
            border: `1px solid rgba(${hexToRgb(colors.primary)}, 0.15)`,
            fontWeight: 500,
            boxShadow: 'none',
          },
        },
      },
      
      // Flat Sidebar Design
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            border: 'none',
            borderRight: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            boxShadow: 'none',
          },
        },
      },
      
      // Flat Dialog Design
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: 8,
            boxShadow: 'none',
          },
        },
      },
      
      // Flat Menu Design
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: 8,
            boxShadow: 'none',
          },
        },
      },
      
      // Flat List Items for Sidebar
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            margin: '1px 8px',
            transition: 'all 0.15s ease',
            fontSize: '0.875rem',
            minHeight: '40px',
            '&.Mui-selected': {
              backgroundColor: `rgba(${hexToRgb(colors.primary)}, 0.08)`,
              color: colors.primary,
              border: `1px solid rgba(${hexToRgb(colors.primary)}, 0.2)`,
              '&:hover': {
                backgroundColor: `rgba(${hexToRgb(colors.primary)}, 0.12)`,
              },
            },
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            },
            '& .MuiListItemIcon-root': {
              minWidth: '36px',
              color: 'inherit',
            },
            '& .MuiListItemText-root': {
              '& .MuiTypography-root': {
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            },
          },
        },
      },
      
      // Flat Table Design
      MuiTableContainer: {
        styleOverrides: {
          root: {
            ...createScrollbarStyles({ palette: { mode } } as Theme),
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 8,
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            boxShadow: 'none',
          },
        },
      },
      
      // Clean Tabs Design
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 40,
          },
          scroller: {
            ...createScrollbarStyles({ palette: { mode } } as Theme),
          },
        },
      },
      
      // Flat Skeleton Design
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)',
            borderRadius: 6,
            '&::after': {
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
            },
          },
          rectangular: {
            borderRadius: 8,
          },
          circular: {
            // Keep default circular radius
          },
          text: {
            borderRadius: 4,
          },
        },
      },
      
      // Flat Autocomplete Design
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            ...createScrollbarStyles({ palette: { mode } } as Theme),
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: 8,
            boxShadow: 'none',
          },
          listbox: {
            ...createScrollbarStyles({ palette: { mode } } as Theme),
            fontSize: '0.875rem',
          },
        },
      },
    },
  })
}

// Default RYVR theme instances
export const ryvrLightTheme = createRyvrTheme('light')
export const ryvrDarkTheme = createRyvrTheme('dark')

// Utility functions
function lightenColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * amount * 100)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255))
    .toString(16).slice(1)
}

function darkenColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * amount * 100)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  return '#' + (0x1000000 + (R > 255 ? 255 : (R < 0 ? 0 : R)) * 0x10000 +
    (G > 255 ? 255 : (G < 0 ? 0 : G)) * 0x100 +
    (B > 255 ? 255 : (B < 0 ? 0 : B)))
    .toString(16).slice(1)
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

export default createRyvrTheme
