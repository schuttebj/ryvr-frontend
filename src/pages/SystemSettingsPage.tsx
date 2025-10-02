import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Star as DefaultIcon,
  StarBorder as NotDefaultIcon,
  Settings as SettingsIcon,
  Api as OpenAIIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import {
  refreshOpenAIModels,
  setDefaultModel,
  getAvailableModels,
  getDefaultModel,
  ModelRefreshResult,
} from '../services/systemIntegrationApi';

interface ModelData {
  id: string;
  name?: string;
  description?: string;
  is_default?: boolean;
  cost_per_1k_tokens?: number;
  max_tokens?: number;
}

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<ModelData[]>([]);
  const [defaultModel, setDefaultModelState] = useState<ModelData | null>(null);
  const [refreshDialog, setRefreshDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    loadModelData();
  }, []);

  const loadModelData = async () => {
    try {
      setLoading(true);
      
      // Load available models and default model
      const [availableModels, currentDefault] = await Promise.all([
        getAvailableModels(),
        getDefaultModel()
      ]);
      
      setModels(availableModels);
      setDefaultModelState(currentDefault);
      
    } catch (error) {
      console.error('Failed to load model data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshModels = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an OpenAI API key to refresh models');
      return;
    }

    try {
      setRefreshing(true);
      const result: ModelRefreshResult = await refreshOpenAIModels(apiKey);
      
      if (result.success) {
        await loadModelData(); // Reload models
        setLastRefresh(new Date().toLocaleString());
        setRefreshDialog(false);
        setApiKey('');
        alert(`Models refreshed successfully!\n${result.models_added} added, ${result.models_updated} updated`);
      } else {
        throw new Error(result.error || 'Failed to refresh models');
      }
    } catch (error) {
      console.error('Failed to refresh models:', error);
      alert(`Failed to refresh models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSetDefault = async (modelId: string) => {
    try {
      await setDefaultModel(modelId);
      await loadModelData(); // Reload to update UI
      alert(`Set ${modelId} as default model`);
    } catch (error) {
      console.error('Failed to set default model:', error);
      alert(`Failed to set default model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="System Settings" subtitle="Configure platform-wide settings">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="System Settings" 
      subtitle="Configure platform-wide settings and preferences"
    >
      <Grid container spacing={3}>
        
        {/* OpenAI Model Management */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<OpenAIIcon color="primary" />}
              title="OpenAI Model Management"
              subheader="Manage available AI models and set system defaults"
              action={
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => setRefreshDialog(true)}
                >
                  Refresh Models
                </Button>
              }
            />
            <CardContent>
              {models.length === 0 ? (
                <Alert severity="info">
                  No models found. Click "Refresh Models" to load available models from OpenAI.
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Current Default: <strong>{defaultModel?.name || defaultModel?.id || 'None'}</strong>
                    {lastRefresh && (
                      <span> • Last refreshed: {lastRefresh}</span>
                    )}
                  </Typography>
                  
                  <List>
                    {models.map((model) => (
                      <React.Fragment key={model.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <span>{model.name || model.id}</span>
                                {model.is_default && (
                                  <Chip 
                                    label="Default" 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                {model.description && (
                                  <Typography variant="body2" color="text.secondary">
                                    {model.description}
                                  </Typography>
                                )}
                                <Box display="flex" gap={2} mt={0.5}>
                                  {model.cost_per_1k_tokens && (
                                    <Typography variant="caption" color="text.secondary">
                                      Cost: ${model.cost_per_1k_tokens}/1K tokens
                                    </Typography>
                                  )}
                                  {model.max_tokens && (
                                    <Typography variant="caption" color="text.secondary">
                                      Max tokens: {model.max_tokens.toLocaleString()}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleSetDefault(model.id)}
                              disabled={model.is_default}
                              title={model.is_default ? 'Current default' : 'Set as default'}
                            >
                              {model.is_default ? <DefaultIcon color="primary" /> : <NotDefaultIcon />}
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Other System Settings - Placeholder for future features */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<SettingsIcon color="action" />}
              title="General Settings"
              subheader="Platform-wide configuration options"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Additional system settings will be available here in future updates.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<SettingsIcon color="action" />}
              title="Security Settings"
              subheader="Authentication and security configuration"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Security settings and access controls will be available here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Refresh Models Dialog */}
      <Dialog open={refreshDialog} onClose={() => setRefreshDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Refresh OpenAI Models</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Enter your OpenAI API key to fetch the latest available models. This will update the system with the most current model list.
          </Alert>
          
          <TextField
            label="OpenAI API Key"
            type="password"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            helperText="Your API key is used only for this refresh and is not stored"
            disabled={refreshing}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setRefreshDialog(false);
              setApiKey('');
            }}
            disabled={refreshing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRefreshModels}
            disabled={!apiKey.trim() || refreshing}
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Models'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
