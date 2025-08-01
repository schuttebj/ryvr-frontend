import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate } from 'react-router-dom';

import { WorkflowNodeData, WorkflowNodeType } from '../../types/workflow';
import NodeSettingsPanel from './NodeSettingsPanel';
import ValidationResultsDialog from './ValidationResultsDialog';
import WorkflowExecutionPanel from './WorkflowExecutionPanel';
import BaseNode from './BaseNode';
import { workflowApi } from '../../services/workflowApi';

// Custom node components
const TriggerNode = (props: any) => <BaseNode {...props} nodeType="trigger" />;
const SerpNode = (props: any) => <BaseNode {...props} nodeType="serp" />;
const AiNode = (props: any) => <BaseNode {...props} nodeType="ai" />;
const EmailNode = (props: any) => <BaseNode {...props} nodeType="email" />;

const nodeTypes = {
  trigger: TriggerNode,
  serp: SerpNode,
  ai: AiNode,
  email: EmailNode,
};

interface WorkflowBuilderProps {
  onSave?: (workflow: any) => Promise<void>;
  workflowId?: string; // Optional workflow ID for editing existing workflows
}

interface NodePaletteItem {
  type: WorkflowNodeType;
  label: string;
  description: string;
  category: string;
}

const nodePaletteItems: NodePaletteItem[] = [
  // Triggers
  {
    type: WorkflowNodeType.TRIGGER,
    label: 'Manual Trigger',
    description: 'Start workflow manually',
    category: 'Triggers'
  },
  
  // AI Tools
  {
    type: WorkflowNodeType.AI_OPENAI_TASK,
    label: 'OpenAI Task',
    description: 'Unified OpenAI task with custom prompts',
    category: 'AI Tools'
  },
  {
    type: WorkflowNodeType.CONTENT_EXTRACT,
    label: 'Extract Content',
    description: 'Extract content from web pages',
    category: 'Content'
  },
  
  // SERP Analysis
  {
    type: WorkflowNodeType.SEO_SERP_ANALYZE,
    label: 'SERP Analysis',
    description: 'Analyze search results',
    category: 'SERP'
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_ORGANIC,
    label: 'Google Organic',
    description: 'Google organic search results',
    category: 'SERP'
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_ADS,
    label: 'Google Ads',
    description: 'Google ads search results',
    category: 'SERP'
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_IMAGES,
    label: 'Google Images',
    description: 'Google image search results',
    category: 'SERP'
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_NEWS,
    label: 'Google News',
    description: 'Google news search results',
    category: 'SERP'
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_MAPS,
    label: 'Google Maps',
    description: 'Google maps search results',
    category: 'SERP'
  },
  
  // Keywords
  {
    type: WorkflowNodeType.SEO_KEYWORDS_VOLUME,
    label: 'Search Volume',
    description: 'Get keyword search volume',
    category: 'Keywords'
  },
  {
    type: WorkflowNodeType.SEO_KEYWORDS_GOOGLE_ADS,
    label: 'Google Ads Keywords',
    description: 'Google Ads keyword data',
    category: 'Keywords'
  },
  {
    type: WorkflowNodeType.SEO_KEYWORDS_SITE,
    label: 'Site Keywords',
    description: 'Keywords for specific site',
    category: 'Keywords'
  },
  {
    type: WorkflowNodeType.SEO_KEYWORDS_SUGGESTIONS,
    label: 'Keyword Suggestions',
    description: 'Get keyword suggestions',
    category: 'Keywords'
  },
  
  // DataForSEO Labs
  {
    type: WorkflowNodeType.SEO_LABS_RANKED_KEYWORDS,
    label: 'Ranked Keywords',
    description: 'Domain ranked keywords',
    category: 'Labs'
  },
  {
    type: WorkflowNodeType.SEO_LABS_SERP_COMPETITORS,
    label: 'SERP Competitors',
    description: 'Find SERP competitors',
    category: 'Labs'
  },
  {
    type: WorkflowNodeType.SEO_LABS_RELATED_KEYWORDS,
    label: 'Related Keywords',
    description: 'Find related keywords',
    category: 'Labs'
  },
  {
    type: WorkflowNodeType.SEO_LABS_SEARCH_INTENT,
    label: 'Search Intent',
    description: 'Analyze search intent',
    category: 'Labs'
  },
  
  // Backlinks
  {
    type: WorkflowNodeType.SEO_BACKLINKS_OVERVIEW,
    label: 'Backlinks Overview',
    description: 'Domain backlinks overview',
    category: 'Backlinks'
  },
  {
    type: WorkflowNodeType.SEO_BACKLINKS_ANCHORS,
    label: 'Anchor Texts',
    description: 'Backlink anchor analysis',
    category: 'Backlinks'
  },
  {
    type: WorkflowNodeType.SEO_BACKLINKS_REFERRING_DOMAINS,
    label: 'Referring Domains',
    description: 'Referring domains analysis',
    category: 'Backlinks'
  },
  
  // On-Page
  {
    type: WorkflowNodeType.SEO_ONPAGE_SUMMARY,
    label: 'On-Page Summary',
    description: 'Website on-page analysis',
    category: 'On-Page'
  },
  {
    type: WorkflowNodeType.SEO_ONPAGE_PAGES,
    label: 'Page Analysis',
    description: 'Individual page analysis',
    category: 'On-Page'
  },
  {
    type: WorkflowNodeType.SEO_ONPAGE_LIGHTHOUSE,
    label: 'Lighthouse Audit',
    description: 'Google Lighthouse audit',
    category: 'On-Page'
  },
  
  // Content Analysis
  {
    type: WorkflowNodeType.SEO_CONTENT_ANALYSIS,
    label: 'Content Analysis',
    description: 'Analyze content performance',
    category: 'Content'
  },
  {
    type: WorkflowNodeType.SEO_CONTENT_SENTIMENT,
    label: 'Sentiment Analysis',
    description: 'Content sentiment analysis',
    category: 'Content'
  },
  
  // Client Data
  {
    type: WorkflowNodeType.CLIENT_PROFILE,
    label: 'Client Profile',
    description: 'Load client data and business profile',
    category: 'Client Data'
  },
  
  // Actions
  {
    type: WorkflowNodeType.EMAIL,
    label: 'Send Email',
    description: 'Send email notification',
    category: 'Actions'
  }
];

export default function WorkflowBuilder({ onSave, workflowId }: WorkflowBuilderProps) {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [settingsNode, setSettingsNode] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [activating, setActivating] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  
  // Track the current workflow ID to fix autosave creating new workflows
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(workflowId || null);
  
  // Auto-save timer
  const autoSaveTimer = useRef<number | null>(null);
  const lastSavedState = useRef<string>('');

  // Load existing workflow data when editing
  useEffect(() => {
    const loadWorkflow = async () => {
      if (workflowId) {
        try {
          console.log('Loading workflow for editing:', workflowId);
          const workflow = await workflowApi.loadWorkflow(workflowId);
          
          if (workflow) {
            setWorkflowName(workflow.name || '');
            setWorkflowDescription(workflow.description || '');
            setWorkflowActive(workflow.isActive || false);
            
            if (workflow.nodes) {
              setNodes(workflow.nodes);
            }
            
            if (workflow.edges) {
              setEdges(workflow.edges);
            }
            
            // Set initial saved state to prevent immediate auto-save
            lastSavedState.current = JSON.stringify({ 
              nodes: workflow.nodes || [], 
              edges: workflow.edges || [], 
              workflowName: workflow.name || '', 
              workflowDescription: workflow.description || '' 
            });
            
            setHasUnsavedChanges(false);
            console.log('Workflow loaded successfully:', workflow);
          }
        } catch (error) {
          console.error('Failed to load workflow:', error);
        }
      }
    };

    loadWorkflow();
  }, [workflowId, setNodes, setEdges]);

  // Track changes to nodes and edges
  useEffect(() => {
    const currentState = JSON.stringify({ nodes, edges, workflowName, workflowDescription });
    if (currentState !== lastSavedState.current && lastSavedState.current !== '') {
      setHasUnsavedChanges(true);
      
      // Auto-save after 2 seconds of no changes
      if (autoSaveEnabled && (workflowName || nodes.length > 0)) {
        if (autoSaveTimer.current) {
          clearTimeout(autoSaveTimer.current);
        }
        autoSaveTimer.current = setTimeout(() => {
          handleAutoSave();
        }, 2000);
      }
    }
  }, [nodes, edges, workflowName, workflowDescription, autoSaveEnabled]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || (!workflowName && nodes.length === 0)) return;
    
    try {
      // Use currentWorkflowId if available, otherwise workflowId, otherwise generate new ID
      const workflowIdToUse = currentWorkflowId || workflowId || `workflow_${Date.now()}`;
      
      const workflow = {
        id: workflowIdToUse,
        name: workflowName || `Untitled Workflow ${new Date().toLocaleTimeString()}`,
        description: workflowDescription,
        nodes,
        edges,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
      };

      if (onSave) {
        await onSave(workflow);
        
        // Update currentWorkflowId if this was a new workflow
        if (!currentWorkflowId && !workflowId) {
          setCurrentWorkflowId(workflowIdToUse);
        }
        
        setHasUnsavedChanges(false);
        lastSavedState.current = JSON.stringify({ nodes, edges, workflowName, workflowDescription });
        setSnackbarMessage('Workflow auto-saved');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [nodes, edges, workflowName, workflowDescription, hasUnsavedChanges, onSave, workflowId, currentWorkflowId]);

  const handleClose = () => {
    if (hasUnsavedChanges && !autoSaveEnabled) {
      setShowCloseDialog(true);
    } else if (hasUnsavedChanges && autoSaveEnabled) {
      // Auto-save before closing
      handleAutoSave().then(() => {
        navigate('/workflows');
      });
    } else {
      navigate('/workflows');
    }
  };

  const handleCloseConfirm = async (saveChanges: boolean) => {
    if (saveChanges) {
      await handleAutoSave();
    }
    setShowCloseDialog(false);
    navigate('/workflows');
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `edge-${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        type: 'default',
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      const position = {
        x: event.clientX - 300, // Adjust for sidebar width
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType === 'trigger' ? 'trigger' : nodeType === 'serp' ? 'serp' : nodeType === 'ai' ? 'ai' : 'email',
        position,
        data: {
          id: `${nodeType}-${Date.now()}`,
          type: nodeType as WorkflowNodeType,
          label: nodePaletteItems.find(item => item.type === nodeType)?.label || nodeType,
          description: nodePaletteItems.find(item => item.type === nodeType)?.description || '',
          config: {},
          isValid: true,
        } as unknown as Record<string, unknown>,
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSettingsNode(node);
  };

  const handleSettingsSave = (nodeId: string, updatedData: WorkflowNodeData) => {
    setNodes((nds: Node[]) =>
      nds.map((node: Node) =>
        node.id === nodeId
          ? {
              ...node,
              data: updatedData as unknown as Record<string, unknown>,
            }
          : node
      )
    );
    setSettingsNode(null);
  };

  const handleNodeDelete = (nodeId: string) => {
    setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== nodeId));
    setEdges((eds: Edge[]) => eds.filter((edge: Edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSettingsNode(null);
  };

  const handleSaveWorkflow = () => {
    // If editing existing workflow (workflowId exists), save directly
    if (workflowId) {
      handleSaveConfirm();
    } else {
      // For new workflows, open dialog to get name/description
      setSaveDialogOpen(true);
    }
  };

  const handleSaveConfirm = async () => {
    // Use currentWorkflowId if available, otherwise workflowId, otherwise generate new ID
    const workflowIdToUse = currentWorkflowId || workflowId || `workflow_${Date.now()}`;
    
    const workflow = {
      id: workflowIdToUse,
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };

    if (onSave) {
      await onSave(workflow);
      
      // Update currentWorkflowId if this was a new workflow
      if (!currentWorkflowId && !workflowId) {
        setCurrentWorkflowId(workflowIdToUse);
      }
      
      setHasUnsavedChanges(false);
      lastSavedState.current = JSON.stringify({ nodes, edges, workflowName, workflowDescription });
      setSnackbarMessage('Workflow saved successfully');
      setSnackbarOpen(true);
    }

    setSaveDialogOpen(false);
    // Don't reset name and description when editing existing workflow
    if (!workflowId && !currentWorkflowId) {
      setWorkflowName('');
      setWorkflowDescription('');
    }
  };

  const handleValidateWorkflow = async () => {
    setValidating(true);
    setValidationResult(null);
    
    try {
      const workflow = {
        id: workflowId || 'temp',
        name: workflowName || 'Untitled Workflow',
        description: workflowDescription || '',
        nodes,
        edges,
        isActive: false,
      };

      const { workflowApi } = await import('../../services/workflowApi');
      const validation = await workflowApi.validateWorkflow(workflow);
      
      setValidationResult(validation);
      setShowValidationDialog(true);
      
      if (validation.isValid) {
        setSnackbarMessage(`✅ Workflow validation passed ${validation.warnings.length > 0 ? 'with warnings' : 'successfully'}!`);
      } else {
        setSnackbarMessage(`❌ Workflow validation failed with ${validation.errors.length} error(s)`);
      }
      setSnackbarOpen(true);
      
    } catch (error: any) {
      console.error('Validation failed:', error);
      setSnackbarMessage(`❌ Validation failed: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setValidating(false);
    }
  };

  const handleActivateWorkflow = async () => {
    if (!workflowId) {
      setSnackbarMessage('Please save the workflow before activating');
      setSnackbarOpen(true);
      return;
    }

    setActivating(true);
    
    try {
      const { workflowApi } = await import('../../services/workflowApi');
      const result = await workflowApi.activateWorkflow(workflowId);
      
      if (result.success) {
        setSnackbarMessage('🚀 Workflow activated successfully!');
        setValidationResult(result.validation);
        setWorkflowActive(true);
        // Trigger a refresh of workflow status
        if (onSave) {
          await onSave(result.workflow);
        }
      } else {
        setSnackbarMessage(`❌ Failed to activate: ${result.error}`);
      }
      setSnackbarOpen(true);
      
    } catch (error: any) {
      console.error('Activation failed:', error);
      setSnackbarMessage(`❌ Activation failed: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setActivating(false);
    }
  };

  const handleDeactivateWorkflow = async () => {
    if (!workflowId) return;

    setActivating(true);
    
    try {
      const { workflowApi } = await import('../../services/workflowApi');
      const result = await workflowApi.deactivateWorkflow(workflowId);
      
      if (result.success) {
        setSnackbarMessage('⏸️ Workflow deactivated');
        setWorkflowActive(false);
        // Trigger a refresh of workflow status
        if (onSave) {
          await onSave(result.workflow);
        }
      } else {
        setSnackbarMessage(`❌ Failed to deactivate: ${result.error}`);
      }
      setSnackbarOpen(true);
      
    } catch (error: any) {
      console.error('Deactivation failed:', error);
      setSnackbarMessage(`❌ Deactivation failed: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setActivating(false);
    }
  };

  const createTestWorkflow = () => {
    const testNodes: Node[] = [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          id: 'trigger-1',
          type: WorkflowNodeType.TRIGGER,
          label: 'Manual Start',
          description: 'Manual trigger to start the workflow',
          config: { triggerType: 'manual' },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'serp-1',
        type: 'serp',
        position: { x: 300, y: 100 },
        data: {
          id: 'serp-1',
          type: WorkflowNodeType.SEO_SERP_ANALYZE,
          label: 'SERP Analysis',
          description: 'Analyze search engine results',
          config: { keyword: 'example keyword', locationCode: 2840, languageCode: 'en' },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'content-1',
        type: 'content',
        position: { x: 500, y: 100 },
        data: {
          id: 'content-1',
          type: WorkflowNodeType.CONTENT_EXTRACT,
          label: 'Extract Content',
          description: 'Extract content from SERP result URLs',
          config: { 
            inputMapping: 'serp_results.results[0].items[*].url',
            extractionType: 'full_text',
            outputFormat: 'text'
          },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
    ];

    const testEdges: Edge[] = [
      { id: 'e1-2', source: 'trigger-1', target: 'serp-1' },
      { id: 'e2-3', source: 'serp-1', target: 'ai-1' },
      { id: 'e3-4', source: 'ai-1', target: 'ai-2' },
    ];

    setNodes(testNodes);
    setEdges(testEdges);
    setWorkflowName('Test Workflow: SERP → AI Analysis → Summary');
    setWorkflowDescription('Sample workflow demonstrating SERP analysis followed by AI processing');
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <ReactFlowProvider>
      <Box
        sx={{
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : 'calc(100vh - 120px)',
          zIndex: isFullscreen ? 9999 : 'auto',
          backgroundColor: 'white',
          display: 'flex',
        }}
      >
        {/* Left Sidebar - Node Palette */}
        <Paper sx={{
          width: 280,
          borderRadius: 0,
          borderRight: '1px solid #e0e0e0',
          overflow: 'auto',
          flexShrink: 0
        }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Workflow Nodes
            </Typography>
            
            {/* Workflow Controls */}
            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={createTestWorkflow}
                sx={{ mb: 1 }}
              >
                Create Test Flow
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveWorkflow}
                color={hasUnsavedChanges ? "warning" : "primary"}
                sx={{ mb: 1 }}
              >
                {hasUnsavedChanges ? 'Save Changes' : 'Save Workflow'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PlayIcon />}
                onClick={() => setShowExecutionPanel(true)}
                disabled={nodes.length === 0}
                color="success"
                sx={{ mb: 1 }}
              >
                Test Full Flow
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={validating ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                onClick={handleValidateWorkflow}
                disabled={validating || nodes.length === 0}
                color="info"
                sx={{ mb: 1 }}
              >
                {validating ? 'Validating...' : 'Validate Workflow'}
              </Button>
              
              {workflowId && (
                <Button
                  fullWidth
                  variant={workflowActive ? "contained" : "outlined"}
                  startIcon={activating ? <CircularProgress size={16} /> : (workflowActive ? <StopIcon /> : <PlayArrowIcon />)}
                  onClick={workflowActive ? handleDeactivateWorkflow : handleActivateWorkflow}
                  disabled={activating || !workflowId}
                  color={workflowActive ? "success" : "primary"}
                  sx={{ mb: 1 }}
                >
                  {activating ? 'Processing...' : (workflowActive ? 'Deactivate' : 'Activate Workflow')}
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Node Categories */}
            {['Triggers', 'AI Tools', 'SERP', 'Keywords', 'Labs', 'Backlinks', 'On-Page', 'Content', 'Client Data', 'Actions'].map((category) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {category}
                </Typography>
                {nodePaletteItems
                  .filter(item => item.category === category)
                  .map((item) => (
                    <Paper
                      key={item.type}
                      elevation={1}
                      draggable
                      onDragStart={(event) => onDragStart(event, item.type)}
                      sx={{
                        p: 2,
                        mb: 1,
                        cursor: 'grab',
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          borderColor: '#1976d2',
                        },
                        '&:active': {
                          cursor: 'grabbing',
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Paper>
                  ))}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Main Canvas Area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: '#fafafa' }}
          >
            <Background />
            <Controls />
            <MiniMap />
            
            {/* Top Controls Panel */}
            <Panel position="top-right">
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {hasUnsavedChanges && (
                  <Tooltip title="You have unsaved changes">
                    <WarningIcon color="warning" fontSize="small" />
                  </Tooltip>
                )}
                
                <Tooltip title={autoSaveEnabled ? "Auto-save enabled" : "Auto-save disabled"}>
                  <Button
                    size="small"
                    variant={autoSaveEnabled ? "contained" : "outlined"}
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Auto
                  </Button>
                </Tooltip>
                
                <Tooltip title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                  <IconButton
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    size="small"
                    sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Close builder">
                  <IconButton
                    onClick={handleClose}
                    size="small"
                    sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Panel>

            {/* Auto-save Status */}
            {autoSaveEnabled && (
              <Panel position="bottom-right">
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  padding: '4px 8px', 
                  borderRadius: 1,
                  fontSize: '12px',
                  color: 'text.secondary'
                }}>
                  {hasUnsavedChanges ? 'Auto-saving...' : 'All changes saved'}
                </Box>
              </Panel>
            )}
          </ReactFlow>
        </Box>
      </Box>

      {/* Right Settings Panel */}
      {settingsNode && (
        <Paper sx={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 400,
          zIndex: 10000, // Higher than fullscreen builder
          borderRadius: 0,
          borderLeft: '1px solid #e0e0e0',
          overflow: 'auto'
        }}>
          <NodeSettingsPanel
            node={settingsNode}
            onClose={() => setSettingsNode(null)}
            onSave={handleSettingsSave}
            onDelete={handleNodeDelete}
          />
        </Paper>
      )}

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="outlined"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={showCloseDialog} onClose={() => setShowCloseDialog(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Would you like to save them before closing?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseConfirm(false)} color="error">
            Don't Save
          </Button>
          <Button onClick={() => setShowCloseDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleCloseConfirm(true)} variant="contained">
            Save & Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* Validation Results Dialog */}
      <ValidationResultsDialog
        open={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        validationResult={validationResult}
        onActivate={workflowId ? handleActivateWorkflow : undefined}
      />

      {/* Workflow Execution Panel */}
      <WorkflowExecutionPanel
        nodes={nodes}
        open={showExecutionPanel}
        onClose={() => setShowExecutionPanel(false)}
      />
    </ReactFlowProvider>
  );
} 