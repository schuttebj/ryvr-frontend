import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
// import AgencyLayout from '../components/layout/AgencyLayout'; // Unused in simplified structure
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as WorkflowIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import WorkflowImportExport from '../components/workflow/WorkflowImportExport';
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
  return (
    <Routes>
      <Route index element={<WorkflowsList />} />
      <Route path=":workflowId" element={<WorkflowBuilderPage />} />
      <Route path="new" element={<WorkflowBuilderPage />} />
    </Routes>
  );
}

function WorkflowsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowSummary[]>([]);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  // Remove unused dialog state since we go directly to builder
  // const [newWorkflowDialog, setNewWorkflowDialog] = useState(false);
  // const [newWorkflowName, setNewWorkflowName] = useState('');
  // const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  // Function to load workflows
  const loadWorkflows = useCallback(async () => {
    try {
      console.log('Loading workflow templates...');
      const result = await workflowApi.listWorkflowTemplates();
      console.log('Loaded workflow templates:', result);
      
      if (result.success && result.templates) {
        setWorkflows(result.templates.map((template: any) => ({
          id: template.id.toString(),
          name: template.name,
          description: template.description || '',
          isActive: template.status === 'published',
          nodes: template.steps || [],
          successRate: 0, // Will get from execution history later
          createdAt: template.created_at,
          tags: template.tags || [],
          executionCount: 0, // Will get from execution history later
        })));
      } else {
        console.error('Failed to load templates:', result.error);
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
      setWorkflows([]);
    }
  }, []);

  // Load workflows on component mount
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // Filter workflows based on search and filter criteria
  useEffect(() => {
    let filtered = workflows;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(workflow =>
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(workflow =>
        workflow.tags?.includes(categoryFilter.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'active') {
        filtered = filtered.filter(workflow => workflow.isActive);
      } else if (statusFilter === 'draft') {
        filtered = filtered.filter(workflow => !workflow.isActive);
      }
    }

    setFilteredWorkflows(filtered);
  }, [workflows, searchTerm, categoryFilter, statusFilter]);

  const handleCreateWorkflow = () => {
    navigate('new');
  };

  const handleEditWorkflow = (workflowId: string) => {
    navigate(workflowId);
    setAnchorEl(null);
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      // Delete from backend
      const result = await workflowApi.deleteWorkflowTemplate(parseInt(workflowId));
      
      if (result.success) {
        // Update local state
        setWorkflows(workflows.filter(w => w.id !== workflowId));
        setAnchorEl(null);
        console.log(`Workflow template ${workflowId} deleted successfully`);
      } else {
        console.error('Failed to delete workflow template:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      // You might want to show a toast notification here
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, workflowId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkflowId(workflowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWorkflowId(null);
  };

  // Filter handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event: any) => {
    setCategoryFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  // Get unique categories from workflows for filter options
  const getCategories = () => {
    const allTags = workflows.flatMap(w => w.tags || []);
    return [...new Set(allTags)];
  };

  const handleWorkflowExecute = useCallback((workflowId: string) => {
    console.log('Executing workflow:', workflowId);
    // TODO: Implement actual execute functionality
  }, []);

  const handleImportSuccess = useCallback((templateId: number) => {
    console.log('Workflow imported successfully:', templateId);
    // Refresh the workflows list to show the imported workflow
    loadWorkflows();
  }, [loadWorkflows]);

  const handleExportWorkflow = useCallback(async (workflowId: string) => {
    try {
      console.log('Exporting workflow:', workflowId);
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;
      
      // Convert string ID to number for V2 templates
      const templateId = parseInt(workflowId);
      if (isNaN(templateId)) {
        console.warn('Cannot export workflow with non-numeric ID:', workflowId);
        return;
      }
      
      const exportData = await workflowApi.exportWorkflow(templateId, true);
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflow.name}-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      handleMenuClose();
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [workflows]);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#4caf50' : '#ff9800';
  };

  // Get the appropriate layout component based on user role
  const getLayoutComponent = () => {
    if (user?.role === 'admin') return AdminLayout;
    return BusinessLayout; // For all users
  };


  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircleIcon /> : <EditIcon />;
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Active' : 'Draft';
  };

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
        {/* Filter and Search Bar */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2 
          }}
        >
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filter & Search
              </Typography>
              <Stack direction="row" spacing={1}>
                <WorkflowImportExport
                  onImportSuccess={handleImportSuccess}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleCreateWorkflow}
                  sx={{ minWidth: 140 }}
                >
                  Add New
                </Button>
              </Stack>
            </Box>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              {/* Search Field */}
              <TextField
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={() => setSearchTerm('')}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 250 }}
              />
              
              {/* Category Filter */}
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={handleCategoryFilterChange}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {getCategories().map(category => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Status Filter */}
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
              
              {/* Clear Filters Button */}
              {(searchTerm || categoryFilter || statusFilter) && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ minWidth: 100 }}
                >
                  Clear
                </Button>
              )}
            </Stack>
            
            {/* Results Count */}
            <Typography variant="body2" color="text.secondary">
              Showing {filteredWorkflows.length} of {workflows.length} workflows
            </Typography>
          </Stack>
        </Paper>

      <Grid container spacing={3}>
        {filteredWorkflows.map((workflow) => (
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
        <MenuItem onClick={() => handleEditWorkflow(selectedWorkflowId!)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleExportWorkflow(selectedWorkflowId!)}>
          <ExportIcon sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <MenuItem onClick={() => handleDeleteWorkflow(selectedWorkflowId!)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Workflow Dialog removed - now go directly to builder */}
      </Box>
    </LayoutComponent>
  );
}

// Separate component for workflow builder page
function WorkflowBuilderPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSaveWorkflow = async (workflow: any) => {
    try {
      const result = await workflowApi.saveWorkflow(workflow);
      
      if (result.success) {
        console.log('✅ Workflow saved successfully:', result.workflow);
        
        // Small delay to ensure backend is synced before navigating
        setTimeout(() => {
          navigate('/admin/workflows');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Failed to save workflow:', error);
      alert('Failed to save workflow: ' + (error as Error).message);
    }
  };

  // Determine which layout to use based on user role
  const LayoutComponent = user?.role === 'admin' ? AdminLayout : BusinessLayout;

  return (
    <LayoutComponent 
      title={workflowId && workflowId !== 'new' ? "Edit Workflow" : "Create Workflow"}
      subtitle={workflowId && workflowId !== 'new' ? "Modify your workflow" : "Build a new automation"}
    >
      <WorkflowBuilder 
        workflowId={workflowId && workflowId !== 'new' ? workflowId : undefined}
        onSave={handleSaveWorkflow}
      />
    </LayoutComponent>
  );
} 