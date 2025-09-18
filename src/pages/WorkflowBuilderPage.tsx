import React from 'react'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { 
  PlayArrow as PlayIcon,
  Save as SaveIcon,
  Share as ShareIcon,
} from '@mui/icons-material'
import WorkflowBuilderThemeWrapper from '../components/theme/WorkflowBuilderThemeWrapper'
import { useAuth } from '../contexts/AuthContext'

// Import your existing workflow builder component
// import { WorkflowBuilder } from '../components/workflow/WorkflowBuilder'

export const WorkflowBuilderPage: React.FC = () => {
  const { user } = useAuth()

  const handleSave = () => {
    console.log('Save workflow')
  }

  const handleRun = () => {
    console.log('Run workflow')
  }

  const handleShare = () => {
    console.log('Share workflow')
  }

  const headerActions = (
    <Stack direction="row" spacing={2} alignItems="center">
      {user && (
        <Chip 
          label={`Credits: 1,250`} 
          color="success" 
          variant="outlined" 
          size="small"
        />
      )}
      
      <Button
        variant="outlined"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        size="small"
      >
        Save
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={handleShare}
        size="small"
      >
        Share
      </Button>
      
      <Button
        variant="contained"
        startIcon={<PlayIcon />}
        onClick={handleRun}
        size="small"
      >
        Run Workflow
      </Button>
    </Stack>
  )

  return (
    <Box sx={{ height: 'calc(100vh - 140px)' }}>
      <WorkflowBuilderThemeWrapper 
        title="Marketing Automation Workflow"
        actions={headerActions}
        fullHeight
      >
        {/* Replace this with your actual workflow builder component */}
        <Box 
          sx={{ 
            height: '100%',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'background.default',
            borderRadius: 1,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5" color="primary">
              Workflow Builder
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Your existing workflow builder component will be rendered here<br />
              with the new RYVR theme applied via CSS custom properties.
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              User: {user?.full_name || user?.email || 'Not logged in'}<br />
              Ready to build workflows!
            </Typography>
            
            {/* Example of how workflow builder CSS variables work */}
            <Box
              sx={{
                p: 2,
                border: '2px solid var(--workflow-primary-color, #5f5eff)',
                borderRadius: 'var(--workflow-border-radius, 8px)',
                backgroundColor: 'var(--workflow-surface-color)',
                color: 'var(--workflow-text-primary)',
                mt: 2,
              }}
            >
              <Typography variant="body2">
                This box demonstrates CSS custom properties for workflow styling
              </Typography>
            </Box>
          </Stack>
        </Box>
      </WorkflowBuilderThemeWrapper>
    </Box>
  )
}

export default WorkflowBuilderPage
