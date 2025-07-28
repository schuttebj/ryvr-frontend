import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface ValidationResultsDialogProps {
  open: boolean;
  onClose: () => void;
  validationResult: any;
  onActivate?: () => void;
}

export default function ValidationResultsDialog({
  open,
  onClose,
  validationResult,
  onActivate
}: ValidationResultsDialogProps) {
  if (!validationResult) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(validationResult.overallStatus)}
            <Typography variant="h6">
              Workflow Validation Results
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Overall Status */}
        <Alert 
          severity={getStatusColor(validationResult.overallStatus)} 
          sx={{ mb: 3 }}
          icon={getStatusIcon(validationResult.overallStatus)}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {validationResult.isValid 
              ? (validationResult.warnings.length > 0 
                  ? `Validation passed with ${validationResult.warnings.length} warning(s)` 
                  : 'Validation passed successfully!')
              : `Validation failed with ${validationResult.errors.length} error(s)`
            }
          </Typography>
          {validationResult.isValid && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              This workflow is ready to be activated and will execute without errors.
            </Typography>
          )}
        </Alert>

        {/* Errors */}
        {validationResult.errors.length > 0 && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon color="error" />
                <Typography variant="subtitle1" color="error">
                  Errors ({validationResult.errors.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {validationResult.errors.map((error: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={error}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Warnings */}
        {validationResult.warnings.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="subtitle1" color="warning.main">
                  Warnings ({validationResult.warnings.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {validationResult.warnings.map((warning: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={warning}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Detailed Execution Flow */}
        {validationResult.executionFlow && validationResult.executionFlow.length > 0 && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="info" />
                <Typography variant="subtitle1">
                  Workflow Execution Flow ({validationResult.executionFlow.length} steps)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {validationResult.executionFlow.map((step: any, index: number) => (
                  <Box 
                    key={step.nodeId}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 2, 
                      p: 2,
                      bgcolor: step.status === 'success' ? 'success.50' : (step.status === 'error' ? 'error.50' : 'grey.50'),
                      position: 'relative'
                    }}
                  >
                    {/* Step Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip 
                        label={`Step ${step.stepIndex}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      {getStatusIcon(step.status)}
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {step.nodeLabel}
                      </Typography>
                      <Chip 
                        label={step.nodeType} 
                        size="small" 
                        variant="outlined"
                      />
                      {step.executionTime > 0 && (
                        <Chip 
                          label={`${step.executionTime}ms`} 
                          size="small" 
                          color="info"
                        />
                      )}
                    </Box>

                    {/* Error Messages */}
                    {step.errors && step.errors.length > 0 && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          {step.errors.join(', ')}
                        </Typography>
                      </Alert>
                    )}

                    {/* Data Flow */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 2, alignItems: 'center' }}>
                      {/* Input Data */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                          📥 Input Data
                        </Typography>
                        <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', maxHeight: 150, overflow: 'auto' }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(step.inputData, null, 2)}
                          </pre>
                        </Box>
                        
                        {/* Data Mapping Info */}
                        {(step.dataMapping.inputMapping || step.dataMapping.customInputMapping) && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'info.50', borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              🔄 Data Mapping:
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                              {step.dataMapping.inputMapping || step.dataMapping.customInputMapping}
                            </Typography>
                            {step.dataMapping.mappedData && (
                              <Box sx={{ mt: 0.5, fontSize: '0.7rem', fontFamily: 'monospace' }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Mapped Value:</Typography>
                                <pre style={{ margin: 0 }}>
                                  {JSON.stringify(step.dataMapping.mappedData, null, 1)}
                                </pre>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Arrow */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          →
                        </Typography>
                      </Box>

                      {/* Output Data */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                          📤 Output Data
                        </Typography>
                        <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', maxHeight: 150, overflow: 'auto' }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {step.outputData ? JSON.stringify(step.outputData, null, 2) : 'No output data'}
                          </pre>
                        </Box>
                        
                        {/* Output Variable */}
                        {step.dataMapping.outputVariable && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              📋 Stored as: 
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {step.dataMapping.outputVariable}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Connection Arrow to Next Step */}
                    {index < validationResult.executionFlow.length - 1 && (
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: -20, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        zIndex: 1
                      }}>
                        <Typography variant="h5" color="primary">
                          ↓
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Node Results Summary */}
        {Object.keys(validationResult.nodeResults).length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="info" />
                <Typography variant="subtitle1">
                  Quick Node Summary ({Object.keys(validationResult.nodeResults).length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {Object.entries(validationResult.nodeResults).map(([nodeId, result]: [string, any]) => (
                  <ListItem 
                    key={nodeId}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1,
                      bgcolor: result.status === 'success' ? 'success.50' : 'error.50'
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(result.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {nodeId}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={result.status} 
                            color={result.status === 'success' ? 'success' : 'error'}
                          />
                          {result.executionTime && (
                            <Chip 
                              size="small" 
                              label={`${result.executionTime}ms`} 
                              color="info"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption">
                            {result.message}
                          </Typography>
                          {result.errors && result.errors.length > 0 && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                              Errors: {result.errors.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {validationResult.isValid && onActivate && (
          <Button 
            onClick={onActivate} 
            variant="contained" 
            color="success"
            startIcon={<CheckIcon />}
          >
            Activate Workflow
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 