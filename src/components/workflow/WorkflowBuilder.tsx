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
  useTheme,
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
import { Search as SearchIcon } from '@mui/icons-material';
import NodeSettingsPanel from './NodeSettingsPanel';
import VariableSelector from './VariableSelector';
import { Z_INDEX } from '../../constants/zIndex';
import ValidationResultsDialog from './ValidationResultsDialog';
import WorkflowExecutionPanel from './WorkflowExecutionPanel';
import BaseNode from './BaseNode';
import ExpandableBasicTextField from './ExpandableBasicTextField';
import { workflowApi } from '../../services/workflowApi';
import { 
  convertToolCatalogToNodePalette,
  getCategoryColor,
  type NodePaletteItem as DynamicNodePaletteItem 
} from '../../utils/toolCatalogUtils';

// Custom node components
const TriggerNode = (props: any) => <BaseNode {...props} nodeType="trigger" />;
const SerpNode = (props: any) => <BaseNode {...props} nodeType="serp" />;
const AiNode = (props: any) => <BaseNode {...props} nodeType="ai" />;
const EmailNode = (props: any) => <BaseNode {...props} nodeType="email" />;

// Note: BRAND_COLORS below is kept for reference but now replaced by getCategoryColor() 
// from toolCatalogUtils which provides dynamic category-based colors
const BRAND_COLORS = {
  // Core system
  trigger: '#9C27B0',      // Purple for triggers
  action: '#FF5722',       // Deep Orange for actions
  client: '#2196F3',       // Blue for client data
  
  // AI & Content
  ai: '#10B981',           // OpenAI Green
  content: '#F59E0B',      // Amber for content
  
  // Google Services
  google: '#4285F4',       // Google Blue
  analytics: '#FF6D01',    // Google Analytics Orange
  ads: '#34A853',         // Google Ads Green
  maps: '#EA4335',        // Google Maps Red
  gtm: '#4285F4',         // GTM Blue
  
  // SEO Tools
  seo: '#6366F1',         // Indigo for SEO
  ahrefs: '#FF6B35',      // Ahrefs Orange
  
  // Social Media
  meta: '#1877F2',        // Meta/Facebook Blue
  twitter: '#1DA1F2',     // Twitter Blue
  linkedin: '#0A66C2',    // LinkedIn Blue
  instagram: '#E4405F',   // Instagram Pink
  
  // CRM & Marketing
  hubspot: '#FF7A59',     // HubSpot Orange
  mailchimp: '#FFE01B',   // Mailchimp Yellow
  
  // E-commerce
  shopify: '#96BF48',     // Shopify Green
  woocommerce: '#96588A', // WooCommerce Purple
  
  // Communication
  slack: '#4A154B',       // Slack Purple
  discord: '#5865F2',     // Discord Blurple
  teams: '#6264A7',       // Teams Purple
  
  // Project Management
  asana: '#F06A6A',       // Asana Red
  trello: '#0079BF',      // Trello Blue
  notion: '#000000',      // Notion Black
  
  // WordPress
  wordpress: '#21759B',   // WordPress Blue
  
  // Default fallback
  default: '#64748B'      // Slate Gray
};

// Note: getNodeColor function removed - now using getCategoryColor from toolCatalogUtils
// for dynamic category-based coloring instead of hardcoded node type matching

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

// Old NodePaletteItem interface - kept for reference, now using DynamicNodePaletteItem
// interface NodePaletteItem {
//   type: WorkflowNodeType;
//   label: string;
//   description: string;
//   category: string;
//   color?: string;
// }

// Note: nodePaletteItems is now loaded dynamically from tool catalog
// See useEffect hook for dynamic loading via workflowApi.getToolCatalog()

export default function WorkflowBuilder({ onSave, workflowId }: WorkflowBuilderProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [settingsNode, setSettingsNode] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [activating, setActivating] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [variableSelectorOpen, setVariableSelectorOpen] = useState(false);
  
  // Dynamic node palette from tool catalog
  const [nodePaletteItems, setNodePaletteItems] = useState<DynamicNodePaletteItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track the current workflow ID to fix autosave creating new workflows
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(workflowId || null);
  
  // Auto-save timer
  const autoSaveTimer = useRef<number | null>(null);
  const lastSavedState = useRef<string>('');

  // Load tool catalog on mount for dynamic node palette
  useEffect(() => {
    const loadToolCatalog = async () => {
      try {
        setLoadingCatalog(true);
        setCatalogError(null);
        
        console.log('📥 Fetching tool catalog from backend...');
        const result = await workflowApi.getToolCatalog();
        
        if (!result.success || !result.catalog) {
          throw new Error(result.error || 'Failed to load catalog');
        }
        
        console.log('✅ Tool catalog loaded:', result.catalog);
        
        // Convert catalog to node palette items
        const paletteItems = convertToolCatalogToNodePalette(result.catalog);
        console.log(`✅ Generated ${paletteItems.length} node palette items from catalog`);
        
        setNodePaletteItems(paletteItems);
        setLoadingCatalog(false);
      } catch (error) {
        console.error('❌ Failed to load tool catalog:', error);
        setCatalogError('Failed to load available tools. Using fallback nodes.');
        setLoadingCatalog(false);
        
        // Fallback to basic nodes if catalog fails to load
        const fallbackNodes: DynamicNodePaletteItem[] = [
          {
            type: 'trigger',
            category: 'trigger',
            label: 'Manual Trigger',
            description: 'Start workflow manually',
            icon: '⚡',
            provider: 'builtin',
            operation: 'trigger',
            baseCredits: 0,
            isAsync: false,
            fields: [],
            authType: 'none',
          }
        ];
        setNodePaletteItems(fallbackNodes);
      }
    };
    
    loadToolCatalog();
  }, []); // Only run on mount

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
        navigate('/admin/workflows');
      });
    } else {
      navigate('/admin/workflows');
    }
  };

  const handleCloseConfirm = async (saveChanges: boolean) => {
    if (saveChanges) {
      await handleAutoSave();
    }
    setShowCloseDialog(false);
    navigate('/admin/workflows');
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

      // Find the node info from palette
      const paletteItem = nodePaletteItems.find((item: DynamicNodePaletteItem) => item.type === nodeType);
      
      // Map node types to ReactFlow node types for rendering (only 4 types needed)
      const getReactFlowNodeType = (type: string, category: string): string => {
        if (type === 'trigger' || type.includes('trigger')) return 'trigger';
        if (category === 'data' || type.startsWith('transform_')) return 'email'; // Use email as transform renderer for now
        if (['review', 'options', 'conditional', 'gate'].some(t => type.includes(t))) return 'email'; // Control flow
        // Most nodes are integrations
        return 'serp'; // Use serp as the generic integration renderer
      };

      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: getReactFlowNodeType(nodeType, paletteItem?.category || ''),
        position,
        data: {
          id: `${nodeType}-${Date.now()}`,
          type: nodeType as WorkflowNodeType, // Store actual node type (e.g., "dataforseo_serp_google_organic")
          label: paletteItem?.label || nodeType,
          description: paletteItem?.description || '',
          config: {},
          isValid: true,
          // Store additional metadata from catalog
          provider: paletteItem?.provider,
          operation: paletteItem?.operation,
          category: paletteItem?.category,
          baseCredits: paletteItem?.baseCredits || 0,
          isAsync: paletteItem?.isAsync || false,
          fields: paletteItem?.fields || [],
        } as unknown as Record<string, unknown>,
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [nodePaletteItems, setNodes]
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
    } else {
      // Fallback: Save to localStorage if no onSave handler
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const existingIndex = workflows.findIndex((w: any) => w.id === workflowIdToUse);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow;
      } else {
        workflows.push(workflow);
      }
      
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      // Update currentWorkflowId
      setCurrentWorkflowId(workflowIdToUse);
      
      setHasUnsavedChanges(false);
      lastSavedState.current = JSON.stringify({ nodes, edges, workflowName, workflowDescription });
      setSnackbarMessage('✅ Workflow saved to localStorage');
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
    setShowValidationDialog(true); // Open dialog immediately
    
    try {
      const workflow = {
        id: workflowId || 'temp',
        name: workflowName || 'Untitled Workflow',
        description: workflowDescription || '',
        nodes: nodes.map((node: any) => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: node.data
        })),
        edges: edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: edge.data
        })),
        business_id: 'default-business', // TODO: Get from context/auth
        isActive: false,
      };

      const { workflowApi } = await import('../../services/workflowApi');
      
      // Pass progress callback to update in real-time
      const validation = await workflowApi.validateWorkflow(workflow, (progress) => {
        // Update validation result with incremental progress - ACCUMULATE steps
        setValidationResult((prev: any) => {
          // Get existing execution flow or start with empty array
          const existingFlow = prev?.executionFlow || [];
          
          // Find if this step already exists (update it) or add it
          const stepIndex = existingFlow.findIndex((s: any) => s.nodeId === progress.step.nodeId);
          let updatedFlow;
          
          if (stepIndex >= 0) {
            // Update existing step
            updatedFlow = [...existingFlow];
            updatedFlow[stepIndex] = progress.step;
          } else {
            // Add new step
            updatedFlow = [...existingFlow, progress.step];
          }
          
          return {
            ...prev,
            isValid: true, // Assume valid until we see errors
            errors: prev?.errors || [],
            warnings: prev?.warnings || [],
            nodeResults: prev?.nodeResults || {},
            overallStatus: 'valid' as const,
            executionFlow: updatedFlow,
            summary: {
              totalNodes: progress.total,
              cachedNodes: 0,
              freshNodes: progress.current,
              message: `Processing step ${progress.current} of ${progress.total}...`
            }
          };
        });
      });
      
      setValidationResult(validation);
      
      if (validation.isValid) {
        setSnackbarMessage(`✅ Workflow validation passed! ${validation.summary.message}`);
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

  const handleTestFullFlow = async () => {
    setValidating(true);
    setValidationResult(null);
    setShowValidationDialog(true); // Open dialog immediately
    
    try {
      const workflow = {
        id: workflowId || 'temp',
        name: workflowName || 'Untitled Workflow',
        description: workflowDescription || '',
        nodes: nodes.map((node: any) => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: node.data
        })),
        edges: edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: edge.data
        })),
        business_id: 'default-business', // TODO: Get from context/auth
        isActive: false,
      };

      const { workflowApi } = await import('../../services/workflowApi');
      
      // Pass progress callback to update in real-time
      const validation = await workflowApi.testFullWorkflow(workflow, (progress) => {
        // Update validation result with incremental progress - ACCUMULATE steps
        setValidationResult((prev: any) => {
          // Get existing execution flow or start with empty array
          const existingFlow = prev?.executionFlow || [];
          
          // Find if this step already exists (update it) or add it
          const stepIndex = existingFlow.findIndex((s: any) => s.nodeId === progress.step.nodeId);
          let updatedFlow;
          
          if (stepIndex >= 0) {
            // Update existing step
            updatedFlow = [...existingFlow];
            updatedFlow[stepIndex] = progress.step;
          } else {
            // Add new step
            updatedFlow = [...existingFlow, progress.step];
          }
          
          return {
            ...prev,
            isValid: true, // Assume valid until we see errors
            errors: prev?.errors || [],
            warnings: prev?.warnings || [],
            nodeResults: prev?.nodeResults || {},
            overallStatus: 'valid' as const,
            executionFlow: updatedFlow,
            summary: {
              totalNodes: progress.total,
              cachedNodes: 0,
              freshNodes: progress.current,
              message: `Processing step ${progress.current} of ${progress.total}...`
            }
          };
        });
      });
      
      setValidationResult(validation);
      
      if (validation.isValid) {
        setSnackbarMessage(`✅ Full workflow test passed! ${validation.summary.message}`);
      } else {
        setSnackbarMessage(`❌ Workflow test failed with ${validation.errors.length} error(s)`);
      }
      setSnackbarOpen(true);
      
    } catch (error: any) {
      console.error('Test failed:', error);
      setSnackbarMessage(`❌ Test failed: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setValidating(false);
    }
  };

  const handleActivateWorkflow = async () => {
    if (!workflowId && !currentWorkflowId) {
      setSnackbarMessage('⚠️ Please save the workflow before activating');
      setSnackbarOpen(true);
      return;
    }

    setActivating(true);
    
    try {
      const { workflowApi } = await import('../../services/workflowApi');
      const idToActivate = currentWorkflowId || workflowId;
      
      if (!idToActivate) {
        throw new Error('No workflow ID available');
      }
      
      // IMPORTANT: Ensure workflow is saved to localStorage before activating
      // This is needed because activateWorkflow looks in localStorage
      const workflow = {
        id: idToActivate,
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        executionCount: 0,
        lastExecuted: null,
        successRate: 0,
        nodeResponses: {}
      };
      
      // Save to localStorage first
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const existingIndex = workflows.findIndex((w: any) => w.id === idToActivate);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = { ...workflows[existingIndex], ...workflow };
      } else {
        workflows.push(workflow);
      }
      
      localStorage.setItem('workflows', JSON.stringify(workflows));
      console.log(`✅ Saved workflow ${idToActivate} to localStorage before activation`);
      
      // Now activate
      const result = await workflowApi.activateWorkflow(idToActivate);
      
      if (result.success) {
        setSnackbarMessage('🚀 Workflow activated successfully!');
        setWorkflowActive(true);
        // Trigger a refresh of workflow status - onSave would need the full workflow object
      } else {
        setSnackbarMessage(`❌ Failed to activate: ${result.error || 'Unknown error'}`);
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
        // Trigger a refresh of workflow status - onSave would need the full workflow object
      } else {
        setSnackbarMessage(`❌ Failed to deactivate: ${result.error || 'Unknown error'}`);
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
        position: { x: 350, y: 100 },
        data: {
          id: 'serp-1',
          type: WorkflowNodeType.SEO_SERP_ANALYZE,
          label: 'SERP Analysis',
          description: 'Analyze search engine results',
          config: { 
            keyword: 'marketing trends', 
            locationCode: 2840, 
            languageCode: 'en',
            resultType: 'organic',
            maxResults: 10,
            integrationId: '' // ⚠️ Configure integrations first!
          },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 600, y: 100 },
        data: {
          id: 'ai-1',
          type: WorkflowNodeType.AI_OPENAI_TASK,
          label: 'AI Analysis',
          description: 'Analyze SERP results with AI',
          config: { 
            systemPrompt: 'You are a marketing analyst. Analyze the provided search results and identify key trends and insights.',
            userPrompt: 'Please analyze these search results: {{serp-1.data.processed.results[0].items}}',
            model: 'gpt-4o-mini',
            maxCompletionTokens: 16384,
            temperature: 0.3,
            integrationId: '', // Will need to be set by user
            outputVariable: 'analysis_result'
          },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'ai-2',
        type: 'ai',
        position: { x: 850, y: 100 },
        data: {
          id: 'ai-2',
          type: WorkflowNodeType.AI_OPENAI_TASK,
          label: 'Summary Report',
          description: 'Create a summary report',
          config: { 
            systemPrompt: 'You are a professional report writer. Create concise, actionable summaries.',
            userPrompt: 'Based on this analysis: {{ai-1.data.processed}}, create a 3-point executive summary with actionable recommendations.',
            model: 'gpt-4o-mini',
            maxCompletionTokens: 8192,
            temperature: 0.2,
            integrationId: '', // Will need to be set by user
            outputVariable: 'final_summary'
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
    setWorkflowDescription('Demo workflow: SERP data → AI analysis → Summary report. ⚠️ Requires DataForSEO and OpenAI integrations to be configured first!');
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
          height: isFullscreen ? '100vh' : '100%',
          minHeight: isFullscreen ? '100vh' : '600px',
          zIndex: isFullscreen ? 9999 : 'auto',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
        }}
      >
        {/* Left Sidebar - Node Palette */}
        <Paper sx={{
          width: 280,
          borderRadius: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          overflow: 'auto',
          flexShrink: 0,
          backgroundColor: theme.palette.background.paper,
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
                onClick={handleTestFullFlow}
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
                {validating ? 'Validating...' : 'Validate Workflow (Use Cache)'}
              </Button>
              
              {(workflowId || currentWorkflowId) && (
                <Button
                  fullWidth
                  variant={workflowActive ? "contained" : "outlined"}
                  startIcon={activating ? <CircularProgress size={16} /> : (workflowActive ? <StopIcon /> : <PlayArrowIcon />)}
                  onClick={workflowActive ? handleDeactivateWorkflow : handleActivateWorkflow}
                  disabled={activating || (!workflowId && !currentWorkflowId)}
                  color={workflowActive ? "success" : "primary"}
                  sx={{ mb: 1 }}
                >
                  {activating ? 'Processing...' : (workflowActive ? 'Deactivate' : 'Activate Workflow')}
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Search Box */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{ mb: 3 }}
            />

            {/* Loading State */}
            {loadingCatalog && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {/* Error State */}
            {catalogError && (
              <Typography color="error" variant="body2" sx={{ mb: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                {catalogError}
              </Typography>
            )}

            {/* Node Categories */}
            {!loadingCatalog && (() => {
              const categories = [
                'Triggers', 'AI Tools', 'Google Analytics', 'Google Ads', 'Meta Ads', 
                'Google Maps', 'Ahrefs', 'WordPress', 'CRM & Marketing', 'Social Media', 
                'E-commerce', 'SEO Tools', 'Content Tools', 'Client Data', 'Actions'
              ];
              
              // Filter categories and items based on search
              const filteredCategories = categories.filter(category => {
                if (!searchTerm) return true;
                const categoryItems = nodePaletteItems.filter((item: DynamicNodePaletteItem) => item.category === category);
                return categoryItems.some((item: DynamicNodePaletteItem) => 
                  item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  category.toLowerCase().includes(searchTerm.toLowerCase())
                );
              });
              
              return filteredCategories.map((category) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {category}
                </Typography>
                {nodePaletteItems
                  .filter((item: DynamicNodePaletteItem) => {
                    if (item.category !== category) return false;
                    if (!searchTerm) return true;
                    return item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
                  })
                  .map((item: DynamicNodePaletteItem) => (
                    <Paper
                      key={item.type}
                      elevation={1}
                      draggable
                      onDragStart={(event: React.DragEvent) => onDragStart(event, item.type)}
                      sx={{
                        p: 2,
                        mb: 1,
                        cursor: 'grab',
                        border: `1px solid ${theme.palette.divider}`,
                        borderLeft: `4px solid ${getCategoryColor(item.category)}`,
                        borderRadius: '4px',
                        backgroundColor: `${getCategoryColor(item.category)}08`, // Very subtle 3% tint
                        '&:hover': {
                          backgroundColor: `${getCategoryColor(item.category)}15`, // Slightly more visible on hover (8% tint)
                          borderColor: theme.palette.divider,
                          borderLeftColor: getCategoryColor(item.category),
                          boxShadow: `0 2px 8px ${getCategoryColor(item.category)}20`,
                          transform: 'translateY(-1px)',
                        },
                        '&:active': {
                          cursor: 'grabbing',
                          transform: 'translateY(0)',
                          backgroundColor: `${getCategoryColor(item.category)}20`, // More visible when pressed
                        },
                        transition: 'all 0.2s ease',
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
            ));
            })()}
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
            style={{ background: theme.palette.background.default }}
          >
            {/* Custom CSS for ReactFlow Controls and Dropdown visibility */}
            <style>
              {`
                /* Global override for Material-UI dropdown z-index */
                .MuiPopover-root, .MuiMenu-root, .MuiSelect-root .MuiPopover-paper {
                  z-index: ${Z_INDEX.DROPDOWN} !important;
                }
                .MuiBackdrop-root {
                  z-index: ${Z_INDEX.DROPDOWN - 1} !important;
                }
                
                ${theme.palette.mode === 'dark' ? `
                  .react-flow__controls button {
                    background-color: #4a5568 !important;
                    border: 1px solid #718096 !important;
                    color: #e2e8f0 !important;
                  }
                  .react-flow__controls button:hover {
                    background-color: #5a6578 !important;
                    border-color: #81909f !important;
                  }
                  .react-flow__controls button svg {
                    fill: #e2e8f0 !important;
                  }
                  .react-flow__minimap {
                    background-color: #2d3748 !important;
                  }
                  .react-flow__minimap-mask {
                    fill: rgba(255, 255, 255, 0.1) !important;
                  }
                  .react-flow__minimap-node {
                    fill: #4a5568 !important;
                  }
                ` : `
                  .react-flow__controls button {
                    background-color: #ffffff !important;
                    border: 1px solid #e2e8f0 !important;
                    color: #4a5568 !important;
                  }
                  .react-flow__controls button:hover {
                    background-color: #f7fafc !important;
                    border-color: #cbd5e0 !important;
                  }
                  .react-flow__controls button svg {
                    fill: #4a5568 !important;
                  }
                `}
              `}
            </style>
            <Background 
              color={theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}
              gap={20}
              size={1}
            />
            <Controls 
              style={{
                backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#ffffff',
                borderRadius: '8px',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.palette.divider}`,
              }}
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />
            <MiniMap 
              style={{
                backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#ffffff',
                borderRadius: '8px',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.palette.divider}`,
              }}
              nodeColor={(node: any) => {
                if (node.type) {
                  return theme.palette.mode === 'dark' ? '#5f5eff' : '#5f5eff';
                }
                return theme.palette.mode === 'dark' ? '#4a5568' : '#cbd5e0';
              }}
              maskColor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            />
            
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
                
                <Tooltip title="Open Data Browser">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setVariableSelectorOpen(true)}
                    sx={{ minWidth: 'auto', px: 1 }}
                    startIcon={<SearchIcon />}
                  >
                    Data
                  </Button>
                </Tooltip>
                
                <Tooltip title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                  <IconButton
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.background.paper, 
                      '&:hover': { backgroundColor: theme.palette.action.hover } 
                    }}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Close builder">
                  <IconButton
                    onClick={handleClose}
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.background.paper, 
                      '&:hover': { backgroundColor: theme.palette.action.hover } 
                    }}
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
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(31, 41, 55, 0.9)' 
                    : 'rgba(255, 255, 255, 0.9)', 
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

      {/* Variable Selector - Use Dialog for Better UX */}
      <VariableSelector
        open={variableSelectorOpen}
        onClose={() => setVariableSelectorOpen(false)}
        onInsert={(variable) => {
          // TODO: Insert variable into currently focused field
          console.log('Variable selected:', variable);
          setVariableSelectorOpen(false);
        }}
        position="dialog"
      />

      {/* Right Settings Panel */}
      {settingsNode && (
        <Paper sx={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 400,
          zIndex: Z_INDEX.NODE_SETTINGS_PANEL, // Proper z-index hierarchy
          borderRadius: 0,
          borderLeft: `1px solid ${theme.palette.divider}`,
          overflow: 'auto',
          // Ensure dropdown menus can appear above this panel
          '& .MuiSelect-root': {
            zIndex: 999999
          },
          '& .MuiPopover-root': {
            zIndex: 999999
          },
          '& .MuiMenu-root': {
            zIndex: 999999
          }
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
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflowName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <ExpandableBasicTextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={workflowDescription}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setWorkflowDescription(e.target.value)}
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
        validating={validating}
      />

      {/* Workflow Execution Panel */}
      <WorkflowExecutionPanel
        nodes={nodes}
        edges={edges}
        open={showExecutionPanel}
        onClose={() => setShowExecutionPanel(false)}
      />
    </ReactFlowProvider>
  );
} 
