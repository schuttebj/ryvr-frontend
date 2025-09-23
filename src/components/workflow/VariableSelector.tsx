import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Chip,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Storage as DataIcon,
} from '@mui/icons-material';
import VariableTransformationPanel from './VariableTransformationPanel';
import JsonTreeView from './JsonTreeView';

// Type declarations for development tools
declare global {
  interface Window {
    gc?: () => void;
  }
  
  const process: {
    env: {
      NODE_ENV?: string;
    };
  };
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [realNodeData, setRealNodeData] = useState<any[]>([]);
  const [nodeColors, setNodeColors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Memoized path selection handler
  const togglePathSelection = useCallback((path: string) => {
    setSelectedPaths((prev: string[]) => {
      if (prev.includes(path)) {
        return prev.filter((p: string) => p !== path);
      } else {
        return [...prev, path];
      }
    });
    console.log('🎯 Toggled path selection:', path);
  }, []);

  // Memoized node color generation
  const generateNodeColors = useCallback((nodeData: any[]) => {
    const colors = [
      '#5f5eff', '#1affd5', '#ff6b6b', '#4ecdc4', '#45b7d1', 
      '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
    ];
    
    const colorMap: Record<string, string> = {};
    nodeData.forEach((node, index) => {
      colorMap[node.nodeId] = colors[index % colors.length];
    });
    
    return colorMap;
  }, []);

  // Optimized data loading with proper async handling and size checks
  useEffect(() => {
    let isMounted = true;
    
    if (open && !isLoading) {
      setIsLoading(true);
      
      const loadRealNodeData = async () => {
        try {
          // Import once and cache the result
          const { getAvailableDataNodes } = await import('../../services/workflowApi');
          const availableNodes = getAvailableDataNodes();
          
          if (isMounted) {
            // Limit data size for performance - only show first 10 nodes max to prevent memory issues
            const limitedNodes = availableNodes.slice(0, 10);
            
            if (limitedNodes.length < availableNodes.length) {
              console.warn(`📊 Limited data to ${limitedNodes.length} of ${availableNodes.length} nodes for performance`);
            }
            
            // Further limit the data inside each node to prevent deep object traversal
            const safeLimitedNodes = limitedNodes.map(node => ({
              ...node,
              data: node.data ? {
                processed: node.data.processed ? JSON.parse(JSON.stringify(node.data.processed).slice(0, 50000)) : undefined,
                raw: undefined // Remove raw data to save memory
              } : undefined
            }));
            
            setRealNodeData(safeLimitedNodes);
            setNodeColors(generateNodeColors(safeLimitedNodes));
            console.log('🔄 VariableSelector loaded limited node data:', safeLimitedNodes);
          }
        } catch (error) {
          console.warn('Failed to load real node data:', error);
          if (isMounted) {
            setRealNodeData([]);
            setNodeColors({});
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      
      loadRealNodeData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [open, generateNodeColors, isLoading]);

  // Properly debounced search term to prevent excessive re-renders
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Add memory monitoring (development only)
  useEffect(() => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      const checkMemory = () => {
        if ('memory' in performance) {
          const memInfo = (performance as any).memory;
          console.log('🧠 Memory usage:', {
            used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB'
          });
        }
      };
      
      if (open) {
        checkMemory();
        const interval = setInterval(checkMemory, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [open]);
  
  // Cleanup effect to help with garbage collection when component closes
  useEffect(() => {
    if (!open) {
      // Clear data when component closes to help with memory management
      setRealNodeData([]);
      setNodeColors({});
      setSelectedPaths([]);
      setSearchTerm('');
      setDebouncedSearchTerm('');
      
      // Force garbage collection if available (development)
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && typeof window !== 'undefined' && window.gc) {
        setTimeout(() => {
          if (window.gc) {
            window.gc();
            console.log('🧹 Forced garbage collection after VariableSelector close');
          }
        }, 1000);
      }
    }
  }, [open]);
  
  const hasRealData = realNodeData && realNodeData.length > 0;

  // Memoized variable generation handler
  const handleVariableGenerated = useCallback((variable: string) => {
    onInsert(variable);
    if (position === 'dialog') {
      onClose();
    }
  }, [onInsert, onClose, position]);

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
        {/* Left Panel - Data Browser (70% width for more data space) */}
        <Box sx={{ 
          width: '70%', 
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

          {/* JSON Tree View */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading workflow data...
                </Typography>
              </Box>
            ) : hasRealData ? (
              <JsonTreeView
                data={realNodeData}
                selectedPaths={selectedPaths}
                onPathToggle={togglePathSelection}
                nodeColors={nodeColors}
                searchTerm={debouncedSearchTerm}
              />
            ) : (
              <Alert severity="info" sx={{ m: 2 }}>
                <Typography variant="body2">
                  No workflow data available. Run some workflow steps to see data here.
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>

        {/* Right Panel - Transformation Panel (30% width) */}
        <Box sx={{ 
          width: '30%', 
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          overflow: 'auto',
          position: 'relative',
          zIndex: 1
        }}>
          <VariableTransformationPanel
            selectedPaths={selectedPaths}
            availableData={realNodeData || {}}
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
      disablePortal={false}
      sx={{ 
        zIndex: 1400, // Use Material-UI standard high z-index instead of extreme values
        '& .MuiDialog-paper': {
          width: '95vw',
          maxWidth: '1600px',
          height: '90vh',
          maxHeight: '900px',
          position: 'relative',
        }
      }}
    >
      <VariableSelectorContent />
    </Dialog>
  );
} 