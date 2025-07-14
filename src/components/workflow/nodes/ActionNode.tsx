
import { Box, Typography } from '@mui/material';
import { 
  Settings as SettingsIcon,
  Email as EmailIcon,
  Http as HttpIcon,
  SmartToy as AIIcon,
  Search as SEOIcon
} from '@mui/icons-material';
import BaseNode from '../BaseNode';
import { WorkflowNodeData, WorkflowNodeType } from '../../../types/workflow';

interface ActionNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
  onSettingsClick?: () => void;
}

const getActionIcon = (type: WorkflowNodeType) => {
  switch (type) {
    case WorkflowNodeType.EMAIL:
      return <EmailIcon />;
    case WorkflowNodeType.WEBHOOK:
      return <HttpIcon />;
    case WorkflowNodeType.AI_ANALYSIS:
    case WorkflowNodeType.CONTENT_GENERATION:
      return <AIIcon />;
    case WorkflowNodeType.SEO_AUDIT:
    case WorkflowNodeType.KEYWORD_RESEARCH:
      return <SEOIcon />;
    default:
      return <SettingsIcon />;
  }
};

const getActionColor = (type: WorkflowNodeType) => {
  switch (type) {
    case WorkflowNodeType.EMAIL:
      return '#2196f3';
    case WorkflowNodeType.WEBHOOK:
      return '#ff9800';
    case WorkflowNodeType.AI_ANALYSIS:
    case WorkflowNodeType.CONTENT_GENERATION:
      return '#9c27b0';
    case WorkflowNodeType.SEO_AUDIT:
    case WorkflowNodeType.KEYWORD_RESEARCH:
      return '#4caf50';
    default:
      return '#5f5fff';
  }
};

export default function ActionNode({ data, selected, onSettingsClick }: ActionNodeProps) {
  return (
    <BaseNode
      data={data}
      selected={selected}
      color={getActionColor(data.type)}
      icon={getActionIcon(data.type)}
      onSettingsClick={onSettingsClick}
    >
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ color: '#5a6577' }}>
          {data.config?.summary || 'Configure action settings'}
        </Typography>
      </Box>
    </BaseNode>
  );
} 