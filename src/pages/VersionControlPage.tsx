import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  Visibility as ViewIcon,
  CheckCircle as PublishedIcon,
  Edit as DraftIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { DEMO_VERSION_HISTORY } from '../data/demoData';
import { format } from 'date-fns';

const VersionControlPage = () => {
  const [selectedVersion, setSelectedVersion] = useState(DEMO_VERSION_HISTORY.currentVersion);
  const document = DEMO_VERSION_HISTORY;

  const handleRollback = (version: number) => {
    if (confirm(`Are you sure you want to rollback to version ${version}?`)) {
      console.log('Rollback to version:', version);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: '#9e9e9e',
      published: '#4caf50',
    };
    return colors[status] || '#9e9e9e';
  };

  const getStatusIcon = (status: string) => {
    return status === 'published' ? <PublishedIcon /> : <DraftIcon />;
  };

  return (
    <AdminLayout
      title="Version Control"
      subtitle="Track changes and manage document versions"
    >
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Document Version History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Version: {document.currentVersion}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => console.log('View all versions')}
              >
                View All Changes
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Timeline */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Version Timeline
                </Typography>
                <Timeline sx={{ px: 0 }}>
                  {document.versions.map((version, index) => (
                    <TimelineItem key={version.version}>
                      <TimelineOppositeContent sx={{ flex: 0.3 }} color="text.secondary">
                        <Typography variant="caption">
                          {format(new Date(version.timestamp), 'MMM d, yyyy')}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {format(new Date(version.timestamp), 'h:mm a')}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot
                          color={version.version === document.currentVersion ? 'primary' : 'grey'}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedVersion(version.version)}
                        >
                          {getStatusIcon(version.status)}
                        </TimelineDot>
                        {index < document.versions.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper
                          elevation={selectedVersion === version.version ? 3 : 1}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: selectedVersion === version.version ? '2px solid #5f5eff' : 'none',
                          }}
                          onClick={() => setSelectedVersion(version.version)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">
                              Version {version.version}
                            </Typography>
                            <Chip
                              label={version.status.toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(version.status),
                                color: '#fff',
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            By {version.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {version.changes}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => setSelectedVersion(version.version)}
                            >
                              View
                            </Button>
                            {version.version !== document.currentVersion && (
                              <Button
                                size="small"
                                startIcon={<RestoreIcon />}
                                onClick={() => handleRollback(version.version)}
                              >
                                Restore
                              </Button>
                            )}
                          </Box>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Box>

          {/* Content Preview */}
          <Box sx={{ flex: 1.5 }}>
            <Card>
              <CardContent>
                {(() => {
                  const version = document.versions.find(v => v.version === selectedVersion);
                  if (!version) return null;

                  return (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Version {version.version} Preview
                        </Typography>
                        <Chip
                          label={version.status.toUpperCase()}
                          sx={{
                            backgroundColor: getStatusColor(version.status),
                            color: '#fff',
                          }}
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Author: {version.author}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Date: {format(new Date(version.timestamp), 'MMM d, yyyy h:mm a')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Changes: {version.changes}
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Paper
                        sx={{
                          p: 3,
                          backgroundColor: '#fafafa',
                          minHeight: 400,
                          maxHeight: 600,
                          overflow: 'auto',
                          '& h1': { fontSize: '1.75rem', fontWeight: 600, mb: 2 },
                          '& h2': { fontSize: '1.5rem', fontWeight: 600, mb: 2, mt: 3 },
                          '& p': { mb: 2, lineHeight: 1.7 },
                        }}
                      >
                        <div dangerouslySetInnerHTML={{ __html: version.content.replace(/\n/g, '<br />') }} />
                      </Paper>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default VersionControlPage;

