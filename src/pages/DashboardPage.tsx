import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AccountTree,
  CreditCard,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, subtitle }: any) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600, color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  // Mock data - replace with actual API calls
  const stats = {
    totalClients: 12,
    activeWorkflows: 8,
    creditsUsed: 1250,
    creditsRemaining: 2750,
  };

  const recentActivity = [
    { id: 1, action: 'Workflow executed', client: 'Acme Corp', time: '2 hours ago', status: 'success' },
    { id: 2, action: 'New client added', client: 'TechStart Inc', time: '4 hours ago', status: 'info' },
    { id: 3, action: 'Credit purchase', client: 'Global Marketing', time: '6 hours ago', status: 'success' },
    { id: 4, action: 'Workflow failed', client: 'Local Business', time: '8 hours ago', status: 'error' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<People fontSize="large" />}
            color="#5f5fff"
            subtitle="+2 this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Workflows"
            value={stats.activeWorkflows}
            icon={<AccountTree fontSize="large" />}
            color="#4caf50"
            subtitle="Running smoothly"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Credits Used"
            value={stats.creditsUsed.toLocaleString()}
            icon={<CreditCard fontSize="large" />}
            color="#ff9800"
            subtitle="This month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Performance"
            value="94%"
            icon={<TrendingUp fontSize="large" />}
            color="#2e7d32"
            subtitle="Success rate"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {recentActivity.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid #f0f0f0',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {activity.action}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.client}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {activity.time}
                      </Typography>
                      <Chip
                        label={activity.status}
                        size="small"
                        color={
                          activity.status === 'success'
                            ? 'success'
                            : activity.status === 'error'
                            ? 'error'
                            : 'info'
                        }
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Credit Usage
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Used</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats.creditsUsed} / {stats.creditsUsed + stats.creditsRemaining}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.creditsUsed / (stats.creditsUsed + stats.creditsRemaining)) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#5f5fff',
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {stats.creditsRemaining} credits remaining TEST
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 