import { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';

// Initial test nodes following React Flow documentation
const initialNodes: Node[] = [
  { 
    id: 'trigger-1', 
    position: { x: 100, y: 100 }, 
    data: { label: '🚀 Trigger Node' },
    style: {
      backgroundColor: '#4caf50',
      color: 'white',
      border: '2px solid #388e3c',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
    }
  },
  { 
    id: 'action-1', 
    position: { x: 400, y: 100 }, 
    data: { label: '📧 Email Action' },
    style: {
      backgroundColor: '#2196f3',
      color: 'white',
      border: '2px solid #1976d2',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
    }
  },
  { 
    id: 'action-2', 
    position: { x: 700, y: 100 }, 
    data: { label: '🤖 AI Analysis' },
    style: {
      backgroundColor: '#9c27b0',
      color: 'white',
      border: '2px solid #7b1fa2',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
    }
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'trigger-to-email', 
    source: 'trigger-1', 
    target: 'action-1',
    animated: true,
    style: { stroke: '#5f5fff', strokeWidth: 3 }
  }
];

export default function FlowTestPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds: Node[]) => applyNodeChanges(changes, nds)),
    [],
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds)),
    [],
  );
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#5f5fff', strokeWidth: 3 }
    }, eds)),
    [],
  );

  const onNodeClick = useCallback((_event: any, node: Node) => {
    console.log('Node clicked:', node);
    alert(`Clicked: ${node.data.label}\nID: ${node.id}\n\nThis shows the node is interactive!`);
  }, []);

  const addNewNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 200 },
      data: { label: `🔧 New Node ${nodes.length + 1}` },
      style: {
        backgroundColor: '#ff9800',
        color: 'white',
        border: '2px solid #f57c00',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
      }
    };
    setNodes((nds: Node[]) => [...nds, newNode]);
  }, [nodes.length]);

  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#2e3142', fontWeight: 600 }}>
            React Flow Test - Official Documentation Example
          </Typography>
          <Button 
            variant="contained" 
            onClick={addNewNode}
            sx={{ mr: 1, bgcolor: '#4caf50' }}
          >
            Add Node
          </Button>
          <Button 
            variant="outlined" 
            onClick={resetFlow}
            sx={{ borderColor: '#5f5fff', color: '#5f5fff' }}
          >
            Reset
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          style={{ backgroundColor: '#f8f9fb' }}
        >
          <Background 
            color="#e0e0e0" 
            gap={20} 
            size={1}
          />
          <Controls />
          <MiniMap
            nodeStrokeColor="#5f5fff"
            nodeColor="#ffffff"
            nodeBorderRadius={8}
            style={{
              backgroundColor: '#f8f9fb',
            }}
          />
        </ReactFlow>

        {/* Test Instructions */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            bgcolor: 'rgba(76, 175, 80, 0.95)',
            color: 'white',
            borderRadius: 2,
            p: 2,
            maxWidth: 300,
            zIndex: 1000,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            ✅ React Flow Test Mode
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            • Drag nodes around
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            • Click nodes for alerts
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            • Drag from edge of one node to another to connect
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            • Use controls in bottom-left
          </Typography>
        </Box>

        {/* Status */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            bgcolor: 'rgba(255,255,255,0.95)',
            borderRadius: 2,
            p: 2,
            zIndex: 1000,
          }}
        >
          <Typography variant="caption" sx={{ color: '#5a6577' }}>
            Nodes: {nodes.length} | Edges: {edges.length}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
} 