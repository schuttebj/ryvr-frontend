import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Badge,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle as ApprovalIcon,
  Comment as CommentIcon,
  Edit as RevisionIcon,
  AlternateEmail as MentionIcon,
  MarkEmailRead as MarkReadIcon,
  MoreVert as MoreIcon,
  Circle as UnreadIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { collaborationApi } from '../services/collaborationApi';
import { format } from 'date-fns';

const FeedbackInboxPage = () => {
  const [feedbackItems, setFeedbackItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [currentTab]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const typeMap = ['all', 'approval', 'comment', 'revision', 'mention'];
      const type = currentTab === 0 ? undefined : typeMap[currentTab];
      const response = await collaborationApi.getFeedbackInbox({ type });
      setFeedbackItems(response.data);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await collaborationApi.markAsRead(id);
      loadFeedback();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await collaborationApi.markAllAsRead();
      loadFeedback();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIconForType = (type: string) => {
    const icons: Record<string, any> = {
      approval: <ApprovalIcon />,
      comment: <CommentIcon />,
      revision: <RevisionIcon />,
      mention: <MentionIcon />,
    };
    return icons[type] || <CommentIcon />;
  };

  const getColorForPriority = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: '#f44336',
      high: '#ff9800',
      medium: '#2196f3',
      low: '#4caf50',
    };
    return colors[priority] || '#9e9e9e';
  };

  const unreadCount = feedbackItems.filter(item => !item.isRead).length;

  return (
    <AdminLayout
      title="Feedback Inbox"
      subtitle="Stay on top of all your action items and notifications"
      actions={
        <Button
          variant="outlined"
          startIcon={<MarkReadIcon />}
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark All as Read
        </Button>
      }
    >
      <Box>
        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Unread Items
              </Typography>
              <Typography variant="h4" color="primary">
                {unreadCount}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Urgent
              </Typography>
              <Typography variant="h4" color="error.main">
                {feedbackItems.filter(i => i.priority === 'urgent').length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                High Priority
              </Typography>
              <Typography variant="h4" color="warning.main">
                {feedbackItems.filter(i => i.priority === 'high').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Tabs */}
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab
                label={
                  <Badge badgeContent={unreadCount} color="primary">
                    <span style={{ paddingRight: unreadCount > 0 ? 20 : 0 }}>All</span>
                  </Badge>
                }
              />
              <Tab label="Approvals" />
              <Tab label="Comments" />
              <Tab label="Revisions" />
              <Tab label="Mentions" />
            </Tabs>

            {/* Feedback List */}
            {loading ? (
              <Typography align="center" sx={{ py: 4 }}>Loading...</Typography>
            ) : feedbackItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  All caught up!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You have no pending items at the moment.
                </Typography>
              </Box>
            ) : (
              <List>
                {feedbackItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {!item.isRead && (
                            <IconButton
                              edge="end"
                              onClick={() => handleMarkAsRead(item.id)}
                              title="Mark as read"
                            >
                              <MarkReadIcon />
                            </IconButton>
                          )}
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setSelectedItem(item.id);
                            }}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        backgroundColor: (theme) => !item.isRead 
                          ? theme.palette.mode === 'dark' ? 'rgba(95, 94, 255, 0.1)' : '#f0f7ff'
                          : 'transparent',
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    >
                      <ListItemButton onClick={() => console.log('Open item', item.id)}>
                        <ListItemIcon>
                          <Badge color="error" variant="dot" invisible={item.isRead}>
                            {getIconForType(item.type)}
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={!item.isRead ? 600 : 400}
                                sx={{ flex: 1 }}
                              >
                                {item.title}
                              </Typography>
                              {!item.isRead && (
                                <UnreadIcon sx={{ fontSize: 12, color: '#5f5eff' }} />
                              )}
                              <Chip
                                label={item.priority.toUpperCase()}
                                size="small"
                                sx={{
                                  backgroundColor: getColorForPriority(item.priority),
                                  color: '#fff',
                                  fontSize: '0.7rem',
                                  height: 20,
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                From: {item.from}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
                              </Typography>
                              {item.dueDate && (
                                <>
                                  <Typography variant="caption" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Due: {format(new Date(item.dueDate), 'MMM d')}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < feedbackItems.length - 1 && <Box sx={{ height: 4 }} />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* Context Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => { console.log('Open'); setAnchorEl(null); }}>
                Open
              </MenuItem>
              <MenuItem onClick={() => { console.log('Mark as read'); setAnchorEl(null); }}>
                Mark as Read
              </MenuItem>
              <MenuItem onClick={() => { console.log('Archive'); setAnchorEl(null); }}>
                Archive
              </MenuItem>
            </Menu>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default FeedbackInboxPage;

