'use client'

// MUI Imports
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Paper,
  Button,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  TrendingUp,
  Visibility,
  Mouse,
  Schedule
} from '@mui/icons-material'

// Auth Context Import
import { useAuth, withAuth } from '@/contexts/AuthContext'

const StatCard = ({ title, value, icon: Icon, color, trend }: {
  title: string
  value: string
  icon: any
  color: string
  trend?: string
}) => {
  return (
    <Card sx={{ height: '100%' }}>
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
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {trend && (
              <Typography variant="caption" color="success.main">
                {trend}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function BusinessDashboard() {
  const { user } = useAuth()

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome to your business dashboard! 📈
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your marketing performance and manage your automated campaigns.
        </Typography>
      </Box>

      {/* Onboarding Progress (if applicable) */}
      <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Complete Your Setup
            </Typography>
            <Typography variant="body2">
              3 of 5 steps completed
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={60} 
            sx={{ 
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'primary.contrastText'
              }
            }} 
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="✓ Profile Complete" size="small" />
            <Chip label="✓ Integrations Added" size="small" />
            <Chip label="✓ First Campaign" size="small" />
            <Chip label="Add Team Members" variant="outlined" size="small" />
            <Chip label="Set Goals" variant="outlined" size="small" />
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Website Visitors"
            value="2,847"
            icon={Visibility}
            color="primary"
            trend="+12% vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Click-through Rate"
            value="3.2%"
            icon={Mouse}
            color="success"
            trend="+0.8% vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value="1.8%"
            icon={TrendingUp}
            color="info"
            trend="+0.3% vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Campaigns"
            value="4"
            icon={Schedule}
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
                Performance Overview
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
                  Analytics Chart Placeholder
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  'Email campaign sent to 500 subscribers',
                  'Social media post published',
                  'New lead generated from website',
                  'SEO report completed'
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

        {/* Active Campaigns */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Active Marketing Campaigns
                </Typography>
                <Button variant="outlined" size="small">
                  View All
                </Button>
              </Box>
              <Grid container spacing={2}>
                {[
                  { name: 'Email Newsletter Campaign', status: 'Running', performance: 'Good', progress: 75 },
                  { name: 'Social Media Automation', status: 'Running', performance: 'Excellent', progress: 90 },
                  { name: 'SEO Content Generation', status: 'Scheduled', performance: 'Pending', progress: 25 },
                  { name: 'Customer Follow-up Sequence', status: 'Running', performance: 'Good', progress: 60 }
                ].map((campaign, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {campaign.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip 
                          label={campaign.status} 
                          color={campaign.status === 'Running' ? 'success' : 'warning'}
                          size="small" 
                        />
                        <Chip 
                          label={campaign.performance} 
                          variant="outlined" 
                          size="small" 
                        />
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Progress: {campaign.progress}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={campaign.progress} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
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

export default withAuth(BusinessDashboard, ['individual_user', 'business_owner', 'business_user'])
