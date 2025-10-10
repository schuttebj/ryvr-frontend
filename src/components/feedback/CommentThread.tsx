import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CheckCircle as ResolveIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

interface CommentThreadProps {
  comments: Comment[];
  onAddComment?: (text: string) => void;
  onResolve?: (commentId: string) => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onAddComment,
  onResolve,
}) => {
  const [newComment, setNewComment] = useState('');
  const [showReply, setShowReply] = useState(false);

  const handleSubmit = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment);
      setNewComment('');
      setShowReply(false);
    }
  };

  return (
    <Box>
      {comments.map((comment) => (
        <Card
          key={comment.id}
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: comment.resolved ? '#f5f5f5' : '#fff',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                {comment.author.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">{comment.author}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {comment.resolved && (
                <Chip
                  label="Resolved"
                  size="small"
                  color="success"
                  icon={<ResolveIcon />}
                />
              )}
              {!comment.resolved && onResolve && (
                <IconButton
                  size="small"
                  onClick={() => onResolve(comment.id)}
                  title="Mark as resolved"
                >
                  <ResolveIcon />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography variant="body2" sx={{ ml: 5 }}>
            {comment.text}
          </Typography>
        </Card>
      ))}

      <Box sx={{ mt: 2 }}>
        {!showReply ? (
          <Button
            startIcon={<ReplyIcon />}
            onClick={() => setShowReply(true)}
            variant="outlined"
            size="small"
          >
            Add Comment
          </Button>
        ) : (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => {
                  setNewComment('');
                  setShowReply(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSubmit}
                disabled={!newComment.trim()}
              >
                Comment
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommentThread;

