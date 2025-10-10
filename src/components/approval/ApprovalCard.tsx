import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface ApprovalCardProps {
  id: string;
  title: string;
  type: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedBy: string;
  submittedAt: string;
  business: string;
  campaign?: string;
  thumbnail?: string | null;
  wordCount?: number;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  onView?: (id: string) => void;
}

const priorityColors = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  urgent: '#d32f2f',
};

const statusColors = {
  pending: '#ff9800',
  approved: '#4caf50',
  rejected: '#f44336',
  changes_requested: '#2196f3',
};

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  id,
  title,
  type,
  content,
  status,
  priority,
  submittedBy,
  submittedAt,
  business,
  campaign,
  thumbnail,
  wordCount,
  onApprove,
  onReject,
  onRequestChanges,
  onView,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ mb: 2, border: `2px solid ${priorityColors[priority]}20` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip
                label={status.replace('_', ' ').toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: statusColors[status],
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={priority.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: priorityColors[priority],
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
              <Chip label={type.toUpperCase()} size="small" variant="outlined" />
            </Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { onView?.(id); handleMenuClose(); }}>
              View Details
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); }}>
              Edit
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {thumbnail && (
            <Box
              component="img"
              src={thumbnail}
              alt={title}
              sx={{
                width: 120,
                height: 90,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {content.substring(0, 150)}
              {content.length > 150 && '...'}
            </Typography>
            {wordCount && (
              <Typography variant="caption" color="text.secondary">
                Word count: {wordCount}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {submittedBy.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {submittedBy}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(submittedAt), 'MMM d, yyyy h:mm a')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Business: {business}
          </Typography>
          {campaign && (
            <Typography variant="caption" color="text.secondary">
              Campaign: {campaign}
            </Typography>
          )}
        </Box>
      </CardContent>

      {status === 'pending' && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onRequestChanges?.(id)}
          >
            Request Changes
          </Button>
          <Button
            size="small"
            startIcon={<RejectIcon />}
            color="error"
            onClick={() => onReject?.(id)}
          >
            Reject
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<ApproveIcon />}
            onClick={() => onApprove?.(id)}
          >
            Approve
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ApprovalCard;

