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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { integrationBuilderApi, type IntegrationOperation } from '../../services/integrationBuilderApi';

const WIZARD_STEPS = ['Parse Documentation', 'Platform & Auth', 'Review Operations', 'Save'];

export default function IntegrationBuilderPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  // OAuth Configuration (for future use if needed)
  const oauthScopes = '';

  // AI Parser for adding operations
  const [addOperationsDialogOpen, setAddOperationsDialogOpen] = useState(false);
  const [addOperationsDoc, setAddOperationsDoc] = useState('');
  const [addOperationsInstructions, setAddOperationsInstructions] = useState('');
  const [parsingOperations, setParsingOperations] = useState(false);

  // Load parsed config into form
  useEffect(() => {
    if (parsedConfig) {
      setPlatformName(parsedConfig.platform.name || '');
      setProvider(parsedConfig.platform.name?.toLowerCase().replace(/\s+/g, '_') || '');
      setBaseUrl(parsedConfig.platform.base_url || '');
      setAuthType(parsedConfig.platform.auth_type || 'bearer');
      setColor(parsedConfig.platform.color || '#5f5eff');
      setDocumentationUrl(parsedConfig.platform.documentation_url || '');
      
      setAuthCredentials(parsedConfig.auth_config.credentials || []);
      setOperations(parsedConfig.operations || []);
    }
  }, [parsedConfig]);

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
          provider: platformName.toLowerCase(),
          auth_url: '',
          token_url: '',
          scopes: oauthScopes.split(',').map(s => s.trim()).filter(Boolean),
        } : undefined,
        operations,
      };

      await integrationBuilderApi.createIntegration(integrationData);
      setSuccess(`Integration "${platformName}" created successfully!`);
      
      // Navigate to integrations page
      setTimeout(() => {
        navigate('/admin/integrations');
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to save integration');
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
        // Add new operations to existing ones (avoid duplicates)
        const existingOpIds = new Set(operations.map(op => op.id));
        const newOps = result.config.operations.filter((op: IntegrationOperation) => !existingOpIds.has(op.id));
        
        setOperations([...operations, ...newOps]);
        setSuccess(`Added ${newOps.length} new operations! (Skipped ${result.config.operations.length - newOps.length} duplicates)`);
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
      id: '',
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

  const handleSaveOperation = () => {
    if (!editingOperation) return;

    const existingIndex = operations.findIndex(op => op.id === editingOperation.id);
    if (existingIndex >= 0) {
      const updated = [...operations];
      updated[existingIndex] = editingOperation;
      setOperations(updated);
    } else {
      setOperations([...operations, editingOperation]);
    }
    setOperationDialogOpen(false);
    setEditingOperation(null);
  };

  const handleDeleteOperation = (operationId: string) => {
    setOperations(operations.filter(op => op.id !== operationId));
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
                    </Select>
                  </FormControl>
                </Grid>
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
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEditOperation(operation)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteOperation(operation.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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
      title="Integration Builder"
      subtitle="Create custom integrations using AI-powered documentation parsing"
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

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
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
              disabled={activeStep === 0 && !parsedConfig}
            >
              Next
            </Button>
          )}
        </Stack>

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
                  onChange={(e) => setEditingOperation({ ...editingOperation, id: e.target.value })}
                  helperText="Unique identifier, e.g., send_email"
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
      </Box>
    </AdminLayout>
  );
}
