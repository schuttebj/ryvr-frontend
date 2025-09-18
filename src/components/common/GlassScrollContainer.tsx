/**
 * Glass Scroll Container Component
 * Provides enhanced scrollbars with glassmorphism styling
 */

import { Box, useTheme, BoxProps } from '@mui/material';
import { ReactNode, forwardRef } from 'react';
import { createScrollbarStyles, scrollbarVariants } from '../../theme/scrollbar';

interface GlassScrollContainerProps extends Omit<BoxProps, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'thin' | 'thick' | 'overlay' | 'primary';
  maxHeight?: string | number;
  maxWidth?: string | number;
  className?: string;
}

const GlassScrollContainer = forwardRef<HTMLDivElement, GlassScrollContainerProps>(
  ({ children, variant = 'default', maxHeight, maxWidth, className, sx, ...boxProps }, ref) => {
    const theme = useTheme();
    
    // Get scrollbar styles based on variant
    const getScrollbarStyles = () => {
      switch (variant) {
        case 'thin':
          return scrollbarVariants.thin(theme);
        case 'thick':
          return scrollbarVariants.thick(theme);
        case 'overlay':
          return scrollbarVariants.overlay(theme);
        case 'primary':
          return scrollbarVariants.primary(theme);
        default:
          return createScrollbarStyles(theme);
      }
    };

    return (
      <Box
        ref={ref}
        className={`glass-scroll-container ${className || ''}`}
        sx={{
          overflow: 'auto',
          maxHeight,
          maxWidth,
          position: 'relative',
          ...getScrollbarStyles(),
          ...sx,
        }}
        {...boxProps}
      >
        {children}
      </Box>
    );
  }
);

GlassScrollContainer.displayName = 'GlassScrollContainer';

export default GlassScrollContainer;

// Specialized scroll containers for common use cases

export const TableScrollContainer = forwardRef<HTMLDivElement, Omit<GlassScrollContainerProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <GlassScrollContainer ref={ref} variant="default" {...props}>
      {children}
    </GlassScrollContainer>
  )
);

export const SidebarScrollContainer = forwardRef<HTMLDivElement, Omit<GlassScrollContainerProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <GlassScrollContainer ref={ref} variant="thin" {...props}>
      {children}
    </GlassScrollContainer>
  )
);

export const ContentScrollContainer = forwardRef<HTMLDivElement, Omit<GlassScrollContainerProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <GlassScrollContainer ref={ref} variant="thick" {...props}>
      {children}
    </GlassScrollContainer>
  )
);

export const OverlayScrollContainer = forwardRef<HTMLDivElement, Omit<GlassScrollContainerProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <GlassScrollContainer ref={ref} variant="overlay" {...props}>
      {children}
    </GlassScrollContainer>
  )
);

export const PrimaryScrollContainer = forwardRef<HTMLDivElement, Omit<GlassScrollContainerProps, 'variant'>>(
  ({ children, ...props }, ref) => (
    <GlassScrollContainer ref={ref} variant="primary" {...props}>
      {children}
    </GlassScrollContainer>
  )
);
