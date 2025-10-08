import { useState } from 'react';
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
  LinearProgress,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';

interface ValidationResultsDialogProps {
  open: boolean;
  onClose: () => void;
  validationResult: any;
  onActivate?: () => void;
  validating?: boolean;
}

export default function ValidationResultsDialog({
  open,
  onClose,
  validationResult,
  onActivate,
  validating = false
}: ValidationResultsDialogProps) {
  const theme = useTheme();
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'pending':
        return <PendingIcon color="disabled" />;
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

  // Calculate progress
  const totalSteps = validationResult?.summary?.totalNodes || validationResult?.executionFlow?.length || 0;
  const completedSteps = validationResult?.executionFlow?.filter((step: any) => 
    step.status === 'success' || step.status === 'error'
  ).length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Dialog 
      open={open} 
      onClose={validating ? undefined : onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {validating ? (
              <CircularProgress size={24} />
            ) : validationResult ? (
              getStatusIcon(validationResult.overallStatus)
            ) : null}
            <Typography variant="h6">
              {validating ? 'Validating Workflow...' : 'Workflow Validation Results'}
            </Typography>
          </Box>
          {!validating && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        {/* Progress Bar */}
        {(validating || (validationResult && completedSteps < totalSteps)) && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress: {completedSteps} / {totalSteps} steps
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ borderRadius: 1, height: 6 }}
            />
          </Box>
        )}
      </DialogTitle>
      
      <DialogContent dividers sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
        {validationResult && !validating && (
          <>
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
              {validationResult.summary && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', opacity: 0.9 }}>
                  {validationResult.summary.message}
                </Typography>
              )}
            </Alert>

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <Accordion 
                defaultExpanded 
                sx={{ 
                  mb: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
                }}
              >
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
              <Accordion 
                sx={{ 
                  mb: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
                }}
              >
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
          </>
        )}

        {/* Detailed Execution Flow - Live Updates */}
        {validationResult?.executionFlow && validationResult.executionFlow.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <InfoIcon color="info" />
              Workflow Execution Flow ({validationResult.executionFlow.length} steps)
            </Typography>

            {validationResult.executionFlow.map((step: any) => (
              <Accordion 
                key={step.nodeId}
                expanded={expandedSteps[step.nodeId] || false}
                onChange={() => toggleStep(step.nodeId)}
                sx={{ 
                  border: 1, 
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                  '&:before': { display: 'none' },
                  boxShadow: 1
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Chip 
                      label={`Step ${step.stepIndex}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    {getStatusIcon(step.status)}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
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
                </AccordionSummary>

                <AccordionDetails>
                  {/* Error Messages */}
                  {step.errors && step.errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {step.errors.join(', ')}
                      </Typography>
                    </Alert>
                  )}

                  {/* Data Flow - Better Alignment */}
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                    {/* Input Data */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                        📥 Input Data
                      </Typography>
                      <Box sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                        color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                        p: 1.5, 
                        borderRadius: 1, 
                        fontSize: '0.75rem', 
                        fontFamily: 'monospace', 
                        maxHeight: 200, 
                        overflow: 'auto',
                        border: 1,
                        borderColor: theme.palette.divider
                      }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {JSON.stringify(step.inputData, null, 2)}
                        </pre>
                      </Box>
                      
                      {/* Data Mapping Info */}
                      {(step.dataMapping.inputMapping || step.dataMapping.customInputMapping) && (
                        <Box sx={{ 
                          mt: 1, 
                          p: 1, 
                          bgcolor: theme.palette.mode === 'dark' ? 'info.dark' : 'info.light',
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'info.main'
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                            🔄 Data Mapping:
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {step.dataMapping.inputMapping || step.dataMapping.customInputMapping}
                          </Typography>
                          {step.dataMapping.mappedData && (
                            <Box sx={{ mt: 0.5, fontSize: '0.7rem', fontFamily: 'monospace' }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>Mapped Value:</Typography>
                              <Box sx={{ 
                                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200',
                                color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                                p: 0.5,
                                borderRadius: 0.5,
                                mt: 0.5
                              }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                  {JSON.stringify(step.dataMapping.mappedData, null, 2)}
                                </pre>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Arrow */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 40
                    }}>
                      <Typography variant="h4" color="primary">
                        →
                      </Typography>
                    </Box>

                    {/* Output Data */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                        📤 Output Data
                      </Typography>
                      <Box sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                        color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                        p: 1.5, 
                        borderRadius: 1, 
                        fontSize: '0.75rem', 
                        fontFamily: 'monospace', 
                        maxHeight: 200, 
                        overflow: 'auto',
                        border: 1,
                        borderColor: theme.palette.divider
                      }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {step.outputData ? JSON.stringify(step.outputData, null, 2) : 'No output data'}
                        </pre>
                      </Box>
                      
                      {/* Output Variable */}
                      {step.dataMapping.outputVariable && (
                        <Box sx={{ 
                          mt: 1, 
                          p: 1, 
                          bgcolor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light',
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'success.main'
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'inline' }}>
                            📋 Stored as: 
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', ml: 0.5 }}>
                            {step.dataMapping.outputVariable}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Loading State */}
        {validating && (!validationResult || !validationResult.executionFlow) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Starting validation...
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default' }}>
        <Button onClick={onClose} disabled={validating}>
          {validating ? 'Validating...' : 'Close'}
        </Button>
        {validationResult?.isValid && onActivate && !validating && (
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
