import React from 'react'
import {
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material'
import {
  LightModeOutlined as LightModeIcon,
  DarkModeOutlined as DarkModeIcon,
} from '@mui/icons-material'
import { useWhiteLabel } from '../../theme/WhiteLabelProvider'

interface ColorModeToggleProps {
  size?: 'small' | 'medium' | 'large'
  variant?: 'icon' | 'switch' | 'menu'
}

export const ColorModeToggle: React.FC<ColorModeToggleProps> = ({
  size = 'small',
  variant = 'icon',
}) => {
  const { isDarkMode, toggleDarkMode } = useWhiteLabel()
  const theme = useTheme()

  const handleToggle = () => {
    toggleDarkMode()
  }

  const getTooltipText = () => {
    return isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
  }

  const getIcon = () => {
    return isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />
  }

  if (variant === 'icon') {
    return (
      <Tooltip title={getTooltipText()}>
        <IconButton
          onClick={handleToggle}
          size={size}
          sx={{
            color: 'text.primary',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: theme.palette.primary.main,
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
