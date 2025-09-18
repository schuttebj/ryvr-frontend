'use client'

// Component Imports
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder'
import { Box, Typography, Button } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

// Auth Context Import
import { useAuth, withAuth } from '@/contexts/AuthContext'

function WorkflowBuilderPage() {
  const router = useRouter()
  const { user } = useAuth()

  const handleBack = () => {
    // Navigate back based on user role
    if (user?.role === 'admin') {
      router.push('/admin/workflows')
    } else if (user?.role?.includes('agency')) {
      router.push('/agency/workflows')
    } else {
      router.push('/business/workflows')
    }
  }

  const handleSave = async (workflow: any) => {
    console.log('Saving workflow:', workflow)
    // TODO: Implement actual save functionality
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="outlined"
            size="small"
          >
            Back to Workflows
          </Button>
          <Typography variant="h5" fontWeight={600}>
            Workflow Builder
          </Typography>
        </Box>
      </Box>

      {/* Workflow Builder */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <WorkflowBuilder onSave={handleSave} />
      </Box>
    </Box>
  )
}

export default withAuth(WorkflowBuilderPage)
