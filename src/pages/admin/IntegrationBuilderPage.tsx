// Integration Builder - Wizard Flow with Admin Layout
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Stack,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  PlayArrow as TestIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { integrationBuilderApi, type IntegrationOperation, type OperationParameter } from '../../services/integrationBuilderApi';

const WIZARD_STEPS = ['Parse Documentation', 'Platform & Auth', 'Review Operations', 'Save'];

// Generate a unique ID for operations
const generateOperationId = () => {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function IntegrationBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const theme = useTheme();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingIntegration, setLoadingIntegration] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // AI Parser
  const [aiDocumentation, setAiDocumentation] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [parsedConfig, setParsedConfig] = useState<any>(null);

  // Platform Configuration
  const [platformName, setPlatformName] = useState('');
  const [provider, setProvider] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [hasSandbox, setHasSandbox] = useState(false);
  const [sandboxBaseUrl, setSandboxBaseUrl] = useState('');
  const [authType, setAuthType] = useState<'basic' | 'bearer' | 'api_key' | 'oauth2' | 'none'>('bearer');
  const [authLocation, setAuthLocation] = useState<'header' | 'query'>('header'); // For api_key: header or query param
  const [apiKeyHeaderName, setApiKeyHeaderName] = useState('api-key');
  const [apiKeyQueryParamName, setApiKeyQueryParamName] = useState('');
  const [color, setColor] = useState('#5f5eff');
  const [iconUrl, setIconUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [isSystemWide, setIsSystemWide] = useState(false);
  const [requiresUserConfig, setRequiresUserConfig] = useState(true);

  // Authentication Configuration
  const [authCredentials, setAuthCredentials] = useState<Array<{
    name: string;
    type: string;
    required: boolean;
    fixed: boolean;
    description: string;
  }>>([]);

  // OAuth Configuration (for future use if needed)
  const oauthScopes = '';

  // Operations
  const [operations, setOperations] = useState<IntegrationOperation[]>([]);
  const [editingOperation, setEditingOperation] = useState<IntegrationOperation | null>(null);
  const [operationDialogOpen, setOperationDialogOpen] = useState(false);

  // AI Parser for adding operations
  const [addOperationsDialogOpen, setAddOperationsDialogOpen] = useState(false);
  const [addOperationsDoc, setAddOperationsDoc] = useState('');
  const [addOperationsInstructions, setAddOperationsInstructions] = useState('');
  const [parsingOperations, setParsingOperations] = useState(false);

  // Test Operation
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testingOperation, setTestingOperation] = useState<IntegrationOperation | null>(null);
  const [testParameters, setTestParameters] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  // Parameter Configuration
  const [paramConfigDialogOpen, setParamConfigDialogOpen] = useState(false);
  const [configuringOperation, setConfiguringOperation] = useState<IntegrationOperation | null>(null);
  const [parameterDefaults, setParameterDefaults] = useState<Record<string, any>>({});

  // Parameter Editor
  const [parameterEditorOpen, setParameterEditorOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<{
    param: OperationParameter;
    index: number;
  } | null>(null);

  // Load parsed config into form
  useEffect(() => {
    if (parsedConfig) {
      setPlatformName(parsedConfig.platform.name || '');
      setProvider(parsedConfig.platform.name?.toLowerCase().replace(/\s+/g, '_') || '');
      setBaseUrl(parsedConfig.platform.base_url || '');
      setHasSandbox(parsedConfig.platform.has_sandbox || false);
      setSandboxBaseUrl(parsedConfig.platform.sandbox_base_url || '');
      setAuthType(parsedConfig.platform.auth_type || 'bearer');
      setColor(parsedConfig.platform.color || '#5f5eff');
      setDocumentationUrl(parsedConfig.platform.documentation_url || '');
      
      setAuthCredentials(parsedConfig.auth_config.credentials || []);
      
      // Determine auth location from parsed config
      if (parsedConfig.auth_config.query_param_name) {
        setAuthLocation('query');
        setApiKeyQueryParamName(parsedConfig.auth_config.query_param_name);
        setApiKeyHeaderName('');
      } else if (parsedConfig.auth_config.header_name) {
        setAuthLocation('header');
        setApiKeyHeaderName(parsedConfig.auth_config.header_name);
        setApiKeyQueryParamName('');
      }
      
      // Assign unique IDs to operations to prevent duplicates
      const operationsWithUniqueIds = (parsedConfig.operations || []).map((op: any) => ({
        ...op,
        id: generateOperationId()
      }));
      setOperations(operationsWithUniqueIds);
    }
  }, [parsedConfig]);

  // Load existing integration in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadExistingIntegration(parseInt(id));
    }
  }, [isEditMode, id]);

  const loadExistingIntegration = async (integrationId: number) => {
    try {
      setLoadingIntegration(true);
      setError(null);

      const integration = await integrationBuilderApi.getIntegration(integrationId);
      
      // Populate form with existing data
      if (integration.platform_config) {
        setPlatformName(integration.platform_config.name || '');
        setProvider(integration.provider || '');
        setBaseUrl(integration.platform_config.base_url || '');
        setHasSandbox(integration.platform_config.has_sandbox || false);
        setSandboxBaseUrl(integration.platform_config.sandbox_base_url || '');
        setAuthType(integration.platform_config.auth_type || 'bearer');
        setColor(integration.platform_config.color || '#5f5eff');
        setIconUrl(integration.platform_config.icon_url || '');
        setDocumentationUrl(integration.platform_config.documentation_url || '');
      }
      
      setIsSystemWide(integration.is_system_wide || false);
      setRequiresUserConfig(integration.requires_user_config !== false);
      
      if (integration.auth_config) {
        setAuthCredentials(integration.auth_config.credentials || []);
        
        // Determine auth location based on which field is populated
        if (integration.auth_config.query_param_name) {
          setAuthLocation('query');
          setApiKeyQueryParamName(integration.auth_config.query_param_name);
          setApiKeyHeaderName(''); // Clear header name
        } else if (integration.auth_config.header_name) {
          setAuthLocation('header');
          setApiKeyHeaderName(integration.auth_config.header_name);
          setApiKeyQueryParamName(''); // Clear query param name
        }
      }
      
      if (integration.operation_configs && integration.operation_configs.operations) {
        setOperations(integration.operation_configs.operations);
      }
      
      // Skip step 1 in edit mode
      setActiveStep(1);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load integration');
    } finally {
      setLoadingIntegration(false);
    }
  };

  const handleParseDocumentation = async () => {
    try {
      setAiParsing(true);
      setError(null);

      const result = await integrationBuilderApi.parseDocumentation({
        platform_name: platformName || 'API Platform',
        documentation: aiDocumentation,
        instructions: aiInstructions,
      });

      if (result.success) {
        setParsedConfig(result.config);
        setSuccess('Documentation parsed successfully!');
        // Auto-advance to next step
        setTimeout(() => {
          setActiveStep(1);
          setSuccess(null);
        }, 1500);
      } else {
        setError(result.error || 'Failed to parse documentation');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to parse documentation');
    } finally {
      setAiParsing(false);
    }
  };

  const handleSaveIntegration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate
      if (!platformName || !provider || !baseUrl) {
        setError('Platform name, provider, and base URL are required');
        return;
      }

      if (operations.length === 0) {
        setError('At least one operation is required');
        return;
      }

      const integrationData = {
        name: platformName,
        provider: provider.toLowerCase().replace(/\s+/g, '_'),
        integration_type: 'business' as const,
        level: 'business' as const,
        is_system_wide: isSystemWide,
        requires_user_config: requiresUserConfig,
        platform_config: {
          name: platformName,
          base_url: baseUrl,
          has_sandbox: hasSandbox,
          sandbox_base_url: sandboxBaseUrl,
          auth_type: authType,
          color,
          icon_url: iconUrl,
          documentation_url: documentationUrl,
        },
        auth_config: {
          type: authType,
          credentials: authCredentials,
          // Always provide both fields (required by backend schema)
          header_name: authType === 'api_key' && authLocation === 'header' ? apiKeyHeaderName : '',
          query_param_name: authType === 'api_key' && authLocation === 'query' ? apiKeyQueryParamName : '',
        },
        oauth_config: authType === 'oauth2' ? {
          provider: platformName.toLowerCase(),
          auth_url: '',
          token_url: '',
          scopes: oauthScopes.split(',').map(s => s.trim()).filter(Boolean),
        } : undefined,
        operations,
      };

      if (isEditMode && id) {
        // Update existing integration
        await integrationBuilderApi.updateIntegration(parseInt(id), integrationData);
        setSuccess(`Integration "${platformName}" updated successfully!`);
      } else {
        // Create new integration
        await integrationBuilderApi.createIntegration(integrationData);
        setSuccess(`Integration "${platformName}" created successfully!`);
      }
      
      // Navigate to integrations page
      setTimeout(() => {
        navigate('/admin/integrations');
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || `Failed to ${isEditMode ? 'update' : 'save'} integration`);
    } finally {
      setLoading(false);
    }
  };

  const handleParseAdditionalOperations = async () => {
    try {
      setParsingOperations(true);
      setError(null);

      const result = await integrationBuilderApi.parseDocumentation({
        platform_name: platformName || 'API Platform',
        documentation: addOperationsDoc,
        instructions: `${addOperationsInstructions}\n\nExtract only the operations from this documentation.`,
      });

      if (result.success && result.config.operations) {
        // Assign unique IDs to all new operations
        const newOpsWithUniqueIds = result.config.operations.map((op: IntegrationOperation) => ({
          ...op,
          id: generateOperationId()
        }));
        
        setOperations([...operations, ...newOpsWithUniqueIds]);
        setSuccess(`Added ${newOpsWithUniqueIds.length} new operations!`);
        setAddOperationsDialogOpen(false);
        setAddOperationsDoc('');
        setAddOperationsInstructions('');
      } else {
        setError(result.error || 'Failed to parse operations');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to parse operations');
    } finally {
      setParsingOperations(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !parsedConfig) {
      setError('Please parse documentation first');
      return;
    }
    if (activeStep === 1 && (!platformName || !baseUrl)) {
      setError('Platform name and base URL are required');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddOperation = () => {
    setEditingOperation({
      id: generateOperationId(), // Generate unique ID immediately
      name: '',
      description: '',
      endpoint: '',
      method: 'POST',
      category: 'General',
      base_credits: 1,
      is_async: false,
      parameters: [],
      headers: [],
    });
    setOperationDialogOpen(true);
  };

  const handleEditOperation = (operation: IntegrationOperation) => {
    setEditingOperation(operation);
    setOperationDialogOpen(true);
  };

  const handleSaveParameterDefaults = () => {
    // This function updates default values for all parameters in the operation
    if (!configuringOperation) return;
    
    const updatedOperation = {
      ...configuringOperation,
      parameters: configuringOperation.parameters.map(param => ({
        ...param,
        default: parameterDefaults[param.name] !== undefined ? parameterDefaults[param.name] : param.default
      }))
    };
    
    const updatedOperations = operations.map(op => 
      op.id === configuringOperation.id ? updatedOperation : op
    );
    setOperations(updatedOperations);
    setParamConfigDialogOpen(false);
    setConfiguringOperation(null);
  };

  // Parameter Editor Handlers
  const handleAddParameter = () => {
    const newParam: OperationParameter = {
      name: '',
      type: 'string',
      required: false,
      fixed: false,
      default: '',
      description: '',
      location: 'body',
      options: []
    };
    setEditingParameter({ param: newParam, index: -1 });
    setParameterEditorOpen(true);
  };

  const handleEditParameter = (param: OperationParameter, index: number) => {
    setEditingParameter({ param: { ...param }, index });
    setParameterEditorOpen(true);
  };

  const handleSaveParameter = () => {
    if (!editingParameter || !editingOperation) return;
    
    const newParams = [...editingOperation.parameters];
    if (editingParameter.index === -1) {
      // Add new parameter
      newParams.push(editingParameter.param);
    } else {
      // Update existing parameter
      newParams[editingParameter.index] = editingParameter.param;
    }
    
    setEditingOperation({ ...editingOperation, parameters: newParams });
    setParameterEditorOpen(false);
    setEditingParameter(null);
  };

  const handleDeleteParameter = (index: number) => {
    if (!editingOperation) return;
    if (window.confirm('Are you sure you want to delete this parameter?')) {
      const newParams = editingOperation.parameters.filter((_, i) => i !== index);
      setEditingOperation({ ...editingOperation, parameters: newParams });
    }
  };

  const handleSaveOperation = () => {
    if (!editingOperation) return;

    const existingIndex = operations.findIndex(op => op.id === editingOperation.id);
    if (existingIndex >= 0) {
      // Update existing operation
      const updated = [...operations];
      updated[existingIndex] = editingOperation;
      setOperations(updated);
    } else {
      // Add new operation (ID already generated in handleAddOperation)
      setOperations([...operations, editingOperation]);
    }
    setOperationDialogOpen(false);
    setEditingOperation(null);
  };

  const handleDeleteOperation = (operationId: string) => {
    setOperations(operations.filter(op => op.id !== operationId));
  };

  const handleConfigureParameters = (operation: IntegrationOperation) => {
    setConfiguringOperation(operation);
    // Initialize with existing defaults
    const defaults: Record<string, any> = {};
    operation.parameters.forEach(param => {
      defaults[param.name] = param.default || '';
    });
    setParameterDefaults(defaults);
    setParamConfigDialogOpen(true);
  };

  const handleTestOperation = (operation: IntegrationOperation) => {
    setTestingOperation(operation);
    // Initialize test parameters with default values (only if they have defaults)
    const initialParams: Record<string, any> = {};
    operation.parameters.forEach(param => {
      if (!param.fixed && param.default !== undefined && param.default !== null && param.default !== '') {
        initialParams[param.name] = param.default;
      }
    });
    setTestParameters(initialParams);
    setTestResult(null);
    setTestDialogOpen(true);
  };

  const handleRunTest = async () => {
    if (!testingOperation || !id) return;

    try {
      setTesting(true);
      setTestResult(null);

      // Separate credentials from operation parameters
      const credentialNames = authCredentials.map(c => c.name);
      const credentials: Record<string, any> = {};
      const operationParams: Record<string, any> = {};
      
      Object.entries(testParameters).forEach(([key, value]) => {
        // Skip empty values for optional parameters
        if (value === '' || value === null || value === undefined) {
          const param = testingOperation.parameters.find(p => p.name === key);
          if (param && !param.required) {
            return; // Skip this parameter
          }
        }
        
        if (credentialNames.includes(key)) {
          credentials[key] = value;
        } else {
          operationParams[key] = value;
        }
      });

      const result = await integrationBuilderApi.testOperation(
        parseInt(id),
        testingOperation.id,
        operationParams,
        undefined,
        credentials
      );

      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.response?.data?.detail || err.message || 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                AI Documentation Parser
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Paste your API documentation below and let AI extract the integration configuration
              </Typography>

              <TextField
                fullWidth
                label="Platform Name (Optional)"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                sx={{ mb: 2 }}
                helperText="e.g., Brevo, SendGrid, Stripe"
              />

              <TextField
                fullWidth
                multiline
                rows={12}
                label="API Documentation"
                value={aiDocumentation}
                onChange={(e) => setAiDocumentation(e.target.value)}
                placeholder="Paste API documentation here..."
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Instructions (Optional)"
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                placeholder="e.g., Focus on email sending endpoints, Extract only GET operations"
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                onClick={handleParseDocumentation}
                disabled={!aiDocumentation || aiParsing}
                startIcon={aiParsing ? <CircularProgress size={20} /> : <AIIcon />}
                fullWidth
                size="large"
              >
                {aiParsing ? 'Parsing Documentation...' : 'Parse with AI'}
              </Button>

              {parsedConfig && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    ✓ Successfully extracted {parsedConfig.operations?.length || 0} operations
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Platform & Authentication</Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Platform Name"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Provider Identifier"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    required
                    helperText="Lowercase with underscores, e.g., brevo_api"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Base URL"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    required
                    placeholder="https://api.example.com"
                  />
                </Grid>
                
                {/* Sandbox Mode Toggle */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={hasSandbox}
                        onChange={(e) => setHasSandbox(e.target.checked)}
                      />
                    }
                    label="Has Sandbox/Test Environment"
                  />
                </Grid>
                
                {/* Sandbox Base URL (only shown if sandbox is enabled) */}
                {hasSandbox && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Sandbox Base URL"
                      value={sandboxBaseUrl}
                      onChange={(e) => setSandboxBaseUrl(e.target.value)}
                      placeholder="https://api.sandbox.example.com"
                      helperText="Separate URL for testing/sandbox environment"
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Authentication Type</InputLabel>
                    <Select
                      value={authType}
                      label="Authentication Type"
                      onChange={(e) => setAuthType(e.target.value as any)}
                    >
                      <MenuItem value="bearer">Bearer Token</MenuItem>
                      <MenuItem value="api_key">API Key</MenuItem>
                      <MenuItem value="basic">Basic Auth</MenuItem>
                      <MenuItem value="oauth2">OAuth 2.0</MenuItem>
                      <MenuItem value="none">No Authentication</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* API Key Location (only shown for api_key auth) */}
                {authType === 'api_key' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>API Key Location</InputLabel>
                      <Select
                        value={authLocation}
                        label="API Key Location"
                        onChange={(e) => setAuthLocation(e.target.value as 'header' | 'query')}
                      >
                        <MenuItem value="header">Header</MenuItem>
                        <MenuItem value="query">Query Parameter</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                {/* API Key Header Name (only shown for api_key auth with header location) */}
                {authType === 'api_key' && authLocation === 'header' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="API Key Header Name"
                      value={apiKeyHeaderName}
                      onChange={(e) => setApiKeyHeaderName(e.target.value)}
                      placeholder="X-API-Key"
                      helperText="Header name for API key (e.g., 'X-API-Key', 'api-key', 'Authorization')"
                    />
                  </Grid>
                )}
                
                {/* API Key Query Parameter Name (only shown for api_key auth with query location) */}
                {authType === 'api_key' && authLocation === 'query' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="API Key Query Parameter"
                      value={apiKeyQueryParamName}
                      onChange={(e) => setApiKeyQueryParamName(e.target.value)}
                      placeholder="key"
                      helperText="Query parameter name for API key (e.g., 'key', 'api_key', 'apikey')"
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="color"
                    label="Brand Color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Icon URL (Optional)"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://example.com/icon.svg"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Documentation URL (Optional)"
                    value={documentationUrl}
                    onChange={(e) => setDocumentationUrl(e.target.value)}
                    placeholder="https://developers.example.com"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isSystemWide}
                        onChange={(e) => setIsSystemWide(e.target.checked)}
                      />
                    }
                    label="System-wide Integration"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={requiresUserConfig}
                        onChange={(e) => setRequiresUserConfig(e.target.checked)}
                      />
                    }
                    label="Requires User Configuration"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>Credentials</Typography>
              <List>
                {authCredentials.map((cred, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={cred.name}
                      secondary={`${cred.type} • ${cred.required ? 'Required' : 'Optional'} • ${cred.fixed ? 'Fixed' : 'Flexible'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Operations ({operations.length})</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<AIIcon />}
                    onClick={() => setAddOperationsDialogOpen(true)}
                  >
                    Parse More Operations
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddOperation}
                  >
                    Add Manually
                  </Button>
                </Stack>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Parameters</TableCell>
                      <TableCell align="center">Test Operation</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operations.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell>{operation.name}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {operation.endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={operation.method} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{operation.category}</TableCell>
                        <TableCell>{operation.base_credits}</TableCell>
                        <TableCell>{operation.parameters.length}</TableCell>
                        <TableCell align="center">
                          <Tooltip title={operation.is_test_operation ? "Used for quick testing" : "Mark as test operation"}>
                            <Switch
                              checked={operation.is_test_operation || false}
                              onChange={(e) => {
                                // Update this operation's test status
                                setOperations(operations.map(op => {
                                  if (op.id === operation.id) {
                                    return { ...op, is_test_operation: e.target.checked };
                                  }
                                  // If this is being set to true, unset all others
                                  if (e.target.checked) {
                                    return { ...op, is_test_operation: false };
                                  }
                                  return op;
                                }));
                              }}
                              size="small"
                              color="success"
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            {operation.parameters.length > 0 && (
                              <Tooltip title="Configure default parameters">
                                <IconButton size="small" onClick={() => handleConfigureParameters(operation)} color="success">
                                  <SettingsIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {isEditMode && (
                              <Tooltip title="Test operation">
                                <IconButton size="small" onClick={() => handleTestOperation(operation)} color="info">
                                  <TestIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Edit operation">
                              <IconButton size="small" onClick={() => handleEditOperation(operation)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete operation">
                              <IconButton size="small" onClick={() => handleDeleteOperation(operation.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {operations.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No operations defined. Click "Parse More Operations" to extract from documentation or "Add Manually" to create one.
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Review & Save</Typography>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="info" sx={{ mb: 3 }}>
                Review your integration configuration before saving
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Platform</Typography>
                  <Typography variant="body1">{platformName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Base URL</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {baseUrl}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Auth Type</Typography>
                  <Chip label={authType} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Operations</Typography>
                  <Typography variant="body1">{operations.length} operations</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Credentials</Typography>
                  {authCredentials.map((cred, index) => (
                    <Chip key={index} label={cred.name} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Grid>
              </Grid>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSaveIntegration}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ mt: 3 }}
              >
                {loading ? 'Saving Integration...' : 'Save Integration'}
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout
      title={isEditMode ? "Edit Integration" : "Integration Builder"}
      subtitle={isEditMode ? "Update your custom integration" : "Create custom integrations using AI-powered documentation parsing"}
      actions={
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/integrations')}
        >
          Back to Integrations
        </Button>
      }
    >
      <Box>
        {loadingIntegration && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {!loadingIntegration && (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {isEditMode && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Editing existing integration. You can update platform details, modify operations, or add new ones.
              </Alert>
            )}

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {WIZARD_STEPS.filter((_, index) => !isEditMode || index > 0).map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === (isEditMode ? 1 : 0)}
                startIcon={<BackIcon />}
              >
                Back
              </Button>
              <Box sx={{ flex: 1 }} />
              {activeStep < WIZARD_STEPS.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ForwardIcon />}
                  disabled={(activeStep === 0 && !parsedConfig && !isEditMode)}
                >
                  Next
                </Button>
              )}
            </Stack>
          </>
        )}

        {/* Operation Editor Dialog */}
        <Dialog open={operationDialogOpen} onClose={() => setOperationDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingOperation?.id ? 'Edit Operation' : 'Add Operation'}</DialogTitle>
          <DialogContent>
            {editingOperation && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Operation ID"
                  value={editingOperation.id}
                  disabled
                  helperText="Auto-generated unique identifier"
                />
                <TextField
                  fullWidth
                  label="Name"
                  value={editingOperation.name}
                  onChange={(e) => setEditingOperation({ ...editingOperation, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={editingOperation.description}
                  onChange={(e) => setEditingOperation({ ...editingOperation, description: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Endpoint"
                  value={editingOperation.endpoint}
                  onChange={(e) => setEditingOperation({ ...editingOperation, endpoint: e.target.value })}
                  helperText="API endpoint path, e.g., /v1/send"
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Method</InputLabel>
                      <Select
                        value={editingOperation.method}
                        label="Method"
                        onChange={(e) => setEditingOperation({ ...editingOperation, method: e.target.value as any })}
                      >
                        <MenuItem value="GET">GET</MenuItem>
                        <MenuItem value="POST">POST</MenuItem>
                        <MenuItem value="PUT">PUT</MenuItem>
                        <MenuItem value="PATCH">PATCH</MenuItem>
                        <MenuItem value="DELETE">DELETE</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Category"
                      value={editingOperation.category}
                      onChange={(e) => setEditingOperation({ ...editingOperation, category: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Base Credits"
                      value={editingOperation.base_credits}
                      onChange={(e) => setEditingOperation({ ...editingOperation, base_credits: parseInt(e.target.value) || 1 })}
                    />
                  </Grid>
                </Grid>

                {/* Parameters Section */}
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2">
                      Parameters ({editingOperation.parameters.length})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddParameter}
                      variant="outlined"
                    >
                      Add Parameter
                    </Button>
                  </Box>

                  {editingOperation.parameters.length === 0 ? (
                    <Alert severity="info">
                      No parameters defined. Click "Add Parameter" to add one.
                    </Alert>
                  ) : (
                    <List dense>
                      {editingOperation.parameters.map((param, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1
                          }}
                          secondaryAction={
                            <Box>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleEditParameter(param, index)}
                                sx={{ mr: 0.5 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteParameter(index)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {param.name}
                                </Typography>
                                {param.required && (
                                  <Chip label="Required" size="small" color="error" sx={{ height: 20 }} />
                                )}
                                {param.fixed && (
                                  <Chip label="Fixed" size="small" color="default" sx={{ height: 20 }} />
                                )}
                                <Chip label={param.type} size="small" color="primary" sx={{ height: 20 }} />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {param.description || 'No description'} • Location: {param.location}
                                {param.default && ` • Default: ${param.default}`}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOperationDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveOperation}>
              Save Operation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Operations Dialog */}
        <Dialog open={addOperationsDialogOpen} onClose={() => setAddOperationsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Parse Additional Operations
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Paste additional API documentation to extract more operations for {platformName}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={12}
              label="API Documentation"
              value={addOperationsDoc}
              onChange={(e) => setAddOperationsDoc(e.target.value)}
              placeholder="Paste additional endpoint documentation here..."
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Instructions (Optional)"
              value={addOperationsInstructions}
              onChange={(e) => setAddOperationsInstructions(e.target.value)}
              placeholder="e.g., Focus on email operations, Extract only POST endpoints"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOperationsDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleParseAdditionalOperations}
              disabled={!addOperationsDoc || parsingOperations}
              startIcon={parsingOperations ? <CircularProgress size={20} /> : <AIIcon />}
            >
              {parsingOperations ? 'Parsing...' : 'Parse Operations'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Test Operation Dialog */}
        <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <TestIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Test Operation: {testingOperation?.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Test this operation with live API calls. Fill in the credentials and required parameters below.
            </Typography>

            {testingOperation && (
              <Stack spacing={3} sx={{ mb: 3 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Endpoint:</strong> {testingOperation.method} {testingOperation.endpoint}
                  </Typography>
                </Alert>

                {/* Sandbox Mode Toggle (if integration has sandbox) */}
                {hasSandbox && sandboxBaseUrl && (
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={testParameters.use_sandbox || false}
                          onChange={(e) => setTestParameters({
                            ...testParameters,
                            use_sandbox: e.target.checked
                          })}
                          color="warning"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">Use Sandbox Mode</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {testParameters.use_sandbox 
                              ? `Testing with: ${sandboxBaseUrl}`
                              : `Testing with: ${baseUrl}`
                            }
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                )}

                {/* Credentials Section */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Authentication Credentials:</Typography>
                  <Stack spacing={2}>
                    {authCredentials.map((cred) => (
                      <TextField
                        key={cred.name}
                        fullWidth
                        type={cred.type === 'password' ? 'password' : 'text'}
                        label={cred.name}
                        value={testParameters[cred.name] || ''}
                        onChange={(e) => setTestParameters({
                          ...testParameters,
                          [cred.name]: e.target.value
                        })}
                        required={cred.required}
                        helperText={cred.description}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Parameters Section */}
                {testingOperation.parameters.filter(p => !p.fixed).length === 0 ? (
                  <Alert severity="info">
                    No configurable parameters for this operation. All parameters are fixed.
                  </Alert>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Operation Parameters:</Typography>
                    <Stack spacing={2}>
                      {testingOperation.parameters
                        .filter(param => !param.fixed)
                        .map((param) => {
                          // Determine input type based on parameter type
                          if (param.type === 'select') {
                            return (
                              <FormControl key={param.name} fullWidth>
                                <InputLabel>{param.name}</InputLabel>
                                <Select
                                  value={testParameters[param.name] || param.default || ''}
                                  onChange={(e) => setTestParameters({
                                    ...testParameters,
                                    [param.name]: e.target.value
                                  })}
                                  label={param.name}
                                  required={param.required}
                                >
                                  {(param.options || []).map((option: string) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                  ))}
                                </Select>
                                {param.description && (
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {param.description}
                                  </Typography>
                                )}
                              </FormControl>
                            );
                          } else if (param.type === 'number') {
                            return (
                              <TextField
                                key={param.name}
                                fullWidth
                                type="number"
                                label={param.name}
                                value={testParameters[param.name] ?? param.default ?? ''}
                                onChange={(e) => setTestParameters({
                                  ...testParameters,
                                  [param.name]: e.target.value ? parseFloat(e.target.value) : ''
                                })}
                                required={param.required}
                                helperText={param.description}
                                placeholder={param.default?.toString() || ''}
                              />
                            );
                          } else if (param.type === 'text' || param.type === 'string') {
                            return (
                              <TextField
                                key={param.name}
                                fullWidth
                                multiline={param.type === 'text'}
                                rows={param.type === 'text' ? 3 : 1}
                                label={param.name}
                                value={testParameters[param.name] ?? param.default ?? ''}
                                onChange={(e) => setTestParameters({
                                  ...testParameters,
                                  [param.name]: e.target.value
                                })}
                                required={param.required}
                                helperText={param.description}
                                placeholder={param.default?.toString() || ''}
                              />
                            );
                          } else {
                            // Default to text field for other types
                            return (
                              <TextField
                                key={param.name}
                                fullWidth
                                label={param.name}
                                value={testParameters[param.name] ?? param.default ?? ''}
                                onChange={(e) => setTestParameters({
                                  ...testParameters,
                                  [param.name]: e.target.value
                                })}
                                required={param.required}
                                helperText={`${param.description || ''} (Type: ${param.type})`}
                                placeholder={param.default?.toString() || ''}
                              />
                            );
                          }
                        })}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}

            {testResult && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Test Result:
                </Typography>
                <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {testResult.success ? '✓ Test successful!' : `✗ Test failed: ${testResult.error || 'Unknown error'}`}
                </Alert>
                {testResult.data && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Response Data:
                    </Typography>
                    <Paper variant="outlined" sx={{ 
                      p: 2, 
                      maxHeight: 300, 
                      overflow: 'auto', 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.03)',
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
                {testResult.raw_response && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Raw Response:
                    </Typography>
                    <Paper variant="outlined" sx={{ 
                      p: 2, 
                      maxHeight: 300, 
                      overflow: 'auto', 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.03)',
                      border: `1px solid ${theme.palette.divider}`
                    }}>
                      <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(testResult.raw_response, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={handleRunTest}
              disabled={testing}
              startIcon={testing ? <CircularProgress size={20} /> : <TestIcon />}
            >
              {testing ? 'Testing...' : 'Run Test'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Parameter Configuration Dialog */}
        <Dialog open={paramConfigDialogOpen} onClose={() => setParamConfigDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Configure Default Parameters: {configuringOperation?.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set default values for operation parameters. These defaults will be used when configuring the integration.
            </Typography>

            {configuringOperation && (
              <Stack spacing={2}>
                {configuringOperation.parameters.length === 0 ? (
                  <Alert severity="info">
                    This operation has no configurable parameters.
                  </Alert>
                ) : (
                  configuringOperation.parameters.map((param) => (
                    <Box key={param.name}>
                      <TextField
                        fullWidth
                        label={param.name}
                        value={parameterDefaults[param.name] || ''}
                        onChange={(e) => setParameterDefaults({
                          ...parameterDefaults,
                          [param.name]: e.target.value
                        })}
                        helperText={`${param.description || ''} ${param.required ? '(Required)' : '(Optional)'} - Location: ${param.location}`}
                        placeholder={param.default?.toString() || ''}
                        type={param.type === 'number' ? 'number' : 'text'}
                      />
                    </Box>
                  ))
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setParamConfigDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveParameterDefaults}
              startIcon={<SaveIcon />}
            >
              Save Defaults
            </Button>
          </DialogActions>
        </Dialog>

        {/* Parameter Editor Dialog */}
        <Dialog open={parameterEditorOpen} onClose={() => setParameterEditorOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingParameter?.index === -1 ? 'Add Parameter' : 'Edit Parameter'}
          </DialogTitle>
          <DialogContent>
            {editingParameter && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Parameter Name"
                  value={editingParameter.param.name}
                  onChange={(e) => setEditingParameter({
                    ...editingParameter,
                    param: { ...editingParameter.param, name: e.target.value }
                  })}
                  required
                  helperText="e.g., keyword, location_code, limit"
                />

                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editingParameter.param.type}
                    label="Type"
                    onChange={(e) => setEditingParameter({
                      ...editingParameter,
                      param: { ...editingParameter.param, type: e.target.value as any }
                    })}
                  >
                    <MenuItem value="string">String (single line)</MenuItem>
                    <MenuItem value="text">Text (multiline)</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                    <MenuItem value="select">Select (dropdown)</MenuItem>
                    <MenuItem value="array">Array</MenuItem>
                    <MenuItem value="object">Object</MenuItem>
                    <MenuItem value="file">File</MenuItem>
                  </Select>
                </FormControl>

                {editingParameter.param.type === 'select' && (
                  <TextField
                    fullWidth
                    label="Options (comma-separated)"
                    value={(editingParameter.param.options || []).join(', ')}
                    onChange={(e) => setEditingParameter({
                      ...editingParameter,
                      param: {
                        ...editingParameter.param,
                        options: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      }
                    })}
                    helperText="e.g., option1, option2, option3"
                  />
                )}

                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={editingParameter.param.location}
                    label="Location"
                    onChange={(e) => setEditingParameter({
                      ...editingParameter,
                      param: { ...editingParameter.param, location: e.target.value as any }
                    })}
                  >
                    <MenuItem value="body">Body</MenuItem>
                    <MenuItem value="query">Query</MenuItem>
                    <MenuItem value="path">Path</MenuItem>
                    <MenuItem value="header">Header</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Default Value"
                  value={editingParameter.param.default || ''}
                  onChange={(e) => setEditingParameter({
                    ...editingParameter,
                    param: { ...editingParameter.param, default: e.target.value }
                  })}
                  helperText="Optional default value"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={editingParameter.param.description || ''}
                  onChange={(e) => setEditingParameter({
                    ...editingParameter,
                    param: { ...editingParameter.param, description: e.target.value }
                  })}
                  helperText="Describe what this parameter does"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={editingParameter.param.required}
                      onChange={(e) => setEditingParameter({
                        ...editingParameter,
                        param: { ...editingParameter.param, required: e.target.checked }
                      })}
                    />
                  }
                  label="Required"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={editingParameter.param.fixed}
                      onChange={(e) => setEditingParameter({
                        ...editingParameter,
                        param: { ...editingParameter.param, fixed: e.target.checked }
                      })}
                    />
                  }
                  label="Fixed (not user-editable)"
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setParameterEditorOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveParameter}
              disabled={!editingParameter?.param.name}
              startIcon={<SaveIcon />}
            >
              Save Parameter
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
