import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  TextFieldProps,
} from '@mui/material';
import {
  Code as VariableIcon,
} from '@mui/icons-material';
import VariableSelector from './VariableSelector';

interface VariableTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  availableData?: Record<string, any>;
  enableVariables?: boolean;
}

export default function VariableTextField({
  value,
  onChange,
  availableData = {},
  enableVariables = true,
  ...textFieldProps
}: VariableTextFieldProps) {
  const [variableSelectorOpen, setVariableSelectorOpen] = useState(false);

  const handleVariableInsert = (variable: string) => {
    // Insert variable at cursor position or at the end
    const currentValue = value || '';
    const newValue = currentValue + (currentValue ? ' ' : '') + variable;
    onChange(newValue);
  };

  const renderEndAdornment = () => {
    const existingEndAdornment = textFieldProps.InputProps?.endAdornment;
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

    if (existingEndAdornment && variableButton) {
      return (
        <>
          {variableButton}
          {existingEndAdornment}
        </>
      );
    }

    return variableButton || existingEndAdornment;
  };

  return (
    <>
      <TextField
        {...textFieldProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          ...textFieldProps.InputProps,
          endAdornment: renderEndAdornment(),
        }}
      />
      
      {enableVariables && (
        <VariableSelector
          open={variableSelectorOpen}
          onClose={() => setVariableSelectorOpen(false)}
          onInsert={handleVariableInsert}
          availableData={availableData}
        />
      )}
    </>
  );
} 