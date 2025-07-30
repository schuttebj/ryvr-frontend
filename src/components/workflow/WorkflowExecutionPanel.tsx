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
  open: boolean;
  onClose: () => void;
}

export default function WorkflowExecutionPanel({ nodes, open, onClose }: WorkflowExecutionPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<WorkflowExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

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

  // Execute workflow
  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      addLogMessage('❌ No nodes to execute');
      return;
    }

    setIsExecuting(true);
    setCurrentStepIndex(-1);
    setExecutionLog([]);
    addLogMessage('🚀 Starting workflow execution...');

    // Reset all steps to pending
    setExecutionSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0,
      result: undefined,
      error: undefined
    })));

    try {
      // Execute nodes in order (simple sequential execution for now)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const stepIndex = executionSteps.findIndex(step => step.nodeId === node.id);
        
        if (stepIndex === -1) continue;

        setCurrentStepIndex(i);
        
        // Update step to running
        setExecutionSteps(prev => prev.map((step, index) => 
          index === stepIndex 
            ? { ...step, status: 'running', startTime: new Date(), progress: 0 }
            : step
        ));

        addLogMessage(`📋 Executing node: ${node.data.label || node.id} (${node.data.type})`);

        try {
          // Execute the node
          const result = await executeNode(node);
          
          // Update step to completed
          setExecutionSteps(prev => prev.map((step, index) => 
            index === stepIndex 
              ? { 
                  ...step, 
                  status: 'completed', 
                  endTime: new Date(),
                  duration: new Date().getTime() - (step.startTime?.getTime() || 0),
                  result,
                  progress: 100
                }
              : step
          ));

          addLogMessage(`✅ Node completed: ${node.data.label || node.id}`);
          
          // Store result for variable system
          await workflowApi.storeNodeResult(node.id, {
            executionId: `exec_${Date.now()}`,
            nodeId: node.id,
            nodeType: node.data.type,
            status: 'success',
            executedAt: new Date().toISOString(),
            executionTime: new Date().getTime() - (executionSteps[stepIndex]?.startTime?.getTime() || 0),
            data: {
              processed: result,
              raw: result,
              summary: { result: result }
            },
            inputData: node.data.config || {},
            apiMetadata: {
              provider: 'workflow_execution',
              endpoint: '/api/v1/workflow/execute',
              creditsUsed: 0
            }
          });

        } catch (error: any) {
          // Update step to failed
          setExecutionSteps(prev => prev.map((step, index) => 
            index === stepIndex 
              ? { 
                  ...step, 
                  status: 'failed', 
                  endTime: new Date(),
                  duration: new Date().getTime() - (step.startTime?.getTime() || 0),
                  error: error.message,
                  progress: 0
                }
              : step
          ));

          addLogMessage(`❌ Node failed: ${node.data.label || node.id} - ${error.message}`);
        }

        // Small delay between nodes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      addLogMessage('🎉 Workflow execution completed!');
      
    } catch (error: any) {
      addLogMessage(`💥 Workflow execution failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
      setCurrentStepIndex(-1);
    }
  };

  // Execute individual node
  const executeNode = async (node: any): Promise<any> => {
    const nodeType = node.data.type;
    const config = node.data.config || {};

    addLogMessage(`🔧 Executing ${nodeType} node with config:`, config);

    switch (nodeType) {
      case WorkflowNodeType.SEO_SERP_ANALYZE:
        return await (workflowApi.executeNode as any)(nodeType, {
          keyword: config.keyword || 'Marketing',
          locationCode: config.locationCode || 2840,
          languageCode: config.languageCode || 'en',
          device: config.device || 'desktop',
          depth: config.depth || 10,
          organicOnly: config.organicOnly || false,
          resultType: config.resultType,
          dateRange: config.dateRange
        }, {}, node.id);

      case WorkflowNodeType.AI_OPENAI_TASK:
        return await (workflowApi.executeNode as any)(nodeType, {
          prompt: config.prompt || 'Generate content about marketing',
          model: config.model || 'gpt-3.5-turbo',
          maxTokens: config.maxTokens || 500
        }, {}, node.id);

      case WorkflowNodeType.DATA_FILTER:
        return await (workflowApi.executeNode as any)(nodeType, {
          data: config.data || [],
          filterType: config.filterType || 'contains',
          filterValue: config.filterValue || '',
          field: config.field || 'title'
        }, {}, node.id);

      default:
        // Mock execution for other node types
        addLogMessage(`🎭 Mock execution for ${nodeType} node`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
        return {
          status: 'success',
          data: `Mock result for ${nodeType}`,
          timestamp: new Date().toISOString()
        };
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Workflow Execution</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" gap={2} mb={2}>
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
          </Box>

          {isExecuting && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={(executionSteps.filter(s => s.status === 'completed').length / executionSteps.length) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Box>

        <Box display="flex" gap={2} sx={{ height: 400 }}>
          {/* Execution Steps */}
          <Paper sx={{ flex: 1, overflow: 'auto' }}>
            <Typography variant="subtitle1" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              Execution Steps
            </Typography>
            <List sx={{ p: 0 }}>
              {executionSteps.map((step, index) => (
                <React.Fragment key={step.nodeId}>
                  <ListItem 
                    sx={{ 
                      backgroundColor: currentStepIndex === index ? '#f0f8ff' : 'transparent',
                      borderLeft: currentStepIndex === index ? '4px solid #1976d2' : 'none'
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(step.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {nodes.find(n => n.id === step.nodeId)?.data?.label || step.nodeId}
                          </Typography>
                          <Chip 
                            label={step.status} 
                            size="small" 
                            color={getStatusColor(step.status) as any}
                          />
                          {step.duration && (
                            <Typography variant="caption" color="text.secondary">
                              ({step.duration}ms)
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={step.nodeType}
                    />
                    <IconButton 
                      size="small"
                      onClick={() => toggleStepExpansion(step.nodeId)}
                    >
                      {expandedSteps.has(step.nodeId) ? <CollapseIcon /> : <ExpandIcon />}
                    </IconButton>
                  </ListItem>
                  
                  <Collapse in={expandedSteps.has(step.nodeId)}>
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                      {step.error && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                          {step.error}
                        </Alert>
                      )}
                      {step.result && (
                        <Paper sx={{ p: 1, backgroundColor: '#f5f5f5' }}>
                          <Typography variant="caption" color="text.secondary">
                            Result:
                          </Typography>
                          <pre style={{ fontSize: '0.75rem', margin: '4px 0 0 0', overflow: 'auto' }}>
                            {JSON.stringify(step.result, null, 2)}
                          </pre>
                        </Paper>
                      )}
                    </Box>
                  </Collapse>
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Execution Log */}
          <Paper sx={{ flex: 1, overflow: 'auto' }}>
            <Typography variant="subtitle1" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              Execution Log
            </Typography>
            <Box sx={{ p: 2, height: 'calc(100% - 60px)', overflow: 'auto' }}>
              {executionLog.map((message, index) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    mb: 0.5,
                    wordBreak: 'break-word'
                  }}
                >
                  {message}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 