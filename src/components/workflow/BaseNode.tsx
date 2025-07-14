
import { Handle, Position } from '@reactflow/core';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Avatar
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { WorkflowNodeData } from '../../types/workflow';

interface BaseNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
  onSettingsClick?: () => void;
  showHandles?: boolean;
  color?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function BaseNode({
  data,
  selected,
  onSettingsClick,
  showHandles = true,
  color = '#5f5fff',
  icon,
  children
}: BaseNodeProps) {
  const hasErrors = data.errors && data.errors.length > 0;
  const isValid = data.isValid !== false;

  return (
    <Card
      sx={{
        minWidth: 220,
        maxWidth: 320,
        border: selected ? `2px solid ${color}` : '1px solid #e0e0e0',
        borderRadius: 3,
        boxShadow: selected ? `0 4px 12px ${color}30` : '0 2px 8px rgba(0,0,0,0.08)',
        backgroundColor: 'white',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0 4px 12px ${color}20`,
          transform: 'translateY(-2px)',
          borderColor: color,
        },
      }}
    >
      {showHandles && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={true}
            style={{
              backgroundColor: color,
              border: '2px solid white',
              width: 14,
              height: 14,
              borderRadius: '50%',
              top: -7,
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={true}
            style={{
              backgroundColor: color,
              border: '2px solid white',
              width: 14,
              height: 14,
              borderRadius: '50%',
              bottom: -7,
            }}
          />
        </>
      )}
      
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {icon && (
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: color,
                color: 'white',
                fontSize: '1rem'
              }}
            >
              {icon}
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: '#2e3142',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {data.label}
            </Typography>
            {data.description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#5a6577',
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {data.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {hasErrors && (
              <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
            )}
            {isValid && !hasErrors && (
              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
            )}
            {onSettingsClick && (
              <IconButton
                size="small"
                onClick={onSettingsClick}
                sx={{ 
                  color: '#5a6577',
                  '&:hover': { color: color }
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {children}

        {hasErrors && (
          <Box sx={{ mt: 1 }}>
            {data.errors?.map((error, index) => (
              <Chip
                key={index}
                label={error}
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20, mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}

        <Chip
          label={data.type.replace('_', ' ').toUpperCase()}
          size="small"
          sx={{
            mt: 1,
            fontSize: '0.7rem',
            height: 20,
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}40`,
          }}
        />
      </CardContent>
    </Card>
  );
} 