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
import { Box, Paper, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Save as SaveIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
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
}

function WorkflowBuilderContent({ workflowId, onSave, onExecute }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  let id = 0;
  const getId = () => `dndnode_${id++}`;

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
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

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeDragStart = useCallback((event: React.DragEvent, nodeType: WorkflowNodeType) => {
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

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <NodePalette onNodeDragStart={onNodeDragStart} />
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: 1 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#2e3142', fontWeight: 600 }}>
              Workflow Builder
            </Typography>
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSave}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button
              startIcon={<PlayIcon />}
              onClick={handleExecute}
              variant="contained"
              disabled={!workflowId}
            >
              Execute
            </Button>
          </Toolbar>
        </AppBar>

        <Paper
          ref={reactFlowWrapper}
          sx={{
            flex: 1,
            m: 2,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
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
            style={{ backgroundColor: '#f8f9fb' }}
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </Paper>
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