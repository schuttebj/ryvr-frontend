/**
 * FlowCard Component
 * 
 * Individual flow card for the Kanban interface with:
 * - Progress tracking
 * - Status indicators
 * - Action buttons
 * - Drag handle
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  MoreVert as MoreIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  CheckCircle as CompleteIcon,
  RateReview as ReviewIcon,
  Timeline as ProgressIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  Replay as RerunIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import { FlowCard as FlowCardType, FlowStatus } from '../../types/workflow';
import FlowApiService from '../../services/flowApi';

interface FlowCardProps {
  flow: FlowCardType;
  onStart?: () => void;
  onApproveReview?: (stepId: string) => void;
  onOpenReview?: () => void;
  onOpenOptions?: () => void;
  onViewDetails?: () => void;
  onRerun?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

export default function FlowCard({ 
  flow, 
  onStart, 
  onApproveReview,
  onOpenReview,
  onOpenOptions,
  onViewDetails,
  onRerun,
  onDelete,
  isDragging = false 
}: FlowCardProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  const statusInfo = FlowApiService.getFlowStatusInfo(flow.status);
  
  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleStartClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onStart?.();
    handleMenuClose();
  };
  
  const handleReviewApprove = (stepId: string) => {
    onApproveReview?.(stepId);
    handleMenuClose();
  };
  
  const handleOpenReviewInterface = () => {
    onOpenReview?.();
    handleMenuClose();
  };
  
  const handleOpenOptionsInterface = () => {
    onOpenOptions?.();
    handleMenuClose();
  };
  
  const handleViewDetails = (event: React.MouseEvent) => {
    event.stopPropagation();
    onViewDetails?.();
  };
  
  const handleRerun = () => {
    onRerun?.();
    handleMenuClose();
  };
  
  const handleDelete = () => {
    onDelete?.();
    handleMenuClose();
  };
  
  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const getStatusIcon = () => {
    switch (flow.status) {
      case FlowStatus.NEW:
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      case FlowStatus.SCHEDULED:
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      case FlowStatus.IN_PROGRESS:
        return <PlayIcon sx={{ fontSize: 16 }} />;
      case FlowStatus.IN_REVIEW:
        return <ReviewIcon sx={{ fontSize: 16 }} />;
      case FlowStatus.INPUT_REQUIRED:
        return <PlayIcon sx={{ fontSize: 16 }} />;
      case FlowStatus.COMPLETE:
        return <CompleteIcon sx={{ fontSize: 16 }} />;
      case FlowStatus.ERROR:
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
    }
  };
  
  const canStart = flow.status === FlowStatus.NEW || flow.status === FlowStatus.SCHEDULED || flow.status === FlowStatus.ERROR;
  const hasReviews = flow.pending_reviews && flow.pending_reviews.length > 0;
  const needsInput = flow.status === FlowStatus.INPUT_REQUIRED;
  // Always allow rerun and delete
  const canRerun = true;
  const canDelete = true;
  
  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  return (
    <>
      <Card
        onClick={handleViewDetails}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isDragging 
            ? theme.shadows[8]
            : theme.shadows[1],
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
          border: `1px solid ${alpha(statusInfo.color, 0.2)}`,
          borderLeft: `4px solid ${statusInfo.color}`,
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                flex: 1,
                mr: 1,
                lineHeight: 1.3,
                wordBreak: 'break-word'
              }}
            >
              {flow.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Status Chip */}
              <Chip
                icon={getStatusIcon()}
                label={statusInfo.label}
                size="small"
                sx={{
                  backgroundColor: alpha(statusInfo.color, 0.1),
                  color: statusInfo.color,
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
              
              {/* Menu Button */}
              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{ ml: 0.5 }}
              >
                <MoreIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
          
          {/* Template Info */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2, fontSize: '0.8rem' }}
          >
            From: {flow.template_name}
          </Typography>
          
          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                Progress
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {flow.completed_steps}/{flow.total_steps} steps
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={flow.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(statusInfo.color, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: statusInfo.color,
                  borderRadius: 3,
                },
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.75rem', 
                color: 'text.secondary',
                mt: 0.5,
                textAlign: 'center'
              }}
            >
              {flow.progress}% complete
            </Typography>
          </Box>
          
          {/* Current Step */}
          {flow.current_step && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <ProgressIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                  Current Step
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.8rem',
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                {flow.current_step}
              </Typography>
            </Box>
          )}
          
          {/* Pending Reviews */}
          {hasReviews && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 500,
                  color: 'warning.main',
                  mb: 0.5
                }}
              >
                Pending Reviews ({flow.pending_reviews!.length})
              </Typography>
              {flow.pending_reviews!.map((review, index) => (
                <Chip
                  key={index}
                  label={`${review.reviewer_needed} review needed`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    mr: 0.5, 
                    mb: 0.5, 
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              ))}
            </Box>
          )}
          
          {/* Footer Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Credits Used */}
              <Tooltip title="Credits used">
                <Chip
                  label={`${flow.credits_used} credits`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Tooltip>
              
              {/* Estimated Duration */}
              {flow.estimated_duration && (
                <Tooltip title="Estimated duration">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {FlowApiService.formatDuration(flow.estimated_duration)}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
            
            {/* Tags */}
            {flow.tags && flow.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {flow.tags.slice(0, 2).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    sx={{ 
                      fontSize: '0.65rem', 
                      height: 18,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    }}
                  />
                ))}
                {flow.tags.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{flow.tags.length - 2}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          
          {/* Error Message */}
          {flow.error_message && (
            <Box sx={{ mt: 1, p: 1, backgroundColor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.75rem',
                  color: 'error.main'
                }}
              >
                {flow.error_message}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 180 }
        }}
      >
        {/* View Details - Always available */}
        <MenuItem onClick={() => { handleViewDetails({} as any); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        
        {canStart && (
          <MenuItem onClick={handleStartClick}>
            <PlayIcon sx={{ mr: 1, fontSize: 18 }} />
            Start Flow
          </MenuItem>
        )}
        
        {hasReviews && (
          <>
            <MenuItem onClick={handleOpenReviewInterface}>
              <ReviewIcon sx={{ mr: 1, fontSize: 18 }} />
              Open Review Interface
            </MenuItem>
            {flow.pending_reviews!.map((review, index) => (
              <MenuItem 
                key={index}
                onClick={() => handleReviewApprove(review.step_id)}
              >
                <ReviewIcon sx={{ mr: 1, fontSize: 18 }} />
                Quick Approve {review.reviewer_needed}
              </MenuItem>
            ))}
          </>
        )}
        
        {needsInput && (
          <MenuItem onClick={handleOpenOptionsInterface}>
            <PlayIcon sx={{ mr: 1, fontSize: 18 }} />
            Select Options
          </MenuItem>
        )}
        
        {/* Rerun - Only for completed or failed flows */}
        {canRerun && (
          <MenuItem onClick={handleRerun}>
            <RerunIcon sx={{ mr: 1, fontSize: 18 }} />
            Rerun Flow
          </MenuItem>
        )}
        
        {/* Delete - Available for non-running flows */}
        {canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
            Delete Flow
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
