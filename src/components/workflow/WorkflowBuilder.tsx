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
} from '@reactflow/core';
import { Controls } from '@reactflow/controls';
import { Background } from '@reactflow/background';
import { Box, AppBar, Toolbar, Typography, Button, Fab } from '@mui/material';
import { Save as SaveIcon, PlayArrow as PlayIcon, Close as CloseIcon } from '@mui/icons-material';
import NodePalette from './NodePalette';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import { WorkflowNodeType } from '../../types/workflow';

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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  let id = 0;
  const getId = () => `node_${id++}`;

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: any) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance?.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      if (!position) return;

      const newNode: Node = {
        id: getId(),
        type: type === WorkflowNodeType.TRIGGER ? 'trigger' : 'action',
        position,
        data: {
          id: getId(),
          type: type as WorkflowNodeType,
          label: getNodeLabel(type as WorkflowNodeType),
          description: getNodeDescription(type as WorkflowNodeType),
          config: {},
          isValid: true,
        },
        draggable: true,
        selectable: true,
        deletable: true,
      };

      setNodes((nds: any) => nds.concat(newNode));
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
              Workflow Builder
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
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
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
                strokeWidth: 2,
              },
            }}
            connectionLineStyle={{
              stroke: '#5f5fff',
              strokeWidth: 2,
            }}
            style={{ 
              backgroundColor: '#f8f9fb',
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Controls 
              position="bottom-left"
            />
            <Background 
              color="#e0e0e0" 
              gap={20} 
              size={1}
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#5a6577',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Start Building Your Workflow
              </Typography>
              <Typography variant="body2">
                Drag elements from the left panel to create your workflow
              </Typography>
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
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <CloseIcon />
          </Fab>
        )}
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