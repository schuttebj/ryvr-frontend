import { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  LinearProgress,
  CircularProgress,
  useTheme,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  HourglassEmpty as PendingIcon,
  PlayArrow as RunningIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Replay as RerunIcon,
} from '@mui/icons-material';
import { FlowStatus } from '../../types/workflow';

interface FlowDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  flowId: number | null;
  onRerun?: (flowId: number) => void;
  onDelete?: (flowId: number) => void;
}

export default function FlowDetailsDialog({
  open,
  onClose,
  flowId,
  onRerun,
  onDelete,
}: FlowDetailsDialogProps) {
  const theme = useTheme();
  const [flowDetails, setFlowDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch flow details
  const fetchFlowDetails = async () => {
    if (!flowId) return;
    
    setLoading(true);
    try {
      const { flowApi } = await import('../../services/flowApi');
      const details = await flowApi.getFlowDetails(flowId);
      setFlowDetails(details);
      
      // Auto-refresh if flow is in progress
      if (details.status === FlowStatus.IN_PROGRESS) {
        setAutoRefresh(true);
      } else {
        setAutoRefresh(false);
      }
    } catch (error: any) {
      console.error('Error fetching flow details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && flowId) {
      fetchFlowDetails();
    }
  }, [open, flowId]);

  // Auto-refresh for running flows
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchFlowDetails();
    }, 2000); // Refresh every 2 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, flowId]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'complete':
      case 'success':
        return <CheckIcon color="success" />;
      case 'failed':
      case 'error':
        return <ErrorIcon color="error" />;
      case 'running':
      case 'in_progress':
        return <RunningIcon color="primary" />;
      case 'pending':
      case 'new':
      case 'scheduled':
        return <PendingIcon color="disabled" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'complete':
      case 'success':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      case 'running':
      case 'in_progress':
        return 'primary';
      case 'pending':
      case 'new':
        return 'default';
      default:
        return 'info';
    }
  };

  // Calculate progress
  const progress = flowDetails?.total_steps > 0 
    ? (flowDetails.completed_steps / flowDetails.total_steps) * 100 
    : 0;

  const handleRerun = () => {
    if (flowId && onRerun) {
      onRerun(flowId);
      onClose();
    }
  };

  const handleDelete = () => {
    if (flowId && onDelete) {
      if (confirm('Are you sure you want to delete this flow?')) {
        onDelete(flowId);
        onClose();
      }
    }
  };

  const canRerun = flowDetails?.status && 
    ['complete', 'error', 'failed'].includes(flowDetails.status);
  
  const canDelete = flowDetails?.status && 
    flowDetails.status !== 'in_progress';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
            {flowDetails && getStatusIcon(flowDetails.status)}
            <Typography variant="h6">
              {flowDetails?.title || 'Flow Details'}
            </Typography>
            {flowDetails && (
              <Chip 
                label={flowDetails.status} 
                color={getStatusColor(flowDetails.status) as any}
                size="small"
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {autoRefresh && (
              <CircularProgress size={20} />
            )}
            <IconButton onClick={fetchFlowDetails} size="small" title="Refresh">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Progress Bar */}
        {flowDetails && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress: {flowDetails.completed_steps} / {flowDetails.total_steps} steps
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
        {loading && !flowDetails ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading flow details...
            </Typography>
          </Box>
        ) : flowDetails ? (
          <>
            {/* Flow Information */}
            <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Flow Information
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Template</Typography>
                  <Typography variant="body2">{flowDetails.template_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">
                    {new Date(flowDetails.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Credits Used</Typography>
                  <Typography variant="body2">{flowDetails.credits_used}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Estimated Duration</Typography>
                  <Typography variant="body2">{flowDetails.estimated_duration || 'N/A'} min</Typography>
                </Box>
              </Box>
            </Box>

            {/* Error Message */}
            {flowDetails.error_message && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Execution Error
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {flowDetails.error_message}
                </Typography>
              </Alert>
            )}

            {/* Step Executions */}
            {flowDetails.step_executions && flowDetails.step_executions.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="info" />
                  Step Executions ({flowDetails.step_executions.length} steps)
                </Typography>

                {flowDetails.step_executions.map((step: any, index: number) => (
                  <Accordion 
                    key={step.id}
                    expanded={expandedSteps[step.step_id] || false}
                    onChange={() => toggleStep(step.step_id)}
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
                          label={`Step ${index + 1}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        {getStatusIcon(step.status)}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                          {step.step_name}
                        </Typography>
                        <Chip 
                          label={step.step_type} 
                          size="small" 
                          variant="outlined"
                        />
                        {step.execution_time_ms > 0 && (
                          <Chip 
                            label={`${step.execution_time_ms}ms`} 
                            size="small" 
                            color="info"
                          />
                        )}
                        {step.credits_used > 0 && (
                          <Chip 
                            label={`${step.credits_used} credits`} 
                            size="small" 
                            color="warning"
                          />
                        )}
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                      {/* Error Messages */}
                      {step.error_data && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            {step.error_data.error || JSON.stringify(step.error_data)}
                          </Typography>
                        </Alert>
                      )}

                      {/* Data Flow */}
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
                              {step.input_data ? JSON.stringify(step.input_data, null, 2) : 'No input data'}
                            </pre>
                          </Box>
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
                              {step.output_data ? JSON.stringify(step.output_data, null, 2) : 'No output data'}
                            </pre>
                          </Box>
                        </Box>
                      </Box>
                      
                      {/* Timestamps */}
                      {step.started_at && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Started: {new Date(step.started_at).toLocaleString()}
                          </Typography>
                          {step.completed_at && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Completed: {new Date(step.completed_at).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                <Typography variant="body2">
                  No step executions recorded yet. {flowDetails.status === FlowStatus.NEW ? 'Start the flow to begin execution.' : ''}
                </Typography>
              </Alert>
            )}
          </>
        ) : (
          <Alert severity="info">
            <Typography variant="body2">
              No flow details available.
            </Typography>
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default' }}>
        <Button onClick={onClose}>
          Close
        </Button>
        {canDelete && onDelete && (
          <Button 
            onClick={handleDelete}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        )}
        {canRerun && onRerun && (
          <Button 
            onClick={handleRerun}
            variant="contained"
            color="primary"
            startIcon={<RerunIcon />}
          >
            Rerun
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

