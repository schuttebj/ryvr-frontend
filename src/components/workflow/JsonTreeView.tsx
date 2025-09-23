import React, { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  Checkbox,
  IconButton,
  Chip,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DataObject as ObjectIcon,
  DataArray as ArrayIcon,
  Article as StringIcon,
  Tag as NumberIcon,
  ToggleOn as BooleanIcon,
  Remove as NullIcon,
} from '@mui/icons-material';

interface JsonTreeViewProps {
  data: any;
  path?: string[];
  selectedPaths: string[];
  onPathToggle: (path: string) => void;
  nodeColors: Record<string, string>;
  searchTerm?: string;
  level?: number;
}

interface TreeNodeProps {
  nodeKey: string;
  value: any;
  path: string[];
  selectedPaths: string[];
  onPathToggle: (path: string) => void;
  nodeColors: Record<string, string>;
  searchTerm?: string;
  level: number;
}

const getValueType = (value: any): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  return 'unknown';
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'object': return <ObjectIcon fontSize="small" />;
    case 'array': return <ArrayIcon fontSize="small" />;
    case 'string': return <StringIcon fontSize="small" />;
    case 'number': return <NumberIcon fontSize="small" />;
    case 'boolean': return <BooleanIcon fontSize="small" />;
    case 'null': return <NullIcon fontSize="small" />;
    default: return <ObjectIcon fontSize="small" />;
  }
};

const getTypeColor = (type: string, theme: any): string => {
  switch (type) {
    case 'string': return theme.palette.success.main;
    case 'number': return theme.palette.info.main;
    case 'boolean': return theme.palette.warning.main;
    case 'null': return theme.palette.text.disabled;
    case 'array': return theme.palette.secondary.main;
    case 'object': return theme.palette.primary.main;
    default: return theme.palette.text.primary;
  }
};

const getValuePreview = (value: any, type: string): string => {
  switch (type) {
    case 'string':
      return value.length > 50 ? `"${value.substring(0, 47)}..."` : `"${value}"`;
    case 'number':
    case 'boolean':
      return String(value);
    case 'null':
      return 'null';
    case 'array':
      return `Array(${value.length})`;
    case 'object':
      return `{${Object.keys(value).length} keys}`;
    default:
      return String(value);
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({
  nodeKey,
  value,
  path,
  selectedPaths,
  onPathToggle,
  nodeColors,
  searchTerm = '',
  level,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(level < 3); // Auto-expand first 3 levels
  
  const type = getValueType(value);
  const isExpandable = type === 'object' || type === 'array';
  const fullPath = path.join('.');
  const isSelected = selectedPaths.includes(fullPath);
  const nodeColor = nodeColors[path[0]] || theme.palette.primary.main;
  const typeColor = getTypeColor(type, theme);
  
  // Search filtering
  const matchesSearch = searchTerm === '' || 
    nodeKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type === 'string' && String(value).toLowerCase().includes(searchTerm.toLowerCase()));

  if (!matchesSearch && !isExpandable) {
    return null;
  }

  const handleExpand = () => {
    if (isExpandable) {
      setExpanded(!expanded);
    }
  };

  const handleSelect = () => {
    if (!isExpandable) {
      onPathToggle(fullPath);
    }
  };

  const indent = level * 20;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 0.5,
          pl: `${indent + 8}px`,
          pr: 1,
          cursor: isExpandable ? 'pointer' : 'default',
          backgroundColor: isSelected ? `${nodeColor}20` : 'transparent',
          border: isSelected ? `1px solid ${nodeColor}` : '1px solid transparent',
          borderRadius: 1,
          mx: 0.5,
          '&:hover': {
            backgroundColor: isExpandable 
              ? theme.palette.action.hover 
              : `${nodeColor}10`,
          },
        }}
        onClick={isExpandable ? handleExpand : undefined}
      >
        {/* Expand/Collapse Icon */}
        {isExpandable && (
          <IconButton
            size="small"
            sx={{ 
              p: 0.25, 
              mr: 0.5,
              color: nodeColor,
            }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
        
        {/* Checkbox for selectable items */}
        {!isExpandable && (
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={handleSelect}
            sx={{
              p: 0.25,
              mr: 0.5,
              color: nodeColor,
              '&.Mui-checked': { color: nodeColor },
            }}
          />
        )}

        {/* Type Icon */}
        <Box sx={{ 
          mr: 1, 
          color: typeColor,
          display: 'flex',
          alignItems: 'center'
        }}>
          {getTypeIcon(type)}
        </Box>

        {/* Key Name */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'medium',
            color: nodeColor,
            mr: 1,
            fontFamily: 'monospace',
          }}
        >
          {nodeKey}
        </Typography>

        {/* Type Chip */}
        <Chip
          label={type}
          size="small"
          variant="outlined"
          sx={{
            height: 18,
            fontSize: '0.7rem',
            mr: 1,
            borderColor: `${typeColor}50`,
            color: typeColor,
            backgroundColor: `${typeColor}10`,
          }}
        />

        {/* Value Preview */}
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontFamily: 'monospace',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getValuePreview(value, type)}
        </Typography>
      </Box>

      {/* Children */}
      {isExpandable && (
        <Collapse in={expanded}>
          <Box>
            {type === 'array' 
              ? value.map((item: any, index: number) => (
                  <TreeNode
                    key={index}
                    nodeKey={`[${index}]`}
                    value={item}
                    path={[...path, index.toString()]}
                    selectedPaths={selectedPaths}
                    onPathToggle={onPathToggle}
                    nodeColors={nodeColors}
                    searchTerm={searchTerm}
                    level={level + 1}
                  />
                ))
              : Object.entries(value).map(([key, val]) => (
                  <TreeNode
                    key={key}
                    nodeKey={key}
                    value={val}
                    path={[...path, key]}
                    selectedPaths={selectedPaths}
                    onPathToggle={onPathToggle}
                    nodeColors={nodeColors}
                    searchTerm={searchTerm}
                    level={level + 1}
                  />
                ))
            }
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  path = [],
  selectedPaths,
  onPathToggle,
  nodeColors,
  searchTerm = '',
  level = 0,
}) => {
  if (!data || typeof data !== 'object') {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No data available to browse
        </Typography>
      </Box>
    );
  }

  // If data is an array of nodes (like our workflow data)
  if (Array.isArray(data)) {
    return (
      <Box>
        {data.map((node: any, index: number) => (
          <TreeNode
            key={node.nodeId || index}
            nodeKey={node.nodeId || `item_${index}`}
            value={node}
            path={[node.nodeId || `item_${index}`]}
            selectedPaths={selectedPaths}
            onPathToggle={onPathToggle}
            nodeColors={nodeColors}
            searchTerm={searchTerm}
            level={level}
          />
        ))}
      </Box>
    );
  }

  // If data is a single object, render its properties
  return (
    <Box>
      {Object.entries(data).map(([key, value]) => (
        <TreeNode
          key={key}
          nodeKey={key}
          value={value}
          path={[...path, key]}
          selectedPaths={selectedPaths}
          onPathToggle={onPathToggle}
          nodeColors={nodeColors}
          searchTerm={searchTerm}
          level={level}
        />
      ))}
    </Box>
  );
};

export default JsonTreeView;
