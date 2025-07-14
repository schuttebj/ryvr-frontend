
import { Box, Typography } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import BaseNode from '../BaseNode';
import { WorkflowNodeData } from '../../../types/workflow';

interface TriggerNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export default function TriggerNode({ data, selected }: TriggerNodeProps) {
  return (
    <BaseNode
      data={data}
      selected={selected}
      color="#4caf50"
      icon={<PlayIcon />}
      showHandles={true}
      isTrigger={true}
    >
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ color: '#5a6577' }}>
          Starts workflow execution
        </Typography>
      </Box>
    </BaseNode>
  );
} 