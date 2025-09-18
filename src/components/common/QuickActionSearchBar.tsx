import React, { useState } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material'
import {
  SearchOutlined as SearchIcon,
} from '@mui/icons-material'

interface QuickActionSearchBarProps {
  onOpen: () => void
  isExpanded: boolean
}

export const QuickActionSearchBar: React.FC<QuickActionSearchBarProps> = ({ 
  onOpen, 
  isExpanded 
}) => {
  const theme = useTheme()

  if (!isExpanded) return null

  return (
    <Box sx={{ px: 2, pb: 1 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search actions... (Ctrl+K)"
        onClick={onOpen}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.04)',
            },
            '& fieldset': {
              borderColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
          '& .MuiInputBase-input': {
            cursor: 'pointer',
            fontSize: '0.875rem',
          },
        }}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '1rem',
                }} 
              />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}

export default QuickActionSearchBar
