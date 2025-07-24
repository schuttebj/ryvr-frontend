import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  NodeMouseHandler,
  EdgeMouseHandler,
  useReactFlow,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import {
  PlayArrow as TriggerIcon,
  Search as SearchIcon,
  SmartToy as AiIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import { WorkflowNodeData, WorkflowNodeType, Workflow } from '../../types/workflow';
import { workflowApi } from '../../services/workflowApi';
import BaseNode from './BaseNode';
import NodeSettingsPanel from './NodeSettingsPanel';

// Custom Node Components
const TriggerNode = ({ data, selected }: { data: WorkflowNodeData; selected: boolean }) => (
  <BaseNode 
    data={data} 
    selected={selected} 
    color="#4CAF50" 
    icon={<TriggerIcon />}
    isTrigger={true}
  />
);

const SerpNode = ({ data, selected }: { data: WorkflowNodeData; selected: boolean }) => (
  <BaseNode 
    data={data} 
    selected={selected} 
    color="#2196F3" 
    icon={<SearchIcon />}
  />
);

const AiNode = ({ data, selected }: { data: WorkflowNodeData; selected: boolean }) => (
  <BaseNode 
    data={data} 
    selected={selected} 
    color="#FF9800" 
    icon={<AiIcon />}
  />
);

const EmailNode = ({ data, selected }: { data: WorkflowNodeData; selected: boolean }) => (
  <BaseNode 
    data={data} 
    selected={selected} 
    color="#9C27B0" 
    icon={<EmailIcon />}
  />
);

// Node type definitions for the palette
const nodeTypes = {
  trigger: TriggerNode,
  seo_serp_analyze: SerpNode,
  ai_content_generate: AiNode,
  ai_content_analyze: AiNode,
  email: EmailNode,
};

// Node palette items
const nodePaletteItems = [
  {
    type: WorkflowNodeType.TRIGGER,
    label: 'Manual Trigger',
    description: 'Start workflow manually',
    icon: TriggerIcon,
    color: '#4CAF50',
    category: 'Triggers'
  },
  {
    type: WorkflowNodeType.SEO_SERP_ANALYZE,
    label: 'SERP Analysis',
    description: 'Analyze search results',
    icon: SearchIcon,
    color: '#2196F3',
    category: 'SEO Tools'
  },
  {
    type: WorkflowNodeType.AI_CONTENT_ANALYZE,
    label: 'AI Analysis',
    description: 'Analyze content with AI',
    icon: AiIcon,
    color: '#FF9800',
    category: 'AI Tools'
  },
  {
    type: WorkflowNodeType.AI_CONTENT_GENERATE,
    label: 'AI Summarize',
    description: 'Generate AI summary',
    icon: AiIcon,
    color: '#FF9800',
    category: 'AI Tools'
  },
  {
    type: WorkflowNodeType.EMAIL,
    label: 'Send Email',
    description: 'Send email notification',
    icon: EmailIcon,
    color: '#9C27B0',
    category: 'Actions'
  },
];

interface WorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflow: any) => void;
}

function WorkflowBuilderContent({ workflowId, onSave }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [settingsNode, setSettingsNode] = useState<{ id: string; data: WorkflowNodeData } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Get node label helper
  const getNodeLabel = (type: WorkflowNodeType): string => {
    const item = nodePaletteItems.find(item => item.type === type);
    return item?.label || type.replace('_', ' ').toUpperCase();
  };

  // Get node description helper  
  const getNodeDescription = (type: WorkflowNodeType): string => {
    const item = nodePaletteItems.find(item => item.type === type);
    return item?.description || `${type} node`;
  };

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop - create new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (!type || !reactFlowWrapper.current) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeId = `${type}_${Date.now()}`;
      const newNode: Node = {
        id: nodeId,
        type: type,
        position,
        data: {
          id: nodeId,
          type: type as WorkflowNodeType,
          label: getNodeLabel(type as WorkflowNodeType),
          description: getNodeDescription(type as WorkflowNodeType),
          config: {},
          isValid: true,
        } as unknown as Record<string, unknown>,
        draggable: true,
        selectable: true,
      };

      setNodes((nds: Node[]) => [...nds, newNode]);
      setIsDragging(false);
    },
    [screenToFlowPosition, setNodes, getNodeLabel, getNodeDescription]
  );

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      console.log('Connecting nodes:', params);
      const newEdge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        animated: true,
        style: { stroke: '#5f5fff', strokeWidth: 2 },
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle settings save
  const handleSettingsSave = useCallback((nodeId: string, updatedData: WorkflowNodeData) => {
    setNodes((nds: Node[]) => 
      nds.map((node: Node) => 
        node.id === nodeId 
          ? { ...node, data: updatedData as unknown as Record<string, unknown> }
          : node
      )
    );
    setSettingsNode(null);
  }, [setNodes]);

  // Handle node deletion
  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== nodeId));
    setEdges((eds: Edge[]) => eds.filter((edge: Edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSettingsNode(null);
  }, [setNodes, setEdges]);

  // Node click handler for settings/configuration
  const onNodeClick: NodeMouseHandler = useCallback((_event: any, node: Node) => {
    console.log('Node clicked:', node.id);
    setSelectedNode(node.id);
    setSettingsNode({ id: node.id, data: node.data as unknown as WorkflowNodeData });
  }, []);

  const onNodeDrag = useCallback((_event: any, node: Node) => {
    console.log('Node drag:', node.id, node.position);
  }, []);

  const onNodeDragStartHandler = useCallback((_event: any, node: Node) => {
    console.log('Node drag start:', node.id);
  }, []);

  const onNodeDragStop = useCallback((_event: any, node: Node) => {
    console.log('Node drag stop:', node.id, node.position);
  }, []);

  // Edge click handler
  const onEdgeClick: EdgeMouseHandler = useCallback((_event: any, edge: Edge) => {
    console.log('Edge clicked:', edge.id);
  }, []);

  // Save workflow
  const handleSaveWorkflow = async () => {
    try {
      const workflow: Workflow = {
        id: workflowId || `workflow_${Date.now()}`,
        name: workflowName,
        description: 'Workflow created with builder',
        nodes: nodes.map((node: Node) => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: node.data as unknown as WorkflowNodeData,
        })),
        edges: edges.map((edge: Edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          animated: edge.animated,
          style: edge.style,
        })),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await workflowApi.saveWorkflow(workflow);
      if (onSave) onSave(workflow);
      setSaveDialogOpen(false);
      
      // Show success message
      console.log('Workflow saved successfully!');
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  // Create test workflow
  const createTestWorkflow = useCallback(() => {
    const testNodes: Node[] = [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          id: 'trigger_1',
          type: WorkflowNodeType.TRIGGER,
          label: 'Manual Trigger',
          description: 'Start workflow manually',
          config: { triggerType: 'manual' },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'serp_1',
        type: 'seo_serp_analyze',
        position: { x: 100, y: 250 },
        data: {
          id: 'serp_1',
          type: WorkflowNodeType.SEO_SERP_ANALYZE,
          label: 'SERP Analysis',
          description: 'Analyze search results',
          config: { keyword: '', locationCode: 2840 },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'ai_1',
        type: 'ai_content_analyze',
        position: { x: 100, y: 400 },
        data: {
          id: 'ai_1',
          type: WorkflowNodeType.AI_CONTENT_ANALYZE,
          label: 'AI Analysis',
          description: 'Analyze content with AI',
          config: { analysisType: 'content' },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'summarize_1',
        type: 'ai_content_generate',
        position: { x: 100, y: 550 },
        data: {
          id: 'summarize_1',
          type: WorkflowNodeType.AI_CONTENT_GENERATE,
          label: 'AI Summarize',
          description: 'Generate AI summary',
          config: { contentType: 'summary' },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
    ];

    const testEdges: Edge[] = [
      {
        id: 'trigger_1-serp_1',
        source: 'trigger_1',
        target: 'serp_1',
        animated: true,
        style: { stroke: '#5f5fff', strokeWidth: 2 },
      },
      {
        id: 'serp_1-ai_1',
        source: 'serp_1',
        target: 'ai_1',
        animated: true,
        style: { stroke: '#5f5fff', strokeWidth: 2 },
      },
      {
        id: 'ai_1-summarize_1',
        source: 'ai_1',
        target: 'summarize_1',
        animated: true,
        style: { stroke: '#5f5fff', strokeWidth: 2 },
      },
    ];

    setNodes(testNodes);
    setEdges(testEdges);
  }, [setNodes, setEdges]);

  // Drag handlers for node palette
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const flowStyle = useMemo(() => ({
    background: 'linear-gradient(to bottom, #f0f2f5, #ffffff)',
  }), []);

  return (
    <Box sx={{ 
      height: isFullscreen ? '100vh' : '80vh',
      width: '100%',
      display: 'flex',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 1000 : 'auto',
      bgcolor: 'background.default'
    }}>
      {/* Left Sidebar - Node Palette */}
      <Paper sx={{ 
        width: 280, 
        height: '100%',
        borderRadius: 0,
        borderRight: '1px solid #e0e0e0',
        overflow: 'auto'
      }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              Workflow Builder
            </Typography>
            <IconButton 
              onClick={() => setIsFullscreen(!isFullscreen)}
              size="small"
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
          
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={createTestWorkflow}
            sx={{ mb: 1 }}
          >
            Create Test Workflow
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
          >
            Save Workflow
          </Button>
        </Box>

        {/* Node Palette */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Drag nodes to canvas
          </Typography>
          
          {/* Group nodes by category */}
          {['Triggers', 'SEO Tools', 'AI Tools', 'Actions'].map(category => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ 
                textTransform: 'uppercase', 
                fontWeight: 'bold',
                color: 'text.secondary',
                mb: 1,
                display: 'block'
              }}>
                {category}
              </Typography>
              
              {nodePaletteItems
                .filter(item => item.category === category)
                .map((item) => (
                  <Paper
                    key={item.type}
                    sx={{
                      p: 2,
                      mb: 1,
                      cursor: 'grab',
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: item.color,
                        boxShadow: `0 2px 8px ${item.color}20`,
                      },
                      '&:active': {
                        cursor: 'grabbing',
                      },
                    }}
                    draggable
                    onDragStart={(event) => onDragStart(event, item.type)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ 
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <item.icon fontSize="small" />
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                ))}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Main Canvas */}
      <Box sx={{ 
        flex: 1, 
        height: '100%',
        position: 'relative',
        marginRight: settingsNode ? '400px' : '0px',
        transition: 'margin-right 0.3s ease'
      }}>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDrag={onNodeDrag}
            onNodeDragStart={onNodeDragStartHandler}
            onNodeDragStop={onNodeDragStop}
            onEdgeClick={onEdgeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            style={flowStyle}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView={false}
            snapToGrid={true}
            snapGrid={[15, 15]}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            panOnDrag={true}
            panOnScroll={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="#e0e0e0"
            />
            <Controls 
              position="bottom-left"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
            <MiniMap 
              position="bottom-right"
              zoomable
              pannable
              nodeStrokeWidth={3}
              nodeColor={(node) => {
                const nodeItem = nodePaletteItems.find(item => item.type === node.type);
                return nodeItem?.color || '#5f5fff';
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
              }}
            />
            
            {/* Canvas Instructions */}
            {nodes.length === 0 && (
              <Panel position="top-center">
                <Alert severity="info" sx={{ mt: 2 }}>
                  Drag nodes from the left panel to start building your workflow, or click "Create Test Workflow"
                </Alert>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </Box>

      {/* Right Settings Panel */}
      {settingsNode && (
        <Paper sx={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 400,
          zIndex: 1001,
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
          <Typography variant="body2" color="text.secondary">
            This workflow contains {nodes.length} nodes and {edges.length} connections.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWorkflow} variant="contained">
            Save Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
} 