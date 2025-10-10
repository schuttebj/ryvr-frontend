import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  OpenInFull as ExpandIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import VariableTextField from './VariableTextField';
import { Z_INDEX } from '../../constants/zIndex';

interface ExpandableTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  rows?: number;
  fullWidth?: boolean;
  multiline?: boolean;
  helperText?: string;
  required?: boolean;
  availableData?: Record<string, any>;
  enableVariables?: boolean;
  showPreview?: boolean;
}

export default function ExpandableTextField({
  value,
  onChange,
  label,
  placeholder,
  rows = 4,
  fullWidth = true,
  multiline = true,
  helperText,
  required = false,
  availableData,
  enableVariables = true,
  showPreview = true,
  ...props
}: ExpandableTextFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState('');
  const theme = useTheme();

  const handleExpandClick = () => {
    setModalValue(value);
    setModalOpen(true);
  };

  const handleModalSave = () => {
    onChange(modalValue);
    setModalOpen(false);
  };

  const handleModalCancel = () => {
    setModalValue(value); // Reset to original value
    setModalOpen(false);
  };

  // Only show expand icon for multiline fields
  const showExpandIcon = multiline && rows && rows > 1;

  const renderExpandIcon = () => {
    if (!showExpandIcon) return null;

    return (
      <Tooltip title="Expand to larger editor">
        <IconButton
          size="small"
          onClick={handleExpandClick}
          sx={{
            ml: 1,
            p: 0.5,
            minWidth: 'auto',
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
            },
          }}
        >
          <ExpandIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        {/* Label and Expand Icon Row */}
        {label && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 0.5,
            gap: 1
          }}>
            <Box component="label" sx={{ 
              fontSize: '0.875rem',
              fontWeight: 500,
              color: theme.palette.text.primary,
              ...(required && {
                '&::after': {
                  content: '" *"',
                  color: theme.palette.error.main,
                }
              })
            }}>
              {label}
            </Box>
            {renderExpandIcon()}
          </Box>
        )}
        
        {/* Text Field */}
        <VariableTextField
          value={value}
          onChange={onChange}
          label="" // Remove label since we're showing it above
          placeholder={placeholder}
          rows={rows}
          fullWidth={fullWidth}
          multiline={multiline}
          helperText={helperText}
          required={required}
          availableData={availableData}
          enableVariables={enableVariables}
          showPreview={showPreview}
          {...props}
        />
      </Box>

      {/* Expansion Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalCancel}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: Z_INDEX.EXPANDABLE_TEXT_MODAL, // Higher than NodeSettingsPanel but lower than dropdowns
        }}
        slotProps={{
          backdrop: {
            sx: {
              // Remove forced z-index - let it naturally sit below the dialog
            },
          },
        }}
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '600px',
          },
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}>
          <Box>
            Edit {label}
          </Box>
          <IconButton
            onClick={handleModalCancel}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          <VariableTextField
            value={modalValue}
            onChange={setModalValue}
            label=""
            placeholder={placeholder}
            rows={15}
            fullWidth
            multiline
            availableData={availableData}
            enableVariables={enableVariables}
            showPreview={showPreview}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.default,
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button
            onClick={handleModalCancel}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleModalSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
