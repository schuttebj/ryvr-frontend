import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeMouseHandler,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, AppBar, Toolbar, Typography, Button, Fab } from '@mui/material';
import { Save as SaveIcon, PlayArrow as PlayIcon, Close as CloseIcon } from '@mui/icons-material';
import NodePalette from './NodePalette';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import NodeSettingsPanel from './NodeSettingsPanel';
import { WorkflowNodeType, WorkflowNodeData } from '../../types/workflow';

// Define custom node types
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  email: ActionNode,
  webhook: ActionNode,
  delay: ActionNode,
  ai_analysis: ActionNode,
  seo_audit: ActionNode,
  keyword_research: ActionNode,
  social_media_post: ActionNode,
  content_generation: ActionNode,
  condition: ActionNode,
};

interface WorkflowBuilderProps {
  workflowId?: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onExecute?: (workflowId: string) => void;
  onClose?: () => void;
}

function WorkflowBuilderContent({ workflowId, onSave, onExecute, onClose }: WorkflowBuilderProps) {
  // Initial test nodes for development
  const initialNodes: Node[] = [
    {
      id: 'test-trigger',
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: {
        id: 'test-trigger',
        type: WorkflowNodeType.TRIGGER,
        label: 'Test Trigger',
        description: 'Manual trigger for testing',
        config: {},
        isValid: true,
      },
      draggable: true,
      selectable: true,
      deletable: true,
      connectable: true,
    },
    {
      id: 'test-action',
      type: 'action',
      position: { x: 400, y: 200 },
      data: {
        id: 'test-action',
        type: WorkflowNodeType.EMAIL,
        label: 'Test Email Action',
        description: 'Send test email',
        config: {},
        isValid: true,
      },
      draggable: true,
      selectable: true,
      deletable: true,
      connectable: true,
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [settingsNode, setSettingsNode] = useState<{ id: string; data: WorkflowNodeData } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  let id = 2; // Start from 2 since we have 2 test nodes
  const getId = () => `node_${id++}`;

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connecting nodes:', params);
      if (params.source && params.target) {
        const edge: Edge = {
          id: `edge-${params.source}-${params.target}-${Date.now()}`,
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle || null,
          targetHandle: params.targetHandle || null,
          animated: true,
          style: {
            stroke: '#5f5fff',
            strokeWidth: 3,
          },
        };
        setEdges((eds: Edge[]) => addEdge(edge, eds));
        console.log('Edge created successfully:', edge);
      }
    },
    [setEdges]
  );

  // Node click handler for settings/configuration
  const onNodeClick: NodeMouseHandler = useCallback((event: any, node: Node) => {
    event.stopPropagation();
    console.log('Node clicked:', node.id);
    setSelectedNode(node.id);
    setSettingsNode({ id: node.id, data: node.data });
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

  const onSelectionChange = useCallback((params: any) => {
    console.log('Selection change:', params);
    if (params.nodes && params.nodes.length > 0) {
      setSelectedNode(params.nodes[0].id);
    } else {
      setSelectedNode(null);
    }
  }, []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Get the bounding box of the ReactFlow wrapper
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      
      if (!reactFlowBounds || !reactFlowInstance) {
        console.error('ReactFlow instance or bounds not available');
        return;
      }

      // Calculate position relative to the ReactFlow wrapper
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      console.log('Drop position calculated:', position, 'Client position:', { x: event.clientX, y: event.clientY });

      const nodeId = getId();
      const newNode: Node = {
        id: nodeId,
        type: type === WorkflowNodeType.TRIGGER ? 'trigger' : 'action',
        position,
        data: {
          id: nodeId,
          type: type as WorkflowNodeType,
          label: getNodeLabel(type as WorkflowNodeType),
          description: getNodeDescription(type as WorkflowNodeType),
          config: {},
          isValid: true,
        },
        draggable: true,
        selectable: true,
        deletable: true,
        connectable: true,
      };

      console.log('Creating node:', newNode);
      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeDragStart = useCallback((event: any, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  const handleExecute = useCallback(() => {
    if (onExecute && workflowId) {
      onExecute(workflowId);
    }
  }, [onExecute, workflowId]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Update nodes with selection state
  const nodesWithSelection = nodes.map((node: Node) => ({
    ...node,
    selected: node.id === selectedNode
  }));

  // Handle settings save
  const handleSettingsSave = useCallback((nodeId: string, updatedData: WorkflowNodeData) => {
    setNodes((nds: Node[]) => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: updatedData }
          : node
      )
    );
  }, [setNodes]);

  // Handle node delete
  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds: Node[]) => nds.filter(node => node.id !== nodeId));
    setEdges((eds: Edge[]) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: '#f8f9fb',
      position: 'relative',
    }}>
      <NodePalette onNodeDragStart={onNodeDragStart} />
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
      }}>
        <AppBar 
          position="static" 
          sx={{ 
            bgcolor: 'white', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#2e3142', fontWeight: 600 }}>
              Workflow Builder - Test Mode (2 Test Nodes)
            </Typography>
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSave}
              variant="outlined"
              sx={{ 
                mr: 1,
                borderColor: '#5f5fff',
                color: '#5f5fff',
                '&:hover': {
                  borderColor: '#5f5fff',
                  bgcolor: '#5f5fff10',
                },
              }}
            >
              Save
            </Button>
            <Button
              startIcon={<PlayIcon />}
              onClick={handleExecute}
              variant="contained"
              disabled={!workflowId || nodes.length === 0}
              sx={{
                bgcolor: '#5f5fff',
                '&:hover': {
                  bgcolor: '#4f4fef',
                },
              }}
            >
              Execute
            </Button>
          </Toolbar>
        </AppBar>

        <Box
          ref={reactFlowWrapper}
          sx={{
            flex: 1,
            position: 'relative',
            bgcolor: '#f8f9fb',
            overflow: 'hidden', // Prevent scrollbars that might interfere
          }}
        >
          <ReactFlow
            nodes={nodesWithSelection}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodeDragStart={onNodeDragStartHandler}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
            }}
            defaultEdgeOptions={{
              animated: true,
              style: {
                stroke: '#5f5fff',
                strokeWidth: 3,
              },
            }}
            connectionLineStyle={{
              stroke: '#5f5fff',
              strokeWidth: 3,
              strokeDasharray: '5,5',
            }}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            panOnDrag={[1]}
            zoomOnScroll={true}
            zoomOnPinch={true}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Control"
            style={{ 
              backgroundColor: '#f8f9fb',
              width: '100%',
              height: '100%',
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background 
              color="#e0e0e0" 
              gap={20} 
              size={1}
              style={{
                opacity: 0.3, // Make background less prominent
              }}
            />
          </ReactFlow>

          {/* Custom Controls */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: 10,
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => reactFlowInstance?.fitView()}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'white',
                color: '#5f5fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  color: '#5f5fff',
                },
              }}
            >
              📍
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => reactFlowInstance?.zoomIn()}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'white',
                color: '#5f5fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  color: '#5f5fff',
                },
              }}
            >
              ➕
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => reactFlowInstance?.zoomOut()}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'white',
                color: '#5f5fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  color: '#5f5fff',
                },
              }}
            >
              ➖
            </Button>
          </Box>

          {/* Test Instructions */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              p: 2,
              maxWidth: 300,
              zIndex: 10,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#4caf50' }}>
              🧪 Test Mode Active
            </Typography>
            <Typography variant="caption" sx={{ color: '#5a6577', display: 'block', mb: 1 }}>
              • Try dragging the nodes around
            </Typography>
            <Typography variant="caption" sx={{ color: '#5a6577', display: 'block', mb: 1 }}>
              • Click nodes to test selection
            </Typography>
            <Typography variant="caption" sx={{ color: '#5a6577', display: 'block', mb: 1 }}>
              • Drag from bottom handle to top handle to connect
            </Typography>
            <Typography variant="caption" sx={{ color: '#5a6577', display: 'block' }}>
              • Click settings icon on nodes
            </Typography>
          </Box>

          {/* Selected node info */}
          {selectedNode && (
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                p: 2,
                minWidth: 200,
                zIndex: 10,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Selected Node
              </Typography>
              <Typography variant="body2" sx={{ color: '#5a6577', mb: 1 }}>
                ID: {selectedNode}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ mt: 1, mr: 1 }}
                onClick={() => {
                  const node = nodes.find((n: Node) => n.id === selectedNode);
                  if (node) setSettingsNode({ id: node.id, data: node.data });
                }}
              >
                Configure
              </Button>
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => setSelectedNode(null)}
              >
                Close
              </Button>
            </Box>
          )}
        </Box>

        {/* Close button */}
        {onClose && (
          <Fab
            size="small"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1001,
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <CloseIcon />
          </Fab>
        )}

        {/* Settings Panel */}
        <NodeSettingsPanel
          node={settingsNode}
          onClose={() => setSettingsNode(null)}
          onSave={handleSettingsSave}
          onDelete={handleNodeDelete}
        />
      </Box>
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

// Helper functions
function getNodeLabel(type: WorkflowNodeType): string {
  switch (type) {
    case WorkflowNodeType.TRIGGER:
      return 'Manual Trigger';
    case WorkflowNodeType.EMAIL:
      return 'Send Email';
    case WorkflowNodeType.WEBHOOK:
      return 'Webhook Call';
    case WorkflowNodeType.DELAY:
      return 'Wait/Delay';
    case WorkflowNodeType.AI_ANALYSIS:
      return 'AI Analysis';
    case WorkflowNodeType.SEO_AUDIT:
      return 'SEO Audit';
    case WorkflowNodeType.KEYWORD_RESEARCH:
      return 'Keyword Research';
    case WorkflowNodeType.SOCIAL_MEDIA_POST:
      return 'Social Media Post';
    case WorkflowNodeType.CONTENT_GENERATION:
      return 'Content Generation';
    case WorkflowNodeType.CONDITION:
      return 'Condition';
    default:
      return 'Unknown Action';
  }
}

function getNodeDescription(type: WorkflowNodeType): string {
  switch (type) {
    case WorkflowNodeType.TRIGGER:
      return 'Starts workflow execution';
    case WorkflowNodeType.EMAIL:
      return 'Send email to contacts';
    case WorkflowNodeType.WEBHOOK:
      return 'Make HTTP API call';
    case WorkflowNodeType.DELAY:
      return 'Wait for specified time';
    case WorkflowNodeType.AI_ANALYSIS:
      return 'Analyze content with AI';
    case WorkflowNodeType.SEO_AUDIT:
      return 'Analyze website SEO';
    case WorkflowNodeType.KEYWORD_RESEARCH:
      return 'Research keywords';
    case WorkflowNodeType.SOCIAL_MEDIA_POST:
      return 'Post to social media';
    case WorkflowNodeType.CONTENT_GENERATION:
      return 'Generate content using AI';
    case WorkflowNodeType.CONDITION:
      return 'Branch workflow based on condition';
    default:
      return 'Workflow action';
  }
} 