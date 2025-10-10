import React, { useState, useEffect } from 'react';
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
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  PlayArrow as RunningIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import { reportsApi } from '../services/reportsApi';

const WorkflowAnalyticsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getWorkflowAnalytics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load workflow stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <AdminLayout title="Workflow Analytics" subtitle="Monitor and optimize your workflow performance">
        <Typography align="center" sx={{ py: 8 }}>Loading analytics...</Typography>
      </AdminLayout>
    );
  }

  const errorRateData = stats.performanceMetrics.errorRates.labels.map((label: string, index: number) => ({
    period: label,
    errorRate: stats.performanceMetrics.errorRates.data[index],
  }));

  const creditUsageData = stats.creditUsage.byWorkflow.map((workflow: any) => ({
    name: workflow.name,
    credits: workflow.credits,
    executions: workflow.executions,
  }));

  return (
    <AdminLayout
      title="Workflow Analytics"
      subtitle="Monitor and optimize your workflow performance"
    >
      <Box>
        {/* Execution Summary */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SuccessIcon color="success" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Executions
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.executionStats.total}</Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{ height: 8, borderRadius: 4, backgroundColor: '#e0e0e0' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircle color="success" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Successful
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {stats.executionStats.successful}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Success Rate: {stats.executionStats.successRate}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.executionStats.successRate}
                    color="success"
                    sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ErrorIcon color="error" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Failed
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {stats.executionStats.failed}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Error Rate: {((stats.executionStats.failed / stats.executionStats.total) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <RunningIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Now
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {stats.executionStats.running}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pending: {stats.executionStats.pending}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Credit Usage */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Credit Usage by Workflow
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Credits Used: {stats.creditUsage.total.toLocaleString()}
            </Typography>
            <BarChart
              data={creditUsageData}
              bars={[{ dataKey: 'credits', name: 'Credits Used', fill: '#5f5eff' }]}
              xAxisKey="name"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Error Rate Trend */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Error Rate Trend
            </Typography>
            <LineChart
              data={errorRateData}
              lines={[{ dataKey: 'errorRate', name: 'Error Rate (%)', stroke: '#f44336' }]}
              xAxisKey="period"
              height={250}
            />
          </CardContent>
        </Card>

        {/* Most Used Workflows */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Most Used Workflows
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Workflow</TableCell>
                    <TableCell align="right">Executions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.performanceMetrics.mostUsed.map((workflow: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {workflow.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={workflow.count} size="small" color="primary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Optimization Suggestions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Optimization Suggestions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {stats.optimizationSuggestions.map((suggestion: any, index: number) => (
                <Alert key={index} severity="info">
                  <AlertTitle>{suggestion.workflow}</AlertTitle>
                  <Typography variant="body2">
                    {suggestion.suggestion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Potential Saving: {suggestion.potentialSaving}
                  </Typography>
                </Alert>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default WorkflowAnalyticsPage;

