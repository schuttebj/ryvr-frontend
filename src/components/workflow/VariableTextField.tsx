import { useState, useRef, useMemo } from 'react';
import {
  TextField,
  IconButton,
  Tooltip,
  TextFieldProps,
  Box,
  Chip,
  Typography,
  Paper,
} from '@mui/material';
import {
  Code as VariableIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import VariableSelector from './VariableSelector';
import { getAvailableDataNodes, processVariables } from '../../services/workflowApi';

interface VariableTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  availableData?: Record<string, any>;
  enableVariables?: boolean;
  showPreview?: boolean; // Option to show variable preview
}

export default function VariableTextField({
  value,
  onChange,
  availableData = {},
  enableVariables = true,
  showPreview = true,
  ...textFieldProps
}: VariableTextFieldProps) {
  const [variableSelectorOpen, setVariableSelectorOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  // Parse variables from text
  const parsedContent = useMemo(() => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const parts: Array<{ type: 'text' | 'variable'; content: string; originalMatch?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = variableRegex.exec(value || '')) !== null) {
      // Add text before variable
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: value.slice(lastIndex, match.index)
        });
      }
      
      // Add variable
      parts.push({
        type: 'variable',
        content: match[1],
        originalMatch: match[0]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < (value || '').length) {
      parts.push({
        type: 'text',
        content: value.slice(lastIndex)
      });
    }
    
    return parts;
  }, [value]);

  // Get variable preview values
  const getVariablePreview = (variablePath: string): string => {
    try {
      const availableNodes = getAvailableDataNodes();
      const allData: Record<string, any> = {};
      
      // Combine all available data - match the path structure that VariableSelector creates
      availableNodes.forEach(node => {
        if (node.data) {
          // Create the structure that matches variable paths: nodeId.data.processed, nodeId.data.raw, etc.
          allData[node.id] = {
            data: node.data  // Wrap in data object to match paths like nodeId.data.processed
          };
          console.log(`📊 Added data for node ${node.id}:`, {
            structure: 'wrapped in data object',
            availablePaths: [`${node.id}.data.processed`, `${node.id}.data.raw`, `${node.id}.data.summary`],
            keys: Object.keys(node.data)
          });
        }
      });
      
      // Use processVariables to handle format parsing correctly
      const dummyText = `{{${variablePath}}}`;
      const processedValue = processVariables(dummyText, allData);
      
      // If it returned the original text, the variable wasn't found
      if (processedValue === dummyText) {
        return '<undefined>';
      }
      
      return processedValue.length > 50 ? processedValue.substring(0, 47) + '...' : processedValue;
    } catch (error) {
      return '<error>';
    }
  };

  const handleVariableInsert = (variable: string) => {
    // Insert variable at cursor position or at the end
    const currentValue = value || '';
    const newValue = currentValue + (currentValue ? ' ' : '') + variable;
    onChange(newValue);
  };

  const removeVariable = (originalMatch: string) => {
    const newValue = (value || '').replace(originalMatch, '');
    onChange(newValue);
  };

  const renderPreviewMode = () => {
    if (!previewMode || parsedContent.length === 0) return null;

    return (
      <Paper elevation={1} sx={{ p: 2, mt: 1, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Preview with actual values:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          {parsedContent.map((part, index) => {
            if (part.type === 'text') {
              return (
                <Typography key={index} component="span" variant="body2">
                  {part.content}
                </Typography>
              );
            } else {
              const previewValue = getVariablePreview(part.content);
              return (
                <Chip
                  key={index}
                  label={previewValue}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ fontSize: '0.75rem' }}
                />
              );
            }
          })}
        </Box>
      </Paper>
    );
  };

  const renderVariablePills = () => {
    if (previewMode || parsedContent.filter(p => p.type === 'variable').length === 0) return null;

    return (
      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
          Variables:
        </Typography>
        {parsedContent
          .filter(part => part.type === 'variable')
          .map((part, index) => (
            <Chip
              key={index}
              label={part.content}
              size="small"
              color="secondary"
              variant="outlined"
              onDelete={() => removeVariable(part.originalMatch!)}
              sx={{ fontSize: '0.75rem' }}
              icon={<VariableIcon fontSize="small" />}
            />
          ))}
      </Box>
    );
  };

  const renderEndAdornment = () => {
    const existingEndAdornment = textFieldProps.InputProps?.endAdornment;
    
    const previewToggle = showPreview && parsedContent.some(p => p.type === 'variable') ? (
      <Tooltip title={previewMode ? "Show variable names" : "Show actual values"}>
        <IconButton
          size="small"
          onClick={() => setPreviewMode(!previewMode)}
          edge="end"
          sx={{ mr: 0.5 }}
        >
          {previewMode ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </Tooltip>
    ) : null;

    const variableButton = enableVariables ? (
      <Tooltip title="Insert variable from previous nodes">
        <IconButton
          size="small"
          onClick={() => setVariableSelectorOpen(true)}
          edge="end"
          sx={{ mr: existingEndAdornment ? 1 : 0 }}
        >
          <VariableIcon />
        </IconButton>
      </Tooltip>
    ) : null;

    if (previewToggle || variableButton || existingEndAdornment) {
      return (
        <>
          {previewToggle}
          {variableButton}
          {existingEndAdornment}
        </>
      );
    }

    return null;
  };

  return (
    <Box>
      <TextField
        {...textFieldProps}
        ref={textFieldRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          ...textFieldProps.InputProps,
          endAdornment: renderEndAdornment(),
        }}
      />
      
      {/* Variable pills display */}
      {renderVariablePills()}
      
      {/* Preview mode display */}
      {renderPreviewMode()}
      
      {enableVariables && (
        <VariableSelector
          open={variableSelectorOpen}
          onClose={() => setVariableSelectorOpen(false)}
          onInsert={handleVariableInsert}
          availableData={availableData}
        />
      )}
    </Box>
  );
} 