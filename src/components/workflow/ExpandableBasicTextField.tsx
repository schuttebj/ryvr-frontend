import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  TextField,
  TextFieldProps,
  useTheme,
  alpha,
} from '@mui/material';
import {
  OpenInFull as ExpandIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface ExpandableBasicTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label: string;
  placeholder?: string;
  rows?: number;
}

export default function ExpandableBasicTextField({
  value,
  onChange,
  label,
  placeholder,
  rows = 4,
  multiline = true,
  ...props
}: ExpandableBasicTextFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState('');
  const theme = useTheme();

  const handleExpandClick = () => {
    setModalValue(value);
    setModalOpen(true);
  };

  const handleModalSave = () => {
    // Create a synthetic event to match the expected onChange signature
    const syntheticEvent = {
      target: { value: modalValue },
      currentTarget: { value: modalValue },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    setModalOpen(false);
  };

  const handleModalCancel = () => {
    setModalValue(value); // Reset to original value
    setModalOpen(false);
  };

  const handleModalChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setModalValue(event.target.value);
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
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <ExpandIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <TextField
          value={value}
          onChange={onChange}
          label={label}
          placeholder={placeholder}
          rows={rows}
          multiline={multiline}
          {...props}
        />
        {renderExpandIcon()}
      </Box>

      {/* Expansion Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalCancel}
        maxWidth="md"
        fullWidth
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
          <TextField
            value={modalValue}
            onChange={handleModalChange}
            label=""
            placeholder={placeholder}
            rows={15}
            fullWidth
            multiline
            variant="outlined"
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
