import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import { reportsApi } from '../services/reportsApi';

const CampaignReportsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last_30_days');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getAnalyticsData();
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportsApi.exportReport('campaign', 'pdf', { dateRange });
      console.log('Report exported');
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  if (loading || !analyticsData) {
    return (
      <AdminLayout title="Campaign Reports" subtitle="Comprehensive analytics and performance insights">
        <Typography align="center" sx={{ py: 8 }}>Loading analytics...</Typography>
      </AdminLayout>
    );
  }

  const trafficData = analyticsData.websiteTraffic.labels.map((label: string, index: number) => ({
    date: label,
    sessions: analyticsData.websiteTraffic.sessions[index],
    pageViews: analyticsData.websiteTraffic.pageViews[index],
    visitors: analyticsData.websiteTraffic.uniqueVisitors[index],
  }));

  const conversionData = analyticsData.conversions.labels.map((label: string, index: number) => ({
    period: label,
    conversions: analyticsData.conversions.data[index],
  }));

  const channelData = analyticsData.channelPerformance.map((channel: any) => ({
    name: channel.channel,
    sessions: channel.sessions,
    conversions: channel.conversions,
    value: channel.value,
  }));

  return (
    <AdminLayout
      title="Campaign Reports"
      subtitle="Analytics from Google Analytics, Google Ads, and Meta Ads"
      actions={
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="last_7_days">Last 7 Days</MenuItem>
              <MenuItem value="last_30_days">Last 30 Days</MenuItem>
              <MenuItem value="last_90_days">Last 90 Days</MenuItem>
              <MenuItem value="this_year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Box>
      }
    >
      <Box>
        {/* Website Traffic Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Website Traffic (Google Analytics)
            </Typography>
            <LineChart
              data={trafficData}
              lines={[
                { dataKey: 'sessions', name: 'Sessions', stroke: '#5f5eff' },
                { dataKey: 'pageViews', name: 'Page Views', stroke: '#1affd5' },
                { dataKey: 'visitors', name: 'Unique Visitors', stroke: '#ffa726' },
              ]}
              xAxisKey="date"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Ad Performance Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Google Ads Performance
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Impressions
                    </Typography>
                    <Typography variant="h5">
                      {analyticsData.adPerformance.google.impressions.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Clicks
                    </Typography>
                    <Typography variant="h5">
                      {analyticsData.adPerformance.google.clicks.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Conversions
                    </Typography>
                    <Typography variant="h5">
                      {analyticsData.adPerformance.google.conversions}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Cost
                    </Typography>
                    <Typography variant="h5">
                      ${analyticsData.adPerformance.google.cost.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Chip label={`CTR: ${analyticsData.adPerformance.google.ctr}%`} size="small" variant="outlined" />
                  <Chip label={`CPC: $${analyticsData.adPerformance.google.cpc}`} size="small" variant="outlined" />
                  <Chip label={`Conv. Rate: ${analyticsData.adPerformance.google.conversionRate}%`} size="small" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Meta Ads Performance
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Impressions
                    </Typography>
                    <Typography variant="h5">
                      {analyticsData.adPerformance.facebook.impressions.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Clicks
                    </Typography>
                    <Typography variant="h5">
                      {analyticsData.adPerformance.facebook.clicks.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Conversions
                    </Typography>
                    <Typography variant="h5">
                      {analyticsData.adPerformance.facebook.conversions}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Cost
                    </Typography>
                    <Typography variant="h5">
                      ${analyticsData.adPerformance.facebook.cost.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Chip label={`CTR: ${analyticsData.adPerformance.facebook.ctr}%`} size="small" variant="outlined" />
                  <Chip label={`CPC: $${analyticsData.adPerformance.facebook.cpc}`} size="small" variant="outlined" />
                  <Chip label={`Conv. Rate: ${analyticsData.adPerformance.facebook.conversionRate}%`} size="small" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Conversions Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Conversions Over Time
            </Typography>
            <BarChart
              data={conversionData}
              bars={[{ dataKey: 'conversions', name: 'Conversions', fill: '#1affd5' }]}
              xAxisKey="period"
              height={250}
            />
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Channel Performance Comparison
            </Typography>
            <BarChart
              data={channelData}
              bars={[
                { dataKey: 'sessions', name: 'Sessions', fill: '#5f5eff' },
                { dataKey: 'conversions', name: 'Conversions', fill: '#1affd5' },
              ]}
              xAxisKey="name"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Top Pages Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Performing Pages
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Page</TableCell>
                    <TableCell align="right">Page Views</TableCell>
                    <TableCell align="right">Bounce Rate</TableCell>
                    <TableCell align="right">Avg. Time on Page</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.topPages.map((page: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {page.page}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {page.views.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Typography variant="body2">{page.bounceRate}%</Typography>
                          {page.bounceRate > 40 ? (
                            <TrendingUpIcon fontSize="small" color="error" />
                          ) : (
                            <TrendingDownIcon fontSize="small" color="success" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{page.avgTime}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default CampaignReportsPage;

