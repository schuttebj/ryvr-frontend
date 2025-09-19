import { useState, useCallback, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import AgencyLayout from '../components/layout/AgencyLayout';
import BusinessLayout from '../components/layout/BusinessLayout';
import { useAuth } from '../contexts/AuthContext';
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
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as WorkflowIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { workflowApi } from '../services/workflowApi';

interface WorkflowSummary {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  nodes?: any[];
  lastExecuted?: string;
  tags?: string[];
  executionCount?: number;
  successRate?: number;
  createdAt?: string;
}

export default function WorkflowsPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuWorkflowId, setMenuWorkflowId] = useState<string | null>(null);
  // Remove unused dialog state since we go directly to builder
  // const [newWorkflowDialog, setNewWorkflowDialog] = useState(false);
  // const [newWorkflowName, setNewWorkflowName] = useState('');
  // const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

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
          isActive: w.isActive || false,
          nodes: w.nodes || [],
          successRate: 0,
          createdAt: w.createdAt,
          tags: w.tags || [],
          executionCount: w.executionCount || 0,
        })));
      } catch (error) {
        console.error('Failed to load workflows:', error);
      }
    };

    // Only load workflows when not showing builder (i.e., when returning to list)
    if (!showBuilder) {
      loadWorkflows();
      setEditingWorkflowId(null); // Reset editing mode when returning to list
    }
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
          isActive: workflow.isActive || false,
          nodes: workflow.nodes || [],
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
    // Don't create a workflow summary here - let the builder handle the creation
    setEditingWorkflowId(null); // Clear editing mode for new workflow
    setShowBuilder(true);
  };

  const handleEditWorkflow = (workflowId: string) => {
    setEditingWorkflowId(workflowId); // Set the workflow ID for editing
    setShowBuilder(true);
    setAnchorEl(null);
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      // Delete from backend/storage
      await workflowApi.deleteWorkflow(workflowId);
      
      // Update local state
      setWorkflows(workflows.filter(w => w.id !== workflowId));
      setAnchorEl(null);
      
      console.log(`Workflow ${workflowId} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      // You might want to show a toast notification here
    }
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#4caf50' : '#ff9800';
  };

  // Get the appropriate layout component based on user role
  const getLayoutComponent = () => {
    if (user?.role === 'admin') return AdminLayout;
    if (user?.role === 'agency_owner' || user?.role === 'agency_manager' || user?.role === 'agency_viewer') return AgencyLayout;
    return BusinessLayout; // For individual_user, business_owner, business_user
  };

  // Get the appropriate breadcrumb base path based on user role
  const getBasePath = () => {
    if (user?.role === 'admin') return '/admin/workflows';
    if (user?.role === 'agency_owner' || user?.role === 'agency_manager' || user?.role === 'agency_viewer') return '/agency/workflows';
    return '/business/workflows';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircleIcon /> : <EditIcon />;
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Active' : 'Draft';
  };

  if (showBuilder) {
    const LayoutComponent = getLayoutComponent();
    return (
      <LayoutComponent 
        title={editingWorkflowId ? "Edit Workflow" : "Create Workflow"}
        subtitle="Design your automation workflow"
      >
        <WorkflowBuilder
          onSave={handleWorkflowSave}
          workflowId={editingWorkflowId || undefined}
        />
      </LayoutComponent>
    );
  }

  const headerActions = (
    <Button
      startIcon={<AddIcon />}
      variant="contained"
      onClick={handleCreateWorkflow}
    >
      Create Workflow
    </Button>
  );

  const LayoutComponent = getLayoutComponent();
  
  return (
    <LayoutComponent 
      title="Workflows"
      subtitle="Create and manage automation workflows"
      actions={headerActions}
    >
      <Box>

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
                    icon={getStatusIcon(workflow.isActive)}
                    label={getStatusLabel(workflow.isActive)}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(workflow.isActive)}20`,
                      color: getStatusColor(workflow.isActive),
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {workflow.nodes?.length || 0} nodes
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
                  {workflow.isActive && (
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

      {/* Create Workflow Dialog removed - now go directly to builder */}
      </Box>
    </LayoutComponent>
  );
} 