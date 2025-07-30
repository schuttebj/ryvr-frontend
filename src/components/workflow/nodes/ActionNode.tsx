
import { Box, Typography } from '@mui/material';
import { 
  Settings as SettingsIcon,
  Email as EmailIcon,
  Http as HttpIcon,
  SmartToy as AIIcon,
  Search as SEOIcon,
  FilterAlt as FilterAltIcon
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
    case WorkflowNodeType.AI_OPENAI_TASK:
    case WorkflowNodeType.CONTENT_EXTRACT:
      return <AIIcon />;
    case WorkflowNodeType.DATA_FILTER:
      return <FilterAltIcon />;
    case WorkflowNodeType.SEO_SERP_ANALYZE:
    case WorkflowNodeType.SEO_KEYWORDS_VOLUME:
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
    case WorkflowNodeType.AI_OPENAI_TASK:
    case WorkflowNodeType.CONTENT_EXTRACT:
      return '#9c27b0';
    case WorkflowNodeType.DATA_FILTER:
      return '#ff5722';
    case WorkflowNodeType.SEO_SERP_ANALYZE:
    case WorkflowNodeType.SEO_KEYWORDS_VOLUME:
      return '#4caf50';
    default:
      return '#5f5fff';
  }
};

const getActionStatus = (type: WorkflowNodeType) => {
  switch (type) {
    case WorkflowNodeType.EMAIL:
      return '📧 Ready to send email';
    case WorkflowNodeType.WEBHOOK:
      return '🔗 Ready for API call';
    case WorkflowNodeType.AI_OPENAI_TASK:
      return '🤖 AI analysis configured';
    case WorkflowNodeType.CONTENT_EXTRACT:
      return '✨ Content extraction ready';
    case WorkflowNodeType.DATA_FILTER:
      return '🔧 Data filter configured';
    case WorkflowNodeType.SEO_SERP_ANALYZE:
      return '🔍 SERP analysis prepared';
    case WorkflowNodeType.SEO_KEYWORDS_VOLUME:
      return '🎯 Keyword research ready';
    default:
      return '⚙️ Action configured';
  }
};

export default function ActionNode({ data, selected, onSettingsClick }: ActionNodeProps) {
  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Fallback alert for testing
      alert(`Settings clicked for: ${data.label}\nID: ${data.id}\nType: ${data.type}\n\nConfiguration options would appear here.`);
    }
  };

  return (
    <BaseNode
      data={data}
      selected={selected}
      color={getActionColor(data.type)}
      icon={getActionIcon(data.type)}
      onSettingsClick={handleSettingsClick}
    >
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ color: '#5a6577' }}>
          {getActionStatus(data.type)}
        </Typography>
      </Box>
    </BaseNode>
  );
} 