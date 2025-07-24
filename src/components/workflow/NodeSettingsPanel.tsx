import { useState } from 'react';
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
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
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

  if (!node) return null;

  const handleSave = () => {
    onSave(node.id, formData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${node.data.label}"?`)) {
      onDelete(node.id);
      onClose();
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Import the workflow API (will need to handle this dynamically in real app)
      const { workflowApi } = await import('../../services/workflowApi');
      const result = await workflowApi.testNode(formData.type, formData.config);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        nodeType: formData.type,
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

  const renderNodeSpecificSettings = () => {
    switch (node.data.type) {
      case WorkflowNodeType.TRIGGER:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Trigger Settings
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trigger Type</InputLabel>
              <Select
                value={formData.config?.triggerType || 'manual'}
                label="Trigger Type"
                onChange={(e: any) => handleConfigChange('triggerType', e.target.value)}
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
                <MenuItem value="schedule">Schedule</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case WorkflowNodeType.EMAIL:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Email Settings
            </Typography>
            <TextField
              fullWidth
              label="To Email"
              value={formData.config?.toEmail || ''}
              onChange={(e) => handleConfigChange('toEmail', e.target.value)}
              sx={{ mb: 2 }}
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
              label="Email Content"
              value={formData.config?.content || ''}
              onChange={(e) => handleConfigChange('content', e.target.value)}
            />
          </Box>
        );

      case WorkflowNodeType.SEO_AUDIT:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              SEO Audit Settings
            </Typography>
            <TextField
              fullWidth
              label="Website URL"
              value={formData.config?.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              placeholder="https://example.com"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.config?.location || 'US'}
                label="Location"
                onChange={(e) => handleConfigChange('location', e.target.value)}
              >
                <MenuItem value="US">United States</MenuItem>
                <MenuItem value="GB">United Kingdom</MenuItem>
                <MenuItem value="CA">Canada</MenuItem>
                <MenuItem value="AU">Australia</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case WorkflowNodeType.KEYWORD_RESEARCH:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Keyword Research Settings
            </Typography>
            <TextField
              fullWidth
              label="Target Keywords"
              value={formData.config?.keywords || ''}
              onChange={(e) => handleConfigChange('keywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              helperText="Enter keywords separated by commas"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Search Volume Range</InputLabel>
              <Select
                value={formData.config?.volumeRange || 'all'}
                label="Search Volume Range"
                onChange={(e) => handleConfigChange('volumeRange', e.target.value)}
              >
                <MenuItem value="all">All Volumes</MenuItem>
                <MenuItem value="high">High (10k+)</MenuItem>
                <MenuItem value="medium">Medium (1k-10k)</MenuItem>
                <MenuItem value="low">Low (0-1k)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case WorkflowNodeType.AI_ANALYSIS:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              AI Analysis Settings
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Analysis Type</InputLabel>
              <Select
                value={formData.config?.analysisType || 'content'}
                label="Analysis Type"
                onChange={(e) => handleConfigChange('analysisType', e.target.value)}
              >
                <MenuItem value="content">Content Analysis</MenuItem>
                <MenuItem value="sentiment">Sentiment Analysis</MenuItem>
                <MenuItem value="seo">SEO Analysis</MenuItem>
                <MenuItem value="competitive">Competitive Analysis</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Content to Analyze"
              value={formData.config?.content || ''}
              onChange={(e) => handleConfigChange('content', e.target.value)}
              placeholder="Enter content or URL to analyze"
            />
          </Box>
        );

      default:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No specific settings available for this node type.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 500,
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 2000,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
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
            label={node.data.type.replace('_', ' ').toUpperCase()}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            Node ID: {node.id}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Basic Settings */}
        <TextField
          fullWidth
          label="Node Label"
          value={formData.label}
          onChange={(e: any) => setFormData((prev: WorkflowNodeData) => ({ ...prev, label: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Description"
          value={formData.description}
          onChange={(e: any) => setFormData((prev: WorkflowNodeData) => ({ ...prev, description: e.target.value }))}
          sx={{ mb: 2 }}
        />

        {/* Node-specific settings */}
        {renderNodeSpecificSettings()}

        {/* Actions */}
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete Node
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<TestIcon />}
              onClick={handleTest}
              disabled={testing}
              color="success"
            >
              {testing ? 'Testing...' : 'Test Node'}
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              color="primary"
            >
              Save Changes
            </Button>
          </Box>
        </Box>

        {/* Test Results */}
        {testResult && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Test Results
            </Typography>
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mb: 1 }}
            >
              {testResult.success ? 'Node executed successfully!' : `Error: ${testResult.error}`}
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

        {/* Help Text */}
        <Alert severity="info" sx={{ mt: 2 }}>
          Configure this node's settings and click "Save Changes" to apply them to your workflow.
        </Alert>
      </Box>
    </Paper>
  );
} 