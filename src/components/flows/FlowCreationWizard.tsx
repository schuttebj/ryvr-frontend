/**
 * FlowCreationWizard Component
 * 
 * Multi-step wizard for creating new flows:
 * 1. Template Selection
 * 2. Field Customization (for editable fields)
 * 3. Review & Create
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as PreviewIcon,
  PlayArrow as StartIcon,
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

import { 
  FlowBusinessContext, 
  CreateFlowRequest
} from '../../types/workflow';
import FlowApiService, { FlowTemplateResponse, TemplatePreviewResponse } from '../../services/flowApi';

interface FlowCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onFlowCreated: () => void;
  selectedBusiness: FlowBusinessContext | null;
}

const WIZARD_STEPS = [
  'Select Template',
  'Customize Fields',
  'Review & Create'
];

export default function FlowCreationWizard({
  open,
  onClose,
  onFlowCreated,
  selectedBusiness
}: FlowCreationWizardProps) {
  const theme = useTheme();
  
  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Template selection
  const [templates, setTemplates] = useState<FlowTemplateResponse[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplateResponse | null>(null);
  const [templatePreview, setTemplatePreview] = useState<TemplatePreviewResponse | null>(null);
  
  // Field customization
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [flowTitle, setFlowTitle] = useState('');
  
  // =============================================================================
  // INITIALIZATION
  // =============================================================================
  
  useEffect(() => {
    if (open) {
      resetWizard();
      loadTemplates();
    }
  }, [open]);
  
  const resetWizard = () => {
    setActiveStep(0);
    setSelectedTemplate(null);
    setTemplatePreview(null);
    setCustomFieldValues({});
    setFlowTitle('');
    setError(null);
  };
  
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await FlowApiService.getPublishedTemplates({
        businessId: selectedBusiness?.id
      });
      setTemplates(response.templates);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Failed to load workflow templates');
    } finally {
      setLoading(false);
    }
  };
  
  // =============================================================================
  // STEP NAVIGATION
  // =============================================================================
  
  const handleNext = async () => {
    if (activeStep === 0 && selectedTemplate) {
      // Load template preview before going to customization
      await loadTemplatePreview();
    }
    setActiveStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const loadTemplatePreview = async () => {
    if (!selectedTemplate) return;
    
    setLoading(true);
    try {
      const preview = await FlowApiService.getTemplatePreview(selectedTemplate.id);
      setTemplatePreview(preview);
      
      // Initialize field values with defaults
      const initialValues: Record<string, any> = {};
      selectedTemplate.editable_fields.forEach(field => {
        initialValues[`${field.step_id}.${field.path}`] = field.default_value || '';
      });
      setCustomFieldValues(initialValues);
      
      // Set default flow title
      setFlowTitle(selectedTemplate.name);
    } catch (err) {
      console.error('Error loading template preview:', err);
      setError('Failed to load template details');
    } finally {
      setLoading(false);
    }
  };
  
  // =============================================================================
  // FLOW CREATION
  // =============================================================================
  
  const handleCreateFlow = async () => {
    if (!selectedTemplate || !selectedBusiness) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const createRequest: CreateFlowRequest = {
        template_id: selectedTemplate.id,
        business_id: selectedBusiness.id,
        title: flowTitle || selectedTemplate.name,
        custom_field_values: customFieldValues,
        execution_mode: 'live'
      };
      
      await FlowApiService.createFlow(selectedBusiness.id, createRequest);
      
      onFlowCreated();
      onClose();
    } catch (err: any) {
      console.error('Error creating flow:', err);
      setError(err.response?.data?.detail || 'Failed to create flow');
    } finally {
      setLoading(false);
    }
  };
  
  // =============================================================================
  // STEP RENDERERS
  // =============================================================================
  
  const renderTemplateSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Choose a Workflow Template
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select from published workflow templates to create your flow.
      </Typography>
      
      {templates.length === 0 && !loading ? (
        <Alert severity="info">
          No published workflow templates available.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {templates.map(template => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedTemplate?.id === template.id 
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AIIcon color="primary" />
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                      {template.name}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {template.description || 'No description available'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    <Chip 
                      label={template.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    {template.tags.slice(0, 2).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {template.step_count} steps
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {FlowApiService.formatCredits(template.credit_cost)}
                    </Typography>
                  </Box>
                  
                  {template.estimated_duration && (
                    <Typography variant="caption" color="text.secondary">
                      ~{FlowApiService.formatDuration(template.estimated_duration)}
                    </Typography>
                  )}
                </CardContent>
                
                {selectedTemplate?.id === template.id && (
                  <Box sx={{ 
                    p: 1, 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <CheckIcon color="primary" sx={{ fontSize: 16 }} />
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      Selected
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
  
  const renderFieldCustomization = () => {
    if (!selectedTemplate || !templatePreview) {
      return <Alert severity="warning">Template details not loaded</Alert>;
    }
    
    const editableFields = selectedTemplate.editable_fields;
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Customize Your Flow
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure the customizable fields for your flow.
        </Typography>
        
        {/* Flow Title */}
        <TextField
          fullWidth
          label="Flow Title"
          value={flowTitle}
          onChange={(e) => setFlowTitle(e.target.value)}
          sx={{ mb: 3 }}
          helperText="Give your flow a descriptive name"
        />
        
        {editableFields.length === 0 ? (
          <Alert severity="info">
            This template has no customizable fields. You can proceed to create the flow.
          </Alert>
        ) : (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Customizable Fields
            </Typography>
            
            <Grid container spacing={3}>
              {editableFields.map((field, index) => {
                const fieldKey = `${field.step_id}.${field.path}`;
                const currentValue = customFieldValues[fieldKey] || '';
                
                return (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          {field.label}
                        </Typography>
                        
                        {field.type === 'textarea' ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={currentValue}
                            onChange={(e) => setCustomFieldValues(prev => ({
                              ...prev,
                              [fieldKey]: e.target.value
                            }))}
                            placeholder={field.description}
                          />
                        ) : field.type === 'select' && field.options ? (
                          <FormControl fullWidth>
                            <Select
                              value={currentValue}
                              onChange={(e) => setCustomFieldValues(prev => ({
                                ...prev,
                                [fieldKey]: e.target.value
                              }))}
                            >
                              {field.options.map((option, optIndex) => (
                                <MenuItem key={optIndex} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            fullWidth
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={currentValue}
                            onChange={(e) => setCustomFieldValues(prev => ({
                              ...prev,
                              [fieldKey]: e.target.value
                            }))}
                            placeholder={field.description}
                          />
                        )}
                        
                        {field.description && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            {field.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
    );
  };
  
  const renderReviewAndCreate = () => {
    if (!selectedTemplate || !templatePreview) {
      return <Alert severity="warning">Template details not loaded</Alert>;
    }
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Review Your Flow
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Review the flow configuration before creating.
        </Typography>
        
        {/* Flow Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Flow Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Flow Title</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {flowTitle}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Template</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedTemplate.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Business</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedBusiness?.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Credit Cost</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {FlowApiService.formatCredits(selectedTemplate.credit_cost)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Workflow Preview */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Workflow Steps
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {templatePreview.steps.map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    backgroundColor: step.is_review 
                      ? alpha(theme.palette.warning.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1,
                    border: `1px solid ${step.is_review 
                      ? alpha(theme.palette.warning.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: step.is_review 
                        ? theme.palette.warning.main 
                        : theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {step.order}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {step.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {step.is_review && (
                      <Chip
                        label="Review"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                    {step.is_editable && (
                      <Chip
                        label="Customized"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };
  
  // =============================================================================
  // MAIN RENDER
  // =============================================================================
  
  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedTemplate !== null;
      case 1:
        return true; // Field customization is optional
      case 2:
        return flowTitle.trim() !== '' && selectedBusiness !== null;
      default:
        return false;
    }
  };
  
  if (!selectedBusiness) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="warning">
            Please select a business before creating a flow.
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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Create New Flow
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Loading Indicator */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {activeStep === 0 && renderTemplateSelection()}
          {activeStep === 1 && renderFieldCustomization()}
          {activeStep === 2 && renderReviewAndCreate()}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
        >
          Back
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        {activeStep < WIZARD_STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed() || loading}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleCreateFlow}
            disabled={!canProceed() || loading}
            startIcon={<StartIcon />}
          >
            Create Flow
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
