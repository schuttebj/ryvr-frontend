import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  refreshOpenAIModels,
  setDefaultModel,
  getAvailableModels,
  ModelRefreshResult,
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
  const [editingIntegration, setEditingIntegration] = useState<SystemIntegration | null>(null);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  
  // OpenAI configuration form
  const [formData, setFormData] = useState({
    apiKey: '',
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7,
  });

  useEffect(() => {
    loadSystemIntegrationStatuses();
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const models = await getAvailableModels();
      setAvailableModels(models);
      
      // Set default model in form if available
      const defaultModel = models.find(m => m.is_default);
      if (defaultModel) {
        setFormData(prev => ({ ...prev, model: defaultModel.id }));
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
      // Use fallback models
      setAvailableModels([
        { id: 'gpt-4o', name: 'GPT-4o', is_default: false },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', is_default: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', is_default: false },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', is_default: false },
      ]);
    }
  };

  const handleRefreshModels = async () => {
    if (!formData.apiKey.trim()) {
      alert('Please enter an OpenAI API key to refresh models');
      return;
    }

    try {
      setRefreshingModels(true);
      const result: ModelRefreshResult = await refreshOpenAIModels(formData.apiKey);
      
      if (result.success) {
        // Reload available models
        await loadAvailableModels();
        alert(`Models refreshed successfully!\n${result.models_added} added, ${result.models_updated} updated`);
      } else {
        throw new Error(result.error || 'Failed to refresh models');
      }
    } catch (error) {
      console.error('Failed to refresh models:', error);
      alert(`Failed to refresh models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRefreshingModels(false);
    }
  };

  const handleSetDefaultModel = async (modelId: string) => {
    try {
      await setDefaultModel(modelId);
      await loadAvailableModels(); // Reload to update default status
      alert(`Set ${modelId} as default model`);
    } catch (error) {
      console.error('Failed to set default model:', error);
      alert(`Failed to set default model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
      openConfigurationDialog(integration);
    }
  };

  const openConfigurationDialog = (integration: SystemIntegration) => {
    setEditingIntegration(integration);
    
    if (integration.provider === 'openai') {
      // Reset form or load existing config
      setFormData({
        apiKey: '',
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.7,
      });
      setOpenAIDialog(true);
    } else {
      // For other integrations, enable without configuration for now
      handleDirectToggle(integration);
    }
  };

  const handleDirectToggle = async (integration: SystemIntegration) => {
    try {
      setConfiguring(integration.id);
      await toggleSystemIntegration(integration.id, {});
      await loadSystemIntegrationStatuses();
    } catch (error) {
      console.error(`Failed to toggle ${integration.name}:`, error);
    } finally {
      setConfiguring(null);
    }
  };

  const handleConfigureOpenAI = async () => {
    if (!formData.apiKey.trim() || !editingIntegration) return;

    try {
      setConfiguring(editingIntegration.id);
      await configureOpenAISystemIntegration(
        editingIntegration.id,
        formData.apiKey.trim(),
        formData.model,
        formData.maxTokens
      );
      await loadSystemIntegrationStatuses();
      setOpenAIDialog(false);
      setEditingIntegration(null);
      setFormData({
        apiKey: '',
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.7,
      });
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

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Status: {integration.status?.is_system_integration ? (
                        <strong style={{ color: 'green' }}>Active System-wide</strong>
                      ) : (
                        'Not Configured'
                      )}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {integration.status?.is_system_integration ? (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openConfigurationDialog(integration)}
                            disabled={configuring === integration.id}
                            sx={{ flex: 1 }}
                          >
                            Edit Configuration
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleToggleIntegration(integration)}
                            disabled={configuring === integration.id}
                          >
                            Disable
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleToggleIntegration(integration)}
                          disabled={configuring === integration.id}
                          sx={{ flex: 1 }}
                        >
                          {configuring === integration.id ? 'Configuring...' : 'Configure'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* OpenAI Configuration Dialog */}
        <Dialog 
          open={openAIDialog} 
          onClose={() => {
            setOpenAIDialog(false);
            setEditingIntegration(null);
          }} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            {editingIntegration?.status?.is_system_integration ? 'Edit' : 'Configure'} OpenAI System Integration
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {editingIntegration?.status?.is_system_integration 
                ? 'Update your OpenAI configuration parameters.'
                : 'Enter your OpenAI API key and configuration to enable AI features for all users.'
              }
            </Typography>
            
            <TextField
              label="OpenAI API Key"
              type="password"
              fullWidth
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-..."
              helperText="This key will be used for all AI operations across the platform"
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Model"
              select
              fullWidth
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              SelectProps={{ native: true }}
              helperText="AI model to use for text generation"
              sx={{ mb: 2 }}
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name || model.id} {model.is_default ? ' (Default)' : ''}
                </option>
              ))}
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRefreshModels}
                disabled={refreshingModels || !formData.apiKey.trim()}
                sx={{ flex: 1 }}
              >
                {refreshingModels ? 'Refreshing...' : 'Refresh Models'}
              </Button>
              {availableModels.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleSetDefaultModel(formData.model)}
                  sx={{ flex: 1 }}
                >
                  Set as Default
                </Button>
              )}
            </Box>
            
            <TextField
              label="Max Tokens"
              type="number"
              fullWidth
              value={formData.maxTokens}
              onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 2000 }))}
              inputProps={{ min: 100, max: 8000, step: 100 }}
              helperText="Maximum tokens per AI response"
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Temperature"
              type="number"
              fullWidth
              value={formData.temperature}
              onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
              inputProps={{ min: 0, max: 2, step: 0.1 }}
              helperText="Creativity level (0=focused, 2=creative)"
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenAIDialog(false);
                setEditingIntegration(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfigureOpenAI}
              disabled={!formData.apiKey.trim() || (editingIntegration !== null && configuring === editingIntegration.id)}
              variant="contained"
            >
              {(editingIntegration !== null && configuring === editingIntegration.id) 
                ? (editingIntegration.status?.is_system_integration ? 'Updating...' : 'Configuring...')
                : (editingIntegration?.status?.is_system_integration ? 'Update' : 'Configure')
              }
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
