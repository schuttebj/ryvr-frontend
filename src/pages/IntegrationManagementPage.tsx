import { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff,
  Cable as ConnectionIcon,
  Api as ApiIcon,
  Assessment as UsageIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface SystemIntegration {
  id: number;
  name: string;
  provider: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'deprecated';
  tier_restrictions: string[];
  icon_url?: string;
  documentation_url?: string;
}

interface UserIntegration {
  id: number;
  integration_id: number;
  integration_name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  level: 'system' | 'agency' | 'business';
  api_key_partial?: string;
  last_used?: string;
  usage_count_30d: number;
  error_message?: string;
  expires_at?: string;
}

interface IntegrationFormData {
  integration_id: number;
  api_key: string;
  endpoint_url?: string;
  additional_config?: Record<string, any>;
}

export default function IntegrationManagementPage() {
  const { user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [systemIntegrations, setSystemIntegrations] = useState<SystemIntegration[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<SystemIntegration | null>(null);
  const [formData, setFormData] = useState<IntegrationFormData>({
    integration_id: 0,
    api_key: '',
    endpoint_url: '',
    additional_config: {},
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // Mock data - replace with real API calls
  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock system integrations
      const mockSystemIntegrations: SystemIntegration[] = [
        {
          id: 1,
          name: 'OpenAI GPT',
          provider: 'OpenAI',
          description: 'AI-powered content generation and analysis',
          category: 'AI & Machine Learning',
          status: 'active',
          tier_restrictions: [],
          documentation_url: 'https://docs.openai.com'
        },
        {
          id: 2,
          name: 'DataForSEO',
          provider: 'DataForSEO',
          description: 'SEO data and SERP analysis',
          category: 'SEO & Analytics',
          status: 'active',
          tier_restrictions: [],
          documentation_url: 'https://docs.dataforseo.com'
        },
        {
          id: 3,
          name: 'Google Ads',
          provider: 'Google',
          description: 'Advertising campaign management',
          category: 'Advertising',
          status: 'active',
          tier_restrictions: ['starter'],
          documentation_url: 'https://developers.google.com/google-ads'
        },
        {
          id: 4,
          name: 'Facebook Ads',
          provider: 'Meta',
          description: 'Social media advertising platform',
          category: 'Advertising',
          status: 'active',
          tier_restrictions: ['starter'],
        },
        {
          id: 5,
          name: 'Google Analytics',
          provider: 'Google',
          description: 'Web analytics and reporting',
          category: 'Analytics',
          status: 'active',
          tier_restrictions: [],
        },
        {
          id: 6,
          name: 'WordPress',
          provider: 'WordPress',
          description: 'Content management and synchronization with WordPress sites',
          category: 'Content Management',
          status: 'active',
          tier_restrictions: [],
          documentation_url: 'https://docs.ryvr.com/integrations/wordpress'
        },
        {
          id: 7,
          name: 'Ahrefs',
          provider: 'Ahrefs',
          description: 'SEO toolset and backlink analysis',
          category: 'SEO & Analytics',
          status: 'active',
          tier_restrictions: ['starter', 'pro'],
        }
      ];
      
      // Mock user integrations
      const mockUserIntegrations: UserIntegration[] = [
        {
          id: 1,
          integration_id: 1,
          integration_name: 'OpenAI GPT',
          provider: 'OpenAI',
          status: 'connected',
          level: user?.role === 'admin' ? 'system' : user?.role?.includes('agency') ? 'agency' : 'business',
          api_key_partial: 'sk-...xyz123',
          last_used: '2024-03-15T14:30:00Z',
          usage_count_30d: 1250,
        },
        {
          id: 2,
          integration_id: 2,
          integration_name: 'DataForSEO',
          provider: 'DataForSEO',
          status: 'connected',
          level: 'system',
          api_key_partial: 'dfs-...abc789',
          last_used: '2024-03-15T12:15:00Z',
          usage_count_30d: 847,
        },
        {
          id: 3,
          integration_id: 3,
          integration_name: 'Google Ads',
          provider: 'Google',
          status: 'error',
          level: 'business',
          api_key_partial: 'gads-...def456',
          last_used: '2024-03-14T16:20:00Z',
          usage_count_30d: 23,
          error_message: 'API quota exceeded',
        }
      ];
      
      setSystemIntegrations(mockSystemIntegrations);
      setUserIntegrations(mockUserIntegrations);
      
    } catch (err: any) {
      console.error('Failed to fetch integrations:', err);
      setError(err.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleAddIntegration = (integration: SystemIntegration) => {
    setSelectedIntegration(integration);
    setFormData({ ...formData, integration_id: integration.id });
    setIsAddDialogOpen(true);
  };

  const handleSaveIntegration = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add mock integration to list
      const newIntegration: UserIntegration = {
        id: Date.now(),
        integration_id: formData.integration_id,
        integration_name: selectedIntegration?.name || '',
        provider: selectedIntegration?.provider || '',
        status: 'testing',
        level: user?.role === 'admin' ? 'system' : user?.role?.includes('agency') ? 'agency' : 'business',
        api_key_partial: formData.api_key.substring(0, 8) + '...' + formData.api_key.slice(-6),
        last_used: new Date().toISOString(),
        usage_count_30d: 0,
      };
      
      setUserIntegrations([...userIntegrations, newIntegration]);
      setIsAddDialogOpen(false);
      setFormData({ integration_id: 0, api_key: '', endpoint_url: '', additional_config: {} });
      setSelectedIntegration(null);
    } catch (error) {
      console.error('Failed to save integration:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': case 'active': return 'success';
      case 'error': case 'deprecated': return 'error';
      case 'testing': case 'inactive': return 'warning';
      case 'disconnected': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': case 'active': return <CheckIcon />;
      case 'error': case 'deprecated': return <ErrorIcon />;
      case 'testing': case 'inactive': return <WarningIcon />;
      default: return <ConnectionIcon />;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      system: 'error',
      agency: 'primary', 
      business: 'success'
    } as const;
    
    return (
      <Chip 
        label={level.toUpperCase()} 
        size="small" 
        color={colors[level as keyof typeof colors] || 'default'}
        sx={{ ml: 1 }}
      />
    );
  };

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
        <Button onClick={fetchIntegrations} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Integration Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect and manage your external service integrations
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchIntegrations}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setActiveTab(0)}
          >
            Add Integration
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <ApiIcon sx={{ mr: 1 }} />
                Available Integrations
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <ConnectionIcon sx={{ mr: 1 }} />
                My Integrations
                <Badge badgeContent={userIntegrations.length} color="primary" sx={{ ml: 1 }} />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <UsageIcon sx={{ mr: 1 }} />
                Usage Analytics
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {systemIntegrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} key={integration.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {integration.name.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {integration.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {integration.provider}
                      </Typography>
                    </Box>
                    <Chip 
                      label={integration.status} 
                      color={getStatusColor(integration.status)} 
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {integration.description}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} mb={2}>
                    <Chip label={integration.category} size="small" variant="outlined" />
                    {integration.tier_restrictions.length > 0 && (
                      <Tooltip title={`Restricted on: ${integration.tier_restrictions.join(', ')}`}>
                        <Chip label="Tier Restricted" size="small" color="warning" />
                      </Tooltip>
                    )}
                  </Stack>
                  
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => window.open(integration.documentation_url, '_blank')}
                      disabled={!integration.documentation_url}
                    >
                      Docs
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddIntegration(integration)}
                      disabled={userIntegrations.some(ui => ui.integration_id === integration.id)}
                    >
                      {userIntegrations.some(ui => ui.integration_id === integration.id) ? 'Added' : 'Connect'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {userIntegrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} key={integration.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: getStatusColor(integration.status) + '.main', mr: 2 }}>
                      {getStatusIcon(integration.status)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {integration.integration_name}
                        {getLevelBadge(integration.level)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {integration.provider}
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <SettingsIcon />
                    </IconButton>
                  </Box>
                  
                  {integration.api_key_partial && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        API Key:
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {integration.api_key_partial}
                      </Typography>
                    </Box>
                  )}
                  
                  <Stack spacing={1} mb={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Usage (30d):
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {integration.usage_count_30d.toLocaleString()} calls
                      </Typography>
                    </Box>
                    
                    {integration.last_used && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Last used:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {new Date(integration.last_used).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                  
                  {integration.error_message && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {integration.error_message}
                    </Alert>
                  )}
                  
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      color={integration.status === 'error' ? 'error' : 'primary'}
                    >
                      Test
                    </Button>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Usage Summary (30 days)
                </Typography>
                
                <Stack spacing={2}>
                  {userIntegrations.map((integration) => (
                    <Box key={integration.id} display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: getStatusColor(integration.status) + '.main', mr: 2, width: 32, height: 32 }}>
                          {integration.integration_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {integration.integration_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {integration.level} level
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {integration.usage_count_30d.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Integration Health
                </Typography>
                
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Connected:</Typography>
                    <Chip 
                      label={userIntegrations.filter(i => i.status === 'connected').length} 
                      color="success" 
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">With Errors:</Typography>
                    <Chip 
                      label={userIntegrations.filter(i => i.status === 'error').length} 
                      color="error" 
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Testing:</Typography>
                    <Chip 
                      label={userIntegrations.filter(i => i.status === 'testing').length} 
                      color="warning" 
                      size="small"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add Integration Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Connect {selectedIntegration?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              You're connecting this integration at the{' '}
              <strong>
                {user?.role === 'admin' ? 'system' : user?.role?.includes('agency') ? 'agency' : 'business'}
              </strong> level.
            </Alert>
            
            <TextField
              fullWidth
              label="API Key"
              type={showApiKey ? 'text' : 'password'}
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <VisibilityOff /> : <ViewIcon />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Endpoint URL (Optional)"
              value={formData.endpoint_url}
              onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
              placeholder="https://api.example.com/v1"
            />
            
            <FormControlLabel
              control={<Switch />}
              label="Test connection after saving"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveIntegration} 
            variant="contained"
            disabled={!formData.api_key}
          >
            Connect Integration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
