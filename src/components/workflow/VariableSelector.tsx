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
  Button,
  useTheme,
  styled,
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

// Styled Dialog with enforced z-index hierarchy
const HighZIndexDialog = styled(Dialog)(() => ({
  // Force z-index on the Dialog root container (highest level)
  '&.MuiDialog-root, &.MuiModal-root': {
    zIndex: '1000000 !important',
  },
  // Backdrop styling - LOWER than modal content (user requirement)
  '& .MuiBackdrop-root': {
    zIndex: '999998 !important',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Dialog container - between backdrop and content
  '& .MuiDialog-container': {
    zIndex: '999999 !important',
  },
  // Dialog paper (modal content) - HIGHER than backdrop (user requirement)
  '& .MuiDialog-paper': {
    zIndex: '999999 !important',
    position: 'relative',
  },
}));

// Safe JsonTreeView wrapper with error handling
const SafeJsonTreeView = ({ 
  data, 
  selectedPaths, 
  onPathToggle, 
  nodeColors, 
  searchTerm 
}: {
  data: any;
  selectedPaths: string[];
  onPathToggle: (path: string) => void;
  nodeColors: Record<string, string>;
  searchTerm: string;
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">
          <Typography variant="body2">
            Tree view encountered an error. Try closing and reopening the variable selector.
          </Typography>
          <Button
            size="small"
            onClick={() => setHasError(false)}
            sx={{ mt: 1 }}
          >
            Try Again
          </Button>
        </Alert>
      </Box>
    );
  }

  try {
    return (
      <JsonTreeView
        data={data}
        selectedPaths={selectedPaths}
        onPathToggle={onPathToggle}
        nodeColors={nodeColors}
        searchTerm={searchTerm}
      />
    );
  } catch (error) {
    console.error('JsonTreeView render error:', error);
    setHasError(true);
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          <Typography variant="body2">
            Failed to render tree view. Please try again.
          </Typography>
        </Alert>
      </Box>
    );
  }
};

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
          // Import workflowApi functions
          const { getAvailableDataNodes, clearDataNodeCache, debugWorkflowData } = await import('../../services/workflowApi');
          
          // Clear cache to ensure we get fresh data
          clearDataNodeCache();
          
          // Use the new debug function for comprehensive debugging
          console.log('🔍 ===== VARIABLE SELECTOR DEBUG =====');
          debugWorkflowData();
          
          const availableNodes = getAvailableDataNodes();
          console.log('🔍 Available nodes from getAvailableDataNodes:', availableNodes);
          console.log('🔍 Available nodes count:', availableNodes.length);
          
          if (isMounted) {
            // If no data, try to get it from globalWorkflowData directly
            if (availableNodes.length === 0) {
              console.warn('⚠️ No nodes from getAvailableDataNodes, checking globalWorkflowData...');
              
              // Try to access globalWorkflowData directly
              try {
                const workflowApiModule = await import('../../services/workflowApi');
                const globalData = (workflowApiModule as any).globalWorkflowData || {};
                console.log('🔍 GlobalWorkflowData contents:', globalData);
                console.log('🔍 GlobalWorkflowData keys:', Object.keys(globalData));
                
                if (Object.keys(globalData).length > 0) {
                  console.log('🔄 Found data in globalWorkflowData, but getAvailableDataNodes returned empty');
                }
              } catch (e) {
                console.warn('Could not access globalWorkflowData:', e);
              }
            }
            
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

  // Force z-index CSS injection when modal opens
  useEffect(() => {
    if (open) {
      // Inject CSS to force z-index on all Variable Selector modals
      const styleId = 'variable-selector-z-index-fix';
      let existingStyle = document.getElementById(styleId);
      
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .MuiDialog-root.variable-selector-modal {
            z-index: 1000000 !important;
          }
          .MuiDialog-root.variable-selector-modal .MuiBackdrop-root {
            z-index: 999998 !important;
          }
          .MuiDialog-root.variable-selector-modal .MuiDialog-container {
            z-index: 999999 !important;
          }
          .MuiDialog-root.variable-selector-modal .MuiDialog-paper {
            z-index: 999999 !important;
          }
        `;
        document.head.appendChild(style);
      }

      return () => {
        // Don't remove the style immediately to prevent flicker
        setTimeout(() => {
          const style = document.getElementById(styleId);
          if (style) {
            style.remove();
          }
        }, 500);
      };
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
              <SafeJsonTreeView
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
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      console.log('🔄 Manual refresh triggered');
                      setIsLoading(false); // Reset loading state to trigger reload
                    }}
                  >
                    🔄 Refresh Data
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="info"
                    onClick={async () => {
                      try {
                        const { debugWorkflowData } = await import('../../services/workflowApi');
                        console.log('🔍 Manual debug check:');
                        debugWorkflowData();
                      } catch (error) {
                        console.error('Debug failed:', error);
                      }
                    }}
                  >
                    🔍 Debug Data
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={async () => {
                      console.log('🧪 Adding test data...');
                      try {
                        const { storeNodeResult } = await import('../../services/workflowApi');
                        
                        // Import WorkflowNodeType
                        const { WorkflowNodeType } = await import('../../types/workflow');
                        
                        // Add sample test data
                        const testResponse = {
                          executionId: `test_${Date.now()}`,
                          nodeId: 'test-node-1',
                          nodeType: WorkflowNodeType.AI_OPENAI_TASK,
                          status: 'success' as const,
                          executedAt: new Date().toISOString(),
                          executionTime: 1000,
                          data: {
                            processed: {
                              analysis: "This is a sample AI analysis result for testing variables.",
                              keywords: ["test", "variable", "data"],
                              score: 85,
                              metadata: {
                                model: "gpt-4o-mini",
                                tokens: 150
                              }
                            },
                            raw: { content: "Raw test content" },
                            summary: {
                              nodeId: 'test-node-1',
                              success: true,
                              dataType: 'object'
                            }
                          },
                          apiMetadata: {
                            provider: 'Test',
                            endpoint: 'test',
                            requestId: `test_${Date.now()}`
                          }
                        };
                        
                        await storeNodeResult('test-node-1', testResponse);
                        console.log('✅ Test data added successfully');
                        
                        // Trigger refresh
                        setIsLoading(false);
                      } catch (error) {
                        console.error('Failed to add test data:', error);
                      }
                    }}
                  >
                    🧪 Add Test Data
                  </Button>
                </Box>
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
    <HighZIndexDialog 
      open={open} 
      onClose={onClose}
      maxWidth={false}
      fullWidth
      disablePortal={false}
      className="variable-selector-modal"
      sx={{ 
        '& .MuiDialog-paper': {
          width: '95vw',
          maxWidth: '1600px',
          height: '90vh',
          maxHeight: '900px',
        }
      }}
    >
      <VariableSelectorContent />
    </HighZIndexDialog>
  );
} 