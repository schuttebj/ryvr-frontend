import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Api as OpenAIIcon,
  Search as DataForSEOIcon,
  CheckCircle as ActiveIcon,
  Settings as ConfigureIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import {
  getSystemIntegrationStatus,
  toggleSystemIntegration,
  configureOpenAISystemIntegration,
  SystemIntegrationStatus,
} from '../services/systemIntegrationApi';

interface SystemIntegration {
  id: number;
  name: string;
  provider: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status?: SystemIntegrationStatus;
}

// System integrations that can be configured by admin
const systemIntegrations: SystemIntegration[] = [
  {
    id: 3, // OpenAI integration ID from reset
    name: 'OpenAI',
    provider: 'openai',
    description: 'AI-powered content generation and analysis for all users',
    icon: <OpenAIIcon />,
    color: '#10a37f',
  },
  {
    id: 1, // DataForSEO integration ID from reset  
    name: 'DataForSEO',
    provider: 'dataforseo',
    description: 'SEO data and SERP analysis for all users',
    icon: <DataForSEOIcon />,
    color: '#1976d2',
  },
];

export default function SystemIntegrationsPage() {
  const [integrations, setIntegrations] = useState<SystemIntegration[]>(systemIntegrations);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState<number | null>(null);
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    loadSystemIntegrationStatuses();
  }, []);

  const loadSystemIntegrationStatuses = async () => {
    try {
      const updatedIntegrations = await Promise.all(
        systemIntegrations.map(async (integration) => {
          try {
            const status = await getSystemIntegrationStatus(integration.id);
            return { ...integration, status };
          } catch (error) {
            console.error(`Failed to load status for ${integration.name}:`, error);
            return integration;
          }
        })
      );
      setIntegrations(updatedIntegrations);
    } catch (error) {
      console.error('Failed to load system integration statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integration: SystemIntegration) => {
    if (integration.status?.is_system_integration) {
      // Disable system integration
      try {
        setConfiguring(integration.id);
        await toggleSystemIntegration(integration.id, {});
        await loadSystemIntegrationStatuses();
      } catch (error) {
        console.error(`Failed to disable ${integration.name}:`, error);
      } finally {
        setConfiguring(null);
      }
    } else {
      // Enable system integration
      if (integration.provider === 'openai') {
        setOpenAIDialog(true);
      } else {
        // For other integrations, just enable without configuration for now
        try {
          setConfiguring(integration.id);
          await toggleSystemIntegration(integration.id, {});
          await loadSystemIntegrationStatuses();
        } catch (error) {
          console.error(`Failed to enable ${integration.name}:`, error);
        } finally {
          setConfiguring(null);
        }
      }
    }
  };

  const handleConfigureOpenAI = async () => {
    if (!apiKey.trim()) return;

    try {
      setConfiguring(3); // OpenAI integration ID
      await configureOpenAISystemIntegration(3, apiKey);
      await loadSystemIntegrationStatuses();
      setOpenAIDialog(false);
      setApiKey('');
    } catch (error) {
      console.error('Failed to configure OpenAI:', error);
    } finally {
      setConfiguring(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="System Integrations" subtitle="Configure system-wide integrations">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="System Integrations" 
      subtitle="Configure integrations that are available to all users"
    >
      <Box>
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>System Integrations</strong> are configured once and used by all users platform-wide. 
            Users don't need to configure these integrations themselves.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {integrations.map((integration) => (
            <Grid item xs={12} md={6} key={integration.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: integration.status?.is_system_integration ? 2 : 1,
                  borderColor: integration.status?.is_system_integration 
                    ? 'success.main' 
                    : 'divider'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: integration.color, mr: 2 }}>
                      {integration.icon}
                    </Box>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {integration.name}
                    </Typography>
                    {integration.status?.is_system_integration ? (
                      <ActiveIcon color="success" />
                    ) : (
                      <ConfigureIcon color="action" />
                    )}
                  </Box>

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 3, minHeight: '40px' }}
                  >
                    {integration.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Status: {integration.status?.is_system_integration ? (
                        <strong style={{ color: 'green' }}>Active System-wide</strong>
                      ) : (
                        'Not Configured'
                      )}
                    </Typography>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={integration.status?.is_system_integration || false}
                          onChange={() => handleToggleIntegration(integration)}
                          disabled={configuring === integration.id}
                          color="primary"
                        />
                      }
                      label=""
                      sx={{ margin: 0 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* OpenAI Configuration Dialog */}
        <Dialog open={openAIDialog} onClose={() => setOpenAIDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Configure OpenAI System Integration</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your OpenAI API key to enable AI features for all users.
            </Typography>
            <TextField
              label="OpenAI API Key"
              type="password"
              fullWidth
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              helperText="This key will be used for all AI operations across the platform"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAIDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleConfigureOpenAI}
              disabled={!apiKey.trim() || configuring === 3}
              variant="contained"
            >
              {configuring === 3 ? 'Configuring...' : 'Configure'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
