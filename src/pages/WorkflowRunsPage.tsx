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
  Divider,
  Tab,
  Tabs,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress
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
  Timeline as TimelineIcon,
  Assessment as ResultsIcon,
  Speed as PerformanceIcon,
  Download as ExportIcon,
  Close as CloseIcon,
  ListAlt as StepsIcon,
  TrendingUp as MetricsIcon
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
  const [activeTab, setActiveTab] = useState(0);

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
    setActiveTab(0); // Reset to Overview tab
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

  // Get node color based on type (same as in WorkflowBuilder)
  const getNodeColor = (nodeType: string): string => {
    if (nodeType?.startsWith('ai_')) return '#10B981';
    if (nodeType?.includes('google_analytics')) return '#FF6D01';
    if (nodeType?.includes('google_ads')) return '#34A853';
    if (nodeType?.startsWith('seo_')) return '#6366F1';
    if (nodeType?.startsWith('meta_')) return '#1877F2';
    if (nodeType === 'trigger') return '#9C27B0';
    if (nodeType === 'client_profile') return '#2196F3';
    return '#64748B';
  };

  // Export results
  const exportResults = (run: WorkflowRun) => {
    const exportData = {
      run: {
        id: run.id,
        workflowName: run.workflowName,
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        duration: run.duration
      },
      summary: {
        totalNodes: run.nodeCount,
        successfulNodes: run.successfulNodes,
        failedNodes: run.nodeCount - run.successfulNodes,
        successRate: ((run.successfulNodes / run.nodeCount) * 100).toFixed(1)
      },
      results: run.results,
      finalResult: run.finalResult
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-run-${run.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
                  onChange={(e: any) => setSelectedWorkflow(e.target.value)}
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

      {/* Enhanced Run Details Dialog */}
      <Dialog 
        open={showRunDetails} 
        onClose={() => setShowRunDetails(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ResultsIcon color="primary" />
              <Typography variant="h6">
                {selectedRun?.workflowName}
              </Typography>
              <Chip 
                label={selectedRun?.status} 
                color={getStatusColor(selectedRun?.status || '') as any}
                size="small"
              />
              {selectedRun && (
                <Chip 
                  label={`${((selectedRun.successfulNodes / selectedRun.nodeCount) * 100).toFixed(0)}% Success`}
                  color={selectedRun.successfulNodes === selectedRun.nodeCount ? "success" : 
                         selectedRun.successfulNodes > selectedRun.nodeCount / 2 ? "warning" : "error"}
                  size="small"
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedRun && (
                <Tooltip title="Export Results">
                  <IconButton onClick={() => exportResults(selectedRun)} size="small">
                    <ExportIcon />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton onClick={() => setShowRunDetails(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {selectedRun && (
            <>
              {/* Quick Stats Bar */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {selectedRun.successfulNodes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Successful Nodes
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error">
                        {selectedRun.nodeCount - selectedRun.successfulNodes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Failed Nodes
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="secondary">
                        {selectedRun.duration ? formatDuration(selectedRun.duration) : 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Duration
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success">
                        {((selectedRun.successfulNodes / selectedRun.nodeCount) * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Success Rate
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_: any, value: any) => setActiveTab(value)}>
                  <Tab label="Overview" icon={<MetricsIcon />} />
                  <Tab 
                    label="Step Details" 
                    icon={<StepsIcon />} 
                    disabled={!selectedRun.results || selectedRun.results.length === 0}
                  />
                  <Tab 
                    label="Final Result" 
                    icon={<ResultsIcon />} 
                    disabled={!selectedRun.finalResult}
                  />
                  <Tab label="Raw Data" icon={<DataIcon />} />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {/* Overview Tab */}
                {activeTab === 0 && (
                  <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
                    <Grid container spacing={3}>
                      {/* Execution Timeline */}
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TimelineIcon color="primary" />
                              Execution Timeline
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Started:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {new Date(selectedRun.startedAt).toLocaleString()}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Completed:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {selectedRun.completedAt ? new Date(selectedRun.completedAt).toLocaleString() : 'N/A'}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Duration:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {selectedRun.duration ? formatDuration(selectedRun.duration) : 'N/A'}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Avg. per Node:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {selectedRun.duration ? formatDuration(selectedRun.duration / selectedRun.nodeCount) : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Performance Metrics */}
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PerformanceIcon color="primary" />
                              Performance Breakdown
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Success Rate:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {((selectedRun.successfulNodes / selectedRun.nodeCount) * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={(selectedRun.successfulNodes / selectedRun.nodeCount) * 100}
                                sx={{ height: 8, borderRadius: 4 }}
                                color={selectedRun.successfulNodes === selectedRun.nodeCount ? "success" : "warning"}
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2">Total Nodes:</Typography>
                              <Typography variant="body2" fontWeight="bold">{selectedRun.nodeCount}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2">Failed Nodes:</Typography>
                              <Typography variant="body2" fontWeight="bold" color="error.main">
                                {selectedRun.nodeCount - selectedRun.successfulNodes}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Error Display */}
                      {selectedRun.error && (
                        <Grid item xs={12}>
                          <Alert severity="error">
                            <Typography variant="h6" gutterBottom>Execution Error</Typography>
                            <Typography variant="body2">{selectedRun.error}</Typography>
                          </Alert>
                        </Grid>
                      )}

                      {/* Results Summary Table */}
                      {selectedRun.results && selectedRun.results.length > 0 && (
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" sx={{ mb: 2 }}>
                                📊 Node Execution Summary
                              </Typography>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Step</TableCell>
                                      <TableCell>Node ID</TableCell>
                                      <TableCell>Type</TableCell>
                                      <TableCell>Status</TableCell>
                                      <TableCell>Has Data</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {selectedRun.results.map((result: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <Chip label={`${index + 1}`} size="small" color="primary" />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {result.nodeId || `Step ${index + 1}`}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={result.nodeType || 'Unknown'}
                                            size="small"
                                            sx={{ 
                                              bgcolor: getNodeColor(result.nodeType || ''), 
                                              color: 'white',
                                              fontSize: '0.7rem'
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={result.success ? "Success" : "Failed"} 
                                            color={result.success ? "success" : "error"} 
                                            size="small" 
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {result.data ? (
                                            <Chip label="✓ Yes" color="info" size="small" />
                                          ) : (
                                            <Chip label="✗ No" color="default" size="small" />
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}

                {/* Step Details Tab */}
                {activeTab === 1 && selectedRun.results && selectedRun.results.length > 0 && (
                  <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
                    <Grid container spacing={2}>
                      {selectedRun.results.map((result: any, index: number) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: getNodeColor(result.nodeType || ''), 
                                    width: 32, 
                                    height: 32 
                                  }}
                                >
                                  {result.success ? <SuccessIcon /> : <ErrorIcon />}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                    Step {index + 1}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {result.nodeId || 'Unknown Node'}
                                  </Typography>
                                </Box>
                                <Box sx={{ ml: 'auto' }}>
                                  <Chip 
                                    label={result.success ? "Success" : "Failed"} 
                                    color={result.success ? "success" : "error"} 
                                    size="small" 
                                  />
                                </Box>
                              </Box>

                              {result.error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                  <Typography variant="body2">{result.error}</Typography>
                                </Alert>
                              )}

                              {result.data && (
                                <Accordion>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="body2">View Result Data</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Paper sx={{ p: 1, backgroundColor: '#f8f9fa', overflow: 'auto', maxHeight: 300 }}>
                                      <pre style={{ fontSize: '0.7rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(result.data, null, 2)}
                                      </pre>
                                    </Paper>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Final Result Tab */}
                {activeTab === 2 && selectedRun.finalResult && (
                  <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          🎯 Workflow Final Output
                        </Typography>
                        <Paper sx={{ 
                          p: 2, 
                          backgroundColor: '#f8f9fa', 
                          overflow: 'auto', 
                          maxHeight: '60vh',
                          fontFamily: 'monospace'
                        }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                            {JSON.stringify(selectedRun.finalResult, null, 2)}
                          </pre>
                        </Paper>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {/* Raw Data Tab */}
                {activeTab === 3 && (
                  <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DataIcon />
                          Complete Run Data
                        </Typography>
                        <Paper sx={{ 
                          p: 2, 
                          backgroundColor: '#f8f9fa', 
                          overflow: 'auto', 
                          maxHeight: '60vh',
                          fontFamily: 'monospace'
                        }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                            {JSON.stringify(selectedRun, null, 2)}
                          </pre>
                        </Paper>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}; 