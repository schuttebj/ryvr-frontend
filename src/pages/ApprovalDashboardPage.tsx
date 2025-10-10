import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Grid,
  Checkbox,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import ApprovalCard from '../components/approval/ApprovalCard';
import { contentApi } from '../services/contentApi';

const ApprovalDashboardPage = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadApprovals();
  }, [currentTab]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const statusMap = ['pending', 'approved', 'changes_requested', 'rejected'];
      const status = currentTab === 0 ? undefined : statusMap[currentTab - 1];
      const response = await contentApi.getApprovals({ status });
      setApprovals(response.data);
    } catch (error) {
      console.error('Failed to load approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await contentApi.approveContent(id);
      loadApprovals();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await contentApi.rejectContent(id, 'Rejected by admin');
      loadApprovals();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const handleRequestChanges = async (id: string) => {
    try {
      await contentApi.requestChanges(id, 'Please make the requested changes');
      loadApprovals();
    } catch (error) {
      console.error('Failed to request changes:', error);
    }
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    selectedItems.forEach(id => {
      if (action === 'approve') {
        handleApprove(id);
      } else {
        handleReject(id);
      }
    });
    setSelectedItems([]);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredApprovals = approvals
    .filter(item => {
      if (searchQuery) {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.content.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const urgentCount = approvals.filter(a => a.priority === 'urgent' && a.status === 'pending').length;

  return (
    <AdminLayout
      title="Approval Dashboard"
      subtitle="Review and approve content before it goes live"
    >
      <Box>
        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Pending Approvals
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {pendingCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Urgent Items
                </Typography>
                <Typography variant="h4" color="error.main">
                  {urgentCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Approved Today
                </Typography>
                <Typography variant="h4" color="success.main">
                  {approvals.filter(a => a.status === 'approved').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Tabs */}
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="All" />
              <Tab label={`Pending (${pendingCount})`} />
              <Tab label="Approved" />
              <Tab label="Changes Requested" />
              <Tab label="Rejected" />
            </Tabs>

            {/* Filters and Search */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search content..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, maxWidth: 400 }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="date">Date Submitted</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                </Select>
              </FormControl>

              {selectedItems.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                  <Chip label={`${selectedItems.length} selected`} onDelete={() => setSelectedItems([])} />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleBulkAction('approve')}
                  >
                    Approve All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleBulkAction('reject')}
                  >
                    Reject All
                  </Button>
                </Box>
              )}
            </Box>

            {/* Approvals List */}
            {loading ? (
              <Typography align="center" sx={{ py: 4 }}>Loading approvals...</Typography>
            ) : filteredApprovals.length === 0 ? (
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" gutterBottom>
                    No items to review
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentTab === 0 ? 'No content pending approval' : 'No items in this category'}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box>
                {filteredApprovals.map((approval) => (
                  <Box key={approval.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {approval.status === 'pending' && (
                      <Checkbox
                        checked={selectedItems.includes(approval.id)}
                        onChange={() => toggleSelectItem(approval.id)}
                        sx={{ alignSelf: 'flex-start', pt: 2 }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <ApprovalCard
                        {...approval}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onRequestChanges={handleRequestChanges}
                        onView={(id) => console.log('View', id)}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default ApprovalDashboardPage;

