import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Divider,
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
  availableData = {}
}: VariableSelectorProps) {
  const [selectedFormat, setSelectedFormat] = useState<'single' | 'list' | 'json' | 'range'>('single');
  const [selectedPath, setSelectedPath] = useState('');
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(4);
  const [generatedVariable, setGeneratedVariable] = useState('');

  // Sample data for demonstration if none provided
  const sampleData = {
    serp_results: {
      results: [{
        keyword: "marketing",
        total_count: 10,
        items: [
          { rank_absolute: 1, url: "https://example1.com/page", title: "Sample Result 1", description: "Description 1" },
          { rank_absolute: 2, url: "https://example2.com/page", title: "Sample Result 2", description: "Description 2" },
          { rank_absolute: 3, url: "https://example3.com/page", title: "Sample Result 3", description: "Description 3" },
        ]
      }]
    },
    extracted_content: [
      { url: "https://example1.com/page", content: "Content from page 1...", length: 1500 },
      { url: "https://example2.com/page", content: "Content from page 2...", length: 1800 }
    ]
  };

  const displayData = Object.keys(availableData).length > 0 ? availableData : sampleData;

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
    
    setGeneratedVariable(variable);
    return variable;
  };

  // Render clickable data tree
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
          current = current[part];
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
            <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto', bgcolor: 'grey.50' }}>
              {renderDataTree(displayData)}
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
                {String(previewVariableOutput())}
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