import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Publish as PublishIcon,
  Schedule as ScheduleIcon,
  CheckCircle as PublishedIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { DEMO_PUBLISHING_CONTENT, DEMO_PUBLISHING_HISTORY } from '../data/demoData';
import { format } from 'date-fns';

const PublishingHubPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState<any>(DEMO_PUBLISHING_CONTENT[0]);
  const [platforms, setPlatforms] = useState(selectedContent?.platforms || {});

  const handlePlatformToggle = (platform: string) => {
    setPlatforms((prev: any) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        enabled: !prev[platform].enabled,
      },
    }));
  };

  const handlePublish = () => {
    console.log('Publishing to platforms:', platforms);
  };

  const getPlatformIcon = (platform: string) => {
    const platformNames: Record<string, string> = {
      wordpress: 'W',
      linkedin: 'in',
      twitter: 'X',
      facebook: 'f',
      instagram: 'IG',
    };
    return platformNames[platform] || platform.charAt(0);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      published: '#4caf50',
      scheduled: '#2196f3',
      draft: '#9e9e9e',
      failed: '#f44336',
    };
    return colors[status] || '#9e9e9e';
  };

  return (
    <AdminLayout
      title="Publishing Hub"
      subtitle="Publish content across multiple platforms"
    >
      <Box>
        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Publish Content" />
            <Tab label="Publishing History" />
          </Tabs>
        </Card>

        {/* Publish Content Tab */}
        {currentTab === 0 && (
          <Grid container spacing={3}>
            {/* Content Selection */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Select Content
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {DEMO_PUBLISHING_CONTENT.map((content) => (
                      <Card
                        key={content.id}
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          border: selectedContent?.id === content.id ? '2px solid #5f5eff' : undefined,
                          backgroundColor: selectedContent?.id === content.id ? '#f0f7ff' : undefined,
                        }}
                        onClick={() => {
                          setSelectedContent(content);
                          setPlatforms(content.platforms);
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {content.title}
                          </Typography>
                          <Chip label={content.type.toUpperCase()} size="small" variant="outlined" />
                          {content.publishedAt && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                              Published: {format(new Date(content.publishedAt), 'MMM d, yyyy')}
                            </Typography>
                          )}
                          {content.scheduledFor && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                              Scheduled: {format(new Date(content.scheduledFor), 'MMM d, yyyy')}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Publishing Options */}
            <Grid item xs={12} md={8}>
              {selectedContent && (
                <>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {selectedContent.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {selectedContent.content}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Select Platforms
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(platforms).map(([platform, data]: [string, any]) => (
                          <Grid item xs={12} sm={6} key={platform}>
                            <Card
                              variant="outlined"
                              sx={{
                                backgroundColor: data.enabled ? '#f0f7ff' : '#fff',
                                border: data.enabled ? '2px solid #5f5eff' : undefined,
                              }}
                            >
                              <CardContent>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={data.enabled}
                                      onChange={() => handlePlatformToggle(platform)}
                                    />
                                  }
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                        {getPlatformIcon(platform)}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                        </Typography>
                                        {data.status && (
                                          <Chip
                                            label={data.status.toUpperCase()}
                                            size="small"
                                            sx={{
                                              backgroundColor: getStatusColor(data.status),
                                              color: '#fff',
                                              mt: 0.5,
                                              height: 18,
                                              fontSize: '0.65rem',
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  }
                                />
                                {data.url && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 5 }}>
                                    URL: {data.url}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Publishing Options
                      </Typography>
                      <TextField
                        fullWidth
                        type="datetime-local"
                        label="Schedule For"
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<PublishIcon />}
                          onClick={handlePublish}
                          disabled={!Object.values(platforms).some((p: any) => p.enabled)}
                        >
                          Publish Now
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ScheduleIcon />}
                          disabled={!Object.values(platforms).some((p: any) => p.enabled)}
                        >
                          Schedule
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </>
              )}
            </Grid>
          </Grid>
        )}

        {/* Publishing History Tab */}
        {currentTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Publications
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Content</TableCell>
                      <TableCell>Platform</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Published At</TableCell>
                      <TableCell>URL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DEMO_PUBLISHING_HISTORY.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                              {getPlatformIcon(item.platform.toLowerCase())}
                            </Avatar>
                            <Typography variant="body2">
                              {item.platform}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status.toUpperCase()}
                            size="small"
                            icon={<PublishedIcon />}
                            sx={{
                              backgroundColor: getStatusColor(item.status),
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(item.publishedAt), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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

export default PublishingHubPage;

