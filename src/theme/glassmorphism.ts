/**
 * Glassmorphism Theme Extensions
 * Adds frosted glass effects and modern UI patterns
 */

import { Theme } from '@mui/material/styles';

// Glassmorphism style generators
export const createGlassEffect = (
  opacity: number = 0.7,
  blur: number = 10,
  borderOpacity: number = 0.2
) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

export const createDarkGlassEffect = (
  opacity: number = 0.8,
  blur: number = 10,
  borderOpacity: number = 0.15
) => ({
  background: `rgba(45, 49, 66, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
});

// Glassmorphism component styles
export const glassStyles = {
  // Basic glass card
  card: (theme: Theme) => ({
    ...(theme.palette.mode === 'dark' 
      ? createDarkGlassEffect(0.9, 8, 0.1) 
      : createGlassEffect(0.85, 8, 0.2)
    ),
    borderRadius: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      ...(theme.palette.mode === 'dark' 
        ? createDarkGlassEffect(0.95, 12, 0.15) 
        : createGlassEffect(0.9, 12, 0.3)
      ),
    },
  }),

  // Glass navigation/sidebar
  navigation: (theme: Theme) => ({
    ...(theme.palette.mode === 'dark' 
      ? createDarkGlassEffect(0.95, 15, 0.1) 
      : createGlassEffect(0.9, 15, 0.3)
    ),
    borderRadius: '20px',
  }),

  // Glass modal/dialog
  modal: (theme: Theme) => ({
    ...(theme.palette.mode === 'dark' 
      ? createDarkGlassEffect(0.95, 20, 0.2) 
      : createGlassEffect(0.9, 20, 0.4)
    ),
    borderRadius: '20px',
  }),

  // Glass button
  button: (theme: Theme) => ({
    ...(theme.palette.mode === 'dark' 
      ? createDarkGlassEffect(0.8, 8, 0.2) 
      : createGlassEffect(0.7, 8, 0.3)
    ),
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      ...(theme.palette.mode === 'dark' 
        ? createDarkGlassEffect(0.9, 10, 0.3) 
        : createGlassEffect(0.8, 10, 0.4)
      ),
    },
  }),

  // Glass input field
  input: (theme: Theme) => ({
    ...(theme.palette.mode === 'dark' 
      ? createDarkGlassEffect(0.9, 6, 0.1) 
      : createGlassEffect(0.85, 6, 0.2)
    ),
    borderRadius: '12px',
    '&:focus-within': {
      ...(theme.palette.mode === 'dark' 
        ? createDarkGlassEffect(0.95, 8, 0.2) 
        : createGlassEffect(0.9, 8, 0.3)
      ),
    },
  }),

  // Glass header
  header: (theme: Theme) => ({
    ...(theme.palette.mode === 'dark' 
      ? createDarkGlassEffect(0.95, 15, 0.1) 
      : createGlassEffect(0.9, 15, 0.25)
    ),
    borderRadius: '0 0 24px 24px',
  }),
};

// Gradient backgrounds for glassmorphism
export const glassGradients = {
  light: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    ryvrBrand: 'linear-gradient(135deg, #5f5eff 0%, #b8cdf8 50%, #1affd5 100%)',
    subtle: 'linear-gradient(135deg, #f8f9fb 0%, #e8eef7 100%)',
  },
  dark: {
    primary: 'linear-gradient(135deg, #2d3142 0%, #4f5565 100%)',
    secondary: 'linear-gradient(135deg, #1e1e2e 0%, #2d3748 100%)',
    success: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    ryvrBrand: 'linear-gradient(135deg, #2d3142 0%, #3a3d4a 50%, #4a5568 100%)',
    subtle: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  },
};

// Animation keyframes for glassmorphism
export const glassAnimations = {
  float: {
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    animation: 'float 6s ease-in-out infinite',
  },
  
  shimmer: {
    '@keyframes shimmer': {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite',
  },

  glow: {
    '@keyframes glow': {
      '0%, 100%': { boxShadow: '0 0 20px rgba(95, 94, 255, 0.3)' },
      '50%': { boxShadow: '0 0 40px rgba(95, 94, 255, 0.6)' },
    },
    animation: 'glow 3s ease-in-out infinite',
  },
};

// Helper function to create glass surface with content
export const createGlassSurface = (theme: Theme, variant: 'card' | 'navigation' | 'modal' | 'button' | 'input' | 'header' = 'card') => ({
  ...glassStyles[variant](theme),
  position: 'relative' as const,
  overflow: 'hidden' as const,
  
  // Add subtle inner glow
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
    zIndex: 1,
  },
});

// Glass theme extension
export const glassThemeExtensions = {
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          ...createGlassSurface(theme, 'card'),
        }),
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          ...createGlassSurface(theme, 'card'),
        }),
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: () => ({
          borderRadius: '12px',
          textTransform: 'none' as const,
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        }),
        
        contained: ({ theme }: { theme: Theme }) => ({
          background: theme.palette.mode === 'dark' 
            ? glassGradients.dark.ryvrBrand 
            : glassGradients.light.ryvrBrand,
          boxShadow: '0 4px 20px rgba(95, 94, 255, 0.3)',
          '&:hover': {
            background: theme.palette.mode === 'dark' 
              ? glassGradients.dark.primary 
              : glassGradients.light.primary,
            boxShadow: '0 6px 25px rgba(95, 94, 255, 0.4)',
          },
        }),
        
        outlined: ({ theme }: { theme: Theme }) => ({
          ...createGlassSurface(theme, 'button'),
        }),
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          '& .MuiOutlinedInput-root': {
            ...createGlassSurface(theme, 'input'),
            '& fieldset': {
              border: 'none',
            },
          },
        }),
      },
    },
  },
  
  palette: {
    background: {
      glass: 'rgba(255, 255, 255, 0.1)',
      glassHover: 'rgba(255, 255, 255, 0.15)',
    },
  },
};
