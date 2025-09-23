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
} from '@mui/material';
import {
  Close as CloseIcon,
  Storage as DataIcon,
} from '@mui/icons-material';
import VariableTransformationPanel from './VariableTransformationPanel';
import JsonTreeView from './JsonTreeView';

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
            {hasRealData ? (
              <JsonTreeView
                data={realNodeData}
                selectedPaths={selectedPaths}
                onPathToggle={togglePathSelection}
                nodeColors={nodeColors}
                searchTerm={searchTerm}
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
        zIndex: 999999,
        '& .MuiBackdrop-root': {
          zIndex: 999998,
        },
        '& .MuiDialog-paper': {
          width: '95vw',
          maxWidth: '1600px',
          height: '90vh',
          maxHeight: '900px',
          zIndex: 999999,
          position: 'relative',
        }
      }}
      BackdropProps={{
        sx: {
          zIndex: 999998,
        }
      }}
    >
      <VariableSelectorContent />
    </Dialog>
  );
} 