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

// RYVR Brand Colors
export const RYVR_COLORS: RyvrThemeColors = {
  primary: '#5f5eff',      // Purple-blue for main brand actions
  secondary: '#5a6678',    // Blue-gray for secondary elements
  success: '#1affd5',      // Cyan-teal for success states
  info: '#b8cdf8',         // Light blue for info states
  lightBackground: '#f8f9fb', // Very light gray for light mode
  darkBackground: '#2d3142',  // Dark blue-gray for dark mode
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
        default: isDark 
          ? `linear-gradient(135deg, #0a0b0f 0%, #1a1d2e 10%, rgba(95, 94, 255, 0.08) 25%, #2d3142 40%, rgba(184, 205, 248, 0.05) 55%, rgba(26, 255, 213, 0.04) 70%, #1f2937 85%, #0a0b0f 100%)`
          : `linear-gradient(135deg, #f8f9fb 0%, #e8eef7 10%, rgba(95, 94, 255, 0.03) 25%, #f0f4f8 40%, rgba(184, 205, 248, 0.08) 55%, rgba(26, 255, 213, 0.02) 70%, #e8eef7 85%, #f8f9fb 100%)`,
        paper: 'transparent',
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
      borderRadius: 16,
    },
    spacing: 8,
    components: {
      /* 
       * CLEAN MODERN DESIGN SYSTEM:
       * 
       * 🎨 Background: Subtle gradient over solid color base
       *    - Light mode: Clean white with subtle gradient overlay
       *    - Dark mode: Dark blue-gray (#2d3142) with subtle gradient
       * 
       * 📦 Clean Components:
       *    - Cards: Solid backgrounds with subtle shadows
       *    - Buttons: Simple styling, gradients only for core CTAs
       *    - Sidebar: Semi-transparent to show gradient
       *    - Content area: Solid backgrounds
       *    - Smaller border radius (8-10px)
       *    - Smaller typography and button padding
       */
      
      // Global CSS overrides for background and scrollbars
      MuiCssBaseline: {
        styleOverrides: {
          ...(() => {
            const scrollbarStyles = globalScrollbarStyles({ palette: { mode } } as Theme);
            const gradientBackground = isDark 
              ? 'linear-gradient(135deg, #2d3142 0%, #1a1d2e 25%, #0f172a 50%, #1e293b 75%, #2d3142 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fb 25%, #e8eef7 50%, #f0f4f8 75%, #ffffff 100%)';
            
            return {
              ...scrollbarStyles,
              html: {
                ...scrollbarStyles.html,
                height: '100%',
                background: gradientBackground,
                backgroundAttachment: 'fixed',
              },
              body: {
                ...scrollbarStyles.body,
                height: '100%',
                margin: 0,
                padding: 0,
                background: gradientBackground,
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
              },
              '#root': {
                height: '100%',
                minHeight: '100vh',
              },
            };
          })(),
        },
      },
      
      // Clean Button Design
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8125rem',
            padding: '6px 16px',
            boxShadow: 'none',
          },
          contained: {
            backgroundColor: colors.primary,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: darkenColor(colors.primary, 0.1),
            },
            // Core CTA variant with gradient
            '&.MuiButton-containedPrimary.gradient-cta': {
              background: 'linear-gradient(135deg, #5f5eff 0%, #1affd5 100%)',
              boxShadow: `0 4px 12px rgba(${hexToRgb(colors.primary)}, 0.3)`,
              '&:hover': {
                boxShadow: `0 6px 16px rgba(${hexToRgb(colors.primary)}, 0.4)`,
                transform: 'translateY(-2px)',
              },
            },
          },
          outlined: {
            backgroundColor: 'transparent',
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            color: isDark ? '#d1d5db' : '#374151',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: colors.primary,
            },
          },
          text: {
            color: colors.primary,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(95, 94, 255, 0.08)' : 'rgba(95, 94, 255, 0.04)',
            },
          },
        },
      },
      
      // Clean Card Design
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#374151' : '#ffffff',
            border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: isDark 
              ? '0 2px 8px rgba(0, 0, 0, 0.2)'
              : '0 2px 8px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      
      // Clean Paper Design
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#374151' : '#ffffff',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: isDark 
              ? '0 1px 4px rgba(0, 0, 0, 0.2)'
              : '0 1px 4px rgba(0, 0, 0, 0.04)',
          },
          elevation1: {
            boxShadow: isDark 
              ? '0 2px 8px rgba(0, 0, 0, 0.25)'
              : '0 2px 8px rgba(0, 0, 0, 0.06)',
          },
          elevation2: {
            boxShadow: isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)'
              : '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
          elevation3: {
            boxShadow: isDark 
              ? '0 8px 24px rgba(0, 0, 0, 0.35)'
              : '0 8px 24px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      
      // Clean TextField Design
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? '#4b5563' : '#f9fafb',
              borderRadius: 8,
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: isDark ? '#6b7280' : '#d1d5db',
              },
              '&:hover': {
                '& fieldset': {
                  borderColor: isDark ? '#9ca3af' : '#9ca3af',
                },
              },
              '&.Mui-focused': {
                '& fieldset': {
                  borderColor: colors.primary,
                  borderWidth: '2px',
                },
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.875rem',
            },
          },
        },
      },
      
      // Clean AppBar Design (minimal use - mostly sidebar navigation)
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#374151' : '#ffffff',
            border: 'none',
            color: isDark ? '#ffffff' : '#1f2937',
            boxShadow: isDark 
              ? '0 1px 4px rgba(0, 0, 0, 0.2)'
              : '0 1px 4px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      
      // Clean Chip Design
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#4b5563' : '#f3f4f6',
            border: `1px solid ${isDark ? '#6b7280' : '#d1d5db'}`,
            borderRadius: 6,
            fontWeight: 500,
            fontSize: '0.75rem',
            color: isDark ? '#d1d5db' : '#374151',
            height: 24,
          },
          filled: {
            backgroundColor: `rgba(${hexToRgb(colors.primary)}, 0.1)`,
            color: colors.primary,
            border: `1px solid rgba(${hexToRgb(colors.primary)}, 0.2)`,
            fontWeight: 500,
          },
        },
      },
      
      // Semi-transparent Sidebar Design
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark 
              ? 'rgba(45, 49, 66, 0.9)'
              : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: 'none',
            borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
            boxShadow: isDark 
              ? '2px 0 8px rgba(0, 0, 0, 0.3)'
              : '2px 0 8px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      
      // Clean Dialog Design
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#374151' : '#ffffff',
            border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
            borderRadius: 12,
            boxShadow: isDark 
              ? '0 16px 48px rgba(0, 0, 0, 0.4)'
              : '0 16px 48px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      
      // Clean Menu Design
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#374151' : '#ffffff',
            border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
            borderRadius: 8,
            boxShadow: isDark 
              ? '0 8px 24px rgba(0, 0, 0, 0.3)'
              : '0 8px 24px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      
      // Clean List Items for Sidebar
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            transition: 'all 0.2s ease',
            fontSize: '0.875rem',
            '&.Mui-selected': {
              backgroundColor: `rgba(${hexToRgb(colors.primary)}, 0.1)`,
              color: colors.primary,
              '&:hover': {
                backgroundColor: `rgba(${hexToRgb(colors.primary)}, 0.15)`,
              },
            },
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      
      // Clean Table Design
      MuiTableContainer: {
        styleOverrides: {
          root: {
            ...createScrollbarStyles({ palette: { mode } } as Theme),
            backgroundColor: isDark ? '#374151' : '#ffffff',
            borderRadius: 8,
            border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
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
      
      // Clean Autocomplete Design
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            ...createScrollbarStyles({ palette: { mode } } as Theme),
            backgroundColor: isDark ? '#374151' : '#ffffff',
            border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
            borderRadius: 8,
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
