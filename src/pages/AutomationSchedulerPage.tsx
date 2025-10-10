import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Replay as RerunIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { DEMO_SCHEDULED_AUTOMATIONS, DEMO_EXECUTION_QUEUE } from '../data/demoData';
import { format } from 'date-fns';

const AutomationSchedulerPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [scheduledAutomations, setScheduledAutomations] = useState(DEMO_SCHEDULED_AUTOMATIONS);
  const [executionQueue, setExecutionQueue] = useState(DEMO_EXECUTION_QUEUE);

  const handlePauseResume = (id: string) => {
    setScheduledAutomations(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'active' ? 'paused' : 'active' }
          : item
      )
    );
  };

  const handleStopExecution = (id: string) => {
    console.log('Stop execution:', id);
  };

  const handleRerunExecution = (id: string) => {
    console.log('Rerun execution:', id);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#4caf50',
      paused: '#ff9800',
      running: '#2196f3',
      queued: '#9e9e9e',
      completed: '#4caf50',
      failed: '#f44336',
    };
    return colors[status] || '#9e9e9e';
  };

  return (
    <AdminLayout
      title="Automation Scheduler"
      subtitle="Schedule recurring workflows and manage execution queue"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Create schedule')}
        >
          Schedule Automation
        </Button>
      }
    >
      <Box>
        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Scheduled Automations" />
            <Tab label={`Execution Queue (${executionQueue.length})`} />
          </Tabs>
        </Card>

        {/* Scheduled Automations Tab */}
        {currentTab === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recurring Automations
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Automation</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Business</TableCell>
                      <TableCell>Next Run</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduledAutomations.map((automation) => (
                      <TableRow key={automation.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {automation.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {automation.workflow}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {automation.schedule}
                          </Typography>
                          <Chip
                            label={automation.frequency.toUpperCase()}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {automation.business}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(automation.nextRun), 'MMM d, h:mm a')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(automation.lastRun), 'MMM d, h:mm a')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={automation.status.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(automation.status),
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handlePauseResume(automation.id)}
                            title={automation.status === 'active' ? 'Pause' : 'Resume'}
                          >
                            {automation.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => console.log('Edit', automation.id)}
                            title="Edit"
                          >
                            <RerunIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Execution Queue Tab */}
        {currentTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active & Queued Executions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Workflow</TableCell>
                      <TableCell>Business</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Started / Queued</TableCell>
                      <TableCell>Credits Used</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {executionQueue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Box sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No active or queued executions
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      executionQueue.map((execution) => (
                        <TableRow key={execution.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {execution.workflow}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {execution.business}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={execution.status.toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(execution.status),
                                color: '#fff',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {execution.status === 'running' ? (
                              <Box sx={{ minWidth: 150 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption">
                                    {execution.progress}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={execution.progress}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Waiting...
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {execution.status === 'running' && execution.startedAt
                                ? format(new Date(execution.startedAt), 'h:mm a')
                                : execution.queuedAt
                                ? format(new Date(execution.queuedAt), 'h:mm a')
                                : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {execution.creditsUsed || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {execution.status === 'running' && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleStopExecution(execution.id)}
                                title="Stop"
                              >
                                <StopIcon />
                              </IconButton>
                            )}
                            {execution.status === 'queued' && (
                              <IconButton
                                size="small"
                                onClick={() => handleStopExecution(execution.id)}
                                title="Cancel"
                              >
                                <StopIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AutomationSchedulerPage;

