'use client'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

// MUI Imports
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Paper,
  Button,
  useTheme
} from '@mui/material'
import {
  TrendingUp,
  Store,
  PlayArrow,
  AttachMoney
} from '@mui/icons-material'

// Auth Context Import
import { useAuth, withAuth } from '@/contexts/AuthContext'

const StatCard = ({ title, value, icon: Icon, color, action }: {
  title: string
  value: string
  icon: any
  color: string
  action?: () => void
}) => {
  return (
    <Card sx={{ height: '100%', cursor: action ? 'pointer' : 'default' }} onClick={action}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: `${color}.light`,
              mr: 2
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function AgencyDashboard() {
  const { user } = useAuth()

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome back, {user?.first_name || user?.username}! 🚀
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your client businesses and marketing campaigns from here.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<Store />}
              size="large"
            >
              Add New Business
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              startIcon={<PlayArrow />}
              size="large"
            >
              Create Workflow
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Client Businesses"
            value="12"
            icon={Store}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Workflows"
            value="24"
            icon={PlayArrow}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Performance"
            value="+18%"
            icon={TrendingUp}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Credits Used"
            value="1,250"
            icon={AttachMoney}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Client Performance Overview
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                  bgcolor: 'background.neutral',
                  borderRadius: 1
                }}
              >
                <Typography color="text.secondary">
                  Performance Chart Placeholder
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Client Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  'Coffee Shop workflow completed successfully',
                  'New business "Local Bakery" onboarded',
                  'Fitness Studio campaign generated 50 leads',
                  'Restaurant workflow needs attention'
                ].map((activity, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: 'background.neutral',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2">
                      {activity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {index + 1} hour{index !== 0 ? 's' : ''} ago
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Business List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Your Client Businesses
              </Typography>
              <Grid container spacing={2}>
                {[
                  { name: 'Coffee Corner', status: 'Active', campaigns: 3 },
                  { name: 'Local Fitness Studio', status: 'Active', campaigns: 5 },
                  { name: 'Downtown Restaurant', status: 'Needs Attention', campaigns: 2 },
                  { name: 'Tech Startup', status: 'Active', campaigns: 4 }
                ].map((business, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {business.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Status: {business.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {business.campaigns} active campaigns
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default withAuth(AgencyDashboard, ['agency_owner', 'agency_manager', 'agency_viewer'])
