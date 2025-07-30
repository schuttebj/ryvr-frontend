import React, { useState, useEffect } from 'react';
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
  Schedule,
} from '@mui/icons-material';

interface VariableSelectorProps {
  open: boolean;
  onClose: () => void;
  onInsert: (variable: string) => void;
  availableData?: Record<string, any>;
}

export default function VariableSelector({
  open,
  onClose,
  onInsert,
}: VariableSelectorProps) {
  const [selectedFormat, setSelectedFormat] = useState<'single' | 'list' | 'json' | 'range'>('single');
  const [selectedPath, setSelectedPath] = useState('');
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(4);
  const [realNodeData, setRealNodeData] = useState<any[]>([]);

  // Load real executed node data when dialog opens
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
          const { getAvailableDataNodes } = await import('../../services/workflowApi');
          const availableNodes = getAvailableDataNodes();
          setRealNodeData(availableNodes);
          console.log('🔄 VariableSelector loaded real node data:', availableNodes);
        } catch (error) {
          console.warn('Failed to load real node data:', error);
          setRealNodeData([]);
        }
      };
      loadData();
    }
  }, [open]);

  // Use real data if available
  const hasRealData = realNodeData.length > 0;

  // Generate variable based on selections
  const generateVariable = () => {
    if (!selectedPath) return '';
    
    let variable = '';
    
    switch (selectedFormat) {
      case 'single':
        variable = `{{${selectedPath}}}`;
        break;
      case 'list':
        variable = `{{${selectedPath}|list}}`;
        break;
      case 'json':
        variable = `{{${selectedPath}|json}}`;
        break;
      case 'range':
        variable = `{{${selectedPath}|range:${rangeStart}-${rangeEnd}}}`;
        break;
      default:
        variable = `{{${selectedPath}}}`;
    }
    
    return variable;
  };

  // Handle inserting the variable
  const handleInsert = () => {
    const variable = generateVariable();
    if (variable) {
      onInsert(variable);
      onClose();
    }
  };

  // Render available data from executed nodes
  const renderAvailableData = () => {
    if (!hasRealData) {
      return (
        <Alert severity="info">
          <Typography variant="body2">
            No executed nodes found. Execute nodes in your workflow first to see available data sources.
            You can use the test data populator in node settings to create sample data for testing.
          </Typography>
        </Alert>
      );
    }

    return (
      <Box>
        {realNodeData.map((node) => (
          <Accordion key={node.nodeId} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {node.nodeId}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {node.nodeType}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Schedule fontSize="small" color="primary" />
                  <Typography variant="caption" color="text.secondary">
                    Executed: {new Date(node.executedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Available Data Paths:
                </Typography>
                {renderDataStructure(node.dataStructure, node.nodeId)}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  // Render data structure from executed nodes
  const renderDataStructure = (items: any[], nodeId: string) => {
    if (!Array.isArray(items) || items.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No data structure available for this node.
        </Typography>
      );
    }

    return (
      <Box>
        {items.map((item, index) => (
          <Box key={`${item.path}-${index}`} sx={{ mb: 1 }}>
            <Chip
              size="small"
              label={`${nodeId}.${item.path}`}
              variant="outlined"
              color="primary"
              sx={{ 
                fontSize: '0.7rem', 
                cursor: 'pointer',
                mr: 1,
                mb: 1
              }}
              onClick={() => setSelectedPath(`${nodeId}.${item.path}`)}
            />
            {item.sampleValue !== null && item.sampleValue !== undefined && (
              <Typography variant="caption" color="text.secondary" sx={{ 
                ml: 1,
                fontStyle: 'italic',
                fontSize: '0.7rem'
              }}>
                Sample: {typeof item.sampleValue === 'object' ? JSON.stringify(item.sampleValue) : String(item.sampleValue)}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Variable Selector</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Select data from previous nodes and choose how to format it in your prompts. 
            Variables will be automatically replaced with actual data when the workflow runs.
          </Typography>
        </Alert>

        {/* Format Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Output Format
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<CodeIcon />}
              label="Single Value"
              onClick={() => setSelectedFormat('single')}
              color={selectedFormat === 'single' ? 'primary' : 'default'}
              variant={selectedFormat === 'single' ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<ListIcon />}
              label="List (Comma-separated)"
              onClick={() => setSelectedFormat('list')}
              color={selectedFormat === 'list' ? 'primary' : 'default'}
              variant={selectedFormat === 'list' ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<JsonIcon />}
              label="JSON Format"
              onClick={() => setSelectedFormat('json')}
              color={selectedFormat === 'json' ? 'primary' : 'default'}
              variant={selectedFormat === 'json' ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<FilterIcon />}
              label="Range (e.g., 1-5)"
              onClick={() => setSelectedFormat('range')}
              color={selectedFormat === 'range' ? 'primary' : 'default'}
              variant={selectedFormat === 'range' ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>

        {/* Range Controls */}
        {selectedFormat === 'range' && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              type="number"
              label="Start Index"
              value={rangeStart}
              onChange={(e) => setRangeStart(parseInt(e.target.value) || 0)}
              size="small"
              inputProps={{ min: 0 }}
            />
            <Typography variant="body2">to</Typography>
            <TextField
              type="number"
              label="End Index"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(parseInt(e.target.value) || 0)}
              size="small"
              inputProps={{ min: 0 }}
            />
          </Box>
        )}

        {/* Data Selection */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Available Data (Click to Select)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'grey.50' }}>
              {renderAvailableData()}
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* Generated Variable Preview */}
        {selectedPath && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Generated Variable
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'primary.50', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {generateVariable()}
                </Typography>
                <Tooltip title="Copy variable">
                  <IconButton
                    size="small"
                    onClick={() => navigator.clipboard.writeText(generateVariable())}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Preview Output
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <pre style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {hasRealData ? 
                  `Variable will be replaced with actual data from ${selectedPath} when workflow runs.` :
                  'Execute workflow nodes to see real data preview'
                }
              </pre>
            </Paper>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleInsert} 
          variant="contained" 
          disabled={!selectedPath}
          startIcon={<CodeIcon />}
        >
          Insert Variable
        </Button>
      </DialogActions>
    </Dialog>
  );
}