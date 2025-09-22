import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Chip,
  TextField,
  Alert,
  IconButton,
  useTheme,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Breadcrumbs,
  Link,
  Checkbox,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  CheckCircle,
  Storage as DataIcon,
} from '@mui/icons-material';
import VariableTransformationPanel from './VariableTransformationPanel';

interface VariableSelectorProps {
  open: boolean;
  onClose: () => void;
  onInsert: (variable: string) => void;
  position?: 'dialog' | 'panel';
  sx?: any;
}

export default function VariableSelector({
  open,
  onClose,
  onInsert,
  position = 'dialog',
  sx = {},
}: VariableSelectorProps) {
  const theme = useTheme();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [realNodeData, setRealNodeData] = useState<any[]>([]);
  const [nodeColors, setNodeColors] = useState<Record<string, string>>({});
  
  // Enhanced path selection with multiple support
  const togglePathSelection = (path: string) => {
    setSelectedPaths((prev: string[]) => {
      if (prev.includes(path)) {
        return prev.filter((p: string) => p !== path);
      } else {
        return [...prev, path];
      }
    });
    console.log('🎯 Toggled path selection:', path);
  };

  // Generate node colors based on node types
  const generateNodeColors = (nodeData: any[]) => {
    const colors = [
      '#5f5eff', '#1affd5', '#ff6b6b', '#4ecdc4', '#45b7d1', 
      '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
    ];
    
    const colorMap: Record<string, string> = {};
    nodeData.forEach((node, index) => {
      colorMap[node.nodeId] = colors[index % colors.length];
    });
    
    return colorMap;
  };

  // Load real node data when component opens
  useEffect(() => {
    if (open) {
      const loadRealNodeData = async () => {
        try {
          const { getAvailableDataNodes } = await import('../../services/workflowApi');
          const availableNodes = getAvailableDataNodes();
          setRealNodeData(availableNodes);
          setNodeColors(generateNodeColors(availableNodes));
          console.log('🔄 VariableSelector loaded node data:', availableNodes);
        } catch (error) {
          console.warn('Failed to load real node data:', error);
          setRealNodeData([]);
          setNodeColors({});
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
    let data: any = realNodeData;
    for (const pathSegment of newPath) {
      data = data?.[pathSegment as keyof typeof data];
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

  // Get node color for a variable path
  const getNodeColor = (path: string): string => {
    const nodeId = path.split('.')[0];
    return nodeColors[nodeId] || theme.palette.primary.main;
  };

  // Check if path is selected
  const isPathSelected = (path: string): boolean => {
    return selectedPaths.includes(path);
  };

  // Handle variable generation from transformation panel
  const handleVariableGenerated = (variable: string) => {
      onInsert(variable);
    if (position === 'dialog') {
      onClose();
    }
  };

  // Enhanced content component with side-by-side layout
  const VariableSelectorContent = () => (
    <Box sx={{ 
      height: position === 'panel' ? '100%' : '80vh',
      width: position === 'panel' ? '100%' : '95vw',
      maxWidth: position === 'panel' ? '100%' : '1400px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.paper,
      ...sx
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        zIndex: 100
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DataIcon color="primary" />
            Variable Builder
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedPaths.length > 0 && (
              <Chip 
                label={`${selectedPaths.length} selected`}
                size="small"
                color="primary"
                sx={{ mr: 1 }}
              />
            )}
            <IconButton 
              onClick={onClose}
              size="small"
              sx={{ color: 'grey.500' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main Content - Side by Side Layout */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Data Browser */}
        <Box sx={{ 
          width: '50%', 
          borderRight: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)'
        }}>
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <TextField
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
            />
          </Box>

          {/* Breadcrumb Navigation */}
          {navigationPath.length > 0 && (
            <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Breadcrumbs>
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
                {navigationPath.map((segment: string, index: number) => (
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
            </Box>
          )}

          {/* Data Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {hasRealData ? (
              navigationPath.length === 0 ? (
                // Root level - show nodes with colors
                <List dense>
                  {realNodeData.map((node: any) => (
                    <ListItemButton
                      key={node.nodeId}
                      onClick={() => navigateToProperty(node.nodeId, node)}
                      sx={{ 
                        borderRadius: 1,
                        m: 1,
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'rgba(0,0,0,0.02)',
                        borderLeft: `4px solid ${nodeColors[node.nodeId] || theme.palette.primary.main}`,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0,0,0,0.04)',
                        }
                      }}
                    >
                      <ListItemIcon>
                        <CheckCircle 
                          sx={{ color: nodeColors[node.nodeId] || theme.palette.primary.main }} 
                          fontSize="small" 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={node.nodeId}
                        secondary="Click to explore data"
                        primaryTypographyProps={{
                          sx: { color: nodeColors[node.nodeId] || theme.palette.primary.main, fontWeight: 'medium' }
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                // Property level - show object properties with selection
                <List dense>
                  {getFilteredProperties(currentData).map((property) => {
                    const value = currentData[property];
                    const type = getPropertyType(value);
                    const preview = getPropertyPreview(value);
                    const isExpandable = (typeof value === 'object' && value !== null);
                    const fullPath = createVariablePath(property);
                    const nodeColor = getNodeColor(fullPath);
                    const isSelected = isPathSelected(fullPath);
                    
                    return (
                      <ListItemButton
                        key={property}
                        onClick={() => {
                          if (isExpandable) {
                            navigateToProperty(property, value);
                          } else {
                            togglePathSelection(fullPath);
                          }
                        }}
                        sx={{ 
                          borderRadius: 1,
                          m: 0.5,
                          backgroundColor: isSelected
                            ? nodeColor + '20'
                            : 'transparent',
                          border: isSelected ? `1px solid ${nodeColor}` : '1px solid transparent',
                          '&:hover': {
                            backgroundColor: nodeColor + '10',
                          }
                        }}
                      >
                        {!isExpandable && (
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                              edge="start"
                              checked={isSelected}
                              size="small"
                              sx={{ 
                                color: nodeColor,
                                '&.Mui-checked': { color: nodeColor }
                              }}
                            />
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: nodeColor }}>
                                {property}
                              </Typography>
                              <Chip 
                                label={type} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  height: 18, 
                                  fontSize: '0.7rem',
                                  borderColor: nodeColor + '50',
                                  color: nodeColor
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
                            <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)', color: nodeColor }} />
                          </ListItemIcon>
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              )
            ) : (
              <Alert severity="info" sx={{ m: 2 }}>
                <Typography variant="body2">
                  No workflow data available. Run some workflow steps to see data here.
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>

        {/* Right Panel - Transformation Panel */}
        <Box sx={{ 
          width: '50%', 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          overflow: 'auto',
          position: 'relative',
          zIndex: 1
        }}>
          <VariableTransformationPanel
            selectedPaths={selectedPaths}
            availableData={currentData || {}}
            onVariableGenerated={handleVariableGenerated}
            nodeColors={nodeColors}
          />
        </Box>
      </Box>
    </Box>
  );

  if (position === 'panel') {
    return open ? <VariableSelectorContent /> : null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{ 
        zIndex: 999999,
        '& .MuiDialog-paper': {
          width: '95vw',
          maxWidth: '1400px',
          height: '85vh',
          maxHeight: '800px',
        }
      }}
    >
      <VariableSelectorContent />
    </Dialog>
  );
} 