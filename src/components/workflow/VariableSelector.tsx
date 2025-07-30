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

  // Component to display individual node data
  const NodeDataDisplay = ({ nodeId }: { nodeId: string }) => {
    const [nodeData, setNodeData] = useState<any>(null);
    
    useEffect(() => {
      const loadNodeData = async () => {
        try {
          const workflowApi = await import('../../services/workflowApi');
          const data = workflowApi.getStoredNodeData(nodeId);
          setNodeData(data);
        } catch (error) {
          console.warn(`Failed to load data for node ${nodeId}:`, error);
          setNodeData(null);
        }
      };
      loadNodeData();
    }, [nodeId]);

    if (!nodeData) {
      return (
        <Alert severity="warning" sx={{ m: 2 }}>
          <Typography variant="body2">
            No test data available for this node. Click "Test Node" in node settings to generate data.
          </Typography>
        </Alert>
      );
    }

    return renderDataTree(nodeData, nodeId);
  };

  // Load real executed node data when dialog opens
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
          const workflowApi = await import('../../services/workflowApi');
          const availableNodes = workflowApi.getAvailableDataNodes();
          setRealNodeData(availableNodes);
          console.log('🔄 VariableSelector loaded node data:', availableNodes);
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

  // Render actual data tree with property names and values
  const renderDataTree = (data: any, currentPath: string = '', level: number = 0): React.ReactNode => {
    if (level > 8) {
      return (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', ml: level * 2 }}>
          ... (deeply nested - click parent path to access)
        </Typography>
      );
    }

    if (Array.isArray(data)) {
      return (
        <Box sx={{ ml: level * 2 }}>
          {/* Array selector for all items */}
          <Box sx={{ mb: 1 }}>
            <Chip
              size="small"
              label={`${currentPath}[*] (All ${data.length} items)`}
              variant="outlined"
              color="secondary"
              sx={{ fontSize: '0.7rem', cursor: 'pointer', mr: 1 }}
              onClick={() => setSelectedPath(`${currentPath}[*]`)}
              icon={<ListIcon fontSize="small" />}
            />
            <Typography variant="caption" color="text.secondary">
              Array with {data.length} items
            </Typography>
          </Box>
          
          {/* Show first few array items */}
          {data.slice(0, 3).map((item, index) => (
            <Accordion key={index} sx={{ mb: 1, ml: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label={`${currentPath}[${index}]`}
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPath(`${currentPath}[${index}]`);
                    }}
                    sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {typeof item === 'object' && item !== null
                      ? `${Array.isArray(item) ? 'Array' : 'Object'} with ${Object.keys(item).length} properties`
                      : String(item).substring(0, 50) + (String(item).length > 50 ? '...' : '')
                    }
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {renderDataTree(item, `${currentPath}[${index}]`, level + 1)}
              </AccordionDetails>
            </Accordion>
          ))}
          
          {data.length > 3 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic' }}>
              ... and {data.length - 3} more items (use [*] for all, or specify index)
            </Typography>
          )}
        </Box>
      );
    } else if (typeof data === 'object' && data !== null) {
      return (
        <Box sx={{ ml: level * 1 }}>
          {Object.entries(data)
            .sort(([a], [b]) => {
              // Sort to put important keys first
              const importantKeys = ['id', 'name', 'title', 'url', 'keyword', 'content', 'type', 'status'];
              const aImportant = importantKeys.indexOf(a);
              const bImportant = importantKeys.indexOf(b);
              if (aImportant !== -1 && bImportant !== -1) return aImportant - bImportant;
              if (aImportant !== -1) return -1;
              if (bImportant !== -1) return 1;
              return a.localeCompare(b);
            })
            .map(([key, value]) => {
              const newPath = currentPath ? `${currentPath}.${key}` : key;
              const isObject = typeof value === 'object' && value !== null;
              const isArray = Array.isArray(value);
              
              return (
                <Box key={key} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      size="small"
                      label={`${key}`}
                      variant="outlined"
                      color={isArray ? 'secondary' : isObject ? 'info' : 'primary'}
                      sx={{ fontSize: '0.7rem', cursor: 'pointer', minWidth: 'auto' }}
                      onClick={() => setSelectedPath(newPath)}
                      icon={isArray ? <ListIcon fontSize="small" /> : isObject ? <JsonIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
                    />
                    
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.8rem' }}>
                      {newPath}
                    </Typography>
                    
                    {!isObject && (
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        fontFamily: 'monospace',
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.7rem'
                      }}>
                        = {String(value)}
                      </Typography>
                    )}
                    
                    {isObject && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {isArray ? `[${(value as any[]).length} items]` : `{${Object.keys(value).length} props}`}
                      </Typography>
                    )}
                  </Box>
                  
                  {isObject && level < 4 && (
                    <Box sx={{ ml: 2, pl: 1, borderLeft: '1px solid', borderColor: 'divider', mt: 1 }}>
                      {renderDataTree(value, newPath, level + 1)}
                    </Box>
                  )}
                </Box>
              );
            })}
        </Box>
      );
    } else {
      return (
        <Box sx={{ ml: level * 2 }}>
          <Chip
            size="small"
            label={currentPath}
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
            onClick={() => setSelectedPath(currentPath)}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontFamily: 'monospace' }}>
            = {String(data)}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
            <strong>Select data from tested nodes:</strong> Click any property name to select it for your variable. 
            Test nodes to automatically make their data available here.
          </Typography>
        </Alert>

        {/* Format Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Variable Format
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
              label="Comma-separated List"
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
              label="Array Range"
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

        {/* Available Data from Tested Nodes */}
        {hasRealData ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DataIcon color="primary" />
              Available Node Data ({realNodeData.length} nodes tested)
            </Typography>
            
            {realNodeData.map((node) => (
              <Accordion key={node.nodeId} sx={{ mb: 2 }} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {node.nodeId}
                    </Typography>
                    <Badge badgeContent="TESTED" color="success" sx={{ ml: 'auto' }} />
                    <Typography variant="caption" color="text.secondary">
                      {node.nodeType} • {new Date(node.executedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto', bgcolor: 'grey.50' }}>
                    {/* Show the actual processed data directly */}
                    <NodeDataDisplay nodeId={node.nodeId} />
                  </Paper>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : (
          <Alert severity="info">
            <Typography variant="body2">
              <strong>No tested nodes found.</strong><br/>
              Test nodes in your workflow by clicking the "Test Node" button in node settings. 
              Test results will automatically appear here for use in other nodes.
            </Typography>
          </Alert>
        )}

        {/* Generated Variable Preview */}
        {selectedPath && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
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
              Variable Preview
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                This variable will be replaced with actual data from <strong>{selectedPath}</strong> when the workflow runs.
              </Typography>
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