import React, { useState, memo, useMemo } from 'react';
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
  
  // Simplified circular reference detection - only check if we're getting too deep
  const shouldSkipCircular = useMemo(() => {
    if (level > 6 || typeof value !== 'object' || value === null) return level > 6;
    
    // Quick check for obvious circular references
    if (value === globalThis || value === window || value === document) return true;
    
    return false;
  }, [value, level]);

  // Early return for circular references or too deep nesting
  if (shouldSkipCircular) {
    return (
      <Box sx={{ p: 1, color: 'warning.main' }}>
        <Typography variant="caption">
          {level > 6 ? 'Max depth reached' : 'Circular reference detected'} - click to expand manually
        </Typography>
      </Box>
    );
  }

  const type = getValueType(value);
  const isExpandable = type === 'object' || type === 'array';
  
  // Simplified computations to prevent re-render loops
  const fullPath = path.join('.');
  const isSelected = selectedPaths.includes(fullPath);
  const nodeColor = nodeColors[path[0]] || theme.palette.primary.main;
  const typeColor = getTypeColor(type, theme);
  
  // Simplified search filtering
  const matchesSearch = searchTerm === '' || 
    nodeKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type === 'string' && String(value).toLowerCase().includes(searchTerm.toLowerCase()));

  // Early return for non-matching search results
  if (!matchesSearch && !isExpandable) {
    return null;
  }

  // Simple event handlers
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

      {/* Children - Simplified rendering to prevent blank screen */}
      {isExpandable && expanded && (
        <Collapse in={expanded}>
          <Box>
            {(() => {
              try {
                // Prevent rendering too deep to avoid memory issues
                if (level >= 5) {
                  return (
                    <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                      Max depth reached - close and reopen to continue
                    </Typography>
                  );
                }

                if (type === 'array' && Array.isArray(value)) {
                  // Limit array items to prevent memory issues
                  const maxItems = 8; // Reduced from 10
                  const safeArray = value.slice(0, maxItems);
                  
                  return (
                    <Box>
                      {safeArray.map((item: any, index: number) => {
                        const itemKey = `${fullPath}_${index}`;
                        const itemPath = [...path, index.toString()];
                        
                        return (
                          <TreeNode
                            key={itemKey}
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
                          ... and {value.length - maxItems} more items (refresh to see more)
                        </Typography>
                      )}
                    </Box>
                  );
                } 
                
                if (type === 'object' && value && typeof value === 'object') {
                  // Limit object properties to prevent memory issues
                  const entries = Object.entries(value);
                  const maxProps = 10; // Reduced from 15
                  const safeEntries = entries.slice(0, maxProps);
                  
                  return (
                    <Box>
                      {safeEntries.map(([key, val]) => {
                        const propKey = `${fullPath}_${key}`;
                        const propPath = [...path, key];
                        
                        return (
                          <TreeNode
                            key={propKey}
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
                          ... and {entries.length - maxProps} more properties (refresh to see more)
                        </Typography>
                      )}
                    </Box>
                  );
                }
                
                return null;
              } catch (error) {
                console.warn('JsonTreeView render error:', error);
                return (
                  <Typography variant="caption" color="error" sx={{ p: 1, display: 'block' }}>
                    Error rendering content - try refreshing
                  </Typography>
                );
              }
            })()}
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
  // Simplified rendering without complex memoization
  if (!data || typeof data !== 'object') {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No data available to browse
        </Typography>
      </Box>
    );
  }

  try {
    // If data is an array of nodes (like our workflow data)
    if (Array.isArray(data)) {
      // Limit the number of top-level nodes for memory safety
      const maxTopLevelNodes = 8; // Reduced for stability
      const limitedData = data.slice(0, maxTopLevelNodes);
      
      return (
        <Box>
          {limitedData.map((node: any, index: number) => {
            const nodeId = node.nodeId || `item_${index}`;
            const nodePath = [nodeId];
            
            return (
              <TreeNode
                key={`${nodeId}_${index}`} // More unique key
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
                ... and {data.length - maxTopLevelNodes} more nodes (close/reopen to see more)
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // If data is a single object, render its properties
    const entries = Object.entries(data);
    const maxProperties = 12; // Reduced for stability
    const limitedEntries = entries.slice(0, maxProperties);
    
    return (
      <Box>
        {limitedEntries.map(([key, value]) => {
          const propPath = [...path, key];
          
          return (
            <TreeNode
              key={`${key}_${level}`} // More unique key
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
              ... and {entries.length - maxProperties} more properties (close/reopen to see more)
            </Typography>
          </Box>
        )}
      </Box>
    );
  } catch (error) {
    console.warn('JsonTreeView error:', error);
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="error">
          Error rendering data - try closing and reopening the variable selector
        </Typography>
      </Box>
    );
  }
});

export default JsonTreeView;
