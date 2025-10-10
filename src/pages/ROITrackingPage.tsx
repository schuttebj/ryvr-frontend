import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import { reportsApi } from '../services/reportsApi';

const ROITrackingPage = () => {
  const [roiData, setRoiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoiData();
  }, []);

  const loadRoiData = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getRoiData();
      setRoiData(response.data);
    } catch (error) {
      console.error('Failed to load ROI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !roiData) {
    return (
      <AdminLayout title="ROI Tracking" subtitle="Track campaign costs, revenue, and return on investment">
        <Typography align="center" sx={{ py: 8 }}>Loading ROI data...</Typography>
      </AdminLayout>
    );
  }

  const roiTrendData = roiData.roiTrend.labels.map((label: string, index: number) => ({
    month: label,
    revenue: roiData.roiTrend.revenue[index],
    cost: roiData.roiTrend.cost[index],
    roi: roiData.roiTrend.roi[index],
  }));

  const channelComparisonData = roiData.channelComparison.map((channel: any) => ({
    name: channel.channel,
    roi: channel.roi,
    cost: channel.avgCost,
  }));

  return (
    <AdminLayout
      title="ROI Tracking"
      subtitle="Track campaign costs, revenue, and return on investment"
    >
      <Box>
        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MoneyIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  ${roiData.overview.totalRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Cost
                  </Typography>
                </Box>
                <Typography variant="h4">
                  ${roiData.overview.totalCost.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Average ROI
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {roiData.overview.roi}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Campaigns
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {roiData.overview.activeCampaigns}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer Acquisition Cost (CAC)
                </Typography>
                <Typography variant="h4">${roiData.overview.cac}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Lifetime Value (LTV)
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${roiData.overview.ltv}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  LTV:CAC Ratio: {(roiData.overview.ltv / roiData.overview.cac).toFixed(2)}:1
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ROI Trend */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ROI Trend Over Time
            </Typography>
            <LineChart
              data={roiTrendData}
              lines={[
                { dataKey: 'revenue', name: 'Revenue', stroke: '#4caf50' },
                { dataKey: 'cost', name: 'Cost', stroke: '#f44336' },
                { dataKey: 'roi', name: 'ROI %', stroke: '#5f5eff' },
              ]}
              xAxisKey="month"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Channel Comparison */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ROI by Channel
            </Typography>
            <BarChart
              data={channelComparisonData}
              bars={[{ dataKey: 'roi', name: 'ROI %', fill: '#1affd5' }]}
              xAxisKey="name"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Campaign ROI Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Campaign Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">ROI</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roiData.campaignROI.map((campaign: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {campaign.campaign}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${campaign.cost.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          ${campaign.revenue.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${campaign.roi}%`}
                          size="small"
                          color={campaign.roi > 400 ? 'success' : campaign.roi > 300 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={campaign.status.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Goal Tracking */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Goal Progress
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {roiData.goalTracking.map((goal: any, index: number) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {goal.goal}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {goal.actual.toLocaleString()} / {goal.target.toLocaleString()} ({goal.progress}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(goal.progress, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: goal.progress >= 100 ? '#4caf50' : '#5f5eff',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default ROITrackingPage;

