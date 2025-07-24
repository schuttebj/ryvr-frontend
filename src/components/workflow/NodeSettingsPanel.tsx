import { useState, useEffect } from 'react';
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
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
  ExpandMore as ExpandMoreIcon,
  DataArray as DataIcon,
} from '@mui/icons-material';
import { WorkflowNodeData, WorkflowNodeType } from '../../types/workflow';

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

  // Update form data when node changes
  useEffect(() => {
    if (node?.data) {
      setFormData(node.data);
    }
  }, [node]);

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
      
      // Test the node with its current configuration
      result = await workflowApi.testNode(formData.type, formData.config);
      
      setTestResult({
        success: result.success,
        data: result.data,
        nodeType: formData.type,
        message: result.success ? 'Node executed successfully!' : result.error,
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
        
        {/* Available data from previous nodes */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Available Data Sources:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip size="small" label="trigger_1.manual" color="primary" variant="outlined" />
            <Chip size="small" label="serp_1.results" color="primary" variant="outlined" />
            <Chip size="small" label="serp_1.keyword" color="primary" variant="outlined" />
            <Chip size="small" label="ai_1.analysis" color="primary" variant="outlined" />
          </Box>
        </Box>

        {/* Input mapping */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Map Input Data</InputLabel>
          <Select
            value={formData.config?.inputMapping || ''}
            label="Map Input Data"
            onChange={(e) => handleConfigChange('inputMapping', e.target.value)}
          >
            <MenuItem value="">No mapping</MenuItem>
            <MenuItem value="trigger_1.manual">Previous: Manual trigger</MenuItem>
            <MenuItem value="serp_1.results">Previous: SERP results</MenuItem>
            <MenuItem value="serp_1.keyword">Previous: Keyword data</MenuItem>
            <MenuItem value="ai_1.analysis">Previous: AI analysis</MenuItem>
          </Select>
        </FormControl>
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
              >
                <MenuItem value="manual">Manual Start</MenuItem>
                <MenuItem value="webhook">Webhook URL</MenuItem>
                <MenuItem value="schedule">Scheduled</MenuItem>
                <MenuItem value="api">API Trigger</MenuItem>
              </Select>
            </FormControl>
            
            {formData.config?.triggerType === 'webhook' && (
              <TextField
                fullWidth
                label="Webhook URL"
                value={formData.config?.webhookUrl || ''}
                onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                sx={{ mb: 2 }}
                helperText="URL that will trigger this workflow"
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
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              SERP Analysis Settings
            </Typography>
            
            {/* DataForSEO Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              DataForSEO Configuration
            </Typography>
            
            <TextField
              fullWidth
              label="DataForSEO Login"
              value={formData.config?.dataforSeoLogin || ''}
              onChange={(e) => handleConfigChange('dataforSeoLogin', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Your DataForSEO account login"
            />
            
            <TextField
              fullWidth
              label="DataForSEO Password"
              type="password"
              value={formData.config?.dataforSeoPassword || ''}
              onChange={(e) => handleConfigChange('dataforSeoPassword', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Your DataForSEO account password"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.useSandbox || true}
                  onChange={(e) => handleConfigChange('useSandbox', e.target.checked)}
                />
              }
              label="Use Sandbox Mode (recommended for testing)"
              sx={{ mb: 2 }}
            />
            
            {/* Search Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Search Configuration
            </Typography>
            
            <TextField
              fullWidth
              label="Target Keyword"
              value={formData.config?.keyword || ''}
              onChange={(e) => handleConfigChange('keyword', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Keyword to analyze SERP results for"
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.config?.locationCode || 2840}
                label="Location"
                onChange={(e) => handleConfigChange('locationCode', e.target.value)}
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
              label="Max Results"
              value={formData.config?.maxResults || 10}
              onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: 100 }}
              helperText="Number of SERP results to analyze (1-100)"
            />
            
            {/* Output Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Output Configuration
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.includeMetrics || true}
                  onChange={(e) => handleConfigChange('includeMetrics', e.target.checked)}
                />
              }
              label="Include ranking metrics"
              sx={{ mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.includeSnippets || true}
                  onChange={(e) => handleConfigChange('includeSnippets', e.target.checked)}
                />
              }
              label="Include meta descriptions and snippets"
              sx={{ mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.includeImages || false}
                  onChange={(e) => handleConfigChange('includeImages', e.target.checked)}
                />
              }
              label="Include image results"
              sx={{ mb: 2 }}
            />
            
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

      case WorkflowNodeType.AI_CONTENT_ANALYZE:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              AI Analysis Settings
            </Typography>
            
            {/* OpenAI Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              OpenAI Configuration
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model</InputLabel>
              <Select
                value={formData.config?.model || 'gpt-4o-mini'}
                label="Model"
                onChange={(e) => handleConfigChange('model', e.target.value)}
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
              label="Temperature"
              value={formData.config?.temperature || 0.7}
              onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, max: 2, step: 0.1 }}
              helperText="Controls randomness: 0 = focused, 2 = creative"
            />
            
            <TextField
              fullWidth
              type="number"
              label="Max Tokens"
              value={formData.config?.maxTokens || 1000}
              onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              helperText="Maximum response length"
            />
            
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={formData.config?.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Your OpenAI API key (stored securely)"
            />
            
            {/* Custom Prompt */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Custom Prompt
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="System Prompt"
              value={formData.config?.systemPrompt || ''}
              onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
              placeholder="You are a helpful AI assistant that analyzes content..."
              sx={{ mb: 2 }}
              helperText="Define the AI's role and behavior"
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="User Prompt Template"
              value={formData.config?.userPrompt || ''}
              onChange={(e) => handleConfigChange('userPrompt', e.target.value)}
              placeholder="Analyze the following content: {input_content}"
              sx={{ mb: 2 }}
              helperText="Use {variable_name} for dynamic content from previous nodes"
            />
            
            {/* JSON Response Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Response Format
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.jsonResponse || false}
                  onChange={(e) => handleConfigChange('jsonResponse', e.target.checked)}
                />
              }
              label="Return response as JSON"
              sx={{ mb: 2 }}
            />
            
            {formData.config?.jsonResponse && (
              <TextField
                fullWidth
                multiline
                rows={6}
                label="JSON Schema"
                value={formData.config?.jsonSchema || ''}
                onChange={(e) => handleConfigChange('jsonSchema', e.target.value)}
                placeholder={`{
  "analysis": {
    "sentiment": "positive|negative|neutral",
    "keywords": ["keyword1", "keyword2"],
    "summary": "Brief summary here",
    "score": 0.85
  }
}`}
                sx={{ mb: 2 }}
                helperText="Define the expected JSON structure for the AI response"
              />
            )}
            
            {/* Output Mapping */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Output Mapping
            </Typography>
            
            <TextField
              fullWidth
              label="Output Variable Name"
              value={formData.config?.outputVariable || 'ai_analysis'}
              onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Name for this node's output (used in next nodes)"
            />
          </Box>
        );

      case WorkflowNodeType.AI_CONTENT_GENERATE:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              AI Content Generation Settings
            </Typography>
            
            {/* OpenAI Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              OpenAI Configuration
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model</InputLabel>
              <Select
                value={formData.config?.model || 'gpt-4o-mini'}
                label="Model"
                onChange={(e) => handleConfigChange('model', e.target.value)}
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
              label="Temperature"
              value={formData.config?.temperature || 0.7}
              onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, max: 2, step: 0.1 }}
              helperText="Controls creativity: 0 = focused, 2 = creative"
            />
            
            <TextField
              fullWidth
              type="number"
              label="Max Tokens"
              value={formData.config?.maxTokens || 1000}
              onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
              sx={{ mb: 2 }}
              helperText="Maximum response length"
            />
            
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={formData.config?.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Your OpenAI API key (stored securely)"
            />
            
            {/* Content Generation Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Content Configuration
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Generation Prompt"
              value={formData.config?.prompt || ''}
              onChange={(e) => handleConfigChange('prompt', e.target.value)}
              placeholder="Generate a summary based on: {ai_analysis}"
              sx={{ mb: 2 }}
              helperText="Use {variable_name} to reference data from previous nodes"
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={formData.config?.contentType || 'summary'}
                label="Content Type"
                onChange={(e) => handleConfigChange('contentType', e.target.value)}
              >
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="article">Article</MenuItem>
                <MenuItem value="social_post">Social Media Post</MenuItem>
                <MenuItem value="email">Email Content</MenuItem>
                <MenuItem value="meta_description">Meta Description</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Tone"
              value={formData.config?.tone || 'professional'}
              onChange={(e) => handleConfigChange('tone', e.target.value)}
              sx={{ mb: 2 }}
              helperText="e.g., professional, casual, friendly, technical"
            />
            
            {/* JSON Response Configuration */}
            <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              Response Format
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.config?.jsonResponse || false}
                  onChange={(e) => handleConfigChange('jsonResponse', e.target.checked)}
                />
              }
              label="Return response as JSON"
              sx={{ mb: 2 }}
            />
            
            {formData.config?.jsonResponse && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="JSON Schema"
                value={formData.config?.jsonSchema || ''}
                onChange={(e) => handleConfigChange('jsonSchema', e.target.value)}
                placeholder={`{
  "content": "Generated content here",
  "metadata": {
    "word_count": 150,
    "tone": "professional"
  }
}`}
                sx={{ mb: 2 }}
                helperText="Define the expected JSON structure"
              />
            )}
            
            {/* Output Mapping */}
            <TextField
              fullWidth
              label="Output Variable Name"
              value={formData.config?.outputVariable || 'generated_content'}
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
            <TextField
              fullWidth
              label="To Email"
              value={formData.config?.toEmail || ''}
              onChange={(e) => handleConfigChange('toEmail', e.target.value)}
              sx={{ mb: 2 }}
              type="email"
            />
            
            <TextField
              fullWidth
              label="Subject"
              value={formData.config?.subject || ''}
              onChange={(e) => handleConfigChange('subject', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Email Body"
              value={formData.config?.body || ''}
              onChange={(e) => handleConfigChange('body', e.target.value)}
              placeholder="Email content or use data from previous nodes"
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
        <TextField
          fullWidth
          label="Node Label"
          value={formData.label}
          onChange={(e) => setFormData((prev: WorkflowNodeData) => ({ ...prev, label: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData((prev: WorkflowNodeData) => ({ ...prev, description: e.target.value }))}
          sx={{ mb: 2 }}
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
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
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
    </Box>
  );
}