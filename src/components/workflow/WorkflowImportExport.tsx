import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Chip,
  Stack,
  Divider,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CloudDownload as DownloadIcon,
} from '@mui/icons-material';
import { workflowApi } from '../../services/workflowApi';

interface WorkflowImportExportProps {
  workflowId?: number;
  workflowName?: string;
  onImportSuccess?: (templateId: number) => void;
}

interface IntegrationStatus {
  step_id: string;
  connection_id: string;
  integration_name: string;
  status: 'available' | 'not_configured' | 'missing';
  configured: boolean;
  message?: string;
}

interface ImportValidationResult {
  valid: boolean;
  integration_status: IntegrationStatus[];
  missing_integrations: string[];
  workflow_name: string;
  total_steps: number;
  steps_with_integrations: number;
}

interface ImportResult {
  success: boolean;
  template_id: number;
  template_name: string;
  status: string;
  integration_status: IntegrationStatus[];
  missing_integrations: string[];
  warnings: string[];
  message: string;
}

export default function WorkflowImportExport({ 
  workflowId, 
  workflowName, 
  onImportSuccess 
}: WorkflowImportExportProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [overrideName, setOverrideName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!workflowId) return;
    
    setIsExporting(true);
    try {
      const exportData = await workflowApi.exportWorkflow(workflowId, includeMetadata);
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflowName || 'workflow'}-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setImportData(data);
        validateImport(data);
      } catch (error) {
        console.error('Invalid JSON file:', error);
        setImportData(null);
        setValidationResult(null);
      }
    };
    
    reader.readAsText(file);
  };

  const validateImport = async (data: any) => {
    if (!data || !data.workflow) return;
    
    try {
      const result = await workflowApi.importWorkflow(data, null, null, true);
      setValidationResult(result as ImportValidationResult);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult(null);
    }
  };

  const handleImport = async () => {
    if (!importData) return;
    
    setIsImporting(true);
    try {
      const result = await workflowApi.importWorkflow(
        importData, 
        null, 
        overrideName || null, 
        false
      );
      
      setImportResult(result as ImportResult);
      
      if (result.success && onImportSuccess) {
        onImportSuccess(result.template_id);
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportState = () => {
    setImportFile(null);
    setImportData(null);
    setValidationResult(null);
    setImportResult(null);
    setOverrideName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportDialogClose = () => {
    setImportDialogOpen(false);
    resetImportState();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckIcon color="success" />;
      case 'not_configured':
        return <WarningIcon color="warning" />;
      case 'missing':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'not_configured':
        return 'warning';
      case 'missing':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Export/Import Action Buttons */}
      <Stack direction="row" spacing={1}>
        {workflowId && (
          <Button
            size="small"
            startIcon={<ExportIcon />}
            onClick={() => setExportDialogOpen(true)}
            variant="outlined"
          >
            Export
          </Button>
        )}
        <Button
          size="small"
          startIcon={<ImportIcon />}
          onClick={() => setImportDialogOpen(true)}
          variant="outlined"
        >
          Import
        </Button>
      </Stack>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Export Workflow: {workflowName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Export this workflow as a JSON file that can be imported into another RYVR instance or shared with others.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                />
              }
              label="Include integration metadata"
            />
            
            <Alert severity="info">
              The exported file will contain the complete workflow configuration including all nodes, tasks, and settings.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExport}
            variant="contained"
            startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export & Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={handleImportDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Import Workflow</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {!importResult && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Import a workflow from a previously exported JSON file. Missing integrations will be handled gracefully.
                </Typography>

                {/* File Upload */}
                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                    sx={{ p: 2 }}
                  >
                    {importFile ? `Selected: ${importFile.name}` : 'Choose JSON File to Import'}
                  </Button>
                </Box>

                {/* Import Settings */}
                {validationResult && (
                  <TextField
                    label="Override Workflow Name (optional)"
                    value={overrideName}
                    onChange={(e) => setOverrideName(e.target.value)}
                    placeholder={validationResult.workflow_name}
                    fullWidth
                  />
                )}
              </>
            )}

            {/* Validation Results */}
            {validationResult && !importResult && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Import Validation
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2">
                        <strong>Workflow:</strong> {validationResult.workflow_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Steps:</strong> {validationResult.total_steps}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Steps with Integrations:</strong> {validationResult.steps_with_integrations}
                      </Typography>
                    </Box>

                    {validationResult.integration_status.length > 0 && (
                      <>
                        <Divider />
                        <Typography variant="subtitle2">Integration Status:</Typography>
                        <List dense>
                          {validationResult.integration_status.map((integration, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {getStatusIcon(integration.status)}
                              </ListItemIcon>
                              <ListItemText
                                primary={integration.integration_name}
                                secondary={
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      label={integration.status.replace('_', ' ')}
                                      size="small"
                                      color={getStatusColor(integration.status) as any}
                                    />
                                    <Typography variant="caption">
                                      Step: {integration.step_id}
                                    </Typography>
                                    {integration.message && (
                                      <Typography variant="caption" color="text.secondary">
                                        {integration.message}
                                      </Typography>
                                    )}
                                  </Stack>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    {validationResult.missing_integrations.length > 0 && (
                      <Alert severity="warning">
                        <Typography variant="body2">
                          <strong>{validationResult.missing_integrations.length} integration(s) are missing:</strong>
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {validationResult.missing_integrations.map((integration, index) => (
                            <Chip key={index} label={integration} size="small" sx={{ mr: 1, mb: 1 }} />
                          ))}
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          The workflow will be imported, but you'll need to reconfigure these integrations manually.
                        </Typography>
                      </Alert>
                    )}

                    {validationResult.valid && (
                      <Alert severity="success">
                        All integrations are available. The workflow can be imported without issues.
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Import Results */}
            {importResult && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Alert severity={importResult.success ? 'success' : 'error'}>
                      <Typography variant="body2">
                        {importResult.message}
                      </Typography>
                    </Alert>

                    {importResult.success && (
                      <Box>
                        <Typography variant="body2">
                          <strong>Imported Workflow:</strong> {importResult.template_name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Template ID:</strong> {importResult.template_id}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {importResult.status}
                        </Typography>
                      </Box>
                    )}

                    {importResult.warnings && importResult.warnings.length > 0 && (
                      <Alert severity="warning">
                        <Typography variant="body2" gutterBottom>
                          <strong>Warnings:</strong>
                        </Typography>
                        <List dense>
                          {importResult.warnings.map((warning, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <Typography variant="body2">• {warning}</Typography>
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportDialogClose}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {validationResult && !importResult && (
            <Button
              onClick={handleImport}
              variant="contained"
              disabled={isImporting || !importData}
              startIcon={isImporting ? <CircularProgress size={20} /> : <ImportIcon />}
            >
              {isImporting ? 'Importing...' : 'Import Workflow'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
