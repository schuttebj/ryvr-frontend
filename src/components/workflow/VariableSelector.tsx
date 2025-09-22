import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Badge,
  Divider,
  useTheme,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  List as ListIcon,
  DataObject as JsonIcon,
  Filter as FilterIcon,
  CheckCircle,
  Storage as DataIcon,
} from '@mui/icons-material';

interface VariableSelectorProps {
  open: boolean;
  onClose: () => void;
  onInsert: (variable: string) => void;
  availableData?: Record<string, any>;
  position?: 'dialog' | 'panel';
  sx?: any;
}

export default function VariableSelector({
  open,
  onClose,
  onInsert,
  availableData,
  position = 'dialog',
  sx = {},
}: VariableSelectorProps) {
  const theme = useTheme();
  const [selectedFormat, setSelectedFormat] = useState<'single' | 'list' | 'json' | 'range'>('single');
  const [selectedPath, setSelectedPath] = useState('');
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [realNodeData, setRealNodeData] = useState<any[]>([]);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(0);

  // Enhanced setSelectedPath with logging
  const setSelectedPathWithLogging = (path: string) => {
    console.log('🎯 Setting selected path:', path);
    setSelectedPath(path);
  };

  // Load real node data when component opens
  useEffect(() => {
    if (open) {
      const loadRealNodeData = async () => {
        try {
          const { getAvailableDataNodes } = await import('../../services/workflowApi');
          const availableNodes = getAvailableDataNodes();
          setRealNodeData(availableNodes);
          console.log('🔄 VariableSelector loaded node data:', availableNodes);
        } catch (error) {
          console.warn('Failed to load real node data:', error);
          setRealNodeData([]);
        }
      };
      loadRealNodeData();
    }
  }, [open]);

  const hasRealData = realNodeData && realNodeData.length > 0;

  // Navigate through object properties (Zapier-like)
  const navigateToProperty = (property: string, value: any) => {
    const newPath = [...navigationPath, property];
    setNavigationPath(newPath);
    setCurrentData(value);
  };

  // Navigate back in breadcrumb
  const navigateBack = (index: number) => {
    const newPath = navigationPath.slice(0, index + 1);
    setNavigationPath(newPath);
    
    // Navigate to the data at that path
    let data = realNodeData;
    for (const pathSegment of newPath) {
      data = data?.[pathSegment];
    }
    setCurrentData(data);
  };

  // Get filtered properties for current data
  const getFilteredProperties = (data: any) => {
    if (!data || typeof data !== 'object') return [];
    
    const properties = Object.keys(data);
    if (!searchTerm) return properties;
    
    return properties.filter(prop => 
      prop.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get property type for display
  const getPropertyType = (value: any): string => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  };

  // Get property preview
  const getPropertyPreview = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return `{${Object.keys(value).length} props}`;
    if (typeof value === 'string') return value.length > 50 ? `"${value.substring(0, 50)}..."` : `"${value}"`;
    return String(value);
  };

  // Create variable path from navigation
  const createVariablePath = (property?: string) => {
    const fullPath = property ? [...navigationPath, property] : navigationPath;
    return fullPath.join('.');
  };

  // Enhanced content component
  const VariableSelectorContent = () => (
    <Box sx={{ 
      height: position === 'panel' ? '100%' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.paper,
      ...sx
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DataIcon color="primary" />
            {position === 'panel' ? 'Data Browser' : 'Variable Selector'}
          </Typography>
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Breadcrumb Navigation */}
        {navigationPath.length > 0 && (
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link 
              component="button" 
              onClick={() => {
                setNavigationPath([]);
                setCurrentData(realNodeData);
              }}
              sx={{ 
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Root
            </Link>
            {navigationPath.map((segment, index) => (
              <Link
                key={index}
                component="button"
                onClick={() => navigateBack(index)}
                sx={{ 
                  color: index === navigationPath.length - 1 
                    ? theme.palette.text.primary 
                    : theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {segment}
              </Link>
            ))}
          </Breadcrumbs>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {hasRealData ? (
          <Box>
            {navigationPath.length === 0 ? (
              // Root level - show nodes
              <List dense>
                {realNodeData.map((node) => (
                  <ListItemButton
                    key={node.nodeId}
                    onClick={() => navigateToProperty(node.nodeId, node)}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.02)',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.04)',
                      }
                    }}
                  >
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={node.nodeId}
                      secondary="Click to explore data"
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              // Property level - show object properties
              <List dense>
                {getFilteredProperties(currentData).map((property) => {
                  const value = currentData[property];
                  const type = getPropertyType(value);
                  const preview = getPropertyPreview(value);
                  const isExpandable = (typeof value === 'object' && value !== null);
                  
                  return (
                    <ListItemButton
                      key={property}
                      onClick={() => {
                        if (isExpandable) {
                          navigateToProperty(property, value);
                        } else {
                          // Select this property
                          const fullPath = createVariablePath(property);
                          setSelectedPathWithLogging(fullPath);
                        }
                      }}
                      sx={{ 
                        borderRadius: 1,
                        mb: 0.5,
                        backgroundColor: selectedPath === createVariablePath(property)
                          ? theme.palette.primary.main + '20'
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0,0,0,0.04)',
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {property}
                            </Typography>
                            <Chip 
                              label={type} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                color: theme.palette.text.secondary 
                              }} 
                            />
                          </Box>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              fontFamily: 'monospace' 
                            }}
                          >
                            {preview}
                          </Typography>
                        }
                      />
                      {isExpandable && (
                        <ListItemIcon sx={{ minWidth: 'auto' }}>
                          <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)' }} />
                        </ListItemIcon>
                      )}
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        ) : (
          <Alert severity="info" sx={{ m: 2 }}>
            <Typography variant="body2">
              No workflow data available. Run some workflow steps to see data here.
            </Typography>
          </Alert>
        )}

        {/* Selected Variable Preview */}
        {selectedPath && (
          <Paper sx={{ 
            p: 2, 
            mt: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(95, 95, 255, 0.1)' 
              : 'rgba(95, 95, 255, 0.05)',
            border: `1px solid ${theme.palette.primary.main}30`
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.primary.main }}>
              Selected Variable
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'monospace', 
                fontWeight: 'bold',
                color: theme.palette.text.primary 
              }}>
                {`{{${selectedPath}}}`}
              </Typography>
              <Tooltip title="Copy variable">
                <IconButton
                  size="small"
                  onClick={() => navigator.clipboard.writeText(`{{${selectedPath}}}`)}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Actions */}
      {position === 'dialog' && (
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => {
              if (selectedPath) {
                onInsert(`{{${selectedPath}}}`);
                onClose();
              }
            }} 
            variant="contained" 
            disabled={!selectedPath}
            startIcon={<CodeIcon />}
          >
            Insert Variable
          </Button>
        </Box>
      )}
    </Box>
  );

  if (position === 'panel') {
    return open ? <VariableSelectorContent /> : null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 999999 }}
    >
      <VariableSelectorContent />
    </Dialog>
  );
}