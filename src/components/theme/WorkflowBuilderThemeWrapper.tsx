import React from 'react'
import { Box, Card, CardHeader, CardContent, useTheme } from '@mui/material'
import { useWhiteLabel } from '../../theme/WhiteLabelProvider'

interface WorkflowBuilderThemeWrapperProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
  fullHeight?: boolean
}

export const WorkflowBuilderThemeWrapper: React.FC<WorkflowBuilderThemeWrapperProps> = ({
  children,
  title = "Workflow Builder",
  actions,
  fullHeight = true,
}) => {
  const theme = useTheme()
  const { whiteLabelConfig } = useWhiteLabel()

  // CSS custom properties for the workflow builder
  const workflowThemeVars = {
    '--workflow-primary-color': whiteLabelConfig?.primaryColor || theme.palette.primary.main,
    '--workflow-secondary-color': whiteLabelConfig?.secondaryColor || theme.palette.secondary.main,
    '--workflow-success-color': theme.palette.success.main,
    '--workflow-error-color': theme.palette.error.main,
    '--workflow-warning-color': theme.palette.warning.main,
    '--workflow-info-color': theme.palette.info.main,
    '--workflow-background-color': theme.palette.background.default,
    '--workflow-surface-color': theme.palette.background.paper,
    '--workflow-text-primary': theme.palette.text.primary,
    '--workflow-text-secondary': theme.palette.text.secondary,
    '--workflow-border-color': theme.palette.divider,
    '--workflow-shadow': theme.palette.mode === 'dark' 
      ? '0 2px 8px rgba(0, 0, 0, 0.24)'
      : '0 2px 8px rgba(45, 49, 66, 0.08)',
    '--workflow-border-radius': '8px',
    '--workflow-font-family': theme.typography.fontFamily,
    '--workflow-mode': theme.palette.mode,
  } as React.CSSProperties

  return (
    <Card 
      sx={{ 
        height: fullHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {title && (
        <CardHeader
          title={title}
          action={actions}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        />
      )}
      
      <CardContent
        sx={{
          p: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          '&:last-child': {
            pb: 0,
          },
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            ...workflowThemeVars,
            
            // Workflow builder specific styling
            '& .workflow-builder': {
              height: '100%',
              fontFamily: 'var(--workflow-font-family)',
              color: 'var(--workflow-text-primary)',
              backgroundColor: 'var(--workflow-background-color)',
            },
            
            // Node styling
            '& .react-flow__node': {
              backgroundColor: 'var(--workflow-surface-color)',
              border: '1px solid var(--workflow-border-color)',
              borderRadius: 'var(--workflow-border-radius)',
              boxShadow: 'var(--workflow-shadow)',
              color: 'var(--workflow-text-primary)',
              fontFamily: 'var(--workflow-font-family)',
            },
            
            '& .react-flow__node.selected': {
              borderColor: 'var(--workflow-primary-color)',
              boxShadow: `0 0 0 2px rgba(${hexToRgb(theme.palette.primary.main)}, 0.2)`,
            },
            
            // Edge styling
            '& .react-flow__edge-path': {
              stroke: 'var(--workflow-border-color)',
              strokeWidth: 2,
            },
            
            '& .react-flow__edge.selected .react-flow__edge-path': {
              stroke: 'var(--workflow-primary-color)',
            },
            
            // Handle styling
            '& .react-flow__handle': {
              backgroundColor: 'var(--workflow-primary-color)',
              border: '2px solid var(--workflow-surface-color)',
              borderRadius: '50%',
              width: 8,
              height: 8,
            },
            
            // Control styling
            '& .react-flow__controls': {
              backgroundColor: 'var(--workflow-surface-color)',
              border: '1px solid var(--workflow-border-color)',
              borderRadius: 'var(--workflow-border-radius)',
              boxShadow: 'var(--workflow-shadow)',
            },
            
            '& .react-flow__controls-button': {
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--workflow-text-primary)',
              
              '&:hover': {
                backgroundColor: 'var(--workflow-primary-color)',
                color: 'white',
              },
            },
            
            // Minimap styling
            '& .react-flow__minimap': {
              backgroundColor: 'var(--workflow-surface-color)',
              border: '1px solid var(--workflow-border-color)',
              borderRadius: 'var(--workflow-border-radius)',
            },
            
            // Background styling
            '& .react-flow__background': {
              backgroundColor: 'var(--workflow-background-color)',
            },
            
            // Task node specific styling
            '& .task-node': {
              '&.task-type-ai': {
                borderColor: 'var(--workflow-primary-color)',
              },
              '&.task-type-integration': {
                borderColor: 'var(--workflow-info-color)',
              },
              '&.task-type-data': {
                borderColor: 'var(--workflow-secondary-color)',
              },
              '&.task-type-condition': {
                borderColor: 'var(--workflow-warning-color)',
              },
              '&.task-error': {
                borderColor: 'var(--workflow-error-color)',
                backgroundColor: `rgba(${hexToRgb(theme.palette.error.main)}, 0.1)`,
              },
              '&.task-success': {
                borderColor: 'var(--workflow-success-color)',
                backgroundColor: `rgba(${hexToRgb(theme.palette.success.main)}, 0.1)`,
              },
            },
            
            // Custom form elements within workflow builder
            '& .workflow-form input': {
              backgroundColor: 'var(--workflow-surface-color)',
              border: '1px solid var(--workflow-border-color)',
              borderRadius: 'calc(var(--workflow-border-radius) / 2)',
              color: 'var(--workflow-text-primary)',
              fontFamily: 'var(--workflow-font-family)',
              padding: '8px 12px',
              
              '&:focus': {
                outline: 'none',
                borderColor: 'var(--workflow-primary-color)',
                boxShadow: `0 0 0 2px rgba(${hexToRgb(theme.palette.primary.main)}, 0.2)`,
              },
            },
            
            '& .workflow-form button': {
              backgroundColor: 'var(--workflow-primary-color)',
              border: 'none',
              borderRadius: 'calc(var(--workflow-border-radius) / 2)',
              color: 'white',
              fontFamily: 'var(--workflow-font-family)',
              fontWeight: 500,
              padding: '8px 16px',
              cursor: 'pointer',
              
              '&:hover': {
                opacity: 0.9,
              },
              
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            },
            
            // Sidebar/panel styling
            '& .workflow-sidebar': {
              backgroundColor: 'var(--workflow-surface-color)',
              borderLeft: '1px solid var(--workflow-border-color)',
              color: 'var(--workflow-text-primary)',
            },
            
            // Tooltip styling
            '& .workflow-tooltip': {
              backgroundColor: 'var(--workflow-surface-color)',
              border: '1px solid var(--workflow-border-color)',
              borderRadius: 'calc(var(--workflow-border-radius) / 2)',
              boxShadow: 'var(--workflow-shadow)',
              color: 'var(--workflow-text-primary)',
              fontFamily: 'var(--workflow-font-family)',
              fontSize: '0.875rem',
              padding: '8px 12px',
            },
        }}
      >
        {children}
      </Box>
      </CardContent>
    </Card>
  )
}

// Utility function to convert hex to rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

export default WorkflowBuilderThemeWrapper
