import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as PendingIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { campaignApi } from '../services/campaignApi';
import { format, differenceInDays } from 'date-fns';

const CampaignTimelinePage = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignApi.list();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: '#ff9800',
      active: '#4caf50',
      paused: '#9e9e9e',
      completed: '#2196f3',
    };
    return colors[status] || '#9e9e9e';
  };

  const getDaysRemaining = (endDate: string) => {
    return differenceInDays(new Date(endDate), new Date());
  };

  return (
    <AdminLayout
      title="Campaign Timeline"
      subtitle="Track all campaigns, milestones, and dependencies"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Create campaign')}
        >
          Create Campaign
        </Button>
      }
    >
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Campaigns
                </Typography>
                <Typography variant="h4">{campaigns.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Active
                </Typography>
                <Typography variant="h4" color="success.main">
                  {campaigns.filter(c => c.status === 'active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Budget
                </Typography>
                <Typography variant="h4">
                  ${campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Spent
                </Typography>
                <Typography variant="h4">
                  ${campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Campaign Timeline */}
        {campaigns.map((campaign) => {
          const daysRemaining = getDaysRemaining(campaign.endDate);
          const budgetUsed = (campaign.spent / campaign.budget) * 100;

          return (
            <Card key={campaign.id} sx={{ mb: 3 }}>
              <CardContent>
                {/* Campaign Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h6">{campaign.name}</Typography>
                      <Chip
                        label={campaign.status.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(campaign.status),
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={`${campaign.progress}% Complete`}
                        size="small"
                        icon={<ProgressIcon />}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(campaign.startDate), 'MMM d, yyyy')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                      {daysRemaining > 0 && ` · ${daysRemaining} days remaining`}
                    </Typography>
                  </Box>

                  <AvatarGroup max={4}>
                    {campaign.team.map((member: string, idx: number) => (
                      <Tooltip key={idx} title={member}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {member.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Campaign Progress
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {campaign.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={campaign.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStatusColor(campaign.status),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Budget Progress */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Budget: ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {budgetUsed.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budgetUsed, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: budgetUsed > 90 ? '#f44336' : '#2196f3',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Milestones */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Milestones
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {campaign.milestones.map((milestone: any) => (
                      <Card
                        key={milestone.id}
                        variant="outlined"
                        sx={{
                          minWidth: 200,
                          opacity: milestone.completed ? 0.7 : 1,
                        }}
                      >
                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            {milestone.completed ? (
                              <CompleteIcon color="success" fontSize="small" />
                            ) : (
                              <PendingIcon color="action" fontSize="small" />
                            )}
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {milestone.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(milestone.date), 'MMM d, yyyy')}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {loading && <Typography align="center" sx={{ py: 4 }}>Loading campaigns...</Typography>}
        {!loading && campaigns.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" gutterBottom>
                No campaigns yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create your first campaign to start tracking progress
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => console.log('Create campaign')}
              >
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </AdminLayout>
  );
};

export default CampaignTimelinePage;

