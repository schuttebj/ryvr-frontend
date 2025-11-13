import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface EditableFieldConfig {
  stepId: string;
  stepName: string;
  fieldName: string;
  fieldType: string;
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: string[];
  min?: number;
  max?: number;
}

interface IntegrationRequirement {
  stepId: string;
  stepName: string;
  integrationProvider: string;
  credentialMode: string;
  availableInstances: Array<{
    id: number;
    name: string;
    provider: string;
  }>;
}

interface FlowCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customValues: Record<string, any>, integrationInstances: Record<string, number>) => void;
  templateName: string;
  editableFields: EditableFieldConfig[];
  integrationRequirements: IntegrationRequirement[];
}

export default function FlowCustomizationDialog({
  open,
  onClose,
  onSubmit,
  templateName,
  editableFields,
  integrationRequirements,
}: FlowCustomizationDialogProps) {
  const [customValues, setCustomValues] = useState<Record<string, Record<string, any>>>({});
  const [integrationInstances, setIntegrationInstances] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Group editable fields by step
  const fieldsByStep = editableFields.reduce((acc, field) => {
    if (!acc[field.stepId]) {
      acc[field.stepId] = {
        stepName: field.stepName,
        fields: [],
      };
    }
    acc[field.stepId].fields.push(field);
    return acc;
  }, {} as Record<string, { stepName: string; fields: EditableFieldConfig[] }>);

  // Initialize custom values with defaults
  useEffect(() => {
    const initialValues: Record<string, Record<string, any>> = {};
    editableFields.forEach(field => {
      if (!initialValues[field.stepId]) {
        initialValues[field.stepId] = {};
      }
      initialValues[field.stepId][field.fieldName] = field.default || '';
    });
    setCustomValues(initialValues);
  }, [editableFields]);

  const handleFieldChange = (stepId: string, fieldName: string, value: any) => {
    setCustomValues(prev => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        [fieldName]: value,
      },
    }));

    // Clear error for this field
    const errorKey = `${stepId}.${fieldName}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleIntegrationSelect = (stepId: string, instanceId: number) => {
    setIntegrationInstances(prev => ({
      ...prev,
      [stepId]: instanceId,
    }));

    // Clear error for this integration
    if (errors[`integration.${stepId}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`integration.${stepId}`];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    editableFields.forEach(field => {
      if (field.required) {
        const value = customValues[field.stepId]?.[field.fieldName];
        if (value === undefined || value === null || value === '') {
          newErrors[`${field.stepId}.${field.fieldName}`] = 'This field is required';
        }
      }
    });

    // Validate required integrations
    integrationRequirements.forEach(req => {
      if (req.credentialMode === 'business' && req.availableInstances.length > 0) {
        if (!integrationInstances[req.stepId]) {
          newErrors[`integration.${req.stepId}`] = 'Please select an integration instance';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(customValues, integrationInstances);
    }
  };

  const renderField = (field: EditableFieldConfig) => {
    const value = customValues[field.stepId]?.[field.fieldName] || field.default || '';
    const errorKey = `${field.stepId}.${field.fieldName}`;
    const hasError = !!errors[errorKey];

    switch (field.fieldType) {
      case 'select':
        return (
          <FormControl fullWidth error={hasError} key={field.fieldName}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleFieldChange(field.stepId, field.fieldName, e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {hasError && <FormHelperText>{errors[errorKey]}</FormHelperText>}
            {!hasError && field.description && <FormHelperText>{field.description}</FormHelperText>}
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth error={hasError} key={field.fieldName}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple
              value={Array.isArray(value) ? value : []}
              label={field.label}
              onChange={(e) => handleFieldChange(field.stepId, field.fieldName, e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {hasError && <FormHelperText>{errors[errorKey]}</FormHelperText>}
            {!hasError && field.description && <FormHelperText>{field.description}</FormHelperText>}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            key={field.fieldName}
            fullWidth
            multiline
            rows={4}
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.stepId, field.fieldName, e.target.value)}
            error={hasError}
            helperText={hasError ? errors[errorKey] : field.description}
            required={field.required}
          />
        );

      case 'number':
      case 'integer':
        return (
          <TextField
            key={field.fieldName}
            fullWidth
            type="number"
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.stepId, field.fieldName, parseFloat(e.target.value) || '')}
            inputProps={{
              min: field.min,
              max: field.max,
              step: field.fieldType === 'integer' ? 1 : 0.1,
            }}
            error={hasError}
            helperText={hasError ? errors[errorKey] : field.description}
            required={field.required}
          />
        );

      case 'boolean':
      case 'checkbox':
        return (
          <FormControlLabel
            key={field.fieldName}
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleFieldChange(field.stepId, field.fieldName, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'string':
      default:
        return (
          <TextField
            key={field.fieldName}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.stepId, field.fieldName, e.target.value)}
            error={hasError}
            helperText={hasError ? errors[errorKey] : field.description}
            required={field.required}
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          <Typography variant="h6">Customize Flow: {templateName}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Integration Requirements */}
        {integrationRequirements.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="primary" />
              Required Integrations
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select which integration credentials to use for each step
            </Alert>

            {integrationRequirements.map((req) => (
              <Box key={req.stepId} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {req.stepName} - {req.integrationProvider}
                </Typography>

                {req.availableInstances.length > 0 ? (
                  <FormControl
                    fullWidth
                    error={!!errors[`integration.${req.stepId}`]}
                  >
                    <InputLabel>Select Integration</InputLabel>
                    <Select
                      value={integrationInstances[req.stepId] || ''}
                      label="Select Integration"
                      onChange={(e) => handleIntegrationSelect(req.stepId, Number(e.target.value))}
                    >
                      {req.availableInstances.map((instance) => (
                        <MenuItem key={instance.id} value={instance.id}>
                          {instance.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors[`integration.${req.stepId}`] && (
                      <FormHelperText>{errors[`integration.${req.stepId}`]}</FormHelperText>
                    )}
                  </FormControl>
                ) : (
                  <Alert severity="warning">
                    No integration instances available for {req.integrationProvider}.
                    Please set up an integration first.
                  </Alert>
                )}
              </Box>
            ))}

            <Divider sx={{ my: 3 }} />
          </Box>
        )}

        {/* Editable Fields */}
        {Object.keys(fieldsByStep).length > 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon color="primary" />
              Customizable Fields
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Customize the following fields for this flow execution
            </Alert>

            {Object.entries(fieldsByStep).map(([stepId, { stepName, fields }]) => (
              <Accordion key={stepId} defaultExpanded={fields.some(f => f.required)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="subtitle1">{stepName}</Typography>
                    <Chip
                      label={`${fields.length} field${fields.length > 1 ? 's' : ''}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {fields.some(f => f.required) && (
                      <Chip label="Required" size="small" color="error" variant="outlined" />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fields.map(field => renderField(field))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : (
          <Alert severity="info">
            This workflow has no customizable fields. Click "Create" to proceed.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            integrationRequirements.some(req =>
              req.credentialMode === 'business' &&
              req.availableInstances.length > 0 &&
              !integrationInstances[req.stepId]
            )
          }
        >
          Create Flow
        </Button>
      </DialogActions>
    </Dialog>
  );
}

