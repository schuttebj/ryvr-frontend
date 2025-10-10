
import { Handle, Position } from '@xyflow/react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Avatar,
  useTheme
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
    serp: '#8B5CF6',        // Purple for SERP
    dataforseo: '#8B5CF6',  // Purple for DataForSEO
    // Social Media
    meta: '#1877F2',        // Meta/Facebook Blue
    twitter: '#1DA1F2',     // Twitter Blue
    linkedin: '#0A66C2',    // LinkedIn Blue
    instagram: '#E4405F',   // Instagram Pink
    facebook: '#1877F2',    // Facebook Blue
    // CRM & Marketing
    hubspot: '#FF7A59',     // HubSpot Orange
    mailchimp: '#FFE01B',   // Mailchimp Yellow
    brevo: '#0B996E',       // Brevo Green
    sendgrid: '#1A82E2',    // SendGrid Blue
    // E-commerce
    shopify: '#96BF48',     // Shopify Green
    woocommerce: '#96588A', // WooCommerce Purple
    stripe: '#635BFF',      // Stripe Purple
    // Communication
    slack: '#4A154B',       // Slack Purple
    discord: '#5865F2',     // Discord Blurple
    teams: '#6264A7',       // Teams Purple
    telegram: '#0088CC',    // Telegram Blue
    // Project Management
    asana: '#F06A6A',       // Asana Red
    trello: '#0079BF',      // Trello Blue
    notion: '#000000',      // Notion Black
    jira: '#0052CC',        // Jira Blue
    monday: '#FF3D57',      // Monday Red
    // WordPress
    wordpress: '#21759B',   // WordPress Blue
    // Database & Storage
    airtable: '#18BFFF',    // Airtable Blue
    sheets: '#34A853',      // Google Sheets Green
    excel: '#217346',       // Excel Green
    // Analytics & Tracking
    mixpanel: '#7856FF',    // Mixpanel Purple
    amplitude: '#011E5A',   // Amplitude Dark Blue
    segment: '#52BD94',     // Segment Green
    // Payment & Finance
    paypal: '#00457C',      // PayPal Blue
    square: '#000000',      // Square Black
    // Core types
    trigger: '#9C27B0',     // Purple for triggers
    action: '#FF5722',      // Deep Orange for actions
    client: '#2196F3',      // Blue for client data
    client_profile: '#2196F3', // Blue for client profile
    content: '#F59E0B',     // Amber for content
    content_extract: '#F59E0B', // Amber for content extraction
    email: '#FF5722',       // Deep Orange for email
    default: '#5f5eff'      // Primary brand color (was Slate Gray)
  };

  // Normalize nodeType to lowercase for case-insensitive matching
  const normalizedType = nodeType.toLowerCase();

  // AI Tools
  if (normalizedType.startsWith('ai_') || normalizedType.includes('openai')) return BRAND_COLORS.ai;
  
  // Google services
  if (normalizedType.includes('google_analytics') || normalizedType.includes('analytics')) return BRAND_COLORS.analytics;
  if (normalizedType.includes('google_ads') || normalizedType.includes('googleads')) return BRAND_COLORS.ads;
  if (normalizedType.includes('google_maps') || normalizedType.includes('maps')) return BRAND_COLORS.maps;
  if (normalizedType.includes('gtm_') || normalizedType.includes('tagmanager')) return BRAND_COLORS.gtm;
  if (normalizedType.includes('google') && !normalizedType.includes('_')) return BRAND_COLORS.google;
  if (normalizedType.includes('sheets')) return BRAND_COLORS.sheets;
  
  // SEO tools
  if (normalizedType.startsWith('seo_')) return BRAND_COLORS.seo;
  if (normalizedType.includes('ahrefs')) return BRAND_COLORS.ahrefs;
  if (normalizedType.includes('serp') || normalizedType.includes('dataforseo')) return BRAND_COLORS.serp;
  
  // Meta/Facebook
  if (normalizedType.includes('meta_') || normalizedType.includes('facebook')) return BRAND_COLORS.meta;
  
  // Social media
  if (normalizedType.includes('twitter')) return BRAND_COLORS.twitter;
  if (normalizedType.includes('linkedin')) return BRAND_COLORS.linkedin;
  if (normalizedType.includes('instagram')) return BRAND_COLORS.instagram;
  if (normalizedType.includes('telegram')) return BRAND_COLORS.telegram;
  
  // CRM & Marketing
  if (normalizedType.includes('hubspot')) return BRAND_COLORS.hubspot;
  if (normalizedType.includes('mailchimp')) return BRAND_COLORS.mailchimp;
  if (normalizedType.includes('brevo')) return BRAND_COLORS.brevo;
  if (normalizedType.includes('sendgrid')) return BRAND_COLORS.sendgrid;
  
  // E-commerce
  if (normalizedType.includes('shopify')) return BRAND_COLORS.shopify;
  if (normalizedType.includes('woocommerce')) return BRAND_COLORS.woocommerce;
  if (normalizedType.includes('stripe')) return BRAND_COLORS.stripe;
  
  // Communication
  if (normalizedType.includes('slack')) return BRAND_COLORS.slack;
  if (normalizedType.includes('discord')) return BRAND_COLORS.discord;
  if (normalizedType.includes('teams')) return BRAND_COLORS.teams;
  
  // Project Management
  if (normalizedType.includes('asana')) return BRAND_COLORS.asana;
  if (normalizedType.includes('trello')) return BRAND_COLORS.trello;
  if (normalizedType.includes('notion')) return BRAND_COLORS.notion;
  if (normalizedType.includes('jira')) return BRAND_COLORS.jira;
  if (normalizedType.includes('monday')) return BRAND_COLORS.monday;
  
  // WordPress
  if (normalizedType.includes('wordpress')) return BRAND_COLORS.wordpress;
  
  // Database & Storage
  if (normalizedType.includes('airtable')) return BRAND_COLORS.airtable;
  if (normalizedType.includes('excel')) return BRAND_COLORS.excel;
  
  // Analytics & Tracking
  if (normalizedType.includes('mixpanel')) return BRAND_COLORS.mixpanel;
  if (normalizedType.includes('amplitude')) return BRAND_COLORS.amplitude;
  if (normalizedType.includes('segment')) return BRAND_COLORS.segment;
  
  // Payment & Finance
  if (normalizedType.includes('paypal')) return BRAND_COLORS.paypal;
  if (normalizedType.includes('square')) return BRAND_COLORS.square;
  
  // Core types (exact matches)
  if (normalizedType === 'trigger') return BRAND_COLORS.trigger;
  if (normalizedType === 'client_profile') return BRAND_COLORS.client_profile;
  if (normalizedType === 'email' || normalizedType === 'action') return BRAND_COLORS.action;
  if (normalizedType === 'content_extract') return BRAND_COLORS.content_extract;
  
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
  const theme = useTheme();
  // Priority: 1) explicit color prop, 2) color from data, 3) brand color from type
  const nodeColor = color || data.color || getNodeColor(data.type || '');
  
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
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: `4px solid ${nodeColor}`,
        borderRadius: '8px',
        boxShadow: selected 
          ? `0 4px 16px ${nodeColor}25` 
          : theme.palette.mode === 'dark' 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,0,0,0.08)',
        backgroundColor: selected 
          ? `${nodeColor}${theme.palette.mode === 'dark' ? '20' : '12'}` 
          : `${nodeColor}${theme.palette.mode === 'dark' ? '10' : '06'}`, // Theme-aware opacity
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'visible', // Allow handles to be visible outside card
        '&:hover': {
          backgroundColor: `${nodeColor}${theme.palette.mode === 'dark' ? '25' : '15'}`, // Theme-aware hover
          boxShadow: `0 6px 20px ${nodeColor}25`,
          transform: 'translateY(-2px)',
          borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : '#d0d0d0',
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
                border: `2px solid ${theme.palette.background.paper}`,
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
              border: `2px solid ${theme.palette.background.paper}`,
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
                color: theme.palette.text.primary,
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