import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  Alert,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import { DashboardSkeleton } from '../components/common/SkeletonLoaders';
import AdminLayout from '../components/layout/AdminLayout';
import adminApi from '../services/adminApi';
import { debugAuthState } from '../utils/auth';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  AccountTree as WorkflowIcon,
  CreditCard as CreditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Extension as ExtensionIcon,
} from '@mui/icons-material';

interface DashboardStats {
  users: {
    total: number;
    admin: number;
    agency: number;
    individual: number;
  };
  agencies: {
    total: number;
    with_businesses: number;
  };
  businesses: {
    total: number;
  };
  workflows: {
    templates: {
      total: number;
      published: number;
    };
    instances: number;
    executions_30d: number;
    success_rate: number;
  };
  credits: {
    total_pools: number;
    total_distributed: number;
    total_used: number;
    utilization_rate: number;
  };
}

interface SystemHealth {
  status: string;
  database: boolean;
  integrations: boolean;
  services: boolean;
  uptime: string;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResult = await adminApi.getDashboardStats();
      if (statsResult.error) {
        throw new Error(statsResult.error);
      }
      setStats(statsResult.data as DashboardStats);

      // Fetch system health
      const healthResult = await adminApi.getSystemHealth();
      if (healthResult.error) {
        console.warn('Health API failed:', healthResult.error);
        // Set a default health status if API fails
        setHealth({
          status: 'unknown',
          database: true, // Assume true since dashboard stats worked
          integrations: true,
          services: true,
          uptime: 'Unknown'
        });
      } else {
        setHealth(healthResult.data as SystemHealth);
      }

    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={handleRefresh} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', action }: any) => (
    <Card 
      sx={{ 
        height: '100%',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
          {action && (
            <IconButton size="small" onClick={action}>
              <AddIcon />
            </IconButton>
          )}
        </Box>
        
        <Typography variant="h3" component="div" fontWeight="bold" color="text.primary">
          {value?.toLocaleString() || '0'}
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const getHealthColor = (status: boolean) => status ? 'success' : 'error';

  const headerActions = (
    <Stack direction="row" spacing={2}>
      <Button
        variant="outlined"
        startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        onClick={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      
      <Button
        variant="text"
        color="secondary"
        onClick={async () => {
          debugAuthState();
          const result = await adminApi.debugAuth();
          console.log('🔍 Auth Debug Result:', result);
        }}
      >
        Debug Auth
      </Button>
    </Stack>
  );

  return (
    <AdminLayout actions={headerActions}>
      <Box>

      {/* System Health */}
      {health && (
        <Alert 
          severity={health.status === 'healthy' ? 'success' : 'warning'} 
          sx={{ mb: 4 }}
          icon={health.status === 'healthy' ? <CheckCircleIcon /> : <WarningIcon />}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            System Status: {health.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
          </Typography>
          <Typography variant="body2">
            Database: {health.database ? 'Connected' : 'Disconnected'} | 
            Integrations: {health.integrations ? 'Active' : 'Issues'} | 
            Services: {health.services ? 'Running' : 'Degraded'} | 
            Uptime: {health.uptime || 'Unknown'}
          </Typography>
        </Alert>
      )}

      {/* Main Stats Grid */}
      <Grid container spacing={3} mb={4}>
        {/* Users */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.users.total}
            subtitle={`${stats?.users.admin} admin, ${stats?.users.agency} agency, ${stats?.users.individual} individual`}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>

        {/* Agencies */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Agencies"
            value={stats?.agencies.total}
            subtitle={`${stats?.agencies.with_businesses} have businesses`}
            icon={<BusinessIcon />}
            color="secondary"
          />
        </Grid>

        {/* Businesses */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Businesses"
            value={stats?.businesses.total}
            subtitle="Active client accounts"
            icon={<BusinessIcon />}
            color="info"
          />
        </Grid>

        {/* Credit Utilization */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Credit Utilization"
            value={`${stats?.credits.utilization_rate || 0}%`}
            subtitle={`${stats?.credits.total_used?.toLocaleString()} of ${stats?.credits.total_distributed?.toLocaleString()} used`}
            icon={<CreditIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Workflow & System Stats */}
      <Grid container spacing={3} mb={4}>
        {/* Workflow Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <WorkflowIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Workflow Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last 30 days
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {stats?.workflows.templates.published || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Published Templates
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {stats?.workflows.instances || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Instances
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats?.workflows.executions_30d || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Executions (30d)
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats?.workflows.success_rate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </Grid>
              </Grid>

              {/* Success Rate Progress */}
              <Box mt={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Success Rate</Typography>
                  <Typography variant="body2">{stats?.workflows.success_rate || 0}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.workflows.success_rate || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Resources */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <StorageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    System Resources
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current status
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <SecurityIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">Database</Typography>
                  </Box>
                  <Chip 
                    label={health?.database ? 'Connected' : 'Disconnected'}
                    color={getHealthColor(health?.database || false)}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <ExtensionIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body1">Integrations</Typography>
                  </Box>
                  <Chip 
                    label={health?.integrations ? 'Active' : 'Issues'}
                    color={getHealthColor(health?.integrations || false)}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <SpeedIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body1">Services</Typography>
                  </Box>
                  <Chip 
                    label={health?.services ? 'Running' : 'Degraded'}
                    color={getHealthColor(health?.services || false)}
                    size="small"
                  />
                </Box>

                <Divider />

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1" fontWeight="medium">
                    Credit Pools
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {stats?.credits.total_pools || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Common administrative tasks
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/users')}
              >
                Create User
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                startIcon={<BusinessIcon />}
                onClick={() => navigate('/admin/agencies')}
              >
                Manage Agencies
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                startIcon={<WorkflowIcon />}
                onClick={() => navigate('/admin/workflows')}
              >
                Workflow Templates
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                startIcon={<ExtensionIcon />}
                onClick={() => navigate('/admin/integrations')}
              >
                System Integrations
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                startIcon={<CreditIcon />}
                onClick={() => navigate('/admin/credits')}
              >
                Credit Management
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                startIcon={<SecurityIcon />}
                onClick={() => navigate('/admin/settings')}
              >
                System Settings
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      </Box>
    </AdminLayout>
  );
}
