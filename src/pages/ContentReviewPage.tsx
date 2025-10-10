import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import CommentThread from '../components/feedback/CommentThread';
import { contentApi } from '../services/contentApi';

const ContentReviewPage = () => {
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviewItems();
  }, []);

  const loadReviewItems = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getReviewItems();
      setReviewItems(response.data);
      if (response.data.length > 0) {
        setSelectedItem(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load review items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!selectedItem) return;
    try {
      await contentApi.addComment(selectedItem.id, text);
      // Reload to get updated comments
      loadReviewItems();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await contentApi.resolveComment(commentId);
      loadReviewItems();
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  const statusColors: Record<string, string> = {
    draft: '#9e9e9e',
    in_review: '#2196f3',
    changes_requested: '#ff9800',
    approved: '#4caf50',
  };

  if (loading) {
    return (
      <AdminLayout title="Content Review" subtitle="Review and collaborate on content">
        <Typography align="center" sx={{ py: 8 }}>Loading...</Typography>
      </AdminLayout>
    );
  }

  if (!selectedItem) {
    return (
      <AdminLayout title="Content Review" subtitle="Review and collaborate on content">
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              No content to review
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All caught up! Check back later for new content.
            </Typography>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Content Review" subtitle="Review and collaborate on content">
      <Grid container spacing={3}>
        {/* Sidebar - Review Queue */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Review Queue
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {reviewItems.map((item) => (
                  <Paper
                    key={item.id}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      backgroundColor: selectedItem?.id === item.id ? '#f0f7ff' : '#fff',
                      border: selectedItem?.id === item.id ? '2px solid #5f5eff' : '1px solid #e0e0e0',
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {item.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={item.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          backgroundColor: statusColors[item.status],
                          color: '#fff',
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        v{item.version}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h5">{selectedItem.title}</Typography>
                  <Chip
                    label={selectedItem.status.replace('_', ' ').toUpperCase()}
                    sx={{
                      backgroundColor: statusColors[selectedItem.status],
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                    {selectedItem.author.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{selectedItem.author}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Version {selectedItem.version}
                    </Typography>
                  </Box>

                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Reviewers:
                    </Typography>
                    <AvatarGroup max={3}>
                      {selectedItem.reviewers.map((reviewer: string, idx: number) => (
                        <Avatar key={idx} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                          {reviewer.charAt(0)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Box>
                </Box>

                <Divider />
              </Box>

              {/* Content */}
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#fafafa',
                  minHeight: 400,
                  '& h1': { fontSize: '1.75rem', fontWeight: 600, mb: 2 },
                  '& h2': { fontSize: '1.5rem', fontWeight: 600, mb: 2, mt: 3 },
                  '& h3': { fontSize: '1.25rem', fontWeight: 600, mb: 1, mt: 2 },
                  '& p': { mb: 2, lineHeight: 1.7 },
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: selectedItem.content.replace(/\n/g, '<br />') }} />
              </Paper>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => console.log('Reject')}
                >
                  Request Changes
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ApproveIcon />}
                  onClick={() => console.log('Approve')}
                >
                  Approve
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Sidebar - Comments */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CommentIcon />
                <Typography variant="subtitle2">
                  Comments ({selectedItem.comments.length})
                </Typography>
              </Box>

              <CommentThread
                comments={selectedItem.comments}
                onAddComment={handleAddComment}
                onResolve={handleResolveComment}
              />

              <Divider sx={{ my: 3 }} />

              {/* Attachments */}
              <Typography variant="subtitle2" gutterBottom>
                Attachments
              </Typography>
              {selectedItem.attachments.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  No attachments
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedItem.attachments.map((attachment: any) => (
                    <Paper key={attachment.id} sx={{ p: 1 }}>
                      <Typography variant="caption">{attachment.name}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default ContentReviewPage;

