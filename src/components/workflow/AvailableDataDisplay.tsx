import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Schedule as TimeIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { AvailableDataNode, DataStructureItem } from '../../types/workflow';

interface AvailableDataDisplayProps {
  availableNodes: AvailableDataNode[];
}

const AvailableDataDisplay: React.FC<AvailableDataDisplayProps> = ({ availableNodes }) => {
  const renderDataStructure = (items: DataStructureItem[], nodeId: string, level: number = 0): React.ReactNode => {
    if (level > 3) return null; // Prevent infinite recursion
    
    return items.map((item, index) => (
      <Box key={`${item.path}-${index}`} sx={{ ml: level * 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`${nodeId}.${item.path}`}
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
            onClick={() => {
              // Copy to clipboard
              navigator.clipboard.writeText(`${nodeId}.${item.path}`);
              console.log(`Copied: ${nodeId}.${item.path}`);
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {item.type}
            {item.isArray && ` (array of ${item.arrayItemType || 'unknown'})`}
          </Typography>
          {item.sampleValue !== null && item.sampleValue !== undefined && (
            <Typography variant="caption" color="primary" sx={{ 
              maxWidth: 200, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontStyle: 'italic'
            }}>
              Sample: {typeof item.sampleValue === 'object' ? JSON.stringify(item.sampleValue) : String(item.sampleValue)}
            </Typography>
          )}
        </Box>
        
        {item.children && item.children.length > 0 && (
          <Box sx={{ ml: 1, mt: 0.5 }}>
            {renderDataStructure(item.children, nodeId, level + 1)}
          </Box>
        )}
      </Box>
    ));
  };

  if (availableNodes.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Available Data Sources:
        </Typography>
        <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
          <Typography variant="body2">
            No data available yet. Execute nodes in your workflow to see available data sources here.
            Once nodes are executed, you'll see their data structure and can click on any path to copy it for mapping.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Available Data Sources:
      </Typography>
      
      {availableNodes.map((node) => (
        <Accordion key={node.nodeId} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <SuccessIcon color="success" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {node.nodeLabel} ({node.nodeId})
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {node.nodeType}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimeIcon fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Executed: {new Date(node.executedAt).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                Click any path below to copy it for mapping:
              </Typography>
            </Box>
            
            <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto', bgcolor: 'grey.50' }}>
              {node.dataStructure.length > 0 ? (
                renderDataStructure(node.dataStructure, node.nodeId)
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data structure available for this node.
                </Typography>
              )}
            </Paper>
            
            <Divider sx={{ my: 1 }} />
            
            {/* Quick access patterns */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Quick Access:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  size="small"
                  label={`${node.nodeId}`}
                  variant="outlined"
                  color="secondary"
                  sx={{ fontSize: '0.7rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText(node.nodeId);
                    console.log(`Copied: ${node.nodeId}`);
                  }}
                />
                <Chip
                  size="small"
                  label={`${node.nodeId}.data.processed`}
                  variant="outlined"
                  color="secondary"
                  sx={{ fontSize: '0.7rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText(`${node.nodeId}.data.processed`);
                    console.log(`Copied: ${node.nodeId}.data.processed`);
                  }}
                />
                <Chip
                  size="small"
                  label={`${node.nodeId}.data.raw`}
                  variant="outlined"
                  color="secondary"
                  sx={{ fontSize: '0.7rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText(`${node.nodeId}.data.raw`);
                    console.log(`Copied: ${node.nodeId}.data.raw`);
                  }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
        💡 Tip: Use format like <code>node_id.path.to.data</code> or <code>node_id.data[*].property</code> for arrays
      </Typography>
    </Box>
  );
};

export default AvailableDataDisplay; 