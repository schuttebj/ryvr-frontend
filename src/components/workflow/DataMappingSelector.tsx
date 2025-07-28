import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

interface DataMappingSelectorProps {
  value: string;
  onChange: (value: string) => void;
  availableData?: Record<string, any>;
  placeholder?: string;
  helperText?: string;
  label?: string;
}

export default function DataMappingSelector({
  value,
  onChange,
  availableData = {},
  placeholder = "Click on data below or enter path manually",
  helperText = "JSON path to extract data from previous nodes",
  label = "Data Mapping"
}: DataMappingSelectorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Generate sample data for demonstration if none provided
  const sampleData = {
    serp_results: {
      results: [{
        keyword: "marketing",
        location_code: 2840,
        language_code: "en",
        total_count: 10,
        items: [
          {
            type: "organic",
            rank_group: 1,
            rank_absolute: 1,
            domain: "example1.com",
            title: "Sample Result 1 for marketing",
            description: "This is a sample SERP result description for testing purposes. Result #1",
            url: "https://example1.com/page"
          },
          {
            type: "organic",
            rank_group: 2,
            rank_absolute: 2,
            domain: "example2.com",
            title: "Sample Result 2 for marketing",
            description: "This is a sample SERP result description for testing purposes. Result #2",
            url: "https://example2.com/page"
          }
        ]
      }]
    },
    extracted_content: [
      {
        url: "https://example1.com/page",
        content: "Sample extracted content from page 1...",
        length: 1500
      },
      {
        url: "https://example2.com/page", 
        content: "Sample extracted content from page 2...",
        length: 2100
      }
    ]
  };

  const displayData = Object.keys(availableData).length > 0 ? availableData : sampleData;

  // Generate JSON path when clicking on data
  const handleDataClick = (path: string) => {
    onChange(path);
  };

  // Preview data at current path
  useEffect(() => {
    if (value && showPreview) {
      try {
        const result = evaluateJsonPath(value, displayData);
        setPreviewData(result);
      } catch (error) {
        setPreviewData({ error: 'Invalid path' });
      }
    }
  }, [value, showPreview, displayData]);

  // Evaluate JSON path
  const evaluateJsonPath = (path: string, data: any): any => {
    if (!path) return null;
    
    const pathParts = path.split('.');
    let current = data;
    
    for (const part of pathParts) {
      if (part.includes('[*]')) {
        const arrayKey = part.replace('[*]', '');
        if (current[arrayKey] && Array.isArray(current[arrayKey])) {
          return current[arrayKey].map((item: any, index: number) => ({
            [`item_${index}`]: item
          }));
        }
      } else if (part.includes('[') && part.includes(']')) {
        const match = part.match(/(\w+)\[(\d+)\]/);
        if (match) {
          const [, arrayKey, index] = match;
          current = current[arrayKey]?.[parseInt(index)];
        }
      } else {
        current = current[part];
      }
    }
    
    return current;
  };

  // Render data tree for selection
  const renderDataTree = (data: any, basePath: string = '', level: number = 0): React.ReactNode => {
    if (level > 3) return null; // Prevent infinite recursion
    
    if (Array.isArray(data)) {
      return (
        <Box sx={{ ml: level * 2 }}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
            Array ({data.length} items)
          </Typography>
          <Box sx={{ ml: 1 }}>
            <Chip
              size="small"
              label={`${basePath}[*]`}
              onClick={() => handleDataClick(`${basePath}[*]`)}
              sx={{ mr: 1, mb: 1 }}
              color="secondary"
            />
            <Chip
              size="small"
              label={`${basePath}[0]`}
              onClick={() => handleDataClick(`${basePath}[0]`)}
              sx={{ mr: 1, mb: 1 }}
              color="secondary"
            />
          </Box>
          {data.length > 0 && typeof data[0] === 'object' && (
            <Box sx={{ ml: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Sample item structure:
              </Typography>
              {renderDataTree(data[0], `${basePath}[0]`, level + 1)}
            </Box>
          )}
        </Box>
      );
    }
    
    if (typeof data === 'object' && data !== null) {
      return (
        <Box sx={{ ml: level * 2 }}>
          {Object.entries(data).map(([key, value]) => {
            const newPath = basePath ? `${basePath}.${key}` : key;
            const isClickable = typeof value !== 'object' || Array.isArray(value);
            
            return (
              <Box key={key} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isClickable ? 'bold' : 'normal',
                      color: isClickable ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {key}:
                  </Typography>
                  {isClickable && (
                    <Chip
                      size="small"
                      label={newPath}
                      onClick={() => handleDataClick(newPath)}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    ({Array.isArray(value) ? 'array' : typeof value})
                  </Typography>
                </Box>
                {typeof value === 'object' && !Array.isArray(value) && (
                  <Box sx={{ ml: 2 }}>
                    {renderDataTree(value, newPath, level + 1)}
                  </Box>
                )}
                {Array.isArray(value) && (
                  <Box sx={{ ml: 2 }}>
                    {renderDataTree(value, newPath, level + 1)}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      );
    }
    
    return (
      <Typography variant="body2" color="text.secondary">
        {String(data)}
      </Typography>
    );
  };

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        helperText={helperText}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Preview data at this path">
                <IconButton
                  size="small"
                  onClick={() => setShowPreview(!showPreview)}
                  color={showPreview ? 'primary' : 'default'}
                >
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy path">
                <IconButton
                  size="small"
                  onClick={() => navigator.clipboard.writeText(value)}
                  disabled={!value}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )
        }}
      />

      {/* Data Preview */}
      {showPreview && value && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Preview: {value}
          </Typography>
          <Paper sx={{ p: 1, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '0.75rem' }}>
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </Paper>
        </Alert>
      )}

      {/* Available Data Selector */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon />
            <Typography variant="subtitle2">
              Available Data (Click to Select Path)
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Click on any data path below to automatically insert it into the mapping field. 
              Use <code>[*]</code> for arrays to process all items, or <code>[0]</code> for specific items.
            </Typography>
          </Alert>
          
          <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'grey.50' }}>
            {Object.keys(displayData).length > 0 ? (
              renderDataTree(displayData)
            ) : (
              <Typography variant="body2" color="text.secondary">
                No data available from previous nodes. Run the workflow to see available data.
              </Typography>
            )}
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Quick Examples */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Common Patterns:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            size="small" 
            label="results[0].items[*].url"
            onClick={() => handleDataClick('results[0].items[*].url')}
            variant="outlined"
          />
          <Chip 
            size="small" 
            label="results[0].items[*].title"
            onClick={() => handleDataClick('results[0].items[*].title')}
            variant="outlined"
          />
          <Chip 
            size="small" 
            label="extracted_content[*].content"
            onClick={() => handleDataClick('extracted_content[*].content')}
            variant="outlined"
          />
        </Box>
      </Box>
    </Box>
  );
} 