/**
 * FlowOptionsInterface Component
 * 
 * Interface for selecting from dynamic options during workflow execution.
 * Supports single and multiple selection modes.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Stack,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormGroup,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SelectIcon,
  RadioButtonUnchecked as RadioIcon,
  CheckBoxOutlineBlank as CheckboxIcon,
  CheckBox as CheckboxCheckedIcon,
} from '@mui/icons-material';

import { FlowCard as FlowCardType } from '../../types/workflow';
import FlowApiService from '../../services/flowApi';

interface FlowOptionsInterfaceProps {
  flow: FlowCardType | null;
  open: boolean;
  onClose: () => void;
  onSelectionCompleted: () => void;
}

export default function FlowOptionsInterface({
  flow,
  open,
  onClose,
  onSelectionCompleted
}: FlowOptionsInterfaceProps) {
  const theme = useTheme();
  
  // State management
  const [optionsData, setOptionsData] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load options data when dialog opens
  useEffect(() => {
    if (open && flow && flow.current_step) {
      loadOptionsData();
    } else {
      setOptionsData(null);
      setSelectedOptions([]);
      setError(null);
    }
  }, [open, flow]);
  
  // =============================================================================
  // DATA LOADING
  // =============================================================================
  
  const loadOptionsData = async () => {
    if (!flow || !flow.current_step) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await FlowApiService.getFlowOptionsData(flow.id, flow.current_step);
      setOptionsData(response);
      setSelectedOptions([]);
    } catch (err: any) {
      console.error('Error loading options data:', err);
      setError(err.message || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };
  
  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  const handleSingleSelection = (option: any) => {
    setSelectedOptions([option]);
  };
  
  const handleMultipleSelection = (option: any, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, option]);
    } else {
      setSelectedOptions(selectedOptions.filter(o => 
        JSON.stringify(o) !== JSON.stringify(option)
      ));
    }
  };
  
  const handleSubmit = async () => {
    if (!flow || !flow.current_step || selectedOptions.length === 0) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      await FlowApiService.submitOptionsSelection(
        flow.id,
        flow.current_step,
        {
          selected_options: selectedOptions,
          selection_metadata: {
            selection_mode: optionsData?.selection_mode,
            selected_count: selectedOptions.length,
            total_options: optionsData?.available_options?.length || 0
          }
        }
      );
      
      onSelectionCompleted();
      onClose();
    } catch (err: any) {
      console.error('Error submitting selection:', err);
      setError(err.message || 'Failed to submit selection');
    } finally {
      setSubmitting(false);
    }
  };
  
  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const renderOption = (option: any, index: number) => {
    // Determine if option is a simple value or object
    const isObject = typeof option === 'object' && option !== null;
    const displayLabel = isObject 
      ? (option.label || option.title || option.name || JSON.stringify(option))
      : String(option);
    
    const isSelected = selectedOptions.some(o => 
      JSON.stringify(o) === JSON.stringify(option)
    );
    
    if (optionsData?.selection_mode === 'single') {
      return (
        <Card
          key={index}
          variant="outlined"
          sx={{
            cursor: 'pointer',
            border: isSelected 
              ? `2px solid ${theme.palette.primary.main}`
              : `1px solid ${theme.palette.divider}`,
            backgroundColor: isSelected 
              ? alpha(theme.palette.primary.main, 0.05)
              : 'transparent',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              borderColor: theme.palette.primary.main,
            },
          }}
          onClick={() => handleSingleSelection(option)}
        >
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isSelected ? (
                <RadioIcon color="primary" />
              ) : (
                <RadioButtonUnchecked sx={{ color: 'text.secondary' }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                  {displayLabel}
                </Typography>
                {isObject && option.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {option.description}
                  </Typography>
                )}
              </Box>
              {isSelected && (
                <Chip
                  label="Selected"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      );
    } else {
      // Multiple selection mode
      return (
        <FormControlLabel
          key={index}
          control={
            <Checkbox
              checked={isSelected}
              onChange={(e) => handleMultipleSelection(option, e.target.checked)}
            />
          }
          label={
            <Box>
              <Typography variant="body1">{displayLabel}</Typography>
              {isObject && option.description && (
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              )}
            </Box>
          }
          sx={{
            width: '100%',
            m: 0,
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            mb: 1,
            backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
          }}
        />
      );
    }
  };
  
  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  if (!flow) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="error">
            No flow selected for options selection.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SelectIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Select Options
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={submitting}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Loading Indicator */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Flow Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Flow Information
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Flow Title
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {flow.title}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Template
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {flow.template_name}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Step
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {flow.current_step || 'Unknown'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Selection Mode
                </Typography>
                <Chip
                  label={optionsData?.selection_mode === 'single' ? 'Single Selection' : 'Multiple Selection'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        {/* Options Selection */}
        {optionsData && !loading && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Available Options ({optionsData.available_options?.length || 0})
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  {optionsData.selection_mode === 'single' 
                    ? 'Please select one option from the list below.'
                    : 'Please select one or more options from the list below.'}
                </Typography>
              </Alert>
              
              {optionsData.available_options && optionsData.available_options.length > 0 ? (
                <Stack spacing={1}>
                  {optionsData.available_options.map((option: any, index: number) => 
                    renderOption(option, index)
                  )}
                </Stack>
              ) : (
                <Alert severity="warning">
                  No options available for selection.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Selection Summary */}
        {selectedOptions.length > 0 && (
          <Card sx={{ mt: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                Selection Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have selected {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''}.
                {optionsData?.selection_mode === 'single' && selectedOptions.length > 0 && (
                  <span> This selection will be passed to the next workflow step.</span>
                )}
              </Typography>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {selectedOptions.length === 0 
            ? 'Please select at least one option to continue.'
            : `${selectedOptions.length} option${selectedOptions.length !== 1 ? 's' : ''} selected.`}
        </Typography>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0 || submitting}
          startIcon={submitting ? null : <SelectIcon />}
        >
          {submitting ? 'Submitting...' : 'Submit Selection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

