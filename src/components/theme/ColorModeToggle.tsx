import React from 'react'
import {
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material'
import { useWhiteLabel } from '../../theme/WhiteLabelProvider'

interface ColorModeToggleProps {
  size?: 'small' | 'medium' | 'large'
  variant?: 'icon' | 'switch' | 'menu'
}

export const ColorModeToggle: React.FC<ColorModeToggleProps> = ({
  size = 'medium',
  variant = 'icon',
}) => {
  const { isDarkMode, toggleDarkMode } = useWhiteLabel()

  const handleToggle = () => {
    toggleDarkMode()
  }

  const getTooltipText = () => {
    return isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
  }

  const getIcon = () => {
    return isDarkMode ? <LightModeIcon /> : <DarkModeIcon />
  }

  if (variant === 'icon') {
    return (
      <Tooltip title={getTooltipText()}>
        <IconButton
          onClick={handleToggle}
          size={size}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
    )
  }

  // Add more variants (switch, menu) if needed in the future
  return null
}

export default ColorModeToggle
