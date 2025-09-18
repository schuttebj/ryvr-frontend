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
  Avatar,
  Alert,
  Stack,
  CircularProgress,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountTree as WorkflowIcon,
  PlayArrow as PlayIcon,
  Assessment as AnalyticsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  CreditCard as CreditIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Speed as PerformanceIcon,
} from '@mui/icons-material';
import { BusinessGlassBackground } from '../components/common/GlassBackground';

interface Business {
  id: number;
  name: string;
  industry: string;
  is_active: boolean;
  created_at: string;
  onboarding_completed: boolean;
}

interface BusinessMetrics {
  active_workflows: number;
  total_executions: number;
  success_rate: number;
  credit_balance: number;
  credit_usage_30d: number;
  last_execution: string;
  avg_execution_time: number;
  pending_tasks: number;
}

interface RecentActivity {
  id: number;
  type: 'workflow_executed' | 'workflow_created' | 'integration_added' | 'task_completed';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
}

export default function BusinessDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | ''>('');
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data fetching - replace with real API calls
  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock businesses data for individual user
      const mockBusinesses: Business[] = [
        {
          id: 1,
          name: "My Marketing Agency",
          industry: "Digital Marketing",
          is_active: true,
          created_at: "2024-01-15T00:00:00Z",
          onboarding_completed: true
        },
        {
          id: 2,
          name: "E-commerce Store",
          industry: "E-commerce",
          is_active: true,
          created_at: "2024-02-01T00:00:00Z",
          onboarding_completed: false
        }
      ];
      
      setBusinesses(mockBusinesses);
      
      // Set first business as selected if none selected
      if (mockBusinesses.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(mockBusinesses[0].id);
      }
      
    } catch (err: any) {
      console.error('Failed to fetch business data:', err);
      setError(err.message || 'Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessMetrics = async (businessId: number) => {
    try {
      // Simulate API call for business metrics
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockMetrics: BusinessMetrics = {
        active_workflows: businessId === 1 ? 8 : businessId === 2 ? 5 : 3,
        total_executions: businessId === 1 ? 156 : businessId === 2 ? 89 : 45,
        success_rate: businessId === 1 ? 92.3 : businessId === 2 ? 87.8 : 94.1,
        credit_balance: businessId === 1 ? 2450 : businessId === 2 ? 1200 : 800,
        credit_usage_30d: businessId === 1 ? 1875 : businessId === 2 ? 950 : 600,
        last_execution: "2024-03-15T14:30:00Z",
        avg_execution_time: 45.2,
        pending_tasks: businessId === 1 ? 3 : businessId === 2 ? 1 : 2
      };
      
      setMetrics(mockMetrics);
      
      // Mock recent activity
      const mockActivity: RecentActivity[] = [
        {
          id: 1,
          type: 'workflow_executed',
          title: 'SEO Content Analysis',
          description: 'Completed analysis for 15 pages',
          timestamp: '2024-03-15T14:30:00Z',
          status: 'success'
        },
        {
          id: 2,
          type: 'task_completed',
          title: 'Social Media Post Generated',
          description: 'AI-generated content for LinkedIn',
          timestamp: '2024-03-15T13:15:00Z',
          status: 'success'
        },
        {
          id: 3,
          type: 'workflow_executed',
          title: 'Email Campaign Analysis',
          description: 'Processing email performance data',
          timestamp: '2024-03-15T12:00:00Z',
          status: 'pending'
        },
        {
          id: 4,
          type: 'integration_added',
          title: 'Google Analytics Connected',
          description: 'Successfully connected GA4 integration',
          timestamp: '2024-03-15T10:45:00Z',
          status: 'success'
        }
      ];
      
      setRecentActivity(mockActivity);
    } catch (err: any) {
      console.error('Failed to fetch business metrics:', err);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, []);

  useEffect(() => {
    if (selectedBusinessId && typeof selectedBusinessId === 'number') {
      fetchBusinessMetrics(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const handleBusinessChange = (event: SelectChangeEvent<number | ''>) => {
    setSelectedBusinessId(event.target.value as number);
  };

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workflow_executed': return <PlayIcon />;
      case 'workflow_created': return <WorkflowIcon />;
      case 'integration_added': return <SettingsIcon />;
      case 'task_completed': return <SuccessIcon />;
      default: return <AnalyticsIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <BusinessGlassBackground>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </BusinessGlassBackground>
    );
  }

  if (error) {
    return (
      <BusinessGlassBackground>
        <Box p={3}>
          <Alert severity="error">
            {error}
            <Button onClick={fetchBusinessData} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        </Box>
      </BusinessGlassBackground>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', progress }: any) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" component="div" fontWeight="bold" color="text.primary">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {subtitle}
          </Typography>
        )}
        
        {progress !== undefined && (
          <Box mt={2}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={color}
              sx={{ borderRadius: 2, height: 6 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {progress.toFixed(1)}% completion rate
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <BusinessGlassBackground>
      <Box p={3}>
        {/* Header with Business Selector */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Business Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor your business performance and manage workflows
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/business/workflows/create')}
            >
              Create Workflow
            </Button>
            <Button
              variant="contained"
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/business/analytics')}
            >
              View Analytics
            </Button>
          </Stack>
        </Box>

        {/* Business Selector */}
        {businesses.length > 1 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Select Business
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Switch between your businesses to view specific data
                  </Typography>
                </Box>
                
                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel>Business</InputLabel>
                  <Select
                    value={selectedBusinessId}
                    label="Business"
                    onChange={handleBusinessChange}
                  >
                    {businesses.map((business) => (
                      <MenuItem key={business.id} value={business.id}>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'success.main' }}>
                            {business.name.charAt(0)}
                          </Avatar>
                          {business.name}
                          {!business.onboarding_completed && (
                            <Chip 
                              label="Setup Required" 
                              size="small" 
                              color="warning"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Business Metrics */}
        {selectedBusiness && metrics && (
          <>
            <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {selectedBusiness.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedBusiness.industry} • Active since {new Date(selectedBusiness.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              
              {!selectedBusiness.onboarding_completed && (
                <Chip 
                  label="Complete Setup" 
                  color="warning" 
                  clickable
                  onClick={() => navigate('/business/onboarding')}
                />
              )}
            </Box>
            
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Workflows"
                  value={metrics.active_workflows}
                  subtitle="Running automation"
                  icon={<WorkflowIcon />}
                  color="primary"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Executions"
                  value={metrics.total_executions}
                  subtitle={`${metrics.success_rate}% success rate`}
                  icon={<TrendingUpIcon />}
                  color="success"
                  progress={metrics.success_rate}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Credit Balance"
                  value={metrics.credit_balance}
                  subtitle={`${metrics.credit_usage_30d} used this month`}
                  icon={<CreditIcon />}
                  color="warning"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Avg. Performance"
                  value={`${metrics.avg_execution_time}s`}
                  subtitle={`${metrics.pending_tasks} tasks pending`}
                  icon={<PerformanceIcon />}
                  color="info"
                />
              </Grid>
            </Grid>

            {/* Recent Activity & Quick Actions */}
            <Grid container spacing={3}>
              {/* Recent Activity */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                      Recent Activity
                    </Typography>
                    
                    <Stack spacing={2}>
                      {recentActivity.map((activity) => (
                        <Box
                          key={activity.id}
                          display="flex"
                          alignItems="center"
                          p={2}
                          sx={{
                            borderRadius: 2,
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.02)' 
                              : 'rgba(0, 0, 0, 0.02)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(0, 0, 0, 0.05)',
                            },
                          }}
                        >
                          <Avatar sx={{ bgcolor: `${getStatusColor(activity.status)}.main`, mr: 2 }}>
                            {getActivityIcon(activity.type)}
                          </Avatar>
                          
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {activity.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                          </Box>
                          
                          <Box textAlign="right">
                            <Chip 
                              label={activity.status} 
                              size="small" 
                              color={getStatusColor(activity.status) as any}
                            />
                            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                      Quick Actions
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Button 
                        variant="contained"
                        fullWidth
                        startIcon={<WorkflowIcon />}
                        onClick={() => navigate('/business/workflows')}
                      >
                        Manage Workflows
                      </Button>
                      
                      <Button 
                        variant="outlined"
                        fullWidth
                        startIcon={<AnalyticsIcon />}
                        onClick={() => navigate('/business/analytics')}
                      >
                        View Analytics
                      </Button>
                      
                      <Button 
                        variant="outlined"
                        fullWidth
                        startIcon={<SettingsIcon />}
                        onClick={() => navigate('/business/integrations')}
                      >
                        Manage Integrations
                      </Button>
                      
                      <Button 
                        variant="outlined"
                        fullWidth
                        startIcon={<ScheduleIcon />}
                        onClick={() => navigate('/business/schedule')}
                      >
                        Schedule Tasks
                      </Button>
                      
                      {!selectedBusiness.onboarding_completed && (
                        <Button 
                          variant="outlined"
                          fullWidth
                          color="warning"
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/business/onboarding')}
                        >
                          Complete Setup
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </BusinessGlassBackground>
  );
}
