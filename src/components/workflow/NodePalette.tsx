import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Avatar,
  Tooltip,
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
    type: WorkflowNodeType.AI_OPENAI_TASK,
    label: 'AI Analysis',
    description: 'Analyze content with AI',
    icon: 'AIIcon',
    category: NodeCategory.AI_TOOLS,
    color: '#9c27b0',
  },
  {
    type: WorkflowNodeType.CONTENT_EXTRACT,
    label: 'Content Extraction',
    description: 'Extract content from web pages',
    icon: 'AIIcon',
    category: NodeCategory.AI_TOOLS,
    color: '#9c27b0',
  },
  {
    type: WorkflowNodeType.DATA_FILTER,
    label: 'Data Filter',
    description: 'Filter and process data arrays',
    icon: 'FilterAltIcon',
    category: NodeCategory.AI_TOOLS,
    color: '#ff5722',
  },

  // SEO Tools
  {
    type: WorkflowNodeType.SEO_SERP_ANALYZE,
    label: 'SERP Analysis',
    description: 'Analyze search engine results',
    icon: 'SEOIcon',
    category: NodeCategory.SEO_TOOLS,
    color: '#4caf50',
  },
  {
    type: WorkflowNodeType.SEO_KEYWORDS_VOLUME,
    label: 'Keyword Volume',
    description: 'Get keyword search volume',
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

  // Actions
  {
    type: WorkflowNodeType.EMAIL,
    label: 'Email Notification',
    description: 'Send email notifications',
    icon: 'EmailIcon',
    category: NodeCategory.ACTIONS,
    color: '#2196f3',
  },
];

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
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
  onNodeDragStart: (event: any, nodeType: WorkflowNodeType) => void;
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

  const handleDragStart = (event: any, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    onNodeDragStart(event, nodeType);
  };

  return (
    <Box
      sx={{
        width: 320,
        height: '100%',
        bgcolor: '#f8f9fb',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: '#c1c1c1',
          borderRadius: '4px',
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e3142' }}>
          Workflow Elements
        </Typography>
        <Typography variant="body2" sx={{ color: '#5a6577', mt: 0.5 }}>
          Drag elements to the canvas to build your workflow
        </Typography>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        {categoryOrder.map((category) => (
          <Accordion 
            key={category} 
            defaultExpanded
            sx={{
              mb: 1,
              boxShadow: 'none',
              border: '1px solid #e0e0e0',
              borderRadius: '8px !important',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: 'white',
                borderRadius: '8px',
                minHeight: 48,
                '&.Mui-expanded': {
                  minHeight: 48,
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e3142' }}>
                {getCategoryTitle(category)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1, bgcolor: '#f8f9fb' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {groupedNodes[category]?.map((item) => (
                  <Tooltip key={item.type} title={item.description} placement="right">
                    <Card
                      sx={{
                        cursor: 'grab',
                        transition: 'all 0.2s ease',
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          boxShadow: `0 4px 8px ${item.color}20`,
                          transform: 'translateY(-1px)',
                          borderColor: item.color,
                        },
                        '&:active': {
                          cursor: 'grabbing',
                          transform: 'scale(0.98)',
                        },
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.type)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              backgroundColor: item.color,
                              color: 'white',
                              fontSize: '1.1rem',
                            }}
                          >
                            {getIconComponent(item.icon)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600,
                                color: '#2e3142',
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#5a6577',
                                lineHeight: 1.2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mt: 0.5,
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Tooltip>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
} 