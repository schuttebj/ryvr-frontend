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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  AccountTree as WorkflowIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  CreditCard as CreditIcon,
  Assessment as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface Business {
  id: number;
  name: string;
  industry: string;
  is_active: boolean;
  created_at: string;
  agency_id: number;
}

interface AgencyStats {
  total_businesses: number;
  active_businesses: number;
  total_workflows: number;
  total_executions_30d: number;
  credit_usage_30d: number;
  active_users: number;
}

interface BusinessStats {
  workflow_instances: number;
  executions_30d: number;
  success_rate: number;
  credit_usage: number;
  last_activity: string;
}

export default function AgencyDashboardPage() {
  const navigate = useNavigate();
  
  // State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | ''>('');
  const [agencyStats, setAgencyStats] = useState<AgencyStats | null>(null);
  const [businessStats, setBusinessStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data fetching - replace with real API calls
  const fetchAgencyData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock businesses data
      const mockBusinesses: Business[] = [
        {
          id: 1,
          name: "Tech Startup Inc",
          industry: "Technology",
          is_active: true,
          created_at: "2024-01-15T00:00:00Z",
          agency_id: 1
        },
        {
          id: 2,
          name: "Local Restaurant",
          industry: "Food & Beverage",
          is_active: true,
          created_at: "2024-02-01T00:00:00Z",
          agency_id: 1
        },
        {
          id: 3,
          name: "Fitness Studio",
          industry: "Health & Wellness",
          is_active: true,
          created_at: "2024-01-20T00:00:00Z",
          agency_id: 1
        }
      ];
      
      // Mock agency stats
      const mockAgencyStats: AgencyStats = {
        total_businesses: 3,
        active_businesses: 3,
        total_workflows: 15,
        total_executions_30d: 247,
        credit_usage_30d: 12450,
        active_users: 8
      };
      
      setBusinesses(mockBusinesses);
      setAgencyStats(mockAgencyStats);
      
      // Set first business as selected if none selected
      if (mockBusinesses.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(mockBusinesses[0].id);
      }
      
    } catch (err: any) {
      console.error('Failed to fetch agency data:', err);
      setError(err.message || 'Failed to load agency data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessStats = async (businessId: number) => {
    try {
      // Simulate API call for specific business stats
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data that could vary based on businessId in real implementation
      const mockBusinessStats: BusinessStats = {
        workflow_instances: businessId === 1 ? 5 : businessId === 2 ? 3 : 2,
        executions_30d: businessId === 1 ? 82 : businessId === 2 ? 65 : 40,
        success_rate: businessId === 1 ? 94.5 : businessId === 2 ? 87.2 : 92.1,
        credit_usage: businessId === 1 ? 4150 : businessId === 2 ? 2800 : 1900,
        last_activity: "2024-03-15T10:30:00Z"
      };
      
      setBusinessStats(mockBusinessStats);
    } catch (err: any) {
      console.error('Failed to fetch business stats:', err);
    }
  };

  useEffect(() => {
    fetchAgencyData();
  }, []);

  useEffect(() => {
    if (selectedBusinessId && typeof selectedBusinessId === 'number') {
      fetchBusinessStats(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const handleBusinessChange = (event: SelectChangeEvent<number | ''>) => {
    setSelectedBusinessId(event.target.value as number);
  };

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={fetchAgencyData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }: any) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold" color="text.primary">
              {value?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header with Business Selector */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Agency Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your client businesses and monitor performance
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/agency/businesses/new')}
        >
          Add Business
        </Button>
      </Box>

      {/* Business Selector */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Select Business
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a business to view detailed analytics and manage workflows
              </Typography>
            </Box>
            
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Business</InputLabel>
              <Select
                value={selectedBusinessId}
                label="Business"
                onChange={handleBusinessChange}
              >
                <MenuItem value="">
                  <em>All Businesses</em>
                </MenuItem>
                {businesses.map((business) => (
                  <MenuItem key={business.id} value={business.id}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                        <BusinessIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      {business.name}
                      <Chip 
                        label={business.industry} 
                        size="small" 
                        sx={{ ml: 1 }}
                        color="secondary"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Agency Overview Stats */}
      {!selectedBusinessId && agencyStats && (
        <>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Agency Overview
          </Typography>
          
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Businesses"
                value={agencyStats.total_businesses}
                subtitle={`${agencyStats.active_businesses} active`}
                icon={<BusinessIcon />}
                color="primary"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Workflows"
                value={agencyStats.total_workflows}
                subtitle="Across all businesses"
                icon={<WorkflowIcon />}
                color="secondary"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Executions (30d)"
                value={agencyStats.total_executions_30d}
                subtitle="All businesses combined"
                icon={<TrendingUpIcon />}
                color="success"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Credit Usage (30d)"
                value={agencyStats.credit_usage_30d}
                subtitle="All businesses combined"
                icon={<CreditIcon />}
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Businesses List */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Your Businesses
              </Typography>
              
              <Grid container spacing={2}>
                {businesses.map((business) => (
                  <Grid item xs={12} md={6} lg={4} key={business.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'translateY(-2px)',
                        }
                      }}
                      onClick={() => setSelectedBusinessId(business.id)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {business.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {business.industry}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Stack direction="row" spacing={1} mb={2}>
                          <Chip 
                            label={business.is_active ? 'Active' : 'Inactive'}
                            color={business.is_active ? 'success' : 'default'}
                            size="small"
                          />
                          <Chip 
                            label={`Created ${new Date(business.created_at).toLocaleDateString()}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                        
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBusinessId(business.id);
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* Selected Business Details */}
      {selectedBusinessId && selectedBusiness && businessStats && (
        <>
          <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {selectedBusiness.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedBusiness.industry} • Created {new Date(selectedBusiness.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Workflows"
                value={businessStats.workflow_instances}
                subtitle="Running instances"
                icon={<WorkflowIcon />}
                color="primary"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Executions (30d)"
                value={businessStats.executions_30d}
                subtitle={`${businessStats.success_rate}% success rate`}
                icon={<TrendingUpIcon />}
                color="success"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Credit Usage"
                value={businessStats.credit_usage}
                subtitle="Last 30 days"
                icon={<CreditIcon />}
                color="warning"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Last Activity"
                value={new Date(businessStats.last_activity).toLocaleDateString()}
                subtitle={new Date(businessStats.last_activity).toLocaleTimeString()}
                icon={<AnalyticsIcon />}
                color="info"
              />
            </Grid>
          </Grid>

          {/* Quick Actions for Selected Business */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Quick Actions for {selectedBusiness.name}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item>
                  <Button 
                    variant="contained"
                    startIcon={<WorkflowIcon />}
                    onClick={() => navigate(`/agency/workflows?business=${selectedBusinessId}`)}
                  >
                    Manage Workflows
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined"
                    startIcon={<AnalyticsIcon />}
                    onClick={() => navigate(`/agency/analytics?business=${selectedBusinessId}`)}
                  >
                    View Analytics
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate(`/agency/businesses/${selectedBusinessId}/team`)}
                  >
                    Manage Team
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => navigate(`/agency/businesses/${selectedBusinessId}/settings`)}
                  >
                    Business Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
