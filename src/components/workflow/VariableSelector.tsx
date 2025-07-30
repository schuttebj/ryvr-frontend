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
  Tabs,
  Tab,
  Badge,
  Divider,
  Card,
  CardContent,
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
  Storage as RawDataIcon,
  AutoGraph as ProcessedIcon,
  Insights as SummaryIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface VariableSelectorProps {
  open: boolean;
  onClose: () => void;
  onInsert: (variable: string) => void;
  availableData?: Record<string, any>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`variable-tabpanel-${index}`}
      aria-labelledby={`variable-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
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
  const [tabValue, setTabValue] = useState(0);

  // Load real executed node data when dialog opens
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
          const { getAvailableDataNodes } = await import('../../services/workflowApi');
          const availableNodes = getAvailableDataNodes();
          setRealNodeData(availableNodes);
          console.log('🔄 VariableSelector loaded comprehensive node data:', availableNodes);
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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Render JSON tree recursively for comprehensive browsing
  const renderJsonTree = (data: any, currentPath: string = '', level: number = 0, maxDisplayLevel: number = 3): React.ReactNode => {
    if (level > maxDisplayLevel) {
      return (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          ... (click to expand deeper levels)
        </Typography>
      );
    }

    if (Array.isArray(data)) {
      return (
        <Box sx={{ ml: level * 2 }}>
          <Box sx={{ mb: 1 }}>
            <Chip
              size="small"
              label={`${currentPath}[*] - All ${data.length} items`}
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.7rem', cursor: 'pointer', mr: 1 }}
              onClick={() => setSelectedPath(`${currentPath}[*]`)}
              icon={<ListIcon fontSize="small" />}
            />
            <Typography variant="caption" color="text.secondary">
              Array with {data.length} items
            </Typography>
          </Box>
          
          {data.slice(0, 3).map((item, index) => (
            <Accordion key={index} sx={{ mb: 1, '&:before': { display: 'none' } }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ minHeight: 'auto', '& .MuiAccordionSummary-content': { my: 0.5 } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label={`${currentPath}[${index}]`}
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPath(`${currentPath}[${index}]`);
                    }}
                    sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {typeof item === 'object' ? `Object with ${Object.keys(item || {}).length} properties` : String(item)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {renderJsonTree(item, `${currentPath}[${index}]`, level + 1, maxDisplayLevel)}
              </AccordionDetails>
            </Accordion>
          ))}
          
          {data.length > 3 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic' }}>
              ... and {data.length - 3} more items (use [*] for all, or specify index like [{data.length - 1}])
            </Typography>
          )}
        </Box>
      );
    } else if (typeof data === 'object' && data !== null) {
      return (
        <Box sx={{ ml: level * 1 }}>
          {Object.entries(data).map(([key, value]) => {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            const isObject = typeof value === 'object' && value !== null;
            const isArray = Array.isArray(value);
            
            return (
              <Box key={key} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip
                    size="small"
                    label={newPath}
                    variant="outlined"
                    color={isArray ? 'secondary' : isObject ? 'info' : 'primary'}
                    sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                    onClick={() => setSelectedPath(newPath)}
                    icon={isArray ? <ListIcon fontSize="small" /> : isObject ? <JsonIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
                  />
                  
                  {!isObject && (
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      fontFamily: 'monospace',
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {String(value)}
                    </Typography>
                  )}
                  
                  {isObject && (
                    <Typography variant="caption" color="text.secondary">
                      {isArray ? `Array[${(value as any[]).length}]` : `Object{${Object.keys(value).length}}`}
                    </Typography>
                  )}
                </Box>
                
                {isObject && level < maxDisplayLevel && (
                  <Box sx={{ ml: 2, pl: 1, borderLeft: '1px solid', borderColor: 'divider' }}>
                    {renderJsonTree(value, newPath, level + 1, maxDisplayLevel)}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      );
    } else {
      return (
        <Chip
          size="small"
          label={currentPath}
          variant="outlined"
          color="primary"
          sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
          onClick={() => setSelectedPath(currentPath)}
        />
      );
    }
  };

  // Render comprehensive data structure for a node
  const renderComprehensiveNodeData = (node: any) => {
    if (!node.completeStructure) {
      return (
        <Alert severity="warning">
          <Typography variant="body2">
            Complete structure not available for this node. Using basic structure.
          </Typography>
        </Alert>
      );
    }

    const structure = node.completeStructure;
    
    return (
      <Box>
        {/* Processed Data Section */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ProcessedIcon color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {structure.processed.label}
              </Typography>
              <Badge badgeContent={structure.processed.paths.length} color="primary" />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {structure.processed.description}
            </Typography>
            <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto', bgcolor: 'grey.50' }}>
              {renderJsonTree(structure.processed.paths, 'processed')}
            </Paper>
          </CardContent>
        </Card>

        {/* Raw API Response Section */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <RawDataIcon color="secondary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {structure.raw.label}
              </Typography>
              <Badge badgeContent={structure.raw.paths.length} color="secondary" />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {structure.raw.description}
            </Typography>
            <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'grey.50' }}>
              {renderJsonTree(structure.raw.paths, 'raw')}
            </Paper>
          </CardContent>
        </Card>

        {/* Summary Data Section */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SummaryIcon color="info" />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {structure.summary.label}
              </Typography>
              <Badge badgeContent={structure.summary.paths.length} color="info" />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {structure.summary.description}
            </Typography>
            <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto', bgcolor: 'grey.50' }}>
              {renderJsonTree(structure.summary.paths, 'summary')}
            </Paper>
          </CardContent>
        </Card>

        {/* Metadata Section (if available) */}
        {structure.metadata && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoIcon color="warning" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {structure.metadata.label}
                </Typography>
                <Badge badgeContent={structure.metadata.paths.length} color="warning" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {structure.metadata.description}
              </Typography>
              <Paper sx={{ p: 2, maxHeight: 150, overflow: 'auto', bgcolor: 'grey.50' }}>
                {renderJsonTree(structure.metadata.paths, 'metadata')}
              </Paper>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Advanced Variable Selector</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Browse complete API responses:</strong> Select any data from processed results, raw API responses, summaries, or metadata. 
            Click any blue chip to select that data path for your variable.
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

        {/* Available Data */}
        {hasRealData ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Available Data Sources ({realNodeData.length} nodes)
            </Typography>
            
            {realNodeData.map((node) => (
              <Accordion key={node.nodeId} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {node.nodeId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {node.nodeType} • {new Date(node.executedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {renderComprehensiveNodeData(node)}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : (
          <Alert severity="info">
            <Typography variant="body2">
              <strong>No executed nodes found.</strong><br/>
              Execute nodes in your workflow first, or use the "Populate Test Data" button in node settings to create sample data for testing.
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