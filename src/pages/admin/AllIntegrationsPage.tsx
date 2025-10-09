// All Integrations - Admin view of all dynamic integrations
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { integrationBuilderApi } from '../../services/integrationBuilderApi';

interface DynamicIntegration {
  id: number;
  name: string;
  provider: string;
  is_dynamic: boolean;
  is_system_wide: boolean;
  requires_user_config: boolean;
  platform_config: {
    name: string;
    base_url: string;
    auth_type: string;
    color?: string;
    icon_url?: string;
    documentation_url?: string;
    category?: string;
  };
  operation_configs: {
    operations: any[];
  };
}

export default function AllIntegrationsPage() {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<DynamicIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all integrations from the database
      const response = await fetch(
        `${(import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com'}/api/v1/integrations`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ryvr_token')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to load integrations');
      
      const data = await response.json();
      
      // Filter only dynamic integrations
      const dynamicIntegrations = data.filter((i: any) => i.is_dynamic === true);
      setIntegrations(dynamicIntegrations);
      
    } catch (err: any) {
      console.error('Failed to load integrations:', err);
      setError(err.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (integrationId: number) => {
    navigate(`/admin/integration-builder/edit/${integrationId}`);
  };

  const handleDelete = async (integrationId: number, integrationName: string) => {
    if (window.confirm(`Delete integration "${integrationName}"? This cannot be undone and will remove it from all workflows.`)) {
      try {
        await integrationBuilderApi.deleteIntegration(integrationId);
        setIntegrations(integrations.filter(i => i.id !== integrationId));
        alert(`Integration "${integrationName}" deleted successfully`);
      } catch (error: any) {
        console.error('Failed to delete integration:', error);
        alert(`Failed to delete integration: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleCreateNew = () => {
    navigate('/admin/integration-builder');
  };

  if (loading) {
    return (
      <AdminLayout title="All Integrations" subtitle="Manage dynamic integrations">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="All Integrations"
      subtitle="View and manage all dynamic integrations"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New Integration
        </Button>
      }
    >
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {integrations.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <ApiIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Dynamic Integrations Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first integration using the Integration Builder
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
              >
                Create Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {integrations.map((integration) => (
              <Grid item xs={12} sm={6} md={4} key={integration.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: 2,
                    borderColor: integration.platform_config?.color || 'primary.main',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {integration.platform_config?.icon_url ? (
                        <Box 
                          component="img" 
                          src={integration.platform_config.icon_url}
                          alt={integration.name}
                          sx={{ width: 32, height: 32, mr: 1.5 }}
                        />
                      ) : (
                        <ApiIcon sx={{ mr: 1.5, fontSize: 32, color: integration.platform_config?.color || 'primary.main' }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {integration.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {integration.provider}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Badges */}
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label="Dynamic" 
                        size="small" 
                        sx={{ 
                          bgcolor: `${integration.platform_config?.color || '#5f5eff'}20`,
                          color: integration.platform_config?.color || 'primary.main',
                        }} 
                      />
                      {integration.is_system_wide && (
                        <Chip label="System-Wide" size="small" color="primary" />
                      )}
                      {integration.requires_user_config && (
                        <Chip label="User Config" size="small" color="secondary" />
                      )}
                    </Box>

                    {/* Stats */}
                    <Box sx={{ flex: 1, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Operations:</strong> {integration.operation_configs?.operations?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Auth Type:</strong> {integration.platform_config?.auth_type || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Category:</strong> {integration.platform_config?.category || 'other'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Base URL:</strong>{' '}
                        <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {integration.platform_config?.base_url || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      {integration.platform_config?.documentation_url && (
                        <Button
                          size="small"
                          href={integration.platform_config.documentation_url}
                          target="_blank"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          Docs
                        </Button>
                      )}
                      <Box sx={{ flex: 1 }} />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => handleEdit(integration.id)}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(integration.id, integration.name)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </AdminLayout>
  );
}

