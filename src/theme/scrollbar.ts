/**
 * Custom Scrollbar Styles for Glassmorphism Theme
 * Creates sleek, arrow-free scrollbars that match the glass aesthetic
 */

import { Theme } from '@mui/material/styles';

// Scrollbar dimensions
const SCROLLBAR_WIDTH = '8px';
const SCROLLBAR_WIDTH_HOVER = '12px';

// Create glassmorphism scrollbar styles
export const createScrollbarStyles = (theme: Theme) => {
  const isDark = theme.palette.mode === 'dark';
  
  return {
    // Webkit browsers (Chrome, Safari, Edge)
    '&::-webkit-scrollbar': {
      width: SCROLLBAR_WIDTH,
      height: SCROLLBAR_WIDTH,
    },
    
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
      borderRadius: '10px',
    },
    
    '&::-webkit-scrollbar-thumb': {
      background: isDark 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.2)',
      borderRadius: '10px',
      border: `2px solid transparent`,
      backgroundClip: 'padding-box',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      
      '&:hover': {
        background: isDark 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
      },
      
      '&:active': {
        background: isDark 
          ? 'rgba(255, 255, 255, 0.4)' 
          : 'rgba(0, 0, 0, 0.4)',
      },
    },
    
    // Remove arrows (corner pieces)
    '&::-webkit-scrollbar-corner': {
      background: 'transparent',
    },
    
    // Remove buttons (arrows)
    '&::-webkit-scrollbar-button': {
      display: 'none',
      width: 0,
      height: 0,
    },
    
    // Enhance scrollbar on hover
    '&:hover': {
      '&::-webkit-scrollbar': {
        width: SCROLLBAR_WIDTH_HOVER,
        height: SCROLLBAR_WIDTH_HOVER,
      },
      
      '&::-webkit-scrollbar-thumb': {
        background: isDark 
          ? 'rgba(255, 255, 255, 0.25)' 
          : 'rgba(0, 0, 0, 0.25)',
      },
    },
    
    // Firefox scrollbar (limited customization)
    scrollbarWidth: 'thin' as const,
    scrollbarColor: isDark 
      ? 'rgba(255, 255, 255, 0.2) transparent'
      : 'rgba(0, 0, 0, 0.2) transparent',
  };
};

// Global scrollbar styles for the entire application
export const globalScrollbarStyles = (theme: Theme) => {
  const isDark = theme.palette.mode === 'dark';
  
  return {
    // Apply to body and html
    html: {
      ...createScrollbarStyles(theme),
    },
    
    body: {
      ...createScrollbarStyles(theme),
    },
    
    // Apply to all scrollable elements
    '*': {
      ...createScrollbarStyles(theme),
    },
    
    // Special styles for specific components
    '.glass-scrollbar': {
      ...createScrollbarStyles(theme),
      
      // Enhanced glass effect for special containers
      '&::-webkit-scrollbar-thumb': {
        background: isDark 
          ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)'
          : 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: isDark 
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    },
    
    // Overlay scrollbars (when needed)
    '.overlay-scrollbar': {
      '&::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      
      '&::-webkit-scrollbar-thumb': {
        background: isDark 
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(0, 0, 0, 0.15)',
        borderRadius: '3px',
        border: 'none',
        
        '&:hover': {
          background: isDark 
            ? 'rgba(255, 255, 255, 0.25)'
            : 'rgba(0, 0, 0, 0.25)',
        },
      },
    },
    
    // Table scrollbars
    '.MuiTableContainer-root': {
      ...createScrollbarStyles(theme),
      
      '&::-webkit-scrollbar': {
        width: '10px',
        height: '10px',
      },
    },
    
    // Dialog scrollbars
    '.MuiDialog-paper': {
      ...createScrollbarStyles(theme),
    },
    
    // Menu scrollbars
    '.MuiMenu-paper': {
      ...createScrollbarStyles(theme),
      
      '&::-webkit-scrollbar': {
        width: '6px',
      },
    },
    
    // Select dropdown scrollbars
    '.MuiSelect-paper': {
      ...createScrollbarStyles(theme),
      
      '&::-webkit-scrollbar': {
        width: '6px',
      },
    },
  };
};

// Utility function to add scrollbar styles to any component
export const withGlassScrollbar = (theme: Theme) => ({
  ...createScrollbarStyles(theme),
});

// Enhanced scrollbar for specific components
export const scrollbarVariants = {
  // Thin scrollbar for sidebars
  thin: (theme: Theme) => ({
    ...createScrollbarStyles(theme),
    '&::-webkit-scrollbar': {
      width: '4px',
      height: '4px',
    },
  }),
  
  // Thick scrollbar for main content
  thick: (theme: Theme) => ({
    ...createScrollbarStyles(theme),
    '&::-webkit-scrollbar': {
      width: '12px',
      height: '12px',
    },
  }),
  
  // Invisible scrollbar (overlay style)
  overlay: (theme: Theme) => ({
    ...createScrollbarStyles(theme),
    '&::-webkit-scrollbar': {
      width: '0px',
      height: '0px',
    },
    '&:hover::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
  }),
  
  // Colorful scrollbar (matches primary theme)
  primary: (theme: Theme) => {
    return {
      ...createScrollbarStyles(theme),
      '&::-webkit-scrollbar-thumb': {
        background: `linear-gradient(180deg, ${theme.palette.primary.main}80 0%, ${theme.palette.primary.dark}60 100%)`,
        border: `1px solid ${theme.palette.primary.main}40`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        
        '&:hover': {
          background: `linear-gradient(180deg, ${theme.palette.primary.main}90 0%, ${theme.palette.primary.dark}70 100%)`,
        },
      },
    };
  },
};
