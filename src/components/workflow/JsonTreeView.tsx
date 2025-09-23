import React, { useState, memo, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Collapse,
  Checkbox,
  IconButton,
  Chip,
  Button,
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
  maxDepth?: number;
  maxItems?: number;
  maxProps?: number;
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
  maxDepth?: number;
  maxItems?: number;
  maxProps?: number;
}

const getValueType = (value: any): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
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
    case 'undefined': return <NullIcon fontSize="small" />;
    default: return <ObjectIcon fontSize="small" />;
  }
};

const getTypeColor = (type: string, theme: any): string => {
  switch (type) {
    case 'string': return theme.palette.success.main;
    case 'number': return theme.palette.info.main;
    case 'boolean': return theme.palette.warning.main;
    case 'null': return theme.palette.text.disabled;
    case 'undefined': return theme.palette.text.disabled;
    case 'array': return theme.palette.secondary.main;
    case 'object': return theme.palette.primary.main;
    default: return theme.palette.text.secondary;
  }
};

const getValuePreview = (value: any, type: string): string => {
  switch (type) {
    case 'string':
      if (value === '') return '""'; // Empty string
      return value.length > 50 ? `"${value.substring(0, 47)}..."` : `"${value}"`;
    case 'number':
      return String(value);
    case 'boolean':
      return String(value);
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'array':
      if (!value || value.length === 0) return 'Array(0)';
      if (value.length <= 3) {
        // Show preview of small arrays with proper formatting
        const previews = value.map((item: any) => {
          if (item === null) return 'null';
          if (item === undefined) return 'undefined';
          if (typeof item === 'string') return `"${item.length > 20 ? item.substring(0, 17) + '...' : item}"`;
          if (typeof item === 'object' && item !== null) return '{...}';
          return String(item);
        });
        return `[${previews.join(', ')}]`;
      }
      return `Array(${value.length})`;
    case 'object':
      if (!value) return 'null';
      return `{${Object.keys(value).length} keys}`;
    case 'unknown':
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      return String(value) || '(empty)';
    default:
      return String(value) || '(empty)';
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
  maxDepth = 5,
  maxItems = 8,
  maxProps = 10,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(level < 2); // Reduce auto-expand to 2 levels for memory
  const [localMaxItems, setLocalMaxItems] = useState(maxItems);
  const [localMaxProps, setLocalMaxProps] = useState(maxProps);
  const [localMaxDepth, setLocalMaxDepth] = useState(maxDepth);
  const [manuallyExpanded, setManuallyExpanded] = useState(false); // Track if user manually expanded this
  
  // Calculate type and expandability first
  const type = getValueType(value);
  const isExpandable = type === 'object' || type === 'array';
  const shouldForceExpansion = type === 'array' && Array.isArray(value) && value.length > 0;
  
  // Check if this node or any child nodes are selected
  const fullPath = path.join('.');
  const isNodeSelected = selectedPaths.includes(fullPath);
  const hasSelectedChildren = selectedPaths.some((selectedPath: string) => 
    selectedPath.startsWith(fullPath + '.') && selectedPath !== fullPath
  );
  const shouldStayExpanded = isNodeSelected || hasSelectedChildren;
  
  // Update local depth when parent prop changes
  useEffect(() => {
    if (maxDepth > localMaxDepth) {
      console.log(`📈 TreeNode ${nodeKey} inherited depth increase: ${localMaxDepth} → ${maxDepth}`);
      setLocalMaxDepth(maxDepth);
    }
  }, [maxDepth, localMaxDepth, nodeKey]);
  
  // Auto-expand when this node or children become selected (but don't interfere with manual expansion)
  useEffect(() => {
    if (shouldStayExpanded && !expanded && isExpandable && !manuallyExpanded) {
      console.log(`📌 Auto-expanding ${nodeKey} because it has selected children (not manually collapsed)`);
      setExpanded(true);
    }
    // Don't auto-collapse - let user maintain their expansion state
  }, [shouldStayExpanded, isExpandable, nodeKey, manuallyExpanded]);
  
  // Debug logging for state changes
  useEffect(() => {
    if (level <= 1) { // Only log for top-level nodes to avoid spam
      console.log(`🌳 TreeNode ${nodeKey} state:`, {
        level,
        localMaxItems,
        localMaxProps,
        localMaxDepth,
        expanded,
        valueType: getValueType(value),
        isExpandable: getValueType(value) === 'object' || getValueType(value) === 'array'
      });
    }
  }, [localMaxItems, localMaxProps, localMaxDepth, expanded, level, nodeKey, value]);
  
  // Simplified circular reference detection - only check if we're getting too deep
  const shouldSkipCircular = useMemo(() => {
    if (level > localMaxDepth || typeof value !== 'object' || value === null) return level > localMaxDepth;
    
    // Quick check for obvious circular references
    if (value === globalThis || value === window || value === document) return true;
    
    return false;
  }, [value, level, localMaxDepth]);

  // Early return for circular references or too deep nesting
  if (shouldSkipCircular) {
    console.log(`🛑 Early skip for ${nodeKey} - level: ${level}, maxDepth: ${localMaxDepth}, reason: ${level > localMaxDepth ? 'depth' : 'circular'}`);
    return (
      <Box sx={{ p: 1, color: 'warning.main' }}>
        <Typography variant="caption">
          {level > localMaxDepth ? `Depth limit reached (${level}/${localMaxDepth})` : 'Circular reference detected'} - use Load Deeper button
        </Typography>
      </Box>
    );
  }

  
  // Debug logging for null/undefined values
  if ((type === 'null' || type === 'undefined') && level <= 3) {
    console.log(`🔍 Null/Undefined value detected:`, {
      nodeKey,
      type,
      value,
      level,
      path: path.join('.'),
      isArrayItem: nodeKey.startsWith('[') && nodeKey.endsWith(']')
    });
  }
  
  // Debug logging for arrays containing null values
  if (type === 'array' && level <= 2) {
    const nullCount = value?.filter((item: any) => item === null || item === undefined).length || 0;
    if (nullCount > 0) {
      console.log(`🔍 Array with null values:`, {
        nodeKey,
        totalItems: value?.length || 0,
        nullCount,
        preview: getValuePreview(value, type),
        path: path.join('.'),
        isExpandable,
        shouldForceExpansion,
        expanded
      });
      
      // Special warning if this might be the user's issue
      if (nullCount === value?.length) {
        console.warn(`⚠️ Array contains ONLY null values - should be expandable to show individual items`);
      }
    }
  }
  
  // Simplified computations to prevent re-render loops  
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
      // More flexible collapse prevention - only prevent if directly selected or critical path
      if (expanded && shouldStayExpanded && (isNodeSelected || hasSelectedChildren)) {
        console.log(`🔒 Preventing collapse of ${nodeKey} because it has selected items (selected: ${isNodeSelected}, hasChildren: ${hasSelectedChildren})`);
        return;
      }
      const newExpanded = !expanded;
      setExpanded(newExpanded);
      setManuallyExpanded(newExpanded); // Track manual expansion
      console.log(`👆 User ${newExpanded ? 'expanded' : 'collapsed'} ${nodeKey} manually`);
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
          border: isSelected 
            ? `1px solid ${nodeColor}` 
            : shouldStayExpanded 
              ? '1px solid rgba(95, 94, 255, 0.2)' 
              : '1px solid transparent',
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
        {(isExpandable || shouldForceExpansion) && (
          <IconButton
            size="small"
            onClick={handleExpand}
            sx={{ 
              p: 0.25, 
              mr: 0.5,
              color: shouldStayExpanded ? theme.palette.primary.main : nodeColor,
              backgroundColor: shouldStayExpanded 
                ? 'rgba(95, 94, 255, 0.1)' // Primary color with transparency for selected nodes
                : (type === 'array' && value?.some?.((item: any) => item === null || item === undefined)) 
                  ? 'rgba(255, 0, 0, 0.1)' 
                  : 'transparent',
              border: shouldStayExpanded ? '1px solid rgba(95, 94, 255, 0.3)' : 'none',
              borderRadius: 1,
            }}
            title={shouldStayExpanded ? 'This node stays open because it contains selected items' : undefined}
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
            color: typeColor,
            fontFamily: 'monospace',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontStyle: (type === 'null' || type === 'undefined') ? 'italic' : 'normal',
            fontWeight: (type === 'null' || type === 'undefined') ? 'bold' : 'normal',
            backgroundColor: (type === 'null' || type === 'undefined') ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
            px: (type === 'null' || type === 'undefined') ? 0.5 : 0,
            borderRadius: (type === 'null' || type === 'undefined') ? 1 : 0,
            border: (type === 'null' || type === 'undefined') ? '1px solid rgba(255, 0, 0, 0.3)' : 'none',
          }}
        >
          {(type === 'null' || type === 'undefined') && nodeKey.startsWith('[') && nodeKey.endsWith(']') 
            ? `← ${getValuePreview(value, type)} (empty array item)` 
            : getValuePreview(value, type)}
        </Typography>
      </Box>

      {/* Children - Simplified rendering to prevent blank screen */}
      {isExpandable && expanded && (
        <Collapse in={expanded}>
          <Box>
            {(() => {
              try {
                // Prevent rendering too deep to avoid memory issues
                if (level >= localMaxDepth) {
                  console.log(`🛑 Max depth reached for ${nodeKey} at level ${level}, maxDepth: ${localMaxDepth}`);
                  return (
                    <Box sx={{ p: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Max depth reached ({localMaxDepth} levels) - Level {level}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent interfering with expand/collapse
                            e.preventDefault();
                            const newDepth = localMaxDepth + 3;
                            console.log(`🔄 Increasing depth limit for this branch from ${localMaxDepth} to ${newDepth}`);
                            setLocalMaxDepth(newDepth);
                            setManuallyExpanded(true); // Mark as manually expanded to preserve state
                          }}
                          sx={{ 
                            fontSize: '0.7rem', 
                            py: 0.5,
                            px: 1,
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                            }
                          }}
                        >
                          🔽 Load Deeper (+3 levels)
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent interfering with expand/collapse
                            e.preventDefault();
                            console.log(`🔄 Collapsing node at level ${level} to allow deeper expansion`);
                            setExpanded(false);
                            setManuallyExpanded(false); // Reset manual expansion state
                          }}
                          sx={{ fontSize: '0.7rem', py: 0.5, px: 1 }}
                        >
                          📁 Collapse
                        </Button>
                      </Box>
                    </Box>
                  );
                }

                if (type === 'array' && Array.isArray(value)) {
                  // Use local max items that can be increased
                  const safeArray = value.slice(0, localMaxItems);
                  
                  return (
                    <Box>
                      {safeArray.map((item: any, index: number) => {
                        const itemKey = `${fullPath}_${index}`;
                        const itemPath = [...path, index.toString()];
                        
                        return (
                          <TreeNode
                            key={`${itemKey}_depth_${localMaxDepth}`} // Force re-render when depth changes
                            nodeKey={`[${index}]`}
                            value={item}
                            path={itemPath}
                            selectedPaths={selectedPaths}
                            onPathToggle={onPathToggle}
                            nodeColors={nodeColors}
                            searchTerm={searchTerm}
                            level={level + 1}
                            maxDepth={localMaxDepth}
                            maxItems={maxItems}
                            maxProps={maxProps}
                          />
                        );
                      })}
                      {value.length > localMaxItems && (
                        <Box sx={{ p: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            ... and {value.length - localMaxItems} more items
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent tree collapse
                              e.preventDefault();
                              console.log('🔄 Loading more array items:', { current: localMaxItems, total: value.length });
                              setLocalMaxItems(prev => {
                                const newMax = Math.min(prev + 10, value.length);
                                console.log('📈 Array maxItems updated:', prev, '→', newMax);
                                return newMax;
                              });
                              setManuallyExpanded(true); // Mark as manually expanded to preserve state
                            }}
                            sx={{ 
                              fontSize: '0.7rem', 
                              py: 0.5, 
                              px: 1,
                              backgroundColor: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                              }
                            }}
                          >
                            🔽 Load More ({Math.min(10, value.length - localMaxItems)} items)
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                } 
                
                if (type === 'object' && value && typeof value === 'object') {
                  // Use local max props that can be increased
                  const entries = Object.entries(value);
                  const safeEntries = entries.slice(0, localMaxProps);
                  
                  return (
                    <Box>
                      {safeEntries.map(([key, val]) => {
                        const propKey = `${fullPath}_${key}`;
                        const propPath = [...path, key];
                        
                        return (
                          <TreeNode
                            key={`${propKey}_depth_${localMaxDepth}`} // Force re-render when depth changes
                            nodeKey={key}
                            value={val}
                            path={propPath}
                            selectedPaths={selectedPaths}
                            onPathToggle={onPathToggle}
                            nodeColors={nodeColors}
                            searchTerm={searchTerm}
                            level={level + 1}
                            maxDepth={localMaxDepth}
                            maxItems={maxItems}
                            maxProps={maxProps}
                          />
                        );
                      })}
                      {entries.length > localMaxProps && (
                        <Box sx={{ p: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            ... and {entries.length - localMaxProps} more properties
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent tree collapse
                              e.preventDefault();
                              console.log('🔄 Loading more object properties:', { current: localMaxProps, total: entries.length });
                              setLocalMaxProps(prev => {
                                const newMax = Math.min(prev + 10, entries.length);
                                console.log('📈 Object maxProps updated:', prev, '→', newMax);
                                return newMax;
                              });
                              setManuallyExpanded(true); // Mark as manually expanded to preserve state
                            }}
                            sx={{ 
                              fontSize: '0.7rem', 
                              py: 0.5, 
                              px: 1,
                              backgroundColor: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                              }
                            }}
                          >
                            🔽 Load More ({Math.min(10, entries.length - localMaxProps)} props)
                          </Button>
                        </Box>
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
  maxDepth = 5,
  maxItems = 8,
  maxProps = 10,
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
                maxDepth={maxDepth}
                maxItems={maxItems}
                maxProps={maxProps}
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
              maxDepth={maxDepth}
              maxItems={maxItems}
              maxProps={maxProps}
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
