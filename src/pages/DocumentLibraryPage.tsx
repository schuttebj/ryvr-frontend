import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem as MenuItemComp,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { DEMO_DOCUMENTS } from '../data/demoData';
import { format } from 'date-fns';

const DocumentLibraryPage = () => {
  const [documents, setDocuments] = useState(DEMO_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const filteredDocuments = documents.filter(doc => {
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && doc.type !== filterType) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    return true;
  });

  const getIconForType = (type: string) => {
    const icons: Record<string, any> = {
      blog: <DocumentIcon />,
      document: <DocumentIcon />,
      template: <CodeIcon />,
      design: <ImageIcon />,
    };
    return icons[type] || <DocumentIcon />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: '#9e9e9e',
      approved: '#4caf50',
      published: '#2196f3',
    };
    return colors[status] || '#9e9e9e';
  };

  return (
    <AdminLayout
      title="Document Library"
      subtitle="Searchable repository of all your content and assets"
    >
      <Box>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search documents..."
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
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="blog">Blog</MenuItem>
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="template">Template</MenuItem>
                  <MenuItem value="design">Design</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <Grid container spacing={2}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} md={6} lg={4} key={doc.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {getIconForType(doc.type)}
                      <Chip
                        label={doc.type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedDoc(doc.id);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" gutterBottom noWrap>
                    {doc.title}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {doc.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Business: {doc.business}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Author: {doc.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Size: {doc.size} • Version {doc.version}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={doc.status.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(doc.status),
                        color: '#fff',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" gutterBottom>
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItemComp onClick={() => { console.log('View'); setAnchorEl(null); }}>
            View Details
          </MenuItemComp>
          <MenuItemComp onClick={() => { console.log('Download'); setAnchorEl(null); }}>
            <DownloadIcon sx={{ mr: 1, fontSize: 18 }} />
            Download
          </MenuItemComp>
          <MenuItemComp onClick={() => { console.log('Share'); setAnchorEl(null); }}>
            <ShareIcon sx={{ mr: 1, fontSize: 18 }} />
            Share
          </MenuItemComp>
        </Menu>
      </Box>
    </AdminLayout>
  );
};

export default DocumentLibraryPage;

