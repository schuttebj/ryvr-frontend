// Integration Builder - Main Admin Page
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PlayArrow as TestIcon,
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { integrationBuilderApi, type IntegrationOperation, type OperationParameter } from '../../services/integrationBuilderApi';
import ReactJson from 'react-json-view';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IntegrationBuilderPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Platform Configuration
  const [platformName, setPlatformName] = useState('');
  const [provider, setProvider] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [authType, setAuthType] = useState<'basic' | 'bearer' | 'api_key' | 'oauth2'>('bearer');
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

  // OAuth Configuration
  const [oauthProvider, setOauthProvider] = useState('');
  const [oauthAuthUrl, setOauthAuthUrl] = useState('');
  const [oauthTokenUrl, setOauthTokenUrl] = useState('');
  const [oauthScopes, setOauthScopes] = useState('');
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');

  // Operations
  const [operations, setOperations] = useState<IntegrationOperation[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<IntegrationOperation | null>(null);
  const [operationDialogOpen, setOperationDialogOpen] = useState(false);

  // AI Parser
  const [aiDocumentation, setAiDocumentation] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Test Panel
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testOperation, setTestOperation] = useState<IntegrationOperation | null>(null);
  const [testParameters, setTestParameters] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

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
          auth_type: authType,
          color,
          icon_url: iconUrl,
          documentation_url: documentationUrl,
        },
        auth_config: {
          type: authType,
          credentials: authCredentials,
        },
        oauth_config: authType === 'oauth2' ? {
          provider: oauthProvider,
          auth_url: oauthAuthUrl,
          token_url: oauthTokenUrl,
          scopes: oauthScopes.split(',').map(s => s.trim()).filter(Boolean),
          client_id: oauthClientId,
          client_secret: oauthClientSecret,
        } : undefined,
        operations,
      };

      const result = await integrationBuilderApi.createIntegration(integrationData);
      setSuccess(`Integration "${platformName}" created successfully!`);
      
      // Reset form or navigate
      setTimeout(() => {
        navigate('/admin/integrations');
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create integration');
    } finally {
      setLoading(false);
    }
  };

  const handleAIParse = async () => {
    try {
      setAiParsing(true);
      setError(null);

      const result = await integrationBuilderApi.parseDocumentation({
        platform_name: platformName || 'API Platform',
        documentation: aiDocumentation,
        instructions: aiInstructions,
      });

      if (result.success) {
        setAiResult(result);
        
        // Apply parsed configuration
        const config = result.config;
        
        if (config.platform) {
          setPlatformName(config.platform.name);
          setProvider(config.platform.name.toLowerCase().replace(/\s+/g, '_'));
          setBaseUrl(config.platform.base_url);
          setAuthType(config.platform.auth_type);
          if (config.platform.color) setColor(config.platform.color);
          if (config.platform.documentation_url) setDocumentationUrl(config.platform.documentation_url);
        }

        if (config.auth_config) {
          setAuthCredentials(config.auth_config.credentials || []);
        }

        if (config.operations) {
          setOperations(config.operations);
        }

        setSuccess('Documentation parsed successfully! Review and adjust as needed.');
      } else {
        setError(result.error || 'Failed to parse documentation');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI parsing failed');
    } finally {
      setAiParsing(false);
    }
  };

  const handleAddCredential = () => {
    setAuthCredentials([
      ...authCredentials,
      { name: '', type: 'string', required: true, fixed: false, description: '' },
    ]);
  };

  const handleUpdateCredential = (index: number, field: string, value: any) => {
    const updated = [...authCredentials];
    updated[index] = { ...updated[index], [field]: value };
    setAuthCredentials(updated);
  };

  const handleRemoveCredential = (index: number) => {
    setAuthCredentials(authCredentials.filter((_, i) => i !== index));
  };

  const handleAddOperation = () => {
    setSelectedOperation({
      id: '',
      name: '',
      description: '',
      endpoint: '',
      method: 'POST',
      category: 'General',
      base_credits: 1,
      is_async: false,
      parameters: [],
      headers: [{ name: 'Content-Type', value: 'application/json', fixed: true }],
    });
    setOperationDialogOpen(true);
  };

  const handleEditOperation = (operation: IntegrationOperation) => {
    setSelectedOperation(operation);
    setOperationDialogOpen(true);
  };

  const handleSaveOperation = () => {
    if (!selectedOperation) return;

    if (operations.find(op => op.id === selectedOperation.id && op !== selectedOperation)) {
      // Update existing
      setOperations(operations.map(op => op.id === selectedOperation.id ? selectedOperation : op));
    } else {
      // Add new
      setOperations([...operations, selectedOperation]);
    }
    
    setOperationDialogOpen(false);
    setSelectedOperation(null);
  };

  const handleDeleteOperation = (operationId: string) => {
    setOperations(operations.filter(op => op.id !== operationId));
  };

  const handleTestOperation = (operation: IntegrationOperation) => {
    setTestOperation(operation);
    setTestParameters({});
    setTestResult(null);
    setTestDialogOpen(true);
  };

  const handleRunTest = async () => {
    if (!testOperation) return;

    try {
      setTesting(true);
      setError(null);

      // Note: This requires saving the integration first
      // For now, show a message
      setError('Save the integration first before testing operations');
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/integrations')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">Integration Builder</Typography>
      </Box>

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

      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Platform Configuration" />
          <Tab label="Authentication" />
          <Tab label="Operations" />
          <Tab label="AI Documentation Parser" />
        </Tabs>

        <CardContent>
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Platform Name"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  helperText="E.g., 'SendGrid', 'Brevo', 'DataForSEO'"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Provider ID"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  helperText="Lowercase identifier (auto-generated from name)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Base URL"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  helperText="API base URL without trailing slash"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Authentication Type</InputLabel>
                  <Select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as any)}
                  >
                    <MenuItem value="basic">Basic Auth</MenuItem>
                    <MenuItem value="bearer">Bearer Token</MenuItem>
                    <MenuItem value="api_key">API Key</MenuItem>
                    <MenuItem value="oauth2">OAuth 2.0</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Brand Color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Icon URL"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Documentation URL"
                  value={documentationUrl}
                  onChange={(e) => setDocumentationUrl(e.target.value)}
                  placeholder="https://docs.example.com"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isSystemWide}
                      onChange={(e) => setIsSystemWide(e.target.checked)}
                    />
                  }
                  label="System-wide (all users can use without configuration)"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={requiresUserConfig}
                      onChange={(e) => setRequiresUserConfig(e.target.checked)}
                    />
                  }
                  label="Requires user configuration (users must provide their own credentials)"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Credential Fields
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddCredential}
                variant="outlined"
              >
                Add Credential Field
              </Button>
            </Box>

            {authCredentials.map((cred, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Field Name"
                      value={cred.name}
                      onChange={(e) => handleUpdateCredential(index, 'name', e.target.value)}
                      placeholder="api_key, username, etc."
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={cred.type}
                        onChange={(e) => handleUpdateCredential(index, 'type', e.target.value)}
                      >
                        <MenuItem value="string">String</MenuItem>
                        <MenuItem value="password">Password</MenuItem>
                        <MenuItem value="number">Number</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} md={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={cred.required}
                          onChange={(e) => handleUpdateCredential(index, 'required', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Required"
                    />
                  </Grid>

                  <Grid item xs={6} md={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={cred.fixed}
                          onChange={(e) => handleUpdateCredential(index, 'fixed', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Fixed"
                    />
                  </Grid>

                  <Grid item xs={10} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={cred.description}
                      onChange={(e) => handleUpdateCredential(index, 'description', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={2} md={1}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveCredential(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}

            {authType === 'oauth2' && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  OAuth 2.0 Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="OAuth Provider"
                      value={oauthProvider}
                      onChange={(e) => setOauthProvider(e.target.value)}
                      placeholder="google, facebook, etc."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Authorization URL"
                      value={oauthAuthUrl}
                      onChange={(e) => setOauthAuthUrl(e.target.value)}
                      placeholder="https://accounts.google.com/o/oauth2/auth"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Token URL"
                      value={oauthTokenUrl}
                      onChange={(e) => setOauthTokenUrl(e.target.value)}
                      placeholder="https://oauth2.googleapis.com/token"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Scopes (comma-separated)"
                      value={oauthScopes}
                      onChange={(e) => setOauthScopes(e.target.value)}
                      placeholder="analytics.readonly, profile"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Client ID"
                      value={oauthClientId}
                      onChange={(e) => setOauthClientId(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Client Secret"
                      value={oauthClientSecret}
                      onChange={(e) => setOauthClientSecret(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Operations ({operations.length})</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddOperation}
                variant="contained"
              >
                Add Operation
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Parameters</TableCell>
                    <TableCell>Async</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operations.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell>{op.name}</TableCell>
                      <TableCell>
                        <Chip label={op.method} size="small" />
                      </TableCell>
                      <TableCell>{op.endpoint}</TableCell>
                      <TableCell>{op.category}</TableCell>
                      <TableCell>{op.parameters.length}</TableCell>
                      <TableCell>{op.is_async ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditOperation(op)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteOperation(op.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleTestOperation(op)}
                        >
                          <TestIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {operations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No operations defined. Add your first operation or use the AI parser.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Paste your API documentation below and let AI extract the integration configuration.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={10}
              label="API Documentation"
              value={aiDocumentation}
              onChange={(e) => setAiDocumentation(e.target.value)}
              placeholder="Paste API documentation here..."
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Instructions (optional)"
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              placeholder="E.g., 'Focus on email sending endpoints'"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              startIcon={aiParsing ? <CircularProgress size={20} /> : <AIIcon />}
              onClick={handleAIParse}
              disabled={!aiDocumentation || aiParsing}
            >
              {aiParsing ? 'Parsing...' : 'Parse with AI'}
            </Button>

            {aiResult && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Parsed Configuration
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <ReactJson
                    src={aiResult.config}
                    theme="rjv-default"
                    collapsed={1}
                    displayDataTypes={false}
                  />
                </Paper>
                {aiResult.validation && (
                  <Box sx={{ mt: 2 }}>
                    {aiResult.validation.errors?.length > 0 && (
                      <Alert severity="error">
                        <strong>Errors:</strong>
                        <ul>
                          {aiResult.validation.errors.map((err: string, i: number) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                    {aiResult.validation.warnings?.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        <strong>Warnings:</strong>
                        <ul>
                          {aiResult.validation.warnings.map((warn: string, i: number) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </TabPanel>
        </CardContent>

        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => navigate('/admin/integrations')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSaveIntegration}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Integration'}
          </Button>
        </Box>
      </Card>

      {/* Operation Editor Dialog - Simplified for now */}
      <Dialog
        open={operationDialogOpen}
        onClose={() => setOperationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedOperation?.name ? 'Edit Operation' : 'Add Operation'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Operation editor - Configure endpoint, parameters, and settings
          </Typography>
          {/* Full operation editor would go here - simplified for demo */}
          <Alert severity="info">
            Full operation editor implementation in progress. Use AI parser for now.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOperationDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveOperation} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog - Simplified */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Test Operation: {testOperation?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Save the integration first, then you can test operations with live API calls.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

