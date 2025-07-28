import { useState } from 'react';
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
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface ValidationResultsDialogProps {
  open: boolean;
  onClose: () => void;
  validationResult: any;
  onActivate?: () => void;
}

export default function ValidationResultsDialog({
  open,
  onClose,
  validationResult,
  onActivate
}: ValidationResultsDialogProps) {
  if (!validationResult) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(validationResult.overallStatus)}
            <Typography variant="h6">
              Workflow Validation Results
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Overall Status */}
        <Alert 
          severity={getStatusColor(validationResult.overallStatus)} 
          sx={{ mb: 3 }}
          icon={getStatusIcon(validationResult.overallStatus)}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {validationResult.isValid 
              ? (validationResult.warnings.length > 0 
                  ? `Validation passed with ${validationResult.warnings.length} warning(s)` 
                  : 'Validation passed successfully!')
              : `Validation failed with ${validationResult.errors.length} error(s)`
            }
          </Typography>
          {validationResult.isValid && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              This workflow is ready to be activated and will execute without errors.
            </Typography>
          )}
        </Alert>

        {/* Errors */}
        {validationResult.errors.length > 0 && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon color="error" />
                <Typography variant="subtitle1" color="error">
                  Errors ({validationResult.errors.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {validationResult.errors.map((error: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={error}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Warnings */}
        {validationResult.warnings.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="subtitle1" color="warning.main">
                  Warnings ({validationResult.warnings.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {validationResult.warnings.map((warning: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={warning}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Node Results */}
        {Object.keys(validationResult.nodeResults).length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="info" />
                <Typography variant="subtitle1">
                  Node Test Results ({Object.keys(validationResult.nodeResults).length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {Object.entries(validationResult.nodeResults).map(([nodeId, result]: [string, any]) => (
                  <ListItem 
                    key={nodeId}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1,
                      bgcolor: result.status === 'success' ? 'success.50' : 'error.50'
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(result.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {nodeId}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={result.status} 
                            color={result.status === 'success' ? 'success' : 'error'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption">
                            {result.message}
                          </Typography>
                          {result.errors && result.errors.length > 0 && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                              Errors: {result.errors.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {validationResult.isValid && onActivate && (
          <Button 
            onClick={onActivate} 
            variant="contained" 
            color="success"
            startIcon={<CheckIcon />}
          >
            Activate Workflow
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 