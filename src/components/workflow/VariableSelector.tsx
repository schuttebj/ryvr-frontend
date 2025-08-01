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
  
  // Enhanced setSelectedPath with logging
  const setSelectedPathWithLogging = (path: string) => {
    console.log('🎯 Setting selected path:', path);
    setSelectedPath(path);
  };

  // Convert the last array index in a path to wildcard
  const convertToWildcardPath = (path: string): string => {
    // Find the last occurrence of [number] and replace with [*]
    // Example: items[0].domain → items[*].domain
    // Handle multiple arrays: results[0].items[1].domain → results[0].items[*].domain
    const parts = path.split('.');
    const lastPart = parts[parts.length - 1]; // The property name (e.g., "domain")
    const pathWithoutLastPart = parts.slice(0, -1).join('.'); // Everything before the property
    
    // Replace the last [number] with [*] in the path before the property
    const wildcardPathWithoutProperty = pathWithoutLastPart.replace(/\[(\d+)\]([^\[]*)$/, '[*]$2');
    
    return `${wildcardPathWithoutProperty}.${lastPart}`;
  };
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(4);
  const [realNodeData, setRealNodeData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Component to display individual node data
  const NodeDataDisplay = ({ nodeId }: { nodeId: string }) => {
    const [nodeData, setNodeData] = useState<any>(null);
    
    useEffect(() => {
      const loadNodeData = async () => {
        try {
          const workflowApi = await import('../../services/workflowApi');
          const fullResponse = workflowApi.getStoredNodeResponse(nodeId);
          setNodeData(fullResponse);
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

    // Show all data sections with proper path prefixes
    return (
      <Box>
        {nodeData.data?.processed && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              📊 Processed Data:
            </Typography>
            {renderDataTree(nodeData.data.processed, `${nodeId}.data.processed`, nodeId, 0)}
          </>
        )}
        
        {nodeData.data?.raw && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              🔗 Raw API Data:
            </Typography>
            {renderDataTree(nodeData.data.raw, `${nodeId}.data.raw`, nodeId, 0)}
          </>
        )}
        
        {nodeData.data?.summary && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              📋 Summary:
            </Typography>
            {renderDataTree(nodeData.data.summary, `${nodeId}.data.summary`, nodeId, 0)}
          </>
        )}
      </Box>
    );
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
    
    console.log('🎨 Generated variable:', variable, 'from path:', selectedPath, 'with format:', selectedFormat);
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

  // Filter data based on search term
  const filterDataBySearch = (data: any, path: string = ''): boolean => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Check if current path matches search
    if (path.toLowerCase().includes(searchLower)) return true;
    
    // Check if any property values match search
    if (typeof data === 'string' && data.toLowerCase().includes(searchLower)) return true;
    if (typeof data === 'number' && data.toString().includes(searchTerm)) return true;
    
    // Recursively check nested objects/arrays
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.some((item, index) => filterDataBySearch(item, `${path}[${index}]`));
      } else {
        return Object.entries(data).some(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          return filterDataBySearch(value, newPath);
        });
      }
    }
    
    return false;
  };

  // Render actual data tree with property names and values (simplified display names)
  const renderDataTree = (data: any, currentPath: string = '', nodeId: string = '', level: number = 0, visited: Set<any> = new Set()): React.ReactNode => {
    // Prevent infinite recursion with circular references instead of depth limits
    if (visited.has(data)) {
      return (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', ml: level * 1 }}>
          [Circular Reference] - {currentPath}
        </Typography>
      );
    }
    
    if (typeof data === 'object' && data !== null) {
      visited.add(data);
    }
    
    if (Array.isArray(data)) {
      return (
        <Box sx={{ ml: level * 2 }}>
          {/* Array selector for all items */}
          <Box sx={{ mb: 1 }}>
            <Chip
              size="small"
              label={`SELECT ALL [*] (${data.length} items)`}
              variant="filled"
              color="warning"
              sx={{ 
                fontSize: '0.8rem', 
                cursor: 'pointer', 
                mr: 1,
                fontWeight: 'bold',
                backgroundColor: 'orange',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'darkorange'
                }
              }}
              onClick={() => {
                console.log('🌟 Wildcard clicked! Setting path:', `${currentPath}[*]`);
                setSelectedPathWithLogging(`${currentPath}[*]`);
              }}
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
                    label={`${currentPath.replace(nodeId + '.', '')}[${index}]`}
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('📍 Individual item clicked! Setting path:', `${currentPath}[${index}]`);
                      setSelectedPathWithLogging(`${currentPath}[${index}]`);
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
                {renderDataTree(item, `${currentPath}[${index}]`, nodeId, level + 1, new Set(visited))}
              </AccordionDetails>
            </Accordion>
          ))}
          
          {data.length > 3 && (
            <Box sx={{ ml: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                ... and {data.length - 3} more items
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label="Select All [*]"
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const wildcardPath = `${currentPath}[*]`;
                    const simplifiedPath = wildcardPath.replace(/^[^.]+\.data\./, '');
                    setSelectedPathWithLogging(simplifiedPath);
                  }}
                  sx={{ 
                    fontSize: '0.7rem', 
                    cursor: 'pointer',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white'
                    }
                  }}
                />
              </Box>
            </Box>
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
            .filter(([key, value]) => {
              const newPath = currentPath ? `${currentPath}.${key}` : key;
              return filterDataBySearch(value, newPath);
            })
            .map(([key, value]) => {
              const newPath = currentPath ? `${currentPath}.${key}` : key;
              const displayPath = newPath.replace(nodeId + '.', ''); // Remove nodeId from display
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
                      onClick={() => setSelectedPathWithLogging(newPath)}
                      icon={isArray ? <ListIcon fontSize="small" /> : isObject ? <JsonIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
                    />
                    
                    {/* Add "Get All" button for properties that can be wildcarded */}
                    {!isArray && !isObject && /\[\d+\]/.test(newPath) && (
                      <Chip
                        size="small"
                        label="Get All"
                        variant="filled"
                        color="warning"
                        sx={{ 
                          fontSize: '0.65rem', 
                          cursor: 'pointer',
                          height: '20px',
                          backgroundColor: 'orange',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'darkorange'
                          }
                        }}
                        onClick={() => {
                          // Convert the last array index to wildcard
                          const wildcardPath = convertToWildcardPath(newPath);
                          console.log('🌟 Get All clicked! Converting:', newPath, '→', wildcardPath);
                          setSelectedPathWithLogging(wildcardPath);
                        }}
                      />
                    )}
                    
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.8rem' }}>
                      {displayPath}
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
                  
                  {isObject && (
                    <Box sx={{ ml: 2, pl: 1, borderLeft: '1px solid', borderColor: 'divider', mt: 1 }}>
                      {renderDataTree(value, newPath, nodeId, level + 1, new Set(visited))}
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
            onClick={() => setSelectedPathWithLogging(currentPath)}
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

        {/* Search Box */}
        {hasRealData && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Search Properties
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Type to search property names or values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: 'text.secondary' }}>🔍</Box>
                ),
              }}
            />
          </Box>
        )}

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