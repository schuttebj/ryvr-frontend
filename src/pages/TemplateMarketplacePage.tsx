import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Grid,
  Rating,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  Download as InstallIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { DEMO_TEMPLATES } from '../data/demoData';

const TemplateMarketplacePage = () => {
  const [templates] = useState(DEMO_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  const categories = ['All', 'Content', 'Social', 'Email', 'Ads', 'SEO'];

  const filteredTemplates = templates.filter(template => {
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !template.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (currentTab > 0 && template.category !== categories[currentTab]) {
      return false;
    }
    return true;
  });

  const handleInstall = (templateId: string) => {
    console.log('Install template:', templateId);
  };

  return (
    <AdminLayout
      title="Template Marketplace"
      subtitle="Pre-built workflows ready to use"
    >
      <Box>
        {/* Search and Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
              sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              {categories.map((category, index) => (
                <Tab key={index} label={category} />
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Featured Templates */}
        {currentTab === 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon color="primary" />
              Featured Templates
            </Typography>
            <Grid container spacing={3}>
              {filteredTemplates.filter(t => t.featured).slice(0, 3).map((template) => (
                <Grid item xs={12} md={4} key={template.id}>
                  <Card sx={{ height: '100%', border: '2px solid #5f5eff' }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 140,
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(95, 94, 255, 0.2)' : '#f0f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" color="primary">
                        {template.name.charAt(0)}
                      </Typography>
                    </CardMedia>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip label={template.category} size="small" color="primary" />
                        <Chip label="FEATURED" size="small" sx={{ backgroundColor: '#ffd700', color: '#000' }} />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {template.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating value={template.rating} readOnly size="small" precision={0.1} />
                          <Typography variant="caption">
                            {template.rating} ({template.reviews})
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {template.installs.toLocaleString()} installs
                        </Typography>
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<InstallIcon />}
                        onClick={() => handleInstall(template.id)}
                      >
                        Install Template
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* All Templates */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingIcon />
            {currentTab === 0 ? 'All Templates' : `${categories[currentTab]} Templates`}
          </Typography>
          <Grid container spacing={3}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 120,
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" color="text.secondary">
                      {template.name.charAt(0)}
                    </Typography>
                  </CardMedia>
                  <CardContent>
                    <Chip label={template.category} size="small" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="h6" gutterBottom noWrap>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 60 }}>
                      {template.description.length > 100
                        ? `${template.description.substring(0, 100)}...`
                        : template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={template.rating} readOnly size="small" precision={0.1} />
                        <Typography variant="caption">
                          {template.rating}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {template.installs.toLocaleString()} installs • By {template.author}
                      </Typography>
                    </Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<InstallIcon />}
                      onClick={() => handleInstall(template.id)}
                    >
                      Install
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  No templates found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or browse different categories
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default TemplateMarketplacePage;

