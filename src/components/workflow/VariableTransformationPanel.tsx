import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  PlayArrow as PreviewIcon,
  Functions as FunctionIcon,
  Transform as TransformIcon,
} from '@mui/icons-material';

interface TransformationRule {
  id: string;
  type: 'extract' | 'aggregate' | 'format' | 'compute';
  operation: string;
  parameters: Record<string, any>;
  alias: string;
}

interface VariableTransformationPanelProps {
  selectedPaths: string[];
  availableData: Record<string, any>;
  onVariableGenerated: (variable: string) => void;
  nodeColors: Record<string, string>;
}

export default function VariableTransformationPanel({
  selectedPaths,
  availableData,
  onVariableGenerated,
  nodeColors = {},
}: VariableTransformationPanelProps) {
  const theme = useTheme();
  const [transformations, setTransformations] = useState<TransformationRule[]>([]);
  const [livePreview, setLivePreview] = useState(true);
  const [previewResult, setPreviewResult] = useState<any>(null);
  
  // High z-index for dropdowns to appear above Variable Selector modal
  // Variable Selector modal has z-index 1000000, so dropdowns need 1000001+
  const dropdownMenuProps = {
    PaperProps: {
      sx: {
        zIndex: 1000001, // Higher than Variable Selector modal (1000000)
        boxShadow: theme.shadows[8], // Enhanced shadow for better visibility
      }
    },
    sx: {
      zIndex: 1000001, // Higher than Variable Selector modal
    }
  };
  
  // Array iteration settings
  const [arrayIteration, setArrayIteration] = useState({
    enabled: false,
    count: 10,
    basePath: '',
    property: ''
  });
  
  // Detect if selected paths contain array indices and suggest array iteration
  const detectArrayPattern = (paths: string[]) => {
    if (paths.length !== 1) return null;
    
    const path = paths[0];
    const parts = path.split('.');
    
    // Look for pattern like "items.0.url" or "results.0.items.1.title"
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (/^\d+$/.test(part)) { // This part is a numeric index
        const basePath = parts.slice(0, i).join('.');
        const property = parts.slice(i + 1).join('.');
        
        // Check if the base path points to an array
        const pathParts = basePath.split('.');
        let current = availableData;
        
        console.log(`🔄 Array detection - checking basePath: ${basePath}, pathParts:`, pathParts);
        console.log(`🔄 Available data keys:`, Object.keys(availableData));
        
        for (const pathPart of pathParts) {
          current = current?.[pathPart];
          console.log(`🔄 Array detection step: ${pathPart} → `, current);
        }
        
        if (Array.isArray(current)) {
          console.log(`🔄 Array detected! Length: ${current.length}`);
          return {
            basePath,
            arrayLength: current.length,
            property,
            currentIndex: parseInt(part),
            fullPath: path
          };
        }
      }
    }
    return null;
  };
  
  // Generate array iteration variables
  const generateArrayIterationVariables = (basePath: string, property: string, count: number) => {
    const variables = [];
    for (let i = 0; i < count; i++) {
      const fullPath = property ? `${basePath}.${i}.${property}` : `${basePath}.${i}`;
      variables.push(`{{${fullPath} ?? ""}}`);
    }
    return variables.join(' + ');
  };

  // Available transformation operations
  const transformationTypes = {
    extract: {
      operations: {
        'property': { label: 'Extract Property', params: ['path'] },
        'slice': { label: 'Array Slice', params: ['start', 'end'] },
        'filter': { label: 'Filter Items', params: ['condition'] },
        'map': { label: 'Map Values', params: ['expression'] },
      }
    },
    aggregate: {
      operations: {
        'sum': { label: 'Sum', params: [] },
        'avg': { label: 'Average', params: [] },
        'count': { label: 'Count', params: [] },
        'min': { label: 'Minimum', params: [] },
        'max': { label: 'Maximum', params: [] },
        'concat': { label: 'Concatenate', params: ['separator'] },
        'unique': { label: 'Unique Values', params: [] },
      }
    },
    format: {
      operations: {
        'join': { label: 'Join Array', params: ['separator'] },
        'split': { label: 'Split String', params: ['delimiter'] },
        'upper': { label: 'Uppercase', params: [] },
        'lower': { label: 'Lowercase', params: [] },
        'trim': { label: 'Trim Whitespace', params: [] },
        'replace': { label: 'Replace Text', params: ['search', 'replace'] },
      }
    },
    compute: {
      operations: {
        'add': { label: 'Add Numbers', params: ['operand'] },
        'subtract': { label: 'Subtract', params: ['operand'] },
        'multiply': { label: 'Multiply', params: ['operand'] },
        'divide': { label: 'Divide', params: ['operand'] },
        'round': { label: 'Round', params: ['decimals'] },
        'expression': { label: 'Custom Expression', params: ['formula'] },
      }
    }
  } as const;

  // Get node color for a variable path
  const getNodeColor = (path: string): string => {
    const nodeId = path.split('.')[0];
    return nodeColors[nodeId] || theme.palette.primary.main;
  };

  // Add new transformation rule
  const addTransformation = (type: TransformationRule['type']) => {
    const newRule: TransformationRule = {
      id: `transform_${Date.now()}`,
      type,
      operation: Object.keys((transformationTypes[type] as any).operations)[0],
      parameters: {},
      alias: `result_${transformations.length + 1}`
    };
    setTransformations([...transformations, newRule]);
  };

  // Update transformation rule
  const updateTransformation = (id: string, updates: Partial<TransformationRule>) => {
    setTransformations(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Remove transformation rule
  const removeTransformation = (id: string) => {
    setTransformations(prev => prev.filter(t => t.id !== id));
  };

  // Generate variable string based on current configuration with null/undefined handling
  const generateVariableString = useMemo(() => {
    if (selectedPaths.length === 0) return '';

    // Check for array iteration mode
    if (arrayIteration.enabled && arrayIteration.basePath && arrayIteration.property) {
      return generateArrayIterationVariables(arrayIteration.basePath, arrayIteration.property, arrayIteration.count);
    }

    if (transformations.length === 0) {
      // Simple variable without transformations
      if (selectedPaths.length === 1) {
        const path = selectedPaths[0];
        
        // Check if this path likely contains null/undefined values
        console.log(`🔧 Generating variable for path: ${path}`);
        
        // For null/undefined values, provide a fallback
        return `{{${path} ?? "null"}}`;  // Use nullish coalescing to show "null" for null/undefined
      } else {
        // Multiple paths - default to comma-separated list with null handling
        return selectedPaths.map(path => `{{${path} ?? "null"}}`).join(' + ');
      }
    }

    // Complex transformation - use our transformation syntax
    const baseVariable = selectedPaths.length === 1 ? selectedPaths[0] : selectedPaths[0]; // TODO: Handle multiple paths
    const transformPipes = transformations.map(t => {
      const paramStr = Object.entries(t.parameters)
        .map(([key, value]) => `${key}:${value}`)
        .join(',');
      return paramStr ? `${t.operation}(${paramStr})` : t.operation;
    }).join('|');

    // Add null handling to complex transformations too
    return `{{${baseVariable} ?? "null" | ${transformPipes}}}`;
  }, [selectedPaths, transformations, arrayIteration]);

  // Live preview of transformation result
  useEffect(() => {
    if (!livePreview || selectedPaths.length === 0) {
      setPreviewResult(null);
      return;
    }

    try {
      // Debug availableData structure before path resolution
      console.log('🔍 VariableTransformationPanel.useEffect debug:', {
        selectedPathsCount: selectedPaths.length,
        selectedPaths: selectedPaths,
        availableDataKeys: Object.keys(availableData),
        availableDataStructure: availableData,
        samplePath: selectedPaths[0]
      });
      
      // Simulate transformation result with proper null/undefined handling
      const mockData = selectedPaths.map(path => {
        console.log(`🔍 Resolving path: ${path}`);
        const pathParts = path.split('.');
        let current = availableData;
        
        // Debug the first step especially
        console.log(`🔍 Starting resolution with availableData:`, availableData);
        console.log(`🔍 Looking for key '${pathParts[0]}' in keys:`, Object.keys(availableData));
        
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          
          // Handle array indices like [0], [1], etc.
          if (part.startsWith('[') && part.endsWith(']')) {
            const index = parseInt(part.slice(1, -1));
            if (Array.isArray(current) && !isNaN(index)) {
              current = current[index];
            } else {
              console.warn(`Invalid array access: ${part} on`, current);
              current = undefined as any;
              break;
            }
          } else {
            // Handle object property access
            if (current && typeof current === 'object') {
              current = current[part];
            } else {
              console.warn(`Cannot access property ${part} on`, current);
              current = undefined as any;
              break;
            }
          }
          
          console.log(`  Step ${i + 1}: ${part} → `, current);
        }
        
        console.log(`✅ Final resolved value for ${path}:`, current);
        return current;
      });

      // Apply transformations
      let result = mockData;
      for (const transformation of transformations) {
        result = applyTransformationToPreview(result, transformation);
      }

      setPreviewResult(result);
    } catch (error) {
      setPreviewResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [selectedPaths, transformations, availableData, livePreview]);

  // Apply transformation for preview (simplified frontend version)
  const applyTransformationToPreview = (data: any, transformation: TransformationRule) => {
    const { type, operation, parameters } = transformation;

    switch (type) {
      case 'extract':
        if (operation === 'slice' && Array.isArray(data)) {
          const start = parseInt(parameters.start) || 0;
          const end = parseInt(parameters.end) || data.length;
          return data.slice(start, end);
        }
        return data;

      case 'aggregate':
        if (Array.isArray(data)) {
          switch (operation) {
            case 'sum':
              return data.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            case 'avg':
              const nums = data.filter(val => !isNaN(parseFloat(val)));
              return nums.length ? nums.reduce((sum, val) => sum + parseFloat(val), 0) / nums.length : 0;
            case 'count':
              return data.length;
            case 'concat':
              return data.join(parameters.separator || '');
            case 'min':
              return Math.min(...data.map(val => parseFloat(val) || 0));
            case 'max':
              return Math.max(...data.map(val => parseFloat(val) || 0));
            default:
              return data;
          }
        }
        return data;

      case 'format':
        if (operation === 'join' && Array.isArray(data)) {
          return data.join(parameters.separator || ', ');
        }
        if (typeof data === 'string') {
          switch (operation) {
            case 'upper':
              return data.toUpperCase();
            case 'lower':
              return data.toLowerCase();
            case 'trim':
              return data.trim();
            case 'replace':
              return data.replace(new RegExp(parameters.search, 'g'), parameters.replace || '');
            default:
              return data;
          }
        }
        return data;

      case 'compute':
        if (typeof data === 'number') {
          switch (operation) {
            case 'add':
              return data + (parseFloat(parameters.operand) || 0);
            case 'subtract':
              return data - (parseFloat(parameters.operand) || 0);
            case 'multiply':
              return data * (parseFloat(parameters.operand) || 1);
            case 'divide':
              return data / (parseFloat(parameters.operand) || 1);
            case 'round':
              return Math.round(data * Math.pow(10, parameters.decimals || 0)) / Math.pow(10, parameters.decimals || 0);
            default:
              return data;
          }
        }
        return data;

      default:
        return data;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TransformIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Variable Transformation</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <FormControlLabel
          control={
            <Switch
              checked={livePreview}
              onChange={(e) => setLivePreview(e.target.checked)}
              size="small"
            />
          }
          label="Live Preview"
        />
      </Box>

      {/* Selected Variables */}
      {selectedPaths.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Variables:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {selectedPaths.map((path, index) => {
              // Resolve the actual value for this path to show in chip
              const pathParts = path.split('.');
              let current = availableData;
              let resolvedValue = 'unknown';
              
              try {
                console.log(`🔧 Chip resolution for path: ${path}, availableData keys:`, Object.keys(availableData));
                
                for (const part of pathParts) {
                  if (part.startsWith('[') && part.endsWith(']')) {
                    const index = parseInt(part.slice(1, -1));
                    current = Array.isArray(current) ? current[index] : undefined;
                  } else {
                    current = current?.[part];
                  }
                  console.log(`🔧 Chip step: ${part} → `, current);
                }
                
                // Format the resolved value for display
                if (current === null) resolvedValue = 'null';
                else if (current === undefined) resolvedValue = 'undefined';
                else if (typeof current === 'string') {
                  const str = current as string;
                  resolvedValue = `"${str.length > 20 ? str.substring(0, 17) + '...' : str}"`;
                }
                else if (typeof current === 'number') resolvedValue = String(current);
                else if (typeof current === 'boolean') resolvedValue = String(current);
                else if (Array.isArray(current)) resolvedValue = `Array(${current.length})`;
                else if (typeof current === 'object' && current !== null) resolvedValue = `{${Object.keys(current).length} keys}`;
                else resolvedValue = String(current);
              } catch (error) {
                console.error(`🔧 Chip resolution error for ${path}:`, error);
                resolvedValue = 'error';
              }
              
              return (
                <Chip
                  key={index}
                  label={`${path.split('.').pop()}: ${resolvedValue}`}
                  size="small"
                  sx={{
                    backgroundColor: getNodeColor(path) + '20',
                    borderColor: getNodeColor(path),
                    color: getNodeColor(path),
                    fontFamily: 'monospace',
                    // Special styling for null/undefined values
                    ...(current === null || current === undefined ? {
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                      borderColor: 'error.main',
                      color: 'error.main',
                      fontStyle: 'italic',
                      fontWeight: 'bold'
                    } : {}),
                  }}
                  variant="outlined"
                />
              );
            })}
          </Stack>
        </Paper>
      )}
      
      {/* Array Iteration */}
      {(() => {
        const arrayPattern = detectArrayPattern(selectedPaths);
        return arrayPattern && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,150,255,0.05)' : 'rgba(0,150,255,0.02)', border: '1px solid rgba(0,150,255,0.2)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                🔄 Array Iteration Detected
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={arrayIteration.enabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setArrayIteration(prev => ({
                        ...prev,
                        enabled,
                        basePath: enabled ? arrayPattern.basePath : '',
                        property: enabled ? arrayPattern.property : '',
                        count: enabled ? Math.min(prev.count, arrayPattern.arrayLength) : prev.count
                      }));
                    }}
                    size="small"
                  />
                }
                label="Enable"
                sx={{ ml: 1 }}
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Detected array pattern: <code>{arrayPattern.basePath}</code> (length: {arrayPattern.arrayLength}) 
              → property: <code>{arrayPattern.property}</code>
            </Typography>
            
            {arrayIteration.enabled && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Number of Items"
                  type="number"
                  size="small"
                  value={arrayIteration.count}
                  onChange={(e) => setArrayIteration(prev => ({ 
                    ...prev, 
                    count: Math.min(Math.max(1, parseInt(e.target.value) || 1), arrayPattern.arrayLength) 
                  }))}
                  inputProps={{ min: 1, max: arrayPattern.arrayLength }}
                  sx={{ width: 150 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Max: {arrayPattern.arrayLength}
                </Typography>
              </Box>
            )}
            
            {arrayIteration.enabled && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Will generate: {arrayIteration.count} variables from {arrayPattern.basePath}.0.{arrayPattern.property} to {arrayPattern.basePath}.{arrayIteration.count - 1}.{arrayPattern.property}
                </Typography>
              </Alert>
            )}
          </Paper>
        );
      })()}

      {/* Transformation Rules */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">Transformations</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => addTransformation('extract')}
          >
            Add Transform
          </Button>
        </Box>

        {transformations.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No transformations applied. Variable will use raw values.
          </Alert>
        ) : (
          <Stack spacing={1}>
            {transformations.map((transformation, index) => (
              <Accordion key={transformation.id} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <FunctionIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {index + 1}. {(transformationTypes[transformation.type] as any).operations[transformation.operation]?.label || transformation.operation}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTransformation(transformation.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {/* Transformation Type */}
                    <FormControl size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={transformation.type}
                        label="Type"
                        onChange={(e) => updateTransformation(transformation.id, {
                          type: e.target.value as TransformationRule['type'],
                          operation: Object.keys((transformationTypes[e.target.value as TransformationRule['type']] as any).operations)[0]
                        })}
                        MenuProps={dropdownMenuProps}
                      >
                        {Object.entries(transformationTypes).map(([key]) => (
                          <MenuItem key={key} value={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Operation */}
                    <FormControl size="small">
                      <InputLabel>Operation</InputLabel>
                      <Select
                        value={transformation.operation}
                        label="Operation"
                        onChange={(e) => updateTransformation(transformation.id, { operation: e.target.value })}
                        MenuProps={dropdownMenuProps}
                      >
                        {Object.entries((transformationTypes[transformation.type] as any).operations).map(([key, value]: [string, any]) => (
                          <MenuItem key={key} value={key}>
                            {value.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Parameters */}
                    {(transformationTypes[transformation.type] as any).operations[transformation.operation]?.params.map((param: string) => (
                      <TextField
                        key={param}
                        size="small"
                        label={param.charAt(0).toUpperCase() + param.slice(1)}
                        value={transformation.parameters[param] || ''}
                        onChange={(e) => updateTransformation(transformation.id, {
                          parameters: { ...transformation.parameters, [param]: e.target.value }
                        })}
                      />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Actions</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addTransformation('format')}
          >
            📝 Comma List
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addTransformation('aggregate')}
          >
            🔢 Sum/Count
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addTransformation('extract')}
          >
            ✂️ Slice Array
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => {
              // Add a custom transformation for null handling
              const newTransformation: TransformationRule = {
                id: Date.now().toString(),
                type: 'format',
                operation: 'nullish_coalescing',
                parameters: { fallback: '(empty)' },
                alias: 'null_safe'
              };
              setTransformations(prev => [...prev, newTransformation]);
            }}
          >
            🚫 Handle Nulls
          </Button>
          {(() => {
            const arrayPattern = detectArrayPattern(selectedPaths);
            return arrayPattern && (
              <Button
                size="small"
                variant="outlined"
                color="info"
                onClick={() => {
                  setArrayIteration({
                    enabled: true,
                    count: Math.min(10, arrayPattern.arrayLength),
                    basePath: arrayPattern.basePath,
                    property: arrayPattern.property
                  });
                }}
              >
                🔄 Array List ({arrayPattern.arrayLength} items)
              </Button>
            );
          })()}
        </Stack>
      </Box>

      {/* Live Preview */}
      {livePreview && previewResult !== null && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PreviewIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle2">Live Preview</Typography>
          </Box>
          <Box sx={{ 
            p: 1, 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto',
            maxHeight: 150
          }}>
            {previewResult?.error ? (
              <Typography color="error">{previewResult.error}</Typography>
            ) : (
              <pre style={{ 
                margin: 0,
                color: (previewResult === null || previewResult === undefined) ? theme.palette.error.main : 'inherit',
                fontStyle: (previewResult === null || previewResult === undefined) ? 'italic' : 'normal',
                fontWeight: (previewResult === null || previewResult === undefined) ? 'bold' : 'normal'
              }}>
                {(() => {
                  // Custom JSON stringify that highlights null/undefined values
                  if (previewResult === null) return 'null';
                  if (previewResult === undefined) return 'undefined';
                  if (Array.isArray(previewResult)) {
                    return '[' + previewResult.map(item => {
                      if (item === null) return 'null';
                      if (item === undefined) return 'undefined';
                      return JSON.stringify(item);
                    }).join(', ') + ']';
                  }
                  return JSON.stringify(previewResult, (_, value) => {
                    if (value === null) return 'null';
                    if (value === undefined) return 'undefined';
                    return value;
                  }, 2);
                })()}
              </pre>
            )}
          </Box>
        </Paper>
      )}

      {/* Generated Variable */}
      <Paper sx={{ 
        p: 2, 
        backgroundColor: theme.palette.primary.main + '10',
        border: `1px solid ${theme.palette.primary.main}30`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="primary">Generated Variable</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(generateVariableString);
                onVariableGenerated(generateVariableString);
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{
          p: 1,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          wordBreak: 'break-all'
        }}>
          {generateVariableString || 'Select variables to generate...'}
        </Box>
      </Paper>
    </Box>
  );
}
