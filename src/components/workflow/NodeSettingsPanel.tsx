import { useState, useEffect } from 'react';
import { useOpenAIModels } from '../../hooks/useOpenAIModels';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Chip,
  Alert,
  FormControlLabel,
  FormHelperText,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
  ExpandMore as ExpandMoreIcon,
  DataArray as DataIcon,
  AutoAwesome as AutoAwesomeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { WorkflowNodeData, WorkflowNodeType } from '../../types/workflow';
import { Client } from '../../types/client';
import DataMappingSelector from './DataMappingSelector';
import VariableTextField from './VariableTextField';
import JsonSchemaBuilder from './JsonSchemaBuilder';

interface ClientForSelection {
  id: string;
  name: string;
  company?: string;
  hasProfile: boolean;
}
// AvailableDataDisplay removed - using variable selector instead

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

interface NodeSettingsPanelProps {
  node: {
    id: string;
    data: WorkflowNodeData;
  } | null;
  onClose: () => void;
  onSave: (nodeId: string, updatedData: WorkflowNodeData) => void;
  onDelete: (nodeId: string) => void;
}

export default function NodeSettingsPanel({ node, onClose, onSave, onDelete }: NodeSettingsPanelProps) {
  const theme = useTheme();
  const { getModelOptions, loading: modelsLoading } = useOpenAIModels();
  const [formData, setFormData] = useState<WorkflowNodeData>(
    node?.data || {
      id: '',
      type: WorkflowNodeType.TRIGGER,
      label: '',
      description: '',
      config: {},
      isValid: true,
    }
  );
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isJsonSchemaBuilderOpen, setIsJsonSchemaBuilderOpen] = useState(false);
  
  // Real data will be loaded from executed nodes - no more hardcoded samples

  // Shared MenuProps configuration for all select dropdowns
  const selectMenuProps = {
    PaperProps: {
      style: { 
        maxHeight: 300, 
        zIndex: 999999, // Extremely high z-index 
        position: 'absolute' as const // Use absolute positioning
      },
      sx: {
        zIndex: 999999, // Consistent z-index value
        backgroundColor: theme.palette.background.paper, // Theme-aware background
        '& .MuiMenuItem-root': {
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          },
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.selected
            }
          }
        }
      }
    },
    // Render dropdown using portal to escape z-index context
    disablePortal: true,
    // Position dropdown relative to trigger
    anchorOrigin: {
      vertical: 'bottom' as const,
      horizontal: 'left' as const,
    },
    transformOrigin: {
      vertical: 'top' as const,
      horizontal: 'left' as const,
    },
    // Menu list styling
    MenuListProps: {
      sx: {
        zIndex: 999999,
        maxHeight: '300px',
        '& .MuiMenuItem-root': {
          minHeight: 48,
          padding: '12px 16px',
          fontSize: '0.875rem'
        }
      }
    },
    // Additional container styling
    slotProps: {
      paper: {
        sx: {
          zIndex: 999999,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
            : '0 4px 16px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '8px',
          mt: 1
        }
      }
    }
  };

  // Load integrations on mount
  useEffect(() => {
    console.log('NodeSettingsPanel: Loading integrations...');
    loadIntegrations();
    console.log('NodeSettingsPanel: integrations state after load:', integrations);
  }, []);

  // Debug effect to track integrations state changes
  useEffect(() => {
    console.log('NodeSettingsPanel: integrations state changed:', integrations);
    console.log('NodeSettingsPanel: integrations length:', integrations.length);
    integrations.forEach((integration, index) => {
      console.log(`Integration ${index}:`, integration);
    });
  }, [integrations]);

  // Update form data when node changes
  useEffect(() => {
    if (node?.data) {
      setFormData(node.data);
    }
  }, [node]);

  const loadIntegrations = () => {
    try {
      console.log('loadIntegrations: Starting to load...');
      const saved = localStorage.getItem('integrations');
      console.log('loadIntegrations: localStorage data:', saved);
      
      if (saved) {
        const loadedIntegrations = JSON.parse(saved);
        console.log('Loaded integrations:', loadedIntegrations);
        setIntegrations(loadedIntegrations);
      } else {
        console.log('No integrations found in localStorage');
        // Create sample integrations for testing if none exist
        const sampleIntegrations: Integration[] = [
          {
            id: 'sample-openai',
            name: 'Sample OpenAI',
            type: 'openai' as const,
            status: 'connected' as const,
            config: { apiKey: 'sk-sample...' },
            lastTested: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'sample-dataforseo',
            name: 'Sample DataForSEO',
            type: 'dataforseo' as const,
            status: 'connected' as const,
            config: { login: 'sample', password: 'sample' },
            lastTested: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
        console.log('Creating sample integrations:', sampleIntegrations);
        setIntegrations(sampleIntegrations);
        localStorage.setItem('integrations', JSON.stringify(sampleIntegrations));
        console.log('Created sample integrations for testing');
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
      // Fallback: create sample integrations anyway
      const fallbackIntegrations: Integration[] = [
        {
          id: 'fallback-openai',
          name: 'Fallback OpenAI',
          type: 'openai' as const,
          status: 'connected' as const,
          config: { apiKey: 'sk-fallback...' },
          lastTested: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'fallback-dataforseo',
          name: 'Fallback DataForSEO',
          type: 'dataforseo' as const,
          status: 'connected' as const,
          config: { login: 'fallback', password: 'fallback' },
          lastTested: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      setIntegrations(fallbackIntegrations);
    }
  };

  const getIntegrationsByType = (type: 'openai' | 'dataforseo') => {
    const filtered = integrations.filter(i => i.type === type && i.status === 'connected');
    console.log(`getIntegrationsByType(${type}): found ${filtered.length} integrations:`, filtered);
    return filtered;
  };

  if (!node) return null;

  const handleSave = () => {
    onSave(node.id, formData);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${node.data.label}"?`)) {
      onDelete(node.id);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      let result;
      
      // Import the workflow API for testing
      const { workflowApi } = await import('../../services/workflowApi');
      
      // Get integration data and merge with node config
      const selectedIntegration = integrations.find(i => i.id === formData.config?.integrationId);
      const testConfig = selectedIntegration ? 
        { ...selectedIntegration.config, ...formData.config } : 
        formData.config;
      
      // Test the node with its current configuration
      result = await workflowApi.testNode(formData.type, testConfig);
      
      // Store successful test results automatically for use in other nodes
      if (result.success && result.data) {
        const standardResponse = {
          executionId: `test_${Date.now()}`,
          nodeId: node.id,
          nodeType: formData.type,
          status: 'success' as const,
          executedAt: new Date().toISOString(),
          executionTime: 1000, // Mock execution time for test
          data: {
            processed: result.data,
            raw: result.data, // For testing, use the same data for both
            summary: {
              nodeId: node.id,
              testExecutedAt: new Date().toISOString(),
              dataType: typeof result.data,
              success: true
            }
          },
          apiMetadata: {
            provider: 'Test',
            endpoint: 'test',
            requestId: `test_${Date.now()}`
          }
        };
        
        // Store in global workflow data
        await workflowApi.storeNodeResult(node.id, standardResponse);
        console.log(`✅ Test result automatically stored for node ${node.id}`);
      }
      
      setTestResult({
        success: result.success,
        data: result.data,
        nodeType: formData.type,
        message: result.success ? 
          'Node executed successfully! Result saved for use in other nodes.' : 
          result.error,
      });
      
    } catch (error: any) {
      console.error('Node test failed:', error);
      setTestResult({
        success: false,
        error: error.message || 'Test failed',
        nodeType: formData.type,
        message: `Test failed: ${error.message || 'Unknown error'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setFormData((prev: WorkflowNodeData) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  // Load available data nodes on component mount
  // Available nodes data is now loaded directly in VariableSelector when needed

  // Handle clearing workflow data for development
  const handleClearWorkflowData = async () => {
    try {
      const { clearWorkflowData } = await import('../../services/workflowApi');
      clearWorkflowData();
      console.log('Workflow data cleared');
    } catch (error) {
      console.error('Failed to clear workflow data:', error);
    }
  };

  // Test data is now automatically populated when nodes are tested

  const renderDataMappingSection = () => (
    <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DataIcon color="primary" />
          <Typography variant="subtitle2">Data Mapping</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Map data from previous nodes in your workflow
        </Typography>
        
        {/* Development tools - minimized */}
        <Box sx={{ mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Development Reset:
          </Typography>
          <Button 
            size="small" 
            variant="outlined" 
            color="warning"
            onClick={handleClearWorkflowData}
            sx={{ fontSize: '0.75rem' }}
          >
            Clear All Node Data
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.7rem' }}>
            Test nodes to automatically store results for use in variables.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const renderNodeSpecificSettings = () => {
    switch (formData.type) {
      case WorkflowNodeType.TRIGGER:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Trigger Settings
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trigger Type</InputLabel>
              <Select
                value={formData.config?.triggerType || 'manual'}
                label="Trigger Type"
                onChange={(e) => handleConfigChange('triggerType', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="manual">Manual Start</MenuItem>
                <MenuItem value="webhook">Webhook URL</MenuItem>
                <MenuItem value="schedule">Scheduled</MenuItem>
                <MenuItem value="api">API Trigger</MenuItem>
              </Select>
            </FormControl>
            
            {formData.config?.triggerType === 'webhook' && (
              <VariableTextField
                fullWidth
                label="Webhook URL"
                value={formData.config?.webhookUrl || ''}
                onChange={(value) => handleConfigChange('webhookUrl', value)}
                sx={{ mb: 2 }}
                helperText="URL that will trigger this workflow. Can use variables for dynamic URLs."
                availableData={{}}
              />
            )}
            
            {formData.config?.triggerType === 'schedule' && (
              <TextField
                fullWidth
                label="Cron Expression"
                value={formData.config?.cronExpression || ''}
                onChange={(e) => handleConfigChange('cronExpression', e.target.value)}
                sx={{ mb: 2 }}
                helperText="e.g., 0 9 * * 1 (Every Monday at 9 AM)"
              />
            )}
          </Box>
        );

      case WorkflowNodeType.SEO_SERP_ANALYZE:
        const dataforSeoIntegrations = getIntegrationsByType('dataforseo');
        
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              SERP Analysis Settings
            </Typography>
            
            {/* Integration Selection */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              DataForSEO Integration
            </Typography>
            
            {dataforSeoIntegrations.length > 0 ? (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Integration</InputLabel>
                <Select
                  value={formData.config?.integrationId || ''}
                  label="Select Integration"
                  onChange={(e) => handleConfigChange('integrationId', e.target.value)}
                  MenuProps={selectMenuProps}
                >
                  {dataforSeoIntegrations.map(integration => (
                    <MenuItem key={integration.id} value={integration.id}>
                      {integration.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No DataForSEO integrations found. 
                <Link href="/integrations" sx={{ ml: 1 }}>
                  <Button size="small" startIcon={<AddIcon />}>
                    Add Integration
                  </Button>
                </Link>
              </Alert>
            )}
            
            {/* Client Assignment */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Client Assignment
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Client Assignment</InputLabel>
              <Select
                value={formData.config?.clientAssignment || 'general'}
                label="Client Assignment"
                onChange={(e) => handleConfigChange('clientAssignment', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="general">General (No Client)</MenuItem>
                <MenuItem value="client_specific">Client Specific</MenuItem>
              </Select>
              <FormHelperText>
                Choose whether to run this analysis for general use or assign to a specific client
              </FormHelperText>
            </FormControl>

            {formData.config?.clientAssignment === 'client_specific' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Client</InputLabel>
                <Select
                  value={formData.config?.clientId || ''}
                  label="Select Client"
                  onChange={(e) => handleConfigChange('clientId', e.target.value)}
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="">-- Select a Client --</MenuItem>
                  {/* TODO: Load clients from API */}
                  <MenuItem value="client_1">Demo Client 1</MenuItem>
                  <MenuItem value="client_2">Demo Client 2</MenuItem>
                </Select>
                <FormHelperText>
                  Select which client this analysis is for (affects billing and reporting)
                </FormHelperText>
              </FormControl>
            )}
            
            {/* Search Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Search Configuration
            </Typography>
            
            <VariableTextField
              fullWidth
              label="Target Keyword"
              value={formData.config?.keyword || ''}
              onChange={(value) => handleConfigChange('keyword', value)}
              sx={{ mb: 2 }}
              helperText="Keyword to analyze SERP results for. Click the variable icon to use data from previous nodes."
              availableData={{}}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.config?.locationCode || 2840}
                label="Location"
                onChange={(e) => handleConfigChange('locationCode', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value={2840}>United States</MenuItem>
                <MenuItem value={2826}>United Kingdom</MenuItem>
                <MenuItem value={2124}>Canada</MenuItem>
                <MenuItem value={2036}>Australia</MenuItem>
                <MenuItem value={2276}>Germany</MenuItem>
                <MenuItem value={2250}>France</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={formData.config?.languageCode || 'en'}
                label="Language"
                onChange={(e) => handleConfigChange('languageCode', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="it">Italian</MenuItem>
                <MenuItem value="pt">Portuguese</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              type="number"
              label="Max Results (Depth)"
              value={formData.config?.maxResults || 10}
              onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: 700 }}
              helperText="Number of SERP results to analyze (1-700). Note: costs increase for depth > 100"
            />

            {/* Advanced Filters */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Advanced Filters
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Device Type</InputLabel>
              <Select
                value={formData.config?.device || 'desktop'}
                label="Device Type"
                onChange={(e) => {
                  const newDevice = e.target.value;
                  handleConfigChange('device', newDevice);
                  // Auto-select appropriate OS when device changes
                  const defaultOS = newDevice === 'mobile' ? 'android' : 'windows';
                  handleConfigChange('os', defaultOS);
                }}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="desktop">Desktop</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
              </Select>
              <FormHelperText>Choose the device type for SERP analysis</FormHelperText>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Operating System</InputLabel>
              <Select
                value={formData.config?.os || (formData.config?.device === 'mobile' ? 'android' : 'windows')}
                label="Operating System"
                onChange={(e) => handleConfigChange('os', e.target.value)}
                MenuProps={selectMenuProps}
              >
                {formData.config?.device === 'mobile' ? (
                  <>
                    <MenuItem value="android">Android</MenuItem>
                    <MenuItem value="ios">iOS</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem value="windows">Windows</MenuItem>
                    <MenuItem value="macos">macOS</MenuItem>
                  </>
                )}
              </Select>
              <FormHelperText>Operating system affects how results are displayed</FormHelperText>
            </FormControl>



            <VariableTextField
              fullWidth
              label="Target Domain Filter (Optional)"
              value={formData.config?.target || ''}
              onChange={(value) => handleConfigChange('target', value)}
              sx={{ mb: 2 }}
              helperText="Filter results by domain (e.g., 'example.com' or 'example.com*' for subdomains)"
              availableData={{}}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Result Type Filter</InputLabel>
              <Select
                value={formData.config?.resultType || 'all'}
                label="Result Type Filter"
                onChange={(e) => handleConfigChange('resultType', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="all">All Results</MenuItem>
                <MenuItem value="organic_only">Organic Only</MenuItem>
                <MenuItem value="news">News Articles</MenuItem>
                <MenuItem value="shopping">Shopping Results</MenuItem>
                <MenuItem value="images">Image Results</MenuItem>
                <MenuItem value="videos">Video Results</MenuItem>
              </Select>
              <FormHelperText>Filter results by content type</FormHelperText>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Date Range Filter</InputLabel>
              <Select
                value={formData.config?.dateRange || 'any'}
                label="Date Range Filter"
                onChange={(e) => handleConfigChange('dateRange', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="any">Any Time</MenuItem>
                <MenuItem value="past_hour">Past Hour</MenuItem>
                <MenuItem value="past_24h">Past 24 Hours</MenuItem>
                <MenuItem value="past_week">Past Week</MenuItem>
                <MenuItem value="past_month">Past Month</MenuItem>
                <MenuItem value="past_year">Past Year</MenuItem>
              </Select>
              <FormHelperText>Filter results by publication date</FormHelperText>
            </FormControl>
            
            <TextField
              fullWidth
              label="Output Variable Name"
              value={formData.config?.outputVariable || 'serp_results'}
              onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Name for this node's output (used in next nodes)"
            />
          </Box>
        );

      case WorkflowNodeType.AI_OPENAI_TASK:
        const openaiTaskIntegrations = getIntegrationsByType('openai');
        
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              OpenAI Task Settings
            </Typography>
            
            {/* Integration Selection */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              OpenAI Integration
            </Typography>
            
            {openaiTaskIntegrations.length > 0 ? (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Integration</InputLabel>
                <Select
                  value={formData.config?.integrationId || ''}
                  label="Select Integration"
                  onChange={(e) => handleConfigChange('integrationId', e.target.value)}
                  MenuProps={selectMenuProps}
                >
                  {openaiTaskIntegrations.map(integration => (
                    <MenuItem key={integration.id} value={integration.id}>
                      {integration.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No OpenAI integrations found. 
                <Link href="/integrations" sx={{ ml: 1 }}>
                  <Button size="small" startIcon={<AddIcon />}>
                    Add Integration
                  </Button>
                </Link>
              </Alert>
            )}
            
            {/* Task Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Task Configuration
            </Typography>
            
            <VariableTextField
              fullWidth
              multiline
              rows={3}
              label="System Prompt"
              value={formData.config?.systemPrompt || ''}
              onChange={(value) => handleConfigChange('systemPrompt', value)}
              sx={{ mb: 2 }}
              helperText="Define the AI's role and behavior. Click the variable icon to insert data from previous nodes."
              placeholder="You are a helpful AI assistant that..."
              availableData={{}}
            />
            
            <VariableTextField
              fullWidth
              multiline
              rows={4}
              label="User Prompt"
              value={formData.config?.userPrompt || ''}
              onChange={(value) => handleConfigChange('userPrompt', value)}
              sx={{ mb: 2 }}
              helperText="Main task description. Click the variable icon to insert data from previous nodes."
              placeholder="Analyze the following data: {{serp_results.results[0].items[*].url|list}}"
              availableData={{}}
            />
            
            {/* Advanced Settings */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Advanced Settings
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model Override</InputLabel>
              <Select
                value={formData.config?.modelOverride || ''}
                label="Model Override"
                onChange={(e) => handleConfigChange('modelOverride', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="">Use integration default</MenuItem>
                {getModelOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                    {option.description && (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({option.description})
                      </Typography>
                    )}
                  </MenuItem>
                ))}
                {getModelOptions().length === 0 && (
                  <MenuItem value="gpt-4o-mini">GPT-4o Mini (Fallback)</MenuItem>
                )}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              type="number"
              label="Temperature Override"
              value={formData.config?.temperatureOverride ?? ''}
              onChange={(e) => handleConfigChange('temperatureOverride', e.target.value ? parseFloat(e.target.value) : undefined)}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, max: 2, step: 0.1 }}
              helperText="Leave empty to use integration default (0=focused, 2=creative)"
            />
            
            <TextField
              fullWidth
              type="number"
              label="Max Completion Tokens"
              value={formData.config?.maxCompletionTokens || formData.config?.maxTokens || 32768}
              onChange={(e) => handleConfigChange('maxCompletionTokens', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: 32768 }}
              helperText="Maximum response length (1-32768 tokens)"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.jsonResponse || false}
                  onChange={(e) => handleConfigChange('jsonResponse', e.target.checked)}
                />
              }
              label="Request JSON Response"
              sx={{ mb: 1 }}
            />
            
            {formData.config?.jsonResponse && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <VariableTextField
                    fullWidth
                    multiline
                    rows={3}
                    label="JSON Schema"
                    value={formData.config?.jsonSchema || ''}
                    onChange={(value) => handleConfigChange('jsonSchema', value)}
                    helperText="Optional: Define expected JSON structure. Can use variables for dynamic schemas."
                    placeholder='{"result": "string", "confidence": "number"}'
                    availableData={{}}
                  />
                  <Tooltip title="Generate JSON Schema with AI">
                    <IconButton
                      onClick={() => setIsJsonSchemaBuilderOpen(true)}
                      sx={{ mt: 1 }}
                      color="primary"
                    >
                      <AutoAwesomeIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Output Variable Name"
              value={formData.config?.outputVariable || 'ai_result'}
              onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Name for this node's output (used in next nodes)"
            />
          </Box>
        );

      case WorkflowNodeType.CONTENT_EXTRACT:        
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Content Extraction Settings
            </Typography>
            
            {/* URL Sources */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              URL Sources
            </Typography>
            
            <VariableTextField
              fullWidth
              multiline
              rows={3}
              label="URL Source"
              value={formData.config?.urlSource || ''}
              onChange={(value) => handleConfigChange('urlSource', value)}
              sx={{ mb: 2 }}
              placeholder="{{seo_serp_analyze.data.processed.all_results[*].url|list}} or https://example.com, https://example2.com"
              helperText="URLs to extract content from. Can use variables from previous nodes, comma-separated URLs, or one URL per line."
              availableData={{}}
            />
            
            <TextField
              fullWidth
              type="number"
              label="Max URLs to Process"
              value={formData.config?.maxUrls || 10}
              onChange={(e) => handleConfigChange('maxUrls', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: 50 }}
              helperText="Maximum number of URLs to process (1-50)"
            />
            
            {/* Legacy Input Mapping (for backward compatibility) */}
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" color="text.secondary">
                  Legacy Input Mapping (Advanced)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <DataMappingSelector
                  value={formData.config?.inputMapping || ''}
                  onChange={(value) => handleConfigChange('inputMapping', value)}
                  placeholder="serp_results.results[0].items[*].url"
                  helperText="Legacy JSON path mapping - use URL Source field above instead"
                  label="Legacy Input Mapping"
                />
              </AccordionDetails>
            </Accordion>
            
            {/* Extraction Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Extraction Options
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Extraction Type</InputLabel>
              <Select
                value={formData.config?.extractionType || 'full_text'}
                label="Extraction Type"
                onChange={(e) => handleConfigChange('extractionType', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="full_text">Full Text Content</MenuItem>
                <MenuItem value="title_only">Title Only</MenuItem>
                <MenuItem value="meta_data">Meta Data</MenuItem>
                <MenuItem value="headings">Headings (H1-H6)</MenuItem>
                <MenuItem value="custom_selector">Custom CSS Selector</MenuItem>
              </Select>
            </FormControl>
            
            {formData.config?.extractionType === 'custom_selector' && (
              <VariableTextField
                fullWidth
                label="CSS Selector"
                value={formData.config?.cssSelector || ''}
                onChange={(value) => handleConfigChange('cssSelector', value)}
                sx={{ mb: 2 }}
                placeholder="article, .content, #main-text"
                helperText="CSS selector to target specific content. Click the variable icon to use dynamic selectors."
                availableData={{}}
              />
            )}
            
            <TextField
              fullWidth
              type="number"
              label="Max Content Length"
              value={formData.config?.maxLength || 5000}
              onChange={(e) => handleConfigChange('maxLength', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 100, max: 50000 }}
              helperText="Maximum characters per page (100-50000)"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.removeHtml || true}
                  onChange={(e) => handleConfigChange('removeHtml', e.target.checked)}
                />
              }
              label="Remove HTML tags"
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.batchProcess || true}
                  onChange={(e) => handleConfigChange('batchProcess', e.target.checked)}
                />
              }
              label="Process multiple URLs (batch mode)"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Output Variable Name"
              value={formData.config?.outputVariable || 'extracted_content'}
              onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Name for this node's output (used in next nodes)"
            />
          </Box>
        );

      case WorkflowNodeType.DATA_FILTER:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Data Filter Settings
            </Typography>
            
            {/* Input Data Source */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Input Data Source
            </Typography>
            
            <VariableTextField
              fullWidth
              label="Data Source"
              value={formData.config?.dataSource || ''}
              onChange={(value) => handleConfigChange('dataSource', value)}
              sx={{ mb: 2 }}
              helperText="JSON path to the data you want to filter (e.g., serp_results.results[0].items)"
              placeholder="serp_results.results[0].items"
              availableData={{}}
            />
            
            {/* Filter Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Filter Rules
            </Typography>
            
            <VariableTextField
              fullWidth
              label="Property to Filter"
              value={formData.config?.filterProperty || ''}
              onChange={(value) => handleConfigChange('filterProperty', value)}
              sx={{ mb: 2 }}
              helperText="Property path to filter on (e.g., domain, title, description)"
              placeholder="domain"
              availableData={{}}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Filter Operation</InputLabel>
              <Select
                value={formData.config?.filterOperation || 'contains'}
                label="Filter Operation"
                onChange={(e) => handleConfigChange('filterOperation', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="contains">Contains</MenuItem>
                <MenuItem value="not_contains">Does Not Contain</MenuItem>
                <MenuItem value="equals">Equals</MenuItem>
                <MenuItem value="not_equals">Does Not Equal</MenuItem>
                <MenuItem value="starts_with">Starts With</MenuItem>
                <MenuItem value="ends_with">Ends With</MenuItem>
                <MenuItem value="greater_than">Greater Than</MenuItem>
                <MenuItem value="less_than">Less Than</MenuItem>
                <MenuItem value="exists">Property Exists</MenuItem>
                <MenuItem value="not_exists">Property Does Not Exist</MenuItem>
              </Select>
              <FormHelperText>Choose how to compare the property value</FormHelperText>
            </FormControl>
            
            <VariableTextField
              fullWidth
              label="Filter Value"
              value={formData.config?.filterValue || ''}
              onChange={(value) => handleConfigChange('filterValue', value)}
              sx={{ mb: 2 }}
              helperText="Value to compare against (not needed for 'exists' operations)"
              availableData={{}}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.caseSensitive || false}
                  onChange={(e) => handleConfigChange('caseSensitive', e.target.checked)}
                />
              }
              label="Case Sensitive"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              type="number"
              label="Max Results"
              value={formData.config?.maxResults || 0}
              onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, max: 1000 }}
              helperText="Limit filtered results (0 = no limit)"
            />
            
            <TextField
              fullWidth
              label="Output Variable Name"
              value={formData.config?.outputVariable || 'filtered_data'}
              onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Name for this node's output (used in next nodes)"
            />
          </Box>
        );

      case WorkflowNodeType.EMAIL:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Email Settings
            </Typography>
            <VariableTextField
              fullWidth
              label="To Email"
              value={formData.config?.toEmail || ''}
              onChange={(value) => handleConfigChange('toEmail', value)}
              sx={{ mb: 2 }}
              type="email"
              helperText="Email address or use variables from previous nodes"
              availableData={{}}
            />
            
            <VariableTextField
              fullWidth
              label="Subject"
              value={formData.config?.subject || ''}
              onChange={(value) => handleConfigChange('subject', value)}
              sx={{ mb: 2 }}
              helperText="Email subject line. Click the variable icon to insert data from previous nodes."
              availableData={{}}
            />
            
            <VariableTextField
              fullWidth
              multiline
              rows={4}
              label="Email Body"
              value={formData.config?.body || ''}
              onChange={(value) => handleConfigChange('body', value)}
              placeholder="Email content. Use {{variable_name}} to insert data from previous nodes."
              helperText="Email content. Click the variable icon to insert data from previous nodes."
              availableData={{}}
            />
          </Box>
        );

      case WorkflowNodeType.CLIENT_PROFILE:
                  const loadAvailableClients = (): ClientForSelection[] => {
            try {
              const clients = JSON.parse(localStorage.getItem('ryvr_clients') || '[]');
              return clients.map((client: Client) => ({
                id: client.id,
                name: client.name,
                company: client.company,
                hasProfile: !!client.businessProfile
              }));
            } catch (error) {
              console.error('Failed to load clients:', error);
              return [];
            }
          };

        const availableClients = loadAvailableClients();

        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              👤 Client Profile Settings
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Client</InputLabel>
              <Select
                value={formData.config?.clientId || ''}
                label="Select Client"
                onChange={(e) => handleConfigChange('clientId', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="">-- Select a Client --</MenuItem>
                {availableClients.map((client: ClientForSelection) => (
                  <MenuItem key={client.id} value={client.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box>
                        <Typography variant="body2">{client.name}</Typography>
                        {client.company && (
                          <Typography variant="caption" color="text.secondary">{client.company}</Typography>
                        )}
                      </Box>
                      {client.hasProfile && (
                        <Chip size="small" label="AI Profile" color="success" variant="outlined" />
                      )}
                    </Box>
                  </MenuItem>
                ))}
                {availableClients.length === 0 && (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No clients found. Create clients in the Clients page first.
                    </Typography>
                  </MenuItem>
                )}
              </Select>
              <FormHelperText>
                Choose which client's data to load into the workflow. This includes questionnaire responses and AI-generated business profiles.
              </FormHelperText>
            </FormControl>

            {formData.config?.clientId && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.03)', 
                borderRadius: 1, 
                mb: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  📊 Available Data:
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  • Basic info: name, company, email, phone, industry
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  • Questionnaire responses (12 categories)
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  • AI business profile (if generated)
                </Typography>
                <Typography variant="caption" color="primary">
                  💡 Use variables like {`{{${formData.config.clientId}.client_meta.name}}`} or {`{{${formData.config.clientId}.business_profile.marketing_and_growth.quick_wins}}`}
                </Typography>
              </Box>
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              This node loads client data and makes it available as variables for subsequent nodes in your workflow.
            </Alert>
          </Box>
        );

      case WorkflowNodeType.REVIEW:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Review Step Configuration
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              This step will pause the workflow for manual review and approval. The flow will move to "In Review" status and require approval to continue.
            </Alert>
            
            <VariableTextField
              fullWidth
              label="Review Title"
              value={formData.config?.reviewTitle || 'Review Required'}
              onChange={(value) => handleConfigChange('reviewTitle', value)}
              sx={{ mb: 2 }}
              helperText="Title shown in the review interface"
              availableData={{}}
            />
            
            <VariableTextField
              fullWidth
              multiline
              rows={3}
              label="Review Description"
              value={formData.config?.reviewDescription || ''}
              onChange={(value) => handleConfigChange('reviewDescription', value)}
              sx={{ mb: 2 }}
              helperText="Instructions for the reviewer. Can use variables from previous steps."
              availableData={{}}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Required Reviewer</InputLabel>
              <Select
                value={formData.config?.requiredReviewer || 'agency'}
                label="Required Reviewer"
                onChange={(e) => handleConfigChange('requiredReviewer', e.target.value)}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="agency">Agency Team</MenuItem>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="admin">System Admin</MenuItem>
              </Select>
              <FormHelperText>
                Who needs to approve this review step
              </FormHelperText>
            </FormControl>
            
            <TextField
              fullWidth
              type="number"
              label="Auto-approve After (hours)"
              value={formData.config?.autoApproveAfter || ''}
              onChange={(e) => handleConfigChange('autoApproveAfter', e.target.value ? parseInt(e.target.value) : null)}
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: 168 }}
              helperText="Optional: Auto-approve if no response after specified hours (1-168)"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.blockingReview !== false}
                  onChange={(e) => handleConfigChange('blockingReview', e.target.checked)}
                />
              }
              label="Blocking Review"
              sx={{ mb: 2 }}
            />
            <FormHelperText sx={{ mt: -1, mb: 2 }}>
              If enabled, workflow cannot continue without approval. If disabled, workflow continues after timeout.
            </FormHelperText>
            
            <TextField
              fullWidth
              label="Output Variable Name"
              value={formData.config?.outputVariable || 'review_result'}
              onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Name for this step's output (approved: true/false, comments, reviewer)"
            />
          </Box>
        );

      default:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              Settings for {formData.type} will be available soon. This node type is supported in the workflow.
            </Alert>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h6">Node Settings</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Node Info */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={formData.type.replace(/_/g, ' ').toUpperCase()}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            Node ID: {node.id}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Basic Settings */}
        <VariableTextField
          fullWidth
          label="Node Label"
          value={formData.label}
          onChange={(value) => setFormData((prev: WorkflowNodeData) => ({ ...prev, label: value }))}
          sx={{ mb: 2 }}
          helperText="Node display name. Can use variables for dynamic labels."
          availableData={{}}
        />

        <VariableTextField
          fullWidth
          multiline
          rows={2}
          label="Description"
          value={formData.description || ''}
          onChange={(value) => setFormData((prev: WorkflowNodeData) => ({ ...prev, description: value }))}
          sx={{ mb: 2 }}
          helperText="Node description. Click the variable icon to insert data from previous nodes."
          availableData={{}}
        />

        {/* Node-specific settings */}
        {renderNodeSpecificSettings()}

        {/* Data Mapping */}
        {formData.type !== WorkflowNodeType.TRIGGER && renderDataMappingSection()}

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
            {testResult.success && testResult.data && (
              <Box sx={{ 
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.03)', 
                p: 2, 
                borderRadius: 1, 
                maxHeight: 200, 
                overflow: 'auto',
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="caption" color="text.secondary">
                  Response Data:
                </Typography>
                <pre style={{ fontSize: '12px', margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete Node
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<TestIcon />}
            onClick={handleTest}
            disabled={testing}
            color="success"
          >
            {testing ? 'Testing...' : 'Test Node'}
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            color="primary"
            fullWidth
          >
            Save Changes
          </Button>
        </Box>

        {/* Help Text */}
        <Alert severity="info" sx={{ mt: 2 }}>
          Configure this node's settings and click "Save Changes" to apply them to your workflow.
        </Alert>
      </Box>

      {/* JSON Schema Builder Dialog */}
      <JsonSchemaBuilder
        open={isJsonSchemaBuilderOpen}
        onClose={() => setIsJsonSchemaBuilderOpen(false)}
        onSelect={(schema) => handleConfigChange('jsonSchema', schema)}
        initialDescription=""
        initialSchema={formData.config?.jsonSchema || ''}
      />
    </Box>
  );
}