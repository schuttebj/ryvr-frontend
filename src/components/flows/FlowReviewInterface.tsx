/**
 * FlowReviewInterface Component
 * 
 * Interface for reviewing and approving flows that are in review status.
 * Shows the flow context, current step details, and approval options.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Timeline as ProgressIcon,
  RateReview as ReviewIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

import { FlowCard, ApproveReviewRequest } from '../../types/workflow';
import FlowApiService from '../../services/flowApi';

interface FlowReviewInterfaceProps {
  flow: FlowCard | null;
  open: boolean;
  onClose: () => void;
  onReviewCompleted: () => void;
}

export default function FlowReviewInterface({
  flow,
  open,
  onClose,
  onReviewCompleted
}: FlowReviewInterfaceProps) {
  const theme = useTheme();
  
  // State management
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open && flow) {
      setSelectedReview(flow.pending_reviews?.[0]?.step_id || null);
      setComments('');
      setError(null);
    } else {
      setSelectedReview(null);
      setComments('');
      setError(null);
    }
  }, [open, flow]);
  
  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  const handleApprove = async () => {
    if (!flow || !selectedReview) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const approvalRequest: ApproveReviewRequest = {
        step_id: selectedReview,
        approved: true,
        comments: comments.trim() || undefined
      };
      
      await FlowApiService.approveReview(flow.id, selectedReview, approvalRequest);
      
      onReviewCompleted();
      onClose();
    } catch (err: any) {
      console.error('Error approving review:', err);
      setError(err.response?.data?.detail || 'Failed to approve review');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!flow || !selectedReview) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const approvalRequest: ApproveReviewRequest = {
        step_id: selectedReview,
        approved: false,
        comments: comments.trim() || 'Review rejected'
      };
      
      await FlowApiService.approveReview(flow.id, selectedReview, approvalRequest);
      
      onReviewCompleted();
      onClose();
    } catch (err: any) {
      console.error('Error rejecting review:', err);
      setError(err.response?.data?.detail || 'Failed to reject review');
    } finally {
      setLoading(false);
    }
  };
  
  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const getCurrentReview = () => {
    if (!flow || !flow.pending_reviews || !selectedReview) return null;
    return flow.pending_reviews.find(review => review.step_id === selectedReview);
  };
  
  const getReviewerTypeLabel = (reviewerType: string) => {
    switch (reviewerType) {
      case 'agency':
        return 'Agency Review';
      case 'client':
        return 'Client Review';
      case 'admin':
        return 'Admin Review';
      default:
        return 'Review';
    }
  };
  
  const getReviewerTypeColor = (reviewerType: string) => {
    switch (reviewerType) {
      case 'agency':
        return theme.palette.primary.main;
      case 'client':
        return theme.palette.success.main;
      case 'admin':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  if (!flow) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="error">
            No flow selected for review.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  const currentReview = getCurrentReview();
  const hasMultipleReviews = flow.pending_reviews && flow.pending_reviews.length > 1;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReviewIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Flow Review
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Loading Indicator */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Flow Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Flow Information
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Flow Title
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {flow.title}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Template
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {flow.template_name}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={flow.progress}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 35 }}>
                    {flow.progress}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {flow.completed_steps}/{flow.total_steps} steps completed
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Step
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {flow.current_step || 'Unknown'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        {/* Pending Reviews */}
        {flow.pending_reviews && flow.pending_reviews.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Pending Reviews ({flow.pending_reviews.length})
              </Typography>
              
              <Stack spacing={2}>
                {flow.pending_reviews.map((review, index) => {
                  const isSelected = selectedReview === review.step_id;
                  const reviewerColor = getReviewerTypeColor(review.reviewer_needed);
                  
                  return (
                    <Card
                      key={index}
                      variant="outlined"
                      sx={{
                        cursor: hasMultipleReviews ? 'pointer' : 'default',
                        border: isSelected 
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                        backgroundColor: isSelected 
                          ? alpha(theme.palette.primary.main, 0.05)
                          : 'transparent',
                        '&:hover': hasMultipleReviews ? {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        } : {},
                      }}
                      onClick={() => hasMultipleReviews && setSelectedReview(review.step_id)}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              Step: {review.step_id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Submitted: {new Date(review.submitted_at).toLocaleString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={getReviewerTypeLabel(review.reviewer_needed)}
                              size="small"
                              sx={{
                                backgroundColor: alpha(reviewerColor, 0.1),
                                color: reviewerColor,
                                fontWeight: 500,
                              }}
                            />
                            {isSelected && (
                              <Chip
                                label="Selected"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        )}
        
        {/* Review Action */}
        {currentReview && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Review Action
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  This step requires {getReviewerTypeLabel(currentReview.reviewer_needed).toLowerCase()} 
                  before the flow can continue. Please review the work completed so far and provide your approval.
                </Typography>
              </Alert>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments (Optional)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments about this review..."
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={handleReject}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Reject
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={handleApprove}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Approve
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Review carefully before approving. This action cannot be undone.
        </Typography>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
