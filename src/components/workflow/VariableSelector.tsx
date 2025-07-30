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
  CheckCircle as SuccessIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material';
import { getAvailableDataNodes } from '../../services/workflowApi';

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
  availableData = {}
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

  // Generate variable based on selections
  const generateVariable = () => {
    if (!selectedPath) return '';
    
    let variable = '';
    
    switch (selectedFormat) {
      case 'single':
        // Single item: {{serp_results.items[0].url}}
        variable = `{{${selectedPath}}}`;
        break;
        
      case 'list':
        // List format: {{serp_results.items[*].url|list}}
        if (selectedPath.includes('[0]')) {
          const arrayPath = selectedPath.replace('[0]', '[*]');
          variable = `{{${arrayPath}|list}}`;
        } else {
          variable = `{{${selectedPath}|list}}`;
        }
        break;
        
      case 'json':
        // JSON format: {{serp_results.items[*]|json}}
        if (selectedPath.includes('[0]')) {
          const arrayPath = selectedPath.replace('[0]', '[*]');
          variable = `{{${arrayPath}|json}}`;
        } else {
          variable = `{{${selectedPath}|json}}`;
        }
        break;
        
      case 'range':
        // Range format: {{serp_results.items[0-4].url|list}}
        if (selectedPath.includes('[0]')) {
          const rangePath = selectedPath.replace('[0]', `[${rangeStart}-${rangeEnd}]`);
          variable = `{{${rangePath}|list}}`;
        } else {
          variable = `{{${selectedPath}[${rangeStart}-${rangeEnd}]|list}}`;
        }
        break;
    }
    
    return variable;
  };

  // Render executed nodes data
  const renderExecutedNodesData = (): React.ReactNode => {
    if (!hasRealData) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            No executed nodes found. Execute nodes in your workflow first to see available data sources.
            For testing, you can populate test data using the development tools in node settings.
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
                <SuccessIcon color="success" fontSize="small" />
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
                  <TimeIcon fontSize="small" color="primary" />
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
  const renderDataStructure = (items: any[], nodeId: string): React.ReactNode => {
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

  // Render clickable data tree (fallback for sample data)
  const renderDataTree = (data: any, basePath: string = '', level: number = 0): React.ReactNode => {
    if (level > 3) return null;
    
    if (Array.isArray(data)) {
      return (
        <Box sx={{ ml: level * 2 }}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
            Array ({data.length} items)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              size="small"
              label={`${basePath}[0]`}
              onClick={() => setSelectedPath(`${basePath}[0]`)}
              color={selectedPath === `${basePath}[0]` ? 'primary' : 'default'}
              variant={selectedPath === `${basePath}[0]` ? 'filled' : 'outlined'}
            />
            <Chip
              size="small"
              label={`${basePath}[*]`}
              onClick={() => setSelectedPath(`${basePath}[*]`)}
              color={selectedPath === `${basePath}[*]` ? 'primary' : 'default'}
              variant={selectedPath === `${basePath}[*]` ? 'filled' : 'outlined'}
            />
          </Box>
          {data.length > 0 && typeof data[0] === 'object' && (
            <Box sx={{ ml: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Item properties:
              </Typography>
              {renderDataTree(data[0], `${basePath}[0]`, level + 1)}
            </Box>
          )}
        </Box>
      );
    }
    
    if (typeof data === 'object' && data !== null) {
      return (
        <Box sx={{ ml: level * 2 }}>
          {Object.entries(data).map(([key, value]) => {
            const newPath = basePath ? `${basePath}.${key}` : key;
            const isClickable = typeof value !== 'object' || Array.isArray(value);
            
            return (
              <Box key={key} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {key}:
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({Array.isArray(value) ? `array[${value.length}]` : typeof value})
                  </Typography>
                  {isClickable && (
                    <Chip
                      size="small"
                      label={newPath}
                      onClick={() => setSelectedPath(newPath)}
                      color={selectedPath === newPath ? 'primary' : 'default'}
                      variant={selectedPath === newPath ? 'filled' : 'outlined'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                {typeof value === 'object' && !Array.isArray(value) && (
                  <Box sx={{ ml: 2 }}>
                    {renderDataTree(value, newPath, level + 1)}
                  </Box>
                )}
                {Array.isArray(value) && (
                  <Box sx={{ ml: 2 }}>
                    {renderDataTree(value, newPath, level + 1)}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      );
    }
    
    return null;
  };

  const handleInsert = () => {
    const variable = generateVariable();
    if (variable) {
      onInsert(variable);
      onClose();
    }
  };

  const previewVariableOutput = () => {
    if (!selectedPath) return 'Select a data path first';
    
    try {
      // Simulate what the variable would resolve to
      const pathParts = selectedPath.replace(/\[\*\]|\[0\]|\[\d+-\d+\]/, '').split('.');
      let current = displayData;
      
      for (const part of pathParts) {
        if (current && typeof current === 'object') {
          current = (current as any)[part];
        }
      }
      
      switch (selectedFormat) {
        case 'single':
          return Array.isArray(current) ? current[0] : current;
        case 'list':
          return Array.isArray(current) ? current.join(', ') : current;
        case 'json':
          return JSON.stringify(current, null, 2);
        case 'range':
          if (Array.isArray(current)) {
            return current.slice(rangeStart, rangeEnd + 1).join(', ');
          }
          return current;
        default:
          return current;
      }
    } catch (error) {
      return 'Invalid path';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon />
            <Typography variant="h6">Variable Generator</Typography>
          </Box>
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