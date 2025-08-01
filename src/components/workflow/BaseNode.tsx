
import { Handle, Position } from '@xyflow/react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Avatar
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { WorkflowNodeData } from '../../types/workflow';

interface BaseNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
  onSettingsClick?: () => void;
  showHandles?: boolean;
  color?: string;
  icon?: any;
  children?: any;
  isTrigger?: boolean;
}

// Get node color based on type
const getNodeColor = (nodeType: string): string => {
  // Brand colors
  const BRAND_COLORS = {
    // AI Tools
    ai: '#10B981',           // OpenAI Green
    // Google Services
    analytics: '#FF6D01',    // Google Analytics Orange
    ads: '#34A853',         // Google Ads Green
    maps: '#EA4335',        // Google Maps Red
    gtm: '#4285F4',         // GTM Blue
    google: '#4285F4',      // Google Blue
    // SEO Tools
    seo: '#6366F1',         // Indigo for SEO
    ahrefs: '#FF6B35',      // Ahrefs Orange
    // Social Media
    meta: '#1877F2',        // Meta/Facebook Blue
    twitter: '#1DA1F2',     // Twitter Blue
    linkedin: '#0A66C2',    // LinkedIn Blue
    instagram: '#E4405F',   // Instagram Pink
    // CRM & Marketing
    hubspot: '#FF7A59',     // HubSpot Orange
    mailchimp: '#FFE01B',   // Mailchimp Yellow
    // E-commerce
    shopify: '#96BF48',     // Shopify Green
    woocommerce: '#96588A', // WooCommerce Purple
    // Communication
    slack: '#4A154B',       // Slack Purple
    discord: '#5865F2',     // Discord Blurple
    teams: '#6264A7',       // Teams Purple
    // Project Management
    asana: '#F06A6A',       // Asana Red
    trello: '#0079BF',      // Trello Blue
    notion: '#000000',      // Notion Black
    // WordPress
    wordpress: '#21759B',   // WordPress Blue
    // Core types
    trigger: '#9C27B0',     // Purple for triggers
    action: '#FF5722',      // Deep Orange for actions
    client: '#2196F3',      // Blue for client data
    content: '#F59E0B',     // Amber for content
    default: '#64748B'      // Slate Gray
  };

  // AI Tools
  if (nodeType.startsWith('ai_')) return BRAND_COLORS.ai;
  
  // Google services
  if (nodeType.includes('google_analytics')) return BRAND_COLORS.analytics;
  if (nodeType.includes('google_ads')) return BRAND_COLORS.ads;
  if (nodeType.includes('google_maps')) return BRAND_COLORS.maps;
  if (nodeType.includes('gtm_')) return BRAND_COLORS.gtm;
  
  // SEO tools
  if (nodeType.startsWith('seo_')) return BRAND_COLORS.seo;
  if (nodeType.startsWith('ahrefs_')) return BRAND_COLORS.ahrefs;
  
  // Meta/Facebook
  if (nodeType.startsWith('meta_')) return BRAND_COLORS.meta;
  
  // Social media
  if (nodeType.startsWith('twitter_')) return BRAND_COLORS.twitter;
  if (nodeType.startsWith('linkedin_')) return BRAND_COLORS.linkedin;
  if (nodeType.startsWith('instagram_')) return BRAND_COLORS.instagram;
  
  // CRM & Marketing
  if (nodeType.startsWith('hubspot_')) return BRAND_COLORS.hubspot;
  if (nodeType.startsWith('mailchimp_')) return BRAND_COLORS.mailchimp;
  
  // E-commerce
  if (nodeType.startsWith('shopify_')) return BRAND_COLORS.shopify;
  if (nodeType.startsWith('woocommerce_')) return BRAND_COLORS.woocommerce;
  
  // Communication
  if (nodeType.startsWith('slack_')) return BRAND_COLORS.slack;
  if (nodeType.startsWith('discord_')) return BRAND_COLORS.discord;
  if (nodeType.startsWith('teams_')) return BRAND_COLORS.teams;
  
  // Project Management
  if (nodeType.startsWith('asana_')) return BRAND_COLORS.asana;
  if (nodeType.startsWith('trello_')) return BRAND_COLORS.trello;
  if (nodeType.startsWith('notion_')) return BRAND_COLORS.notion;
  
  // WordPress
  if (nodeType.startsWith('wordpress_')) return BRAND_COLORS.wordpress;
  
  // Core types
  if (nodeType === 'trigger') return BRAND_COLORS.trigger;
  if (nodeType === 'client_profile') return BRAND_COLORS.client;
  if (nodeType === 'email' || nodeType === 'action') return BRAND_COLORS.action;
  if (nodeType === 'content_extract') return BRAND_COLORS.content;
  
  return BRAND_COLORS.default;
};

export default function BaseNode({
  data,
  selected,
  onSettingsClick,
  showHandles = true,
  color,
  icon,
  children,
  isTrigger = false
}: BaseNodeProps) {
  // Use brand color if no custom color provided
  const nodeColor = color || getNodeColor(data.type || '');
  
  const hasErrors = data.errors && data.errors.length > 0;
  const isValid = data.isValid !== false;

  const handleSettingsClick = (event: any) => {
    event.stopPropagation();
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  return (
    <Card
      sx={{
        minWidth: 220,
        maxWidth: 320,
        border: '1px solid #e0e0e0',
        borderLeft: `4px solid ${nodeColor}`,
        borderRadius: '8px',
        boxShadow: selected ? `0 4px 16px ${nodeColor}25` : '0 2px 8px rgba(0,0,0,0.08)',
        backgroundColor: selected ? `${nodeColor}12` : `${nodeColor}06`, // Subtle tint, more visible when selected
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'visible', // Allow handles to be visible outside card
        '&:hover': {
          backgroundColor: `${nodeColor}15`, // Slightly more visible on hover
          boxShadow: `0 6px 20px ${nodeColor}25`,
          transform: 'translateY(-2px)',
          borderColor: '#d0d0d0',
          borderLeftColor: nodeColor,
        },
      }}
    >
      {showHandles && (
        <>
          {/* Target handle - for receiving connections */}
          {!isTrigger && (
            <Handle
              type="target"
              position={Position.Top}
              id="target-top"
              isConnectable={true}
              style={{
                backgroundColor: nodeColor,
                border: '2px solid white',
                width: 16,
                height: 16,
                borderRadius: '50%',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          )}
          
          {/* Source handle - for creating connections */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="source-bottom"
            isConnectable={true}
            style={{
              backgroundColor: nodeColor,
              border: '2px solid white',
              width: 16,
              height: 16,
              borderRadius: '50%',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </>
      )}
      
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {icon && (
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: color,
                color: 'white',
                fontSize: '1rem'
              }}
            >
              {icon}
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: '#2e3142',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {data.label}
            </Typography>
            {data.description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#5a6577',
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {data.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {hasErrors && (
              <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
            )}
            {isValid && !hasErrors && (
              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
            )}
            <IconButton
              size="small"
              onClick={handleSettingsClick}
              sx={{ 
                color: '#5a6577',
                '&:hover': { color: color }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {children}

        {hasErrors && (
          <Box sx={{ mt: 1 }}>
            {data.errors?.map((error, index) => (
              <Chip
                key={index}
                label={error}
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20, mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}

        <Chip
          label={data.type.replace('_', ' ').toUpperCase()}
          size="small"
          sx={{
            mt: 1,
            fontSize: '0.7rem',
            height: 20,
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}40`,
          }}
        />
      </CardContent>
    </Card>
  );
} 