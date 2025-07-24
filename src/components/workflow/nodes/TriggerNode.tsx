
import { Box, Typography } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import BaseNode from '../BaseNode';
import { WorkflowNodeData } from '../../../types/workflow';

interface TriggerNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
  onSettingsClick?: () => void;
}

export default function TriggerNode({ data, selected, onSettingsClick }: TriggerNodeProps) {
  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Fallback alert for testing
      alert(`Settings clicked for: ${data.label}\nID: ${data.id}\nType: ${data.type}`);
    }
  };

  return (
    <BaseNode
      data={data}
      selected={selected}
      color="#4caf50"
      icon={<PlayIcon />}
      showHandles={true}
      isTrigger={true}
      onSettingsClick={handleSettingsClick}
    >
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ color: '#5a6577' }}>
          🟢 Ready to start workflow execution
        </Typography>
      </Box>
    </BaseNode>
  );
} 