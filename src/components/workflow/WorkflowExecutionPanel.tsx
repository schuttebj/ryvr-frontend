import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Collapse,
  Alert,
  Tab,
  Tabs,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  DataObject as DataIcon,
  Timeline as TimelineIcon,
  Assessment as ResultsIcon,
  Download as ExportIcon,
  Visibility as ViewIcon,
  Speed as PerformanceIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { workflowApi } from '../../services/workflowApi';
import { WorkflowNodeType } from '../../types/workflow';

interface WorkflowExecutionStep {
  nodeId: string;
  nodeType: WorkflowNodeType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  result?: any;
  error?: string;
  progress?: number;
}

interface WorkflowExecutionPanelProps {
  nodes: any[];
  edges: any[];
  open: boolean;
  onClose: () => void;
}

export default function WorkflowExecutionPanel({ nodes, edges, open, onClose }: WorkflowExecutionPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<WorkflowExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(0);
  const [workflowResults, setWorkflowResults] = useState<any[]>([]);
  const [executionSummary, setExecutionSummary] = useState<any>(null);

  // Initialize execution steps from nodes
  useEffect(() => {
    if (nodes.length > 0) {
      const steps: WorkflowExecutionStep[] = nodes.map(node => ({
        nodeId: node.id,
        nodeType: node.data.type,
        status: 'pending',
        progress: 0
      }));
      setExecutionSteps(steps);
    }
  }, [nodes]);

  // Add log message
  const addLogMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Toggle step expansion
  const toggleStepExpansion = (nodeId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Execute workflow using the proper workflowApi
  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      addLogMessage('❌ No nodes to execute');
      return;
    }

    setIsExecuting(true);
    setCurrentStepIndex(-1);
    setExecutionLog([]);
    addLogMessage('🚀 Starting workflow execution with proper flow order...');

    // Reset all steps to pending
    setExecutionSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0,
      result: undefined,
      error: undefined
    })));

    try {
      // Create a proper workflow object with edges
      const workflowData = {
        id: `temp_workflow_${Date.now()}`,
        name: 'Test Execution',
        nodes: nodes,
        edges: edges || [], // Include edges for proper flow order
        isActive: true
      };

      addLogMessage(`📋 Executing workflow with ${nodes.length} nodes and ${edges.length} edges...`);
      addLogMessage(`🔗 Flow order will be determined by node connections`);

      const startTime = Date.now();

      // Use the proper workflowApi.executeWorkflow that follows edges
      const workflowResult = await workflowApi.executeWorkflow(workflowData.id, workflowData);

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      if (workflowResult.status === 'completed') {
        addLogMessage(`🎉 Workflow execution completed successfully in ${totalDuration}ms!`);

        // Update execution steps based on the results
        if (workflowResult.results && workflowResult.results.length > 0) {
          workflowResult.results.forEach((result: any) => {
            const stepIndex = executionSteps.findIndex(step => step.nodeId === result.nodeId);
            if (stepIndex !== -1) {
              setExecutionSteps(prev => prev.map((step, idx) => 
                idx === stepIndex 
                  ? { 
                      ...step, 
                      status: result.success ? 'completed' : 'failed',
                      endTime: new Date(),
                      duration: result.executionTime || Math.floor(totalDuration / workflowResult.results.length),
                      result: result.data,
                      error: result.error,
                      progress: result.success ? 100 : 0
                    }
                  : step
              ));

              addLogMessage(result.success 
                ? `✅ Node completed: ${result.nodeId} (${result.nodeType})` 
                : `❌ Node failed: ${result.nodeId} - ${result.error}`
              );
            }
          });

          // Set results for display
          const displayResults = workflowResult.results.map((result: any) => ({
            nodeId: result.nodeId,
            nodeType: result.nodeType,
            nodeLabel: nodes.find(n => n.id === result.nodeId)?.data?.label || result.nodeId,
            result: result.data,
            duration: result.executionTime || Math.floor(totalDuration / workflowResult.results.length),
            timestamp: new Date()
          }));

          setWorkflowResults(displayResults);

          // Generate summary
          const summary = {
            totalNodes: workflowResult.results.length,
            completedNodes: workflowResult.results.filter((r: any) => r.success).length,
            failedNodes: workflowResult.results.filter((r: any) => !r.success).length,
            totalDuration: totalDuration,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            successRate: (workflowResult.results.filter((r: any) => r.success).length / workflowResult.results.length) * 100
          };

          setExecutionSummary(summary);
          addLogMessage(`📊 Summary: ${summary.completedNodes}/${summary.totalNodes} nodes completed (${summary.successRate.toFixed(1)}% success rate)`);
        } else {
          addLogMessage('⚠️ No results returned from workflow execution');
        }
      } else {
        addLogMessage(`💥 Workflow execution failed: ${workflowResult.error_message || 'Unknown error'}`);
        
        // Mark all steps as failed if overall workflow failed
        setExecutionSteps(prev => prev.map(step => ({
          ...step,
          status: 'failed',
          error: workflowResult.error_message,
          endTime: new Date(),
          progress: 0
        })));
      }
      
    } catch (error: any) {
      addLogMessage(`💥 Workflow execution failed: ${error.message}`);
      console.error('Workflow execution error:', error);
      
      // Mark all steps as failed
      setExecutionSteps(prev => prev.map(step => ({
        ...step,
        status: 'failed',
        error: error.message,
        endTime: new Date(),
        progress: 0
      })));
    } finally {
      setIsExecuting(false);
      setCurrentStepIndex(-1);
    }
  };

  // Stop execution
  const stopExecution = () => {
    setIsExecuting(false);
    setCurrentStepIndex(-1);
    addLogMessage('⏹️ Workflow execution stopped by user');
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <SuccessIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'running': return <RefreshIcon color="primary" />;
      case 'pending': return <PendingIcon color="disabled" />;
      default: return <PendingIcon color="disabled" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'primary';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Export results
  const exportResults = () => {
    const exportData = {
      workflow: {
        nodes: nodes.length,
        executedAt: new Date().toISOString()
      },
      summary: executionSummary,
      results: workflowResults,
      steps: executionSteps
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get node color based on type (same as in WorkflowBuilder)
  const getNodeColor = (nodeType: string): string => {
    if (nodeType.startsWith('ai_')) return '#10B981';
    if (nodeType.includes('google_analytics')) return '#FF6D01';
    if (nodeType.includes('google_ads')) return '#34A853';
    if (nodeType.startsWith('seo_')) return '#6366F1';
    if (nodeType.startsWith('meta_')) return '#1877F2';
    if (nodeType === 'trigger') return '#9C27B0';
    if (nodeType === 'client_profile') return '#2196F3';
    return '#64748B';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Workflow Execution</Typography>
            {executionSummary && (
              <Chip 
                label={`${executionSummary.successRate.toFixed(0)}% Success`}
                color={executionSummary.successRate === 100 ? "success" : executionSummary.successRate > 50 ? "warning" : "error"}
                size="small"
              />
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {workflowResults.length > 0 && (
              <Tooltip title="Export Results">
                <IconButton onClick={exportResults} size="small">
                  <ExportIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Control Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box display="flex" gap={2} mb={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={isExecuting ? <StopIcon /> : <PlayIcon />}
              onClick={isExecuting ? stopExecution : executeWorkflow}
              disabled={nodes.length === 0}
              color={isExecuting ? "error" : "primary"}
            >
              {isExecuting ? 'Stop Execution' : 'Execute Workflow'}
            </Button>
            
            <Chip 
              label={`${executionSteps.filter(s => s.status === 'completed').length}/${executionSteps.length} completed`}
              color="info"
              variant="outlined"
            />

            {executionSummary && (
              <Chip 
                label={`${formatDuration(executionSummary.totalDuration)} total`}
                color="default"
                variant="outlined"
                icon={<TimelineIcon />}
              />
            )}
          </Box>

          {isExecuting && (
            <LinearProgress 
              variant="determinate" 
              value={(executionSteps.filter(s => s.status === 'completed').length / executionSteps.length) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
            <Tab label="Execution" icon={<TimelineIcon />} />
            <Tab 
              label="Results" 
              icon={<ResultsIcon />} 
              disabled={workflowResults.length === 0}
            />
            <Tab 
              label="Summary" 
              icon={<PerformanceIcon />} 
              disabled={!executionSummary}
            />
            <Tab label="Logs" icon={<DataIcon />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {/* Execution Tab */}
          {activeTab === 0 && (
            <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
              <List sx={{ p: 0 }}>
                {executionSteps.map((step, index) => (
                  <React.Fragment key={step.nodeId}>
                    <ListItem 
                      sx={{ 
                        backgroundColor: currentStepIndex === index ? '#f0f8ff' : 'transparent',
                        borderLeft: `4px solid ${currentStepIndex === index ? '#1976d2' : getNodeColor(step.nodeType)}`,
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: getNodeColor(step.nodeType), 
                            width: 32, 
                            height: 32 
                          }}
                        >
                          {getStatusIcon(step.status)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight={500}>
                              {nodes.find(n => n.id === step.nodeId)?.data?.label || step.nodeId}
                            </Typography>
                            <Chip 
                              label={step.status} 
                              size="small" 
                              color={getStatusColor(step.status) as any}
                            />
                            {step.duration && (
                              <Chip
                                label={formatDuration(step.duration)}
                                size="small"
                                variant="outlined"
                                icon={<TimeIcon />}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {step.nodeType.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                        }
                      />
                      <IconButton 
                        size="small"
                        onClick={() => toggleStepExpansion(step.nodeId)}
                      >
                        {expandedSteps.has(step.nodeId) ? <CollapseIcon /> : <ExpandIcon />}
                      </IconButton>
                    </ListItem>
                    
                    <Collapse in={expandedSteps.has(step.nodeId)}>
                      <Box sx={{ pl: 6, pr: 2, pb: 2 }}>
                        {step.error && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="body2">{step.error}</Typography>
                          </Alert>
                        )}
                        {step.result && (
                          <Card>
                            <CardContent>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                🔍 Execution Result
                              </Typography>
                              <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', overflow: 'auto', maxHeight: 300 }}>
                                <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {JSON.stringify(step.result, null, 2)}
                                </pre>
                              </Paper>
                            </CardContent>
                          </Card>
                        )}
                      </Box>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {/* Results Tab */}
          {activeTab === 1 && workflowResults.length > 0 && (
            <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
              <Grid container spacing={2}>
                {workflowResults.map((result) => (
                  <Grid item xs={12} md={6} key={result.nodeId}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Avatar 
                            sx={{ 
                              bgcolor: getNodeColor(result.nodeType), 
                              width: 32, 
                              height: 32 
                            }}
                          >
                            <DataIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                              {result.nodeLabel}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {result.nodeType.replace(/_/g, ' ')} • {formatDuration(result.duration || 0)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandIcon />}>
                            <Typography variant="body2">View Result Data</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Paper sx={{ p: 1, backgroundColor: '#f8f9fa', overflow: 'auto', maxHeight: 200 }}>
                              <pre style={{ fontSize: '0.7rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(result.result, null, 2)}
                              </pre>
                            </Paper>
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Summary Tab */}
          {activeTab === 2 && executionSummary && (
            <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PerformanceIcon color="primary" />
                        Execution Overview
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h3" color="primary">
                              {executionSummary.completedNodes}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Completed
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h3" color="error">
                              {executionSummary.failedNodes}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Failed
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimelineIcon color="primary" />
                        Performance Metrics
                      </Typography>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Success Rate:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {executionSummary.successRate.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Total Duration:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatDuration(executionSummary.totalDuration)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Avg. per Node:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatDuration(executionSummary.totalDuration / executionSummary.totalNodes)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {workflowResults.length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          📊 Results Summary
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Node</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {workflowResults.map((result) => (
                                <TableRow key={result.nodeId}>
                                  <TableCell>{result.nodeLabel}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={result.nodeType.replace(/_/g, ' ')}
                                      size="small"
                                      sx={{ bgcolor: getNodeColor(result.nodeType), color: 'white' }}
                                    />
                                  </TableCell>
                                  <TableCell>{formatDuration(result.duration || 0)}</TableCell>
                                  <TableCell>
                                    <Chip label="Success" color="success" size="small" />
                                  </TableCell>
                                  <TableCell>
                                    <IconButton 
                                      size="small"
                                      onClick={() => {
                                        setActiveTab(1);
                                        toggleStepExpansion(result.nodeId);
                                      }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
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

          {/* Logs Tab */}
          {activeTab === 3 && (
            <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
              <Paper sx={{ p: 2, height: '100%', backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DataIcon />
                  Execution Logs
                </Typography>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {executionLog.map((message, index) => (
                    <Typography 
                      key={index} 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        mb: 0.5,
                        wordBreak: 'break-word',
                        color: message.includes('❌') ? 'error.main' : 
                               message.includes('✅') ? 'success.main' :
                               message.includes('🎉') ? 'primary.main' : 'text.primary'
                      }}
                    >
                      {message}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
} 