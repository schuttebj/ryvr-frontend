import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  AccessTime as TimeIcon,
  DataObject as DataIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { workflowApi } from '../services/workflowApi';

interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  results: any[];
  finalResult?: any;
  error?: string;
  nodeCount: number;
  successfulNodes: number;
}

interface WorkflowSummary {
  id: string;
  name: string;
  isActive: boolean;
  nodes?: any[];
}

export const WorkflowRunsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [runningWorkflows, setRunningWorkflows] = useState<Set<string>>(new Set());
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [showRunDetails, setShowRunDetails] = useState(false);

  useEffect(() => {
    loadWorkflows();
    loadRuns();
  }, []);

  const loadWorkflows = () => {
    try {
      const workflowsData = JSON.parse(localStorage.getItem('workflows') || '[]');
      setWorkflows(workflowsData.filter((w: any) => w.isActive));
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const loadRuns = () => {
    try {
      const runsData = JSON.parse(localStorage.getItem('workflow_runs') || '[]');
      setRuns(runsData.sort((a: WorkflowRun, b: WorkflowRun) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load runs:', error);
    }
  };

  const saveRuns = (updatedRuns: WorkflowRun[]) => {
    localStorage.setItem('workflow_runs', JSON.stringify(updatedRuns));
    setRuns(updatedRuns);
  };

  const executeWorkflow = async (workflowId: string) => {
    setRunningWorkflows(prev => new Set([...prev, workflowId]));

    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Load full workflow data
      const workflowsData = JSON.parse(localStorage.getItem('workflows') || '[]');
      const fullWorkflow = workflowsData.find((w: any) => w.id === workflowId);

      if (!fullWorkflow) {
        throw new Error('Full workflow data not found');
      }

      const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = new Date();

      // Create initial run record
      const newRun: WorkflowRun = {
        id: runId,
        workflowId,
        workflowName: workflow.name,
        status: 'running',
        startedAt: startTime.toISOString(),
        results: [],
        nodeCount: fullWorkflow.nodes?.length || 0,
        successfulNodes: 0
      };

      const updatedRuns = [newRun, ...runs];
      saveRuns(updatedRuns);

      // Execute workflow
      const result = await workflowApi.executeWorkflow(fullWorkflow);
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Update run record with results
      const completedRun: WorkflowRun = {
        ...newRun,
        status: result.success ? 'completed' : 'failed',
        completedAt: endTime.toISOString(),
        duration,
        results: result.results || [],
        finalResult: result.results?.[result.results.length - 1]?.data,
        error: result.error,
        successfulNodes: result.results?.filter((r: any) => r.success).length || 0
      };

      const finalRuns = runs.map(r => r.id === runId ? completedRun : r);
      saveRuns(finalRuns);

    } catch (error: any) {
      console.error('Workflow execution failed:', error);
      
      // Update run record with error
      const failedRuns = runs.map(r => 
        r.id === runs[0]?.id ? { ...r, status: 'failed' as const, error: error.message } : r
      );
      saveRuns(failedRuns);
    } finally {
      setRunningWorkflows(prev => {
        const updated = new Set(prev);
        updated.delete(workflowId);
        return updated;
      });
    }
  };

  const deleteRun = (runId: string) => {
    const updatedRuns = runs.filter(r => r.id !== runId);
    saveRuns(updatedRuns);
  };

  const viewRunDetails = (run: WorkflowRun) => {
    setSelectedRun(run);
    setShowRunDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <SuccessIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'running': return <CircularProgress size={20} />;
      default: return <ScheduleIcon />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Workflow Runs
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Execute workflows and view execution history
        </Typography>
      </Box>

      {/* Execute Workflow Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Execute Workflow
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel>Select Active Workflow</InputLabel>
                <Select
                  value={selectedWorkflow}
                  onChange={(e) => setSelectedWorkflow(e.target.value)}
                  label="Select Active Workflow"
                >
                  {workflows.map((workflow) => (
                    <MenuItem key={workflow.id} value={workflow.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{workflow.name}</Typography>
                        <Chip 
                          size="small" 
                          label={`${workflow.nodes?.length || 0} nodes`} 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={runningWorkflows.has(selectedWorkflow) ? 
                  <CircularProgress size={20} color="inherit" /> : 
                  <PlayIcon />
                }
                onClick={() => executeWorkflow(selectedWorkflow)}
                disabled={!selectedWorkflow || runningWorkflows.has(selectedWorkflow)}
                fullWidth
                size="large"
              >
                {runningWorkflows.has(selectedWorkflow) ? 'Running...' : 'Execute Workflow'}
              </Button>
            </Grid>
          </Grid>

          {workflows.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No active workflows found. Create and activate a workflow first.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Run History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon />
            Run History ({runs.length})
          </Typography>

          {runs.length === 0 ? (
            <Alert severity="info">
              No workflow runs yet. Execute a workflow to see results here.
            </Alert>
          ) : (
            <List>
              {runs.map((run, index) => (
                <React.Fragment key={run.id}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: run.status === 'completed' ? 'success.50' : 
                              run.status === 'failed' ? 'error.50' : 'warning.50'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                      {getStatusIcon(run.status)}
                    </Box>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {run.workflowName}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={run.status} 
                            color={getStatusColor(run.status) as any}
                          />
                          {run.duration && (
                            <Chip 
                              size="small" 
                              label={formatDuration(run.duration)} 
                              icon={<TimeIcon />}
                              variant="outlined"
                            />
                          )}
                          <Chip 
                            size="small" 
                            label={`${run.successfulNodes}/${run.nodeCount} nodes`} 
                            color={run.successfulNodes === run.nodeCount ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Started: {new Date(run.startedAt).toLocaleString()}
                          {run.completedAt && ` • Completed: ${new Date(run.completedAt).toLocaleString()}`}
                          {run.error && (
                            <Typography component="span" color="error" sx={{ display: 'block', mt: 0.5 }}>
                              Error: {run.error}
                            </Typography>
                          )}
                        </Typography>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton onClick={() => viewRunDetails(run)} color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Run">
                          <IconButton onClick={() => deleteRun(run.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < runs.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Run Details Dialog */}
      <Dialog 
        open={showRunDetails} 
        onClose={() => setShowRunDetails(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DataIcon />
            Run Details: {selectedRun?.workflowName}
            <Chip 
              label={selectedRun?.status} 
              color={getStatusColor(selectedRun?.status || '') as any}
              size="small"
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedRun && (
            <Box sx={{ mt: 2 }}>
              {/* Run Summary */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                    <Typography variant="body1">
                      {selectedRun.duration ? formatDuration(selectedRun.duration) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Nodes</Typography>
                    <Typography variant="body1">
                      {selectedRun.successfulNodes}/{selectedRun.nodeCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Started</Typography>
                    <Typography variant="body1">
                      {new Date(selectedRun.startedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                    <Typography variant="body1">
                      {selectedRun.completedAt ? new Date(selectedRun.completedAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Error Display */}
              {selectedRun.error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="body2">{selectedRun.error}</Typography>
                </Alert>
              )}

              {/* Final Result */}
              {selectedRun.finalResult && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ color: 'success.main' }}>
                      🎯 Final Result
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ 
                      bgcolor: 'grey.100', 
                      p: 2, 
                      borderRadius: 1, 
                      fontFamily: 'monospace', 
                      fontSize: '0.875rem',
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(selectedRun.finalResult, null, 2)}
                      </pre>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Step-by-Step Results */}
              {selectedRun.results && selectedRun.results.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      📋 Step-by-Step Results ({selectedRun.results.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedRun.results.map((result: any, index: number) => (
                        <Box 
                          key={index}
                          sx={{ 
                            border: 1, 
                            borderColor: 'divider', 
                            borderRadius: 1, 
                            p: 2,
                            bgcolor: result.success ? 'success.50' : 'error.50'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Chip label={`Step ${index + 1}`} size="small" color="primary" />
                            {result.success ? <SuccessIcon color="success" /> : <ErrorIcon color="error" />}
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              Node: {result.nodeId}
                            </Typography>
                          </Box>

                          {result.error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                              {result.error}
                            </Alert>
                          )}

                          {result.data && (
                            <Box sx={{ 
                              bgcolor: 'grey.100', 
                              p: 1, 
                              borderRadius: 1, 
                              fontFamily: 'monospace', 
                              fontSize: '0.75rem',
                              maxHeight: 200,
                              overflow: 'auto'
                            }}>
                              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowRunDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 