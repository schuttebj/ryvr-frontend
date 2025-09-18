/**
 * Glass Background Component
 * Provides the gradient background for glassmorphism effects
 */

import { Box, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { glassGradients } from '../../theme/glassmorphism';

interface GlassBackgroundProps {
  children: ReactNode;
  variant?: 'subtle' | 'primary' | 'secondary' | 'success' | 'ryvrBrand';
  animated?: boolean;
}

export default function GlassBackground({ 
  children, 
  variant = 'ryvrBrand',
  animated = true 
}: GlassBackgroundProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const backgroundGradient = isDark 
    ? glassGradients.dark[variant]
    : glassGradients.light[variant];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: backgroundGradient,
        position: 'relative',
        overflow: 'hidden',
        
        // Animated floating orbs for enhanced glass effect
        ...(animated && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-100%',
            left: '-100%',
            width: '400%',
            height: '400%',
            background: isDark
              ? 'radial-gradient(circle at 25% 25%, rgba(95, 94, 255, 0.1) 0%, transparent 25%), radial-gradient(circle at 75% 75%, rgba(26, 255, 213, 0.1) 0%, transparent 25%)'
              : 'radial-gradient(circle at 25% 25%, rgba(95, 94, 255, 0.15) 0%, transparent 25%), radial-gradient(circle at 75% 75%, rgba(26, 255, 213, 0.15) 0%, transparent 25%)',
            animation: 'float 20s ease-in-out infinite',
            zIndex: 0,
          },
          
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '60vmax',
            height: '60vmax',
            background: isDark
              ? 'radial-gradient(circle, rgba(184, 205, 248, 0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(184, 205, 248, 0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 15s ease-in-out infinite reverse',
            zIndex: 0,
          },
          
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '25%': { transform: 'translate(20px, -20px) rotate(90deg)' },
            '50%': { transform: 'translate(0, 0) rotate(180deg)' },
            '75%': { transform: 'translate(-20px, 20px) rotate(270deg)' },
          },
        }),
      }}
    >
      {/* Content wrapper with glass backdrop */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          backdropFilter: 'blur(0.5px)',
          WebkitBackdropFilter: 'blur(0.5px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// Specialized glass background variants
export function AdminGlassBackground({ children }: { children: ReactNode }) {
  return (
    <GlassBackground variant="primary" animated>
      {children}
    </GlassBackground>
  );
}

export function AgencyGlassBackground({ children }: { children: ReactNode }) {
  return (
    <GlassBackground variant="ryvrBrand" animated>
      {children}
    </GlassBackground>
  );
}

export function BusinessGlassBackground({ children }: { children: ReactNode }) {
  return (
    <GlassBackground variant="success" animated>
      {children}
    </GlassBackground>
  );
}

export function LoginGlassBackground({ children }: { children: ReactNode }) {
  return (
    <GlassBackground variant="secondary" animated>
      {children}
    </GlassBackground>
  );
}
