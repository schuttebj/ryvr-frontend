import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Http as HttpIcon,
  SmartToy as AIIcon,
  Search as SEOIcon,
  CallSplit as BranchIcon,
  Schedule as ScheduleIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { WorkflowNodeType, NodeCategory, NodePaletteItem } from '../../types/workflow';

const nodePaletteItems: NodePaletteItem[] = [
  // Triggers
  {
    type: WorkflowNodeType.TRIGGER,
    label: 'Manual Trigger',
    description: 'Start workflow manually',
    icon: 'PlayIcon',
    category: NodeCategory.TRIGGERS,
    color: '#4caf50',
  },
  {
    type: WorkflowNodeType.WEBHOOK,
    label: 'Webhook Trigger',
    description: 'Start workflow via webhook',
    icon: 'HttpIcon',
    category: NodeCategory.TRIGGERS,
    color: '#ff9800',
  },
  {
    type: WorkflowNodeType.DELAY,
    label: 'Schedule Trigger',
    description: 'Start workflow on schedule',
    icon: 'ScheduleIcon',
    category: NodeCategory.TRIGGERS,
    color: '#2196f3',
  },

  // Actions
  {
    type: WorkflowNodeType.EMAIL,
    label: 'Send Email',
    description: 'Send email to contacts',
    icon: 'EmailIcon',
    category: NodeCategory.ACTIONS,
    color: '#2196f3',
  },
  {
    type: WorkflowNodeType.WEBHOOK,
    label: 'Webhook Call',
    description: 'Make HTTP API call',
    icon: 'HttpIcon',
    category: NodeCategory.ACTIONS,
    color: '#ff9800',
  },
  {
    type: WorkflowNodeType.DELAY,
    label: 'Wait/Delay',
    description: 'Wait for specified time',
    icon: 'ScheduleIcon',
    category: NodeCategory.ACTIONS,
    color: '#9e9e9e',
  },

  // AI Tools
  {
    type: WorkflowNodeType.AI_ANALYSIS,
    label: 'AI Analysis',
    description: 'Analyze content with AI',
    icon: 'AIIcon',
    category: NodeCategory.AI_TOOLS,
    color: '#9c27b0',
  },
  {
    type: WorkflowNodeType.CONTENT_GENERATION,
    label: 'Content Generation',
    description: 'Generate content using AI',
    icon: 'AIIcon',
    category: NodeCategory.AI_TOOLS,
    color: '#9c27b0',
  },

  // SEO Tools
  {
    type: WorkflowNodeType.SEO_AUDIT,
    label: 'SEO Audit',
    description: 'Analyze website SEO',
    icon: 'SEOIcon',
    category: NodeCategory.SEO_TOOLS,
    color: '#4caf50',
  },
  {
    type: WorkflowNodeType.KEYWORD_RESEARCH,
    label: 'Keyword Research',
    description: 'Research keywords',
    icon: 'SEOIcon',
    category: NodeCategory.SEO_TOOLS,
    color: '#4caf50',
  },

  // Conditions
  {
    type: WorkflowNodeType.CONDITION,
    label: 'Condition',
    description: 'Branch workflow based on condition',
    icon: 'BranchIcon',
    category: NodeCategory.CONDITIONS,
    color: '#ff5722',
  },

  // Marketing
  {
    type: WorkflowNodeType.SOCIAL_MEDIA_POST,
    label: 'Social Media Post',
    description: 'Post to social media',
    icon: 'ShareIcon',
    category: NodeCategory.MARKETING,
    color: '#e91e63',
  },
];

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    PlayIcon: <PlayIcon />,
    SettingsIcon: <SettingsIcon />,
    EmailIcon: <EmailIcon />,
    HttpIcon: <HttpIcon />,
    AIIcon: <AIIcon />,
    SEOIcon: <SEOIcon />,
    BranchIcon: <BranchIcon />,
    ScheduleIcon: <ScheduleIcon />,
    ShareIcon: <ShareIcon />,
  };
  return iconMap[iconName] || <SettingsIcon />;
};

const groupedNodes = nodePaletteItems.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  acc[item.category].push(item);
  return acc;
}, {} as Record<NodeCategory, NodePaletteItem[]>);

interface NodePaletteProps {
  onNodeDragStart: (event: React.DragEvent, nodeType: WorkflowNodeType) => void;
}

export default function NodePalette({ onNodeDragStart }: NodePaletteProps) {
  const categoryOrder = [
    NodeCategory.TRIGGERS,
    NodeCategory.ACTIONS,
    NodeCategory.CONDITIONS,
    NodeCategory.AI_TOOLS,
    NodeCategory.SEO_TOOLS,
    NodeCategory.MARKETING,
  ];

  const getCategoryTitle = (category: NodeCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: '#f8f9fb',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2e3142' }}>
        Workflow Elements
      </Typography>

      {categoryOrder.map((category) => (
        <Accordion key={category} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {getCategoryTitle(category)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {groupedNodes[category]?.map((item) => (
                <Card
                  key={item.type}
                  sx={{
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 2,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      cursor: 'grabbing',
                    },
                  }}
                  draggable
                  onDragStart={(e) => onNodeDragStart(e, item.type)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: item.color,
                          color: 'white',
                          fontSize: '1rem',
                        }}
                      >
                        {getIconComponent(item.icon)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#5a6577',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
} 