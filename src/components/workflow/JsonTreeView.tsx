import React, { useState, memo, useMemo, useCallback } from 'react';
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

const TreeNode: React.FC<TreeNodeProps> = memo(({
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
  const [expanded, setExpanded] = useState(level < 2); // Reduce auto-expand to 2 levels for memory
  
  // Add circular reference detection
  const hasCircularRef = useMemo(() => {
    if (typeof value !== 'object' || value === null) return false;
    try {
      JSON.stringify(value);
      return false;
    } catch (e) {
      return true; // Circular reference detected
    }
  }, [value]);

  // If circular reference detected, don't render children
  if (hasCircularRef && level > 0) {
    return (
      <Box sx={{ p: 1, color: 'warning.main' }}>
        <Typography variant="caption">
          Circular reference detected - skipping to prevent memory leak
        </Typography>
      </Box>
    );
  }

  const type = getValueType(value);
  const isExpandable = type === 'object' || type === 'array';
  
  // Memoize expensive computations
  const fullPath = useMemo(() => path.join('.'), [path]);
  const isSelected = useMemo(() => selectedPaths.includes(fullPath), [selectedPaths, fullPath]);
  const nodeColor = useMemo(() => nodeColors[path[0]] || theme.palette.primary.main, [nodeColors, path, theme.palette.primary.main]);
  const typeColor = useMemo(() => getTypeColor(type, theme), [type, theme]);
  
  // Memoize search filtering
  const matchesSearch = useMemo(() => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return nodeKey.toLowerCase().includes(searchLower) ||
           (type === 'string' && String(value).toLowerCase().includes(searchLower));
  }, [searchTerm, nodeKey, type, value]);

  // Early return for non-matching search results
  if (!matchesSearch && !isExpandable) {
    return null;
  }

  // Memoize event handlers
  const handleExpand = useCallback(() => {
    if (isExpandable) {
      setExpanded(!expanded);
    }
  }, [isExpandable, expanded]);

  const handleSelect = useCallback(() => {
    if (!isExpandable) {
      onPathToggle(fullPath);
    }
  }, [isExpandable, onPathToggle, fullPath]);

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

      {/* Children - Memoized and limited for memory safety */}
      {isExpandable && expanded && (
        <Collapse in={expanded}>
          <Box>
            {useMemo(() => {
              // Prevent rendering too deep to avoid memory issues
              if (level >= 4) {
                return (
                  <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                    Max depth reached - expand manually to continue
                  </Typography>
                );
              }

              if (type === 'array') {
                // Limit array items to prevent memory issues
                const maxItems = 10;
                const limitedArray = value.slice(0, maxItems);
                
                return (
                  <>
                    {limitedArray.map((item: any, index: number) => {
                      // Create path once and reuse
                      const itemPath = [...path, index.toString()];
                      return (
                        <TreeNode
                          key={`${fullPath}[${index}]`}
                          nodeKey={`[${index}]`}
                          value={item}
                          path={itemPath}
                          selectedPaths={selectedPaths}
                          onPathToggle={onPathToggle}
                          nodeColors={nodeColors}
                          searchTerm={searchTerm}
                          level={level + 1}
                        />
                      );
                    })}
                    {value.length > maxItems && (
                      <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                        ... and {value.length - maxItems} more items (limited for performance)
                      </Typography>
                    )}
                  </>
                );
              } else {
                // Limit object properties to prevent memory issues
                const entries = Object.entries(value);
                const maxProps = 15;
                const limitedEntries = entries.slice(0, maxProps);
                
                return (
                  <>
                    {limitedEntries.map(([key, val]) => {
                      // Create path once and reuse
                      const propPath = [...path, key];
                      return (
                        <TreeNode
                          key={`${fullPath}.${key}`}
                          nodeKey={key}
                          value={val}
                          path={propPath}
                          selectedPaths={selectedPaths}
                          onPathToggle={onPathToggle}
                          nodeColors={nodeColors}
                          searchTerm={searchTerm}
                          level={level + 1}
                        />
                      );
                    })}
                    {entries.length > maxProps && (
                      <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                        ... and {entries.length - maxProps} more properties (limited for performance)
                      </Typography>
                    )}
                  </>
                );
              }
            }, [type, value, path, fullPath, selectedPaths, onPathToggle, nodeColors, searchTerm, level])}
          </Box>
        </Collapse>
      )}
    </Box>
  );
});

const JsonTreeView: React.FC<JsonTreeViewProps> = memo(({
  data,
  path = [],
  selectedPaths,
  onPathToggle,
  nodeColors,
  searchTerm = '',
  level = 0,
}) => {
  // Memoize the rendered content to prevent unnecessary re-renders
  const renderedContent = useMemo(() => {
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
      // Limit the number of top-level nodes for memory safety
      const maxTopLevelNodes = 10;
      const limitedData = data.slice(0, maxTopLevelNodes);
      
      return (
        <Box>
          {limitedData.map((node: any, index: number) => {
            const nodeId = node.nodeId || `item_${index}`;
            const nodePath = [nodeId];
            
            return (
              <TreeNode
                key={nodeId}
                nodeKey={nodeId}
                value={node}
                path={nodePath}
                selectedPaths={selectedPaths}
                onPathToggle={onPathToggle}
                nodeColors={nodeColors}
                searchTerm={searchTerm}
                level={level}
              />
            );
          })}
          {data.length > maxTopLevelNodes && (
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                ... and {data.length - maxTopLevelNodes} more nodes (limited for performance)
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // If data is a single object, render its properties
    const entries = Object.entries(data);
    const maxProperties = 20;
    const limitedEntries = entries.slice(0, maxProperties);
    
    return (
      <Box>
        {limitedEntries.map(([key, value]) => {
          const propPath = [...path, key];
          
          return (
            <TreeNode
              key={key}
              nodeKey={key}
              value={value}
              path={propPath}
              selectedPaths={selectedPaths}
              onPathToggle={onPathToggle}
              nodeColors={nodeColors}
              searchTerm={searchTerm}
              level={level}
            />
          );
        })}
        {entries.length > maxProperties && (
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              ... and {entries.length - maxProperties} more properties (limited for performance)
            </Typography>
          </Box>
        )}
      </Box>
    );
  }, [data, path, selectedPaths, onPathToggle, nodeColors, searchTerm, level]);

  return renderedContent;
});

export default JsonTreeView;
