/**
 * Flows Page - Kanban-style Flow Management Interface
 * 
 * Main interface for managing flows (workflow executions) with:
 * - Kanban board with drag-and-drop
 * - Business switching (like Trello boards)
 * - Progress tracking and status management
 * - Flow creation wizard integration
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  PlayArrow as PlayIcon,
  Error as ErrorIcon,
  CheckCircle as CompleteIcon,
  Schedule as ScheduleIcon,
  RateReview as ReviewIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import { FlowCard as FlowCardType, FlowStatus, FlowBusinessContext } from '../types/workflow';
import FlowApiService from '../services/flowApi';
import FlowCreationWizard from '../components/flows/FlowCreationWizard';
import FlowCard from '../components/flows/FlowCard';
import BusinessSelector from '../components/flows/BusinessSelector';
import FlowReviewInterface from '../components/flows/FlowReviewInterface';
import { useAuth } from '../contexts/AuthContext';

const FLOW_COLUMNS = [
  { id: 'new', title: 'New', color: '#6b7280' },
  { id: 'scheduled', title: 'Scheduled', color: '#f59e0b' },
  { id: 'in_progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'in_review', title: 'In Review', color: '#8b5cf6' },
  { id: 'complete', title: 'Complete', color: '#10b981' },
  { id: 'error', title: 'Error', color: '#ef4444' },
];

export default function FlowsPage() {
  const theme = useTheme();
  const { userContext, currentBusinessId, user } = useAuth();
  
  // State management
  const [selectedBusiness, setSelectedBusiness] = useState<FlowBusinessContext | null>(null);
  const [flows, setFlows] = useState<FlowCardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [reviewInterfaceOpen, setReviewInterfaceOpen] = useState(false);
  const [selectedFlowForReview, setSelectedFlowForReview] = useState<FlowCardType | null>(null);
  
  // Get available businesses from AuthContext
  const availableBusinesses: FlowBusinessContext[] = (userContext?.businesses || []).map((business) => ({
    id: business.id,
    name: business.name,
    agency_id: 0, // Not used in current structure
    active_flows_count: 0,
    credits_remaining: 0, // Could be added to Business model if needed
    tier: 'basic'
  }));
  
  // Debug logging
  console.log('🔍 FlowsPage - Debug Info:', {
    userRole: user?.role,
    businessCount: availableBusinesses.length,
    businesses: availableBusinesses.map(b => ({ id: b.id, name: b.name })),
    currentBusinessId,
    selectedBusiness: selectedBusiness ? { id: selectedBusiness.id, name: selectedBusiness.name } : null
  });
  
  // Organize flows by status for Kanban columns
  const flowsByStatus = FLOW_COLUMNS.reduce((acc, column) => {
    acc[column.id] = flows.filter(flow => flow.status === column.id);
    return acc;
  }, {} as Record<string, FlowCardType[]>);
  
  // =============================================================================
  // INITIALIZATION
  // =============================================================================
  
  // Auto-select first business or current business from context
  useEffect(() => {
    if (availableBusinesses.length > 0 && !selectedBusiness) {
      // Try to use currentBusinessId from context first
      const currentBusiness = availableBusinesses.find(b => b.id === currentBusinessId);
      setSelectedBusiness(currentBusiness || availableBusinesses[0]);
    }
  }, [availableBusinesses, currentBusinessId, selectedBusiness]);
  
  useEffect(() => {
    if (selectedBusiness) {
      loadFlows();
    }
  }, [selectedBusiness]);
  
  const loadFlows = async () => {
    if (!selectedBusiness) {
      setError('No business selected');
      return;
    }
    
    if (!selectedBusiness.id || isNaN(selectedBusiness.id)) {
      setError(`Invalid business ID: ${selectedBusiness.id}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading flows for business:', selectedBusiness);
      const response = await FlowApiService.getFlows(selectedBusiness.id, {
        limit: 100 // Load all flows for now
      });
      setFlows(response.flows);
    } catch (err) {
      console.error('Error loading flows:', err);
      setError(`Failed to load flows: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // =============================================================================
  // DRAG AND DROP HANDLING
  // =============================================================================
  
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Dropped outside a valid area
    if (!destination) return;
    
    // No movement
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    const flowId = parseInt(draggableId);
    const newStatus = destination.droppableId as FlowStatus;
    
    // Optimistic update
    setFlows(prevFlows => 
      prevFlows.map(flow => 
        flow.id === flowId 
          ? { ...flow, status: newStatus }
          : flow
      )
    );
    
    try {
      await FlowApiService.updateFlow(flowId, { status: newStatus });
      
      // Reload flows to get updated data
      await loadFlows();
    } catch (err) {
      console.error('Error updating flow status:', err);
      
      // Revert optimistic update on error
      setFlows(prevFlows => 
        prevFlows.map(flow => 
          flow.id === flowId 
            ? { ...flow, status: source.droppableId as FlowStatus }
            : flow
        )
      );
      
      setError('Failed to update flow status');
    }
  };
  
  // =============================================================================
  // FLOW ACTIONS
  // =============================================================================
  
  const handleFlowCreated = async () => {
    setWizardOpen(false);
    await loadFlows();
  };
  
  const handleStartFlow = async (flowId: number) => {
    try {
      await FlowApiService.startFlow(flowId);
      await loadFlows();
    } catch (err) {
      console.error('Error starting flow:', err);
      setError('Failed to start flow');
    }
  };
  
  const handleApproveReview = async (flowId: number, stepId: string) => {
    try {
      await FlowApiService.approveReview(flowId, stepId, {
        step_id: stepId,
        approved: true,
        comments: ''
      });
      await loadFlows();
    } catch (err) {
      console.error('Error approving review:', err);
      setError('Failed to approve review');
    }
  };
  
  const handleOpenReviewInterface = (flow: FlowCardType) => {
    setSelectedFlowForReview(flow);
    setReviewInterfaceOpen(true);
  };
  
  const handleCloseReviewInterface = () => {
    setReviewInterfaceOpen(false);
    setSelectedFlowForReview(null);
  };
  
  const handleReviewCompleted = async () => {
    await loadFlows();
  };
  
  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'new': return <AddIcon />;
      case 'scheduled': return <ScheduleIcon />;
      case 'in_progress': return <PlayIcon />;
      case 'in_review': return <ReviewIcon />;
      case 'complete': return <CompleteIcon />;
      case 'error': return <ErrorIcon />;
      default: return <AddIcon />;
    }
  };
  
  const renderKanbanColumn = (column: typeof FLOW_COLUMNS[0]) => {
    const columnFlows = flowsByStatus[column.id] || [];
    
    return (
      <Box
        key={column.id}
        sx={{
          flex: 1,
          minWidth: 280,
          maxWidth: 320,
          height: 'fit-content',
        }}
      >
        {/* Column Header */}
        <Card
          sx={{
            mb: 2,
            backgroundColor: alpha(column.color, 0.1),
            borderTop: `3px solid ${column.color}`,
          }}
        >
          <CardContent sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: column.color }}>
                  {getColumnIcon(column.id)}
                </Box>
                <Typography variant="h6" sx={{ color: column.color, fontWeight: 600 }}>
                  {column.title}
                </Typography>
                <Chip
                  label={columnFlows.length}
                  size="small"
                  sx={{
                    backgroundColor: alpha(column.color, 0.2),
                    color: column.color,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        {/* Droppable Area */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                minHeight: 120,
                backgroundColor: snapshot.isDraggingOver 
                  ? alpha(column.color, 0.05)
                  : 'transparent',
                borderRadius: 2,
                transition: 'background-color 0.2s ease',
                p: 1,
              }}
            >
              {columnFlows.map((flow, index) => (
                <Draggable
                  key={flow.id}
                  draggableId={flow.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        mb: 2,
                        transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <FlowCard
                        flow={flow}
                        onStart={() => handleStartFlow(flow.id)}
                        onApproveReview={(stepId) => handleApproveReview(flow.id, stepId)}
                        onOpenReview={() => handleOpenReviewInterface(flow)}
                        isDragging={snapshot.isDragging}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Empty state */}
              {columnFlows.length === 0 && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'text.secondary',
                    fontStyle: 'italic',
                  }}
                >
                  No flows
                </Box>
              )}
            </Box>
          )}
        </Droppable>
      </Box>
    );
  };
  
  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  if (availableBusinesses.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          {user?.role === 'admin' 
            ? 'No businesses in the system yet. Create a test business to get started with flows.'
            : 'No businesses found. You need access to at least one business to manage flows.'}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Flows
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Business Selector */}
            <BusinessSelector
              businesses={availableBusinesses}
              selectedBusiness={selectedBusiness}
              onBusinessChange={setSelectedBusiness}
            />
            
            {/* Create Flow Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setWizardOpen(true)}
              disabled={!selectedBusiness || loading}
              sx={{ minWidth: 140 }}
            >
              New Flow
            </Button>
          </Box>
        </Box>
        
        {/* Business Info */}
        {selectedBusiness && (
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Chip
              icon={<BusinessIcon />}
              label={selectedBusiness.name}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
            <Typography variant="body2" color="text.secondary">
              {selectedBusiness.credits_remaining} credits remaining
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flows.length} total flows
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Box sx={{ px: 3, py: 1 }}>
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Box>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ px: 3, py: 1 }}>
          <LinearProgress />
        </Box>
      )}
      
      {/* Kanban Board */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              p: 3,
              overflowX: 'auto',
              height: '100%',
              alignItems: 'flex-start',
            }}
          >
            {FLOW_COLUMNS.map(renderKanbanColumn)}
          </Box>
        </DragDropContext>
      </Box>
      
      {/* Flow Creation Wizard */}
      <FlowCreationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onFlowCreated={handleFlowCreated}
        selectedBusiness={selectedBusiness}
      />
      
      {/* Flow Review Interface */}
      <FlowReviewInterface
        flow={selectedFlowForReview}
        open={reviewInterfaceOpen}
        onClose={handleCloseReviewInterface}
        onReviewCompleted={handleReviewCompleted}
      />
    </Box>
  );
}
