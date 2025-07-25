import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as WorkflowIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { workflowApi } from '../services/workflowApi';

interface WorkflowSummary {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'error';
  nodeCount: number;
  lastExecuted?: string;
  tags?: string[];
  executionCount?: number;
  successRate?: number;
  createdAt?: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuWorkflowId, setMenuWorkflowId] = useState<string | null>(null);
  const [newWorkflowDialog, setNewWorkflowDialog] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  // Load workflows on component mount and when returning from builder
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        console.log('Loading workflows...');
        const savedWorkflows = await workflowApi.listWorkflows();
        console.log('Loaded workflows:', savedWorkflows);
        setWorkflows(savedWorkflows.map((w: any) => ({
          id: w.id,
          name: w.name,
          description: w.description,
          status: w.isActive ? 'active' : 'draft',
          nodeCount: w.nodes?.length || 0,
          successRate: 0,
          createdAt: w.createdAt,
          tags: w.tags || [],
          executionCount: w.executionCount || 0,
        })));
      } catch (error) {
        console.error('Failed to load workflows:', error);
      }
    };

    loadWorkflows();
  }, [showBuilder]); // Re-load when showBuilder changes

  const handleWorkflowSave = useCallback(async (workflow: any) => {
    try {
      await workflowApi.saveWorkflow(workflow);
      
      // Update the workflows list
      setWorkflows(prev => {
        const existingIndex = prev.findIndex(w => w.id === workflow.id);
        const workflowSummary: WorkflowSummary = {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          status: 'draft',
          nodeCount: workflow.nodes?.length || 0,
          successRate: 0,
          createdAt: workflow.createdAt || new Date().toISOString(),
          tags: workflow.tags || [],
          executionCount: workflow.executionCount || 0,
        };
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = workflowSummary;
          return updated;
        } else {
          return [...prev, workflowSummary];
        }
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, []);

  const handleCreateWorkflow = () => {
    if (newWorkflowName.trim()) {
      const newWorkflow: WorkflowSummary = {
        id: Date.now().toString(),
        name: newWorkflowName,
        description: newWorkflowDescription,
        status: 'draft',
        nodeCount: 0,
        successRate: 0,
        createdAt: new Date().toISOString(),
      };
      setWorkflows([...workflows, newWorkflow]);
      setShowBuilder(true);
      setNewWorkflowDialog(false);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
    }
  };

  const handleEditWorkflow = (_workflowId: string) => {
    setShowBuilder(true);
    setAnchorEl(null);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(workflows.filter(w => w.id !== workflowId));
    setAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, workflowId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuWorkflowId(workflowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuWorkflowId(null);
  };

  const handleWorkflowExecute = useCallback((workflowId: string) => {
    console.log('Executing workflow:', workflowId);
    // TODO: Implement actual execute functionality
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'paused':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'paused':
        return <PauseIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <EditIcon />;
    }
  };

  if (showBuilder) {
    return (
      <WorkflowBuilder
        onSave={handleWorkflowSave}
      />
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Workflows
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setNewWorkflowDialog(true)}
        >
          Create Workflow
        </Button>
      </Box>

      <Grid container spacing={3}>
        {workflows.map((workflow) => (
          <Grid item xs={12} md={6} lg={4} key={workflow.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#5f5fff', mr: 2 }}>
                    <WorkflowIcon />
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, workflow.id)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {workflow.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {workflow.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    icon={getStatusIcon(workflow.status)}
                    label={workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(workflow.status)}20`,
                      color: getStatusColor(workflow.status),
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {workflow.nodeCount} nodes
                  </Typography>
                </Box>

                {workflow.lastExecuted && (
                  <Typography variant="caption" color="text.secondary">
                    Last executed: {new Date(workflow.lastExecuted).toLocaleDateString()}
                  </Typography>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleEditWorkflow(workflow.id)}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  {workflow.status === 'active' && (
                    <Button
                      startIcon={<PlayIcon />}
                      onClick={() => handleWorkflowExecute(workflow.id)}
                      variant="contained"
                      size="small"
                    >
                      Execute
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditWorkflow(menuWorkflowId!)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteWorkflow(menuWorkflowId!)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={newWorkflowDialog} onClose={() => setNewWorkflowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="outlined"
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newWorkflowDescription}
            onChange={(e) => setNewWorkflowDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewWorkflowDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateWorkflow} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 