import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Divider,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as TestIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
  Psychology as AiIcon,
  Search as SeoIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';

interface Integration {
  id: string;
  name: string;
  type: 'openai' | 'dataforseo' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastTested?: string;
  createdAt: string;
  updatedAt: string;
}

// Available integrations - these are the ones users can add
const availableIntegrations = [
  {
    type: 'openai' as const,
    name: 'OpenAI',
    description: 'AI-powered content generation and analysis',
    icon: <AiIcon />,
    color: '#10a37f',
    category: 'AI Tools',
  },
  {
    type: 'dataforseo' as const,
    name: 'DataForSEO',
    description: 'SEO data and SERP analysis APIs',
    icon: <SeoIcon />,
    color: '#1976d2',
    category: 'SEO Tools',
  },
  {
    type: 'custom' as const,
    name: 'Custom API',
    description: 'Connect to any REST API endpoint',
    icon: <ApiIcon />,
    color: '#9c27b0',
    category: 'Custom',
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [_selectedIntegrationType, setSelectedIntegrationType] = useState<'openai' | 'dataforseo' | 'custom' | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'openai' as 'openai' | 'dataforseo' | 'custom',
    // OpenAI fields
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
    // DataForSEO fields
    login: '',
    password: '',
    useSandbox: true,
    // Custom fields
    baseUrl: '',
    headers: '{}',
  });

  // Load integrations on mount
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    try {
      const saved = localStorage.getItem('integrations');
      if (saved) {
        setIntegrations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const saveIntegrations = (newIntegrations: Integration[]) => {
    try {
      localStorage.setItem('integrations', JSON.stringify(newIntegrations));
      setIntegrations(newIntegrations);
    } catch (error) {
      console.error('Failed to save integrations:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const openDialog = (integration?: Integration, integrationType?: 'openai' | 'dataforseo' | 'custom') => {
    if (integration) {
      setEditingIntegration(integration);
      setFormData({
        name: integration.name,
        type: integration.type,
        apiKey: integration.config.apiKey || '',
        model: integration.config.model || 'gpt-4o-mini',
        temperature: integration.config.temperature || 0.7,
        maxTokens: integration.config.maxTokens || 1000,
        login: integration.config.login || '',
        password: integration.config.password || '',
        useSandbox: integration.config.useSandbox !== false,
        baseUrl: integration.config.baseUrl || '',
        headers: JSON.stringify(integration.config.headers || {}, null, 2),
      });
    } else {
      setEditingIntegration(null);
      setSelectedIntegrationType(integrationType || null);
      setFormData({
        name: '',
        type: integrationType || 'openai',
        apiKey: '',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 1000,
        login: '',
        password: '',
        useSandbox: true,
        baseUrl: '',
        headers: '{}',
      });
    }
    setShowDialog(true);
    setTestResult(null);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingIntegration(null);
    setSelectedIntegrationType(null);
    setTestResult(null);
  };

  const handleSave = () => {
    try {
      const config: Record<string, any> = {};
      
      if (formData.type === 'openai') {
        config.apiKey = formData.apiKey;
        config.model = formData.model;
        config.temperature = formData.temperature;
        config.maxTokens = formData.maxTokens;
      } else if (formData.type === 'dataforseo') {
        config.login = formData.login;
        config.password = formData.password;
        config.useSandbox = formData.useSandbox;
      } else if (formData.type === 'custom') {
        config.baseUrl = formData.baseUrl;
        config.headers = JSON.parse(formData.headers);
      }

      const integration: Integration = {
        id: editingIntegration?.id || `integration_${Date.now()}`,
        name: formData.name,
        type: formData.type,
        status: 'disconnected',
        config,
        lastTested: editingIntegration?.lastTested,
        createdAt: editingIntegration?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newIntegrations = editingIntegration
        ? integrations.map(i => i.id === editingIntegration.id ? integration : i)
        : [...integrations, integration];

      saveIntegrations(newIntegrations);
      closeDialog();
    } catch (error: any) {
      console.error('Failed to save integration:', error);
      alert('Failed to save integration: ' + error.message);
    }
  };

  const handleDelete = (integrationId: string) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      const newIntegrations = integrations.filter(i => i.id !== integrationId);
      saveIntegrations(newIntegrations);
    }
  };

  const handleTest = async (integration: Integration) => {
    setTesting(true);
    setTestResult(null);

    try {
      let result;

      if (integration.type === 'openai') {
        // Test OpenAI integration
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${integration.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: integration.config.model,
            messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
            max_tokens: 50,
            temperature: 0.7,
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        result = {
          success: true,
          message: 'OpenAI integration test successful',
          response: data.choices[0]?.message?.content,
        };
      } else if (integration.type === 'dataforseo') {
        // Test DataForSEO integration
        const baseUrl = integration.config.useSandbox 
          ? 'https://sandbox.dataforseo.com' 
          : 'https://api.dataforseo.com';
        
        const auth = btoa(`${integration.config.login}:${integration.config.password}`);
        
        const response = await fetch(`${baseUrl}/v3/serp/google/organic/live/advanced`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            keyword: 'test',
            location_code: 2840,
            language_code: 'en',
            depth: 1
          }])
        });

        if (!response.ok) {
          throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        result = {
          success: true,
          message: 'DataForSEO integration test successful',
          response: data.tasks?.[0]?.result || 'Test completed',
        };
      } else {
        result = {
          success: true,
          message: 'Custom integration configured (manual testing required)',
          response: 'Configuration saved successfully',
        };
      }

      // Update integration status
      const newIntegrations = integrations.map(i => 
        i.id === integration.id 
          ? { ...i, status: 'connected' as const, lastTested: new Date().toISOString() }
          : i
      );
      saveIntegrations(newIntegrations);

      setTestResult(result);
    } catch (error: any) {
      console.error('Integration test failed:', error);
      
      // Update integration status to error
      const newIntegrations = integrations.map(i => 
        i.id === integration.id 
          ? { ...i, status: 'error' as const, lastTested: new Date().toISOString() }
          : i
      );
      saveIntegrations(newIntegrations);

      setTestResult({
        success: false,
        message: 'Integration test failed',
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'openai': return <AiIcon />;
      case 'dataforseo': return <SeoIcon />;
      default: return <ApiIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const filteredIntegrations = selectedTab === 0 
    ? integrations 
    : integrations.filter(i => {
        if (selectedTab === 1) return i.type === 'openai';
        if (selectedTab === 2) return i.type === 'dataforseo';
        if (selectedTab === 3) return i.type === 'custom';
        return true;
      });

  return (
    <AdminLayout 
      title="Integrations"
      subtitle="Add and manage your API integrations for workflows"
    >
      <Box>

      {/* Available Integrations */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Available Integrations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Click on any integration block to configure and add it to your workspace
        </Typography>
        
        <Grid container spacing={2}>
          {availableIntegrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} key={integration.type}>
              <Paper
                elevation={2}
                onClick={() => openDialog(undefined, integration.type)}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: integration.color,
                    backgroundColor: `${integration.color}10`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 20px ${integration.color}20`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: integration.color, mr: 2 }}>
                    {integration.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {integration.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {integration.description}
                </Typography>
                <Chip
                  label={integration.category}
                  size="small"
                  sx={{
                    bgcolor: `${integration.color}20`,
                    color: integration.color,
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Configured Integrations */}
      {integrations.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Your Integrations
          </Typography>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="All Integrations" />
              <Tab label="OpenAI" />
              <Tab label="DataForSEO" />
              <Tab label="Custom" />
            </Tabs>
          </Box>

          {/* Integration Cards */}
          <Grid container spacing={3}>
            {filteredIntegrations.map((integration) => (
              <Grid item xs={12} md={6} lg={4} key={integration.id}>
                <Card sx={{ position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DragIcon sx={{ color: 'text.secondary', mr: 1 }} />
                      {getIntegrationIcon(integration.type)}
                      <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
                        {integration.name}
                      </Typography>
                      <Chip
                        label={integration.status}
                        color={getStatusColor(integration.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)} Integration
                    </Typography>
                    
                    {integration.lastTested && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Last tested: {new Date(integration.lastTested).toLocaleString()}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<TestIcon />}
                        onClick={() => handleTest(integration)}
                        disabled={testing}
                        variant="outlined"
                      >
                        Test
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openDialog(integration)}
                        variant="outlined"
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(integration.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {integrations.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 2 }}>
          <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No integrations configured yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by clicking on one of the available integrations above
          </Typography>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Integration Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="e.g., My OpenAI Account, Production DataForSEO"
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Integration Type</InputLabel>
              <Select
                value={formData.type}
                label="Integration Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="dataforseo">DataForSEO</MenuItem>
                <MenuItem value="custom">Custom API</MenuItem>
              </Select>
            </FormControl>

            {/* OpenAI Configuration */}
            {formData.type === 'openai' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
                  OpenAI Configuration
                </Typography>
                
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="Get your API key from platform.openai.com"
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Default Model</InputLabel>
                  <Select
                    value={formData.model}
                    label="Default Model"
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  >
                    <MenuItem value="gpt-4o-mini">GPT-4o Mini (Recommended)</MenuItem>
                    <MenuItem value="gpt-4o">GPT-4o</MenuItem>
                    <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                    <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="number"
                  label="Default Temperature"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  helperText="0 = focused, 2 = creative"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Default Max Tokens"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                  sx={{ mb: 2 }}
                  helperText="Maximum response length"
                />
              </Box>
            )}

            {/* DataForSEO Configuration */}
            {formData.type === 'dataforseo' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
                  DataForSEO Configuration
                </Typography>
                
                <TextField
                  fullWidth
                  label="Login"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="Your DataForSEO account login"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="Your DataForSEO account password"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.useSandbox}
                      onChange={(e) => setFormData({ ...formData, useSandbox: e.target.checked })}
                    />
                  }
                  label="Use Sandbox Mode (recommended for testing)"
                  sx={{ mb: 2 }}
                />
              </Box>
            )}

            {/* Custom API Configuration */}
            {formData.type === 'custom' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
                  Custom API Configuration
                </Typography>
                
                <TextField
                  fullWidth
                  label="Base URL"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="https://api.example.com"
                  helperText="The base URL for your API"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Headers (JSON)"
                  value={formData.headers}
                  onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="Additional headers in JSON format"
                />
              </Box>
            )}

            {/* Test Results */}
            {testResult && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Test Results
                </Typography>
                <Alert 
                  severity={testResult.success ? 'success' : 'error'}
                  sx={{ mb: 1 }}
                >
                  {testResult.message}
                </Alert>
                {testResult.error && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Error: {testResult.error}
                  </Typography>
                )}
                {testResult.response && (
                  <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Response:
                    </Typography>
                    <pre style={{ fontSize: '12px', margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                      {typeof testResult.response === 'string' 
                        ? testResult.response 
                        : JSON.stringify(testResult.response, null, 2)}
                    </pre>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          {!editingIntegration && (
            <Button
              onClick={() => handleTest({
                id: 'test',
                name: formData.name,
                type: formData.type,
                status: 'disconnected',
                config: formData.type === 'openai' ? {
                  apiKey: formData.apiKey,
                  model: formData.model,
                  temperature: formData.temperature,
                  maxTokens: formData.maxTokens,
                } : formData.type === 'dataforseo' ? {
                  login: formData.login,
                  password: formData.password,
                  useSandbox: formData.useSandbox,
                } : {
                  baseUrl: formData.baseUrl,
                  headers: JSON.parse(formData.headers || '{}'),
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })}
              disabled={testing || !formData.name}
              variant="outlined"
            >
              {testing ? 'Testing...' : 'Test'}
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || (formData.type === 'openai' && !formData.apiKey) || 
                     (formData.type === 'dataforseo' && (!formData.login || !formData.password))}
          >
            {editingIntegration ? 'Save Changes' : 'Add Integration'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </AdminLayout>
  );
} 