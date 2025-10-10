import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { contentApi } from '../services/contentApi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

const ContentCalendarPage = () => {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await contentApi.getCalendarItems();
      setContentItems(response.data);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const getContentForDate = (date: Date) => {
    return contentItems.filter(item => 
      isSameDay(new Date(item.scheduledDate), date)
    );
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const typeColors: Record<string, string> = {
    blog: '#5f5eff',
    social: '#ff6b9d',
    email: '#ffa726',
    ad: '#42a5f5',
  };

  const statusColors: Record<string, string> = {
    draft: '#9e9e9e',
    scheduled: '#2196f3',
    published: '#4caf50',
  };

  return (
    <AdminLayout
      title="Content Calendar"
      subtitle="Plan and schedule your content across all channels"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Add content')}
        >
          Schedule Content
        </Button>
      }
    >
      <Box>
        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(_, newView) => newView && setView(newView)}
                size="small"
              >
                <ToggleButton value="month">
                  <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
                  Month
                </ToggleButton>
                <ToggleButton value="week">
                  <WeekIcon sx={{ mr: 1 }} fontSize="small" />
                  Week
                </ToggleButton>
                <ToggleButton value="day">
                  <DayIcon sx={{ mr: 1 }} fontSize="small" />
                  Day
                </ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                  ←
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 180, textAlign: 'center' }}>
                  {format(currentDate, 'MMMM yyyy')}
                </Typography>
                <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                  →
                </IconButton>
                <Button size="small" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="blog">Blog</MenuItem>
                    <MenuItem value="social">Social</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="ad">Ad</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Calendar Grid - Month View */}
        {view === 'month' && (
          <Box>
            {/* Weekday Headers */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Grid item xs key={day}>
                  <Typography variant="subtitle2" align="center" color="text.secondary">
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Days */}
            <Grid container spacing={1}>
              {daysInMonth.map((day) => {
                const dayContent = getContentForDate(day).filter(item => {
                  if (filterType !== 'all' && item.type !== filterType) return false;
                  if (filterStatus !== 'all' && item.status !== filterStatus) return false;
                  return true;
                });

                const isToday = isSameDay(day, new Date());

                return (
                  <Grid item xs key={day.toString()}>
                    <Paper
                      sx={{
                        height: 120,
                        minHeight: 120,
                        maxHeight: 120,
                        p: 1,
                        backgroundColor: (theme) => isToday 
                          ? theme.palette.mode === 'dark' ? 'rgba(95, 94, 255, 0.2)' : '#f0f7ff'
                          : theme.palette.background.paper,
                        border: (theme) => isToday 
                          ? '2px solid #5f5eff' 
                          : `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          boxShadow: 2,
                        },
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={isToday ? 700 : 400}
                        color={isToday ? 'primary' : 'text.secondary'}
                      >
                        {format(day, 'd')}
                      </Typography>

                      <Box sx={{ mt: 0.5, flex: 1, overflow: 'auto' }}>
                        {dayContent.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              backgroundColor: typeColors[item.type] || '#9e9e9e',
                              color: '#fff',
                              fontSize: '0.7rem',
                              padding: '2px 4px',
                              borderRadius: '2px',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8,
                              },
                            }}
                            title={item.title}
                          >
                            {item.title}
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Legend */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Content Types
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label="Blog" size="small" sx={{ backgroundColor: typeColors.blog, color: '#fff' }} />
              <Chip label="Social" size="small" sx={{ backgroundColor: typeColors.social, color: '#fff' }} />
              <Chip label="Email" size="small" sx={{ backgroundColor: typeColors.email, color: '#fff' }} />
              <Chip label="Ad" size="small" sx={{ backgroundColor: typeColors.ad, color: '#fff' }} />
            </Box>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label="Draft" size="small" sx={{ backgroundColor: statusColors.draft, color: '#fff' }} />
              <Chip label="Scheduled" size="small" sx={{ backgroundColor: statusColors.scheduled, color: '#fff' }} />
              <Chip label="Published" size="small" sx={{ backgroundColor: statusColors.published, color: '#fff' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default ContentCalendarPage;

