import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate } from 'react-router-dom';

import { WorkflowNodeData, WorkflowNodeType } from '../../types/workflow';
import { Search as SearchIcon } from '@mui/icons-material';
import NodeSettingsPanel from './NodeSettingsPanel';
import VariableSelector from './VariableSelector';
import ValidationResultsDialog from './ValidationResultsDialog';
import WorkflowExecutionPanel from './WorkflowExecutionPanel';
import BaseNode from './BaseNode';
import { workflowApi } from '../../services/workflowApi';

// Custom node components
const TriggerNode = (props: any) => <BaseNode {...props} nodeType="trigger" />;
const SerpNode = (props: any) => <BaseNode {...props} nodeType="serp" />;
const AiNode = (props: any) => <BaseNode {...props} nodeType="ai" />;
const EmailNode = (props: any) => <BaseNode {...props} nodeType="email" />;

// Brand color system for different node categories
const BRAND_COLORS = {
  // Core system
  trigger: '#9C27B0',      // Purple for triggers
  action: '#FF5722',       // Deep Orange for actions
  client: '#2196F3',       // Blue for client data
  
  // AI & Content
  ai: '#10B981',           // OpenAI Green
  content: '#F59E0B',      // Amber for content
  
  // Google Services
  google: '#4285F4',       // Google Blue
  analytics: '#FF6D01',    // Google Analytics Orange
  ads: '#34A853',         // Google Ads Green
  maps: '#EA4335',        // Google Maps Red
  gtm: '#4285F4',         // GTM Blue
  
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
  
  // Default fallback
  default: '#64748B'      // Slate Gray
};

// Function to get node color based on type
const getNodeColor = (nodeType: WorkflowNodeType): string => {
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
  if (nodeType === WorkflowNodeType.TRIGGER) return BRAND_COLORS.trigger;
  if (nodeType === WorkflowNodeType.CLIENT_PROFILE) return BRAND_COLORS.client;
  if (nodeType === WorkflowNodeType.EMAIL || nodeType === WorkflowNodeType.ACTION) return BRAND_COLORS.action;
  if (nodeType === WorkflowNodeType.CONTENT_EXTRACT) return BRAND_COLORS.content;
  
  return BRAND_COLORS.default;
};

const nodeTypes = {
  trigger: TriggerNode,
  serp: SerpNode,
  ai: AiNode,
  email: EmailNode,
};

interface WorkflowBuilderProps {
  onSave?: (workflow: any) => Promise<void>;
  workflowId?: string; // Optional workflow ID for editing existing workflows
}

interface NodePaletteItem {
  type: WorkflowNodeType;
  label: string;
  description: string;
  category: string;
  color?: string;
}

const nodePaletteItems: NodePaletteItem[] = [
  // Triggers
  {
    type: WorkflowNodeType.TRIGGER,
    label: 'Manual Trigger',
    description: 'Start workflow manually',
    category: 'Triggers',
    color: BRAND_COLORS.trigger
  },
  
  // AI Tools
  {
    type: WorkflowNodeType.AI_OPENAI_TASK,
    label: 'OpenAI Task',
    description: 'Unified OpenAI task with custom prompts',
    category: 'AI Tools',
    color: BRAND_COLORS.ai
  },
  {
    type: WorkflowNodeType.CONTENT_EXTRACT,
    label: 'Extract Content',
    description: 'Extract content from web pages',
    category: 'Content Tools',
    color: BRAND_COLORS.content
  },
  
  // SERP Analysis
  {
    type: WorkflowNodeType.SEO_SERP_ANALYZE,
    label: 'SERP Analysis',
    description: 'Analyze search results',
    category: 'SEO Tools',
    color: BRAND_COLORS.seo
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_ORGANIC,
    label: 'Google Organic',
    description: 'Google organic search results',
    category: 'SEO Tools',
    color: BRAND_COLORS.seo
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_ADS,
    label: 'Google Ads',
    description: 'Google ads search results',
    category: 'SERP'
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_IMAGES,
    label: 'Google Images',
    description: 'Google image search results',
    category: 'SERP'
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_NEWS,
    label: 'Google News',
    description: 'Google news search results',
    category: 'SERP'
  },
  {
    type: WorkflowNodeType.SEO_SERP_GOOGLE_MAPS,
    label: 'Google Maps',
    description: 'Google maps search results',
    category: 'SERP'
  },
  
  // Keywords
  {
    type: WorkflowNodeType.SEO_KEYWORDS_VOLUME,
    label: 'Search Volume',
    description: 'Get keyword search volume',
    category: 'Keywords'
  },
  
  // Review and Approval
  {
    type: WorkflowNodeType.REVIEW,
    label: 'Review Step',
    description: 'Pause workflow for review and approval',
    category: 'Flow Control',
    color: '#f59e0b'
  },
  {
    type: WorkflowNodeType.SEO_KEYWORDS_GOOGLE_ADS,
    label: 'Google Ads Keywords',
    description: 'Google Ads keyword data',
    category: 'Keywords'
  },
  {
    type: WorkflowNodeType.SEO_KEYWORDS_SITE,
    label: 'Site Keywords',
    description: 'Keywords for specific site',
    category: 'Keywords'
  },
  {
    type: WorkflowNodeType.SEO_KEYWORDS_SUGGESTIONS,
    label: 'Keyword Suggestions',
    description: 'Get keyword suggestions',
    category: 'Keywords'
  },
  
  // DataForSEO Labs
  {
    type: WorkflowNodeType.SEO_LABS_RANKED_KEYWORDS,
    label: 'Ranked Keywords',
    description: 'Domain ranked keywords',
    category: 'Labs'
  },
  {
    type: WorkflowNodeType.SEO_LABS_SERP_COMPETITORS,
    label: 'SERP Competitors',
    description: 'Find SERP competitors',
    category: 'Labs'
  },
  {
    type: WorkflowNodeType.SEO_LABS_RELATED_KEYWORDS,
    label: 'Related Keywords',
    description: 'Find related keywords',
    category: 'Labs'
  },
  {
    type: WorkflowNodeType.SEO_LABS_SEARCH_INTENT,
    label: 'Search Intent',
    description: 'Analyze search intent',
    category: 'Labs'
  },
  
  // Backlinks
  {
    type: WorkflowNodeType.SEO_BACKLINKS_OVERVIEW,
    label: 'Backlinks Overview',
    description: 'Domain backlinks overview',
    category: 'Backlinks'
  },
  {
    type: WorkflowNodeType.SEO_BACKLINKS_ANCHORS,
    label: 'Anchor Texts',
    description: 'Backlink anchor analysis',
    category: 'Backlinks'
  },
  {
    type: WorkflowNodeType.SEO_BACKLINKS_REFERRING_DOMAINS,
    label: 'Referring Domains',
    description: 'Referring domains analysis',
    category: 'Backlinks'
  },
  
  // On-Page
  {
    type: WorkflowNodeType.SEO_ONPAGE_SUMMARY,
    label: 'On-Page Summary',
    description: 'Website on-page analysis',
    category: 'On-Page'
  },
  {
    type: WorkflowNodeType.SEO_ONPAGE_PAGES,
    label: 'Page Analysis',
    description: 'Individual page analysis',
    category: 'On-Page'
  },
  {
    type: WorkflowNodeType.SEO_ONPAGE_LIGHTHOUSE,
    label: 'Lighthouse Audit',
    description: 'Google Lighthouse audit',
    category: 'On-Page'
  },
  
  // Content Analysis
  {
    type: WorkflowNodeType.SEO_CONTENT_ANALYSIS,
    label: 'Content Analysis',
    description: 'Analyze content performance',
    category: 'Content'
  },
  {
    type: WorkflowNodeType.SEO_CONTENT_SENTIMENT,
    label: 'Sentiment Analysis',
    description: 'Content sentiment analysis',
    category: 'Content'
  },
  
  // Client Data
  {
    type: WorkflowNodeType.CLIENT_PROFILE,
    label: 'Client Profile',
    description: 'Load client data and business profile',
    category: 'Client Data',
    color: BRAND_COLORS.client
  },
  
  // Actions
  {
    type: WorkflowNodeType.EMAIL,
    label: 'Send Email',
    description: 'Send email notification',
    category: 'Actions',
    color: BRAND_COLORS.action
  },
  
  // Google Analytics
  {
    type: WorkflowNodeType.GOOGLE_ANALYTICS_OVERVIEW,
    label: 'GA Overview',
    description: 'Get Google Analytics overview',
    category: 'Google Analytics',
    color: BRAND_COLORS.analytics
  },
  {
    type: WorkflowNodeType.GOOGLE_ANALYTICS_TRAFFIC,
    label: 'Traffic Analysis',
    description: 'Analyze website traffic',
    category: 'Google Analytics',
    color: BRAND_COLORS.analytics
  },
  {
    type: WorkflowNodeType.GOOGLE_ANALYTICS_CONVERSIONS,
    label: 'Conversion Tracking',
    description: 'Track conversions and goals',
    category: 'Google Analytics',
    color: BRAND_COLORS.analytics
  },
  
  // Google Ads
  {
    type: WorkflowNodeType.GOOGLE_ADS_CAMPAIGNS,
    label: 'Campaign Data',
    description: 'Get Google Ads campaign data',
    category: 'Google Ads',
    color: BRAND_COLORS.ads
  },
  {
    type: WorkflowNodeType.GOOGLE_ADS_KEYWORDS,
    label: 'Keyword Performance',
    description: 'Analyze keyword performance',
    category: 'Google Ads',
    color: BRAND_COLORS.ads
  },
  
  // Meta Ads
  {
    type: WorkflowNodeType.META_ADS_CAMPAIGNS,
    label: 'Campaign Data',
    description: 'Get Meta Ads campaign data',
    category: 'Meta Ads',
    color: BRAND_COLORS.meta
  },
  {
    type: WorkflowNodeType.META_ADS_INSIGHTS,
    label: 'Ad Insights',
    description: 'Get detailed ad insights',
    category: 'Meta Ads',
    color: BRAND_COLORS.meta
  },
  
  // Google Maps
  {
    type: WorkflowNodeType.GOOGLE_MAPS_PLACES,
    label: 'Places Data',
    description: 'Get Google Places information',
    category: 'Google Maps',
    color: BRAND_COLORS.maps
  },
  {
    type: WorkflowNodeType.GOOGLE_MAPS_REVIEWS,
    label: 'Reviews Analysis',
    description: 'Analyze Google Maps reviews',
    category: 'Google Maps',
    color: BRAND_COLORS.maps
  },
  
  // Ahrefs
  {
    type: WorkflowNodeType.AHREFS_SITE_EXPLORER,
    label: 'Site Explorer',
    description: 'Analyze website with Ahrefs',
    category: 'Ahrefs',
    color: BRAND_COLORS.ahrefs
  },
  {
    type: WorkflowNodeType.AHREFS_KEYWORDS,
    label: 'Keyword Research',
    description: 'Research keywords with Ahrefs',
    category: 'Ahrefs',
    color: BRAND_COLORS.ahrefs
  },
  
  // WordPress
  {
    type: WorkflowNodeType.WORDPRESS_POSTS,
    label: 'Post Management',
    description: 'Manage WordPress posts',
    category: 'WordPress',
    color: BRAND_COLORS.wordpress
  },
  {
    type: WorkflowNodeType.WORDPRESS_PAGES,
    label: 'Page Management',
    description: 'Manage WordPress pages',
    category: 'WordPress',
    color: BRAND_COLORS.wordpress
  },
  
  // CRM & Marketing
  {
    type: WorkflowNodeType.HUBSPOT_CONTACTS,
    label: 'Contact Management',
    description: 'Manage HubSpot contacts',
    category: 'CRM & Marketing',
    color: BRAND_COLORS.hubspot
  },
  {
    type: WorkflowNodeType.MAILCHIMP_LISTS,
    label: 'List Management',
    description: 'Manage Mailchimp lists',
    category: 'CRM & Marketing',
    color: BRAND_COLORS.mailchimp
  },
  
  // Social Media
  {
    type: WorkflowNodeType.TWITTER_POSTS,
    label: 'Tweet Management',
    description: 'Manage Twitter posts',
    category: 'Social Media',
    color: BRAND_COLORS.twitter
  },
  {
    type: WorkflowNodeType.LINKEDIN_POSTS,
    label: 'LinkedIn Posts',
    description: 'Manage LinkedIn posts',
    category: 'Social Media',
    color: BRAND_COLORS.linkedin
  },
  
  // E-commerce
  {
    type: WorkflowNodeType.SHOPIFY_PRODUCTS,
    label: 'Product Management',
    description: 'Manage Shopify products',
    category: 'E-commerce',
    color: BRAND_COLORS.shopify
  },
  {
    type: WorkflowNodeType.WOOCOMMERCE_PRODUCTS,
    label: 'WooCommerce Products',
    description: 'Manage WooCommerce products',
    category: 'E-commerce',
    color: BRAND_COLORS.woocommerce
  }
];

export default function WorkflowBuilder({ onSave, workflowId }: WorkflowBuilderProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [settingsNode, setSettingsNode] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [activating, setActivating] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [variableSelectorOpen, setVariableSelectorOpen] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track the current workflow ID to fix autosave creating new workflows
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(workflowId || null);
  
  // Auto-save timer
  const autoSaveTimer = useRef<number | null>(null);
  const lastSavedState = useRef<string>('');

  // Load existing workflow data when editing
  useEffect(() => {
    const loadWorkflow = async () => {
      if (workflowId) {
        try {
          console.log('Loading workflow for editing:', workflowId);
          const workflow = await workflowApi.loadWorkflow(workflowId);
          
          if (workflow) {
            setWorkflowName(workflow.name || '');
            setWorkflowDescription(workflow.description || '');
            setWorkflowActive(workflow.isActive || false);
            
            if (workflow.nodes) {
              setNodes(workflow.nodes);
            }
            
            if (workflow.edges) {
              setEdges(workflow.edges);
            }
            
            // Set initial saved state to prevent immediate auto-save
            lastSavedState.current = JSON.stringify({ 
              nodes: workflow.nodes || [], 
              edges: workflow.edges || [], 
              workflowName: workflow.name || '', 
              workflowDescription: workflow.description || '' 
            });
            
            setHasUnsavedChanges(false);
            console.log('Workflow loaded successfully:', workflow);
          }
        } catch (error) {
          console.error('Failed to load workflow:', error);
        }
      }
    };

    loadWorkflow();
  }, [workflowId, setNodes, setEdges]);

  // Track changes to nodes and edges
  useEffect(() => {
    const currentState = JSON.stringify({ nodes, edges, workflowName, workflowDescription });
    if (currentState !== lastSavedState.current && lastSavedState.current !== '') {
      setHasUnsavedChanges(true);
      
      // Auto-save after 2 seconds of no changes
      if (autoSaveEnabled && (workflowName || nodes.length > 0)) {
        if (autoSaveTimer.current) {
          clearTimeout(autoSaveTimer.current);
        }
        autoSaveTimer.current = setTimeout(() => {
          handleAutoSave();
        }, 2000);
      }
    }
  }, [nodes, edges, workflowName, workflowDescription, autoSaveEnabled]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || (!workflowName && nodes.length === 0)) return;
    
    try {
      // Use currentWorkflowId if available, otherwise workflowId, otherwise generate new ID
      const workflowIdToUse = currentWorkflowId || workflowId || `workflow_${Date.now()}`;
      
      const workflow = {
        id: workflowIdToUse,
        name: workflowName || `Untitled Workflow ${new Date().toLocaleTimeString()}`,
        description: workflowDescription,
        nodes,
        edges,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
      };

      if (onSave) {
        await onSave(workflow);
        
        // Update currentWorkflowId if this was a new workflow
        if (!currentWorkflowId && !workflowId) {
          setCurrentWorkflowId(workflowIdToUse);
        }
        
        setHasUnsavedChanges(false);
        lastSavedState.current = JSON.stringify({ nodes, edges, workflowName, workflowDescription });
        setSnackbarMessage('Workflow auto-saved');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [nodes, edges, workflowName, workflowDescription, hasUnsavedChanges, onSave, workflowId, currentWorkflowId]);

  const handleClose = () => {
    if (hasUnsavedChanges && !autoSaveEnabled) {
      setShowCloseDialog(true);
    } else if (hasUnsavedChanges && autoSaveEnabled) {
      // Auto-save before closing
      handleAutoSave().then(() => {
        navigate('/admin/workflows');
      });
    } else {
      navigate('/admin/workflows');
    }
  };

  const handleCloseConfirm = async (saveChanges: boolean) => {
    if (saveChanges) {
      await handleAutoSave();
    }
    setShowCloseDialog(false);
    navigate('/admin/workflows');
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `edge-${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        type: 'default',
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      const position = {
        x: event.clientX - 300, // Adjust for sidebar width
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType === 'trigger' ? 'trigger' : nodeType === 'serp' ? 'serp' : nodeType === 'ai' ? 'ai' : 'email',
        position,
        data: {
          id: `${nodeType}-${Date.now()}`,
          type: nodeType as WorkflowNodeType,
          label: nodePaletteItems.find(item => item.type === nodeType)?.label || nodeType,
          description: nodePaletteItems.find(item => item.type === nodeType)?.description || '',
          config: {},
          isValid: true,
        } as unknown as Record<string, unknown>,
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSettingsNode(node);
  };

  const handleSettingsSave = (nodeId: string, updatedData: WorkflowNodeData) => {
    setNodes((nds: Node[]) =>
      nds.map((node: Node) =>
        node.id === nodeId
          ? {
              ...node,
              data: updatedData as unknown as Record<string, unknown>,
            }
          : node
      )
    );
    setSettingsNode(null);
  };

  const handleNodeDelete = (nodeId: string) => {
    setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== nodeId));
    setEdges((eds: Edge[]) => eds.filter((edge: Edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSettingsNode(null);
  };

  const handleSaveWorkflow = () => {
    // If editing existing workflow (workflowId exists), save directly
    if (workflowId) {
      handleSaveConfirm();
    } else {
      // For new workflows, open dialog to get name/description
      setSaveDialogOpen(true);
    }
  };

  const handleSaveConfirm = async () => {
    // Use currentWorkflowId if available, otherwise workflowId, otherwise generate new ID
    const workflowIdToUse = currentWorkflowId || workflowId || `workflow_${Date.now()}`;
    
    const workflow = {
      id: workflowIdToUse,
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };

    if (onSave) {
      await onSave(workflow);
      
      // Update currentWorkflowId if this was a new workflow
      if (!currentWorkflowId && !workflowId) {
        setCurrentWorkflowId(workflowIdToUse);
      }
      
      setHasUnsavedChanges(false);
      lastSavedState.current = JSON.stringify({ nodes, edges, workflowName, workflowDescription });
      setSnackbarMessage('Workflow saved successfully');
      setSnackbarOpen(true);
    }

    setSaveDialogOpen(false);
    // Don't reset name and description when editing existing workflow
    if (!workflowId && !currentWorkflowId) {
      setWorkflowName('');
      setWorkflowDescription('');
    }
  };

  const handleValidateWorkflow = async () => {
    setValidating(true);
    setValidationResult(null);
    
    try {
      const workflow = {
        id: workflowId || 'temp',
        name: workflowName || 'Untitled Workflow',
        description: workflowDescription || '',
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: node.data
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: edge.data
        })),
        business_id: 'default-business', // TODO: Get from context/auth
        isActive: false,
      };

      const { workflowApi } = await import('../../services/workflowApi');
      const validation = await workflowApi.validateWorkflow(workflow);
      
      setValidationResult(validation);
      setShowValidationDialog(true);
      
      if (validation.isValid) {
        setSnackbarMessage(`✅ Workflow validation passed!`);
      } else {
        setSnackbarMessage(`❌ Workflow validation failed with ${validation.errors.length} error(s)`);
      }
      setSnackbarOpen(true);
      
    } catch (error: any) {
      console.error('Validation failed:', error);
      setSnackbarMessage(`❌ Validation failed: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setValidating(false);
    }
  };

  const handleActivateWorkflow = async () => {
    if (!workflowId) {
      setSnackbarMessage('Please save the workflow before activating');
      setSnackbarOpen(true);
      return;
    }

    setActivating(true);
    
    try {
      const { workflowApi } = await import('../../services/workflowApi');
      const result = await workflowApi.activateWorkflow(workflowId);
      
      if (result.success) {
        setSnackbarMessage('🚀 Workflow activated successfully!');
        setWorkflowActive(true);
        // Trigger a refresh of workflow status - onSave would need the full workflow object
      } else {
        setSnackbarMessage(`❌ Failed to activate: ${result.error || 'Unknown error'}`);
      }
      setSnackbarOpen(true);
      
    } catch (error: any) {
      console.error('Activation failed:', error);
      setSnackbarMessage(`❌ Activation failed: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setActivating(false);
    }
  };

  const handleDeactivateWorkflow = async () => {
    if (!workflowId) return;

    setActivating(true);
    
    try {
      const { workflowApi } = await import('../../services/workflowApi');
      const result = await workflowApi.deactivateWorkflow(workflowId);
      
      if (result.success) {
        setSnackbarMessage('⏸️ Workflow deactivated');
        setWorkflowActive(false);
        // Trigger a refresh of workflow status - onSave would need the full workflow object
      } else {
        setSnackbarMessage(`❌ Failed to deactivate: ${result.error || 'Unknown error'}`);
      }
      setSnackbarOpen(true);
      
    } catch (error: any) {
      console.error('Deactivation failed:', error);
      setSnackbarMessage(`❌ Deactivation failed: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setActivating(false);
    }
  };

  const createTestWorkflow = () => {
    const testNodes: Node[] = [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          id: 'trigger-1',
          type: WorkflowNodeType.TRIGGER,
          label: 'Manual Start',
          description: 'Manual trigger to start the workflow',
          config: { triggerType: 'manual' },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'serp-1',
        type: 'serp',
        position: { x: 350, y: 100 },
        data: {
          id: 'serp-1',
          type: WorkflowNodeType.SEO_SERP_ANALYZE,
          label: 'SERP Analysis',
          description: 'Analyze search engine results',
          config: { 
            keyword: 'marketing trends', 
            locationCode: 2840, 
            languageCode: 'en',
            resultType: 'organic',
            maxResults: 10,
            integrationId: '' // ⚠️ Configure integrations first!
          },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 600, y: 100 },
        data: {
          id: 'ai-1',
          type: WorkflowNodeType.AI_OPENAI_TASK,
          label: 'AI Analysis',
          description: 'Analyze SERP results with AI',
          config: { 
            systemPrompt: 'You are a marketing analyst. Analyze the provided search results and identify key trends and insights.',
            userPrompt: 'Please analyze these search results: {{serp-1.data.processed.results[0].items}}',
            model: 'gpt-4o-mini',
            maxTokens: 1000,
            temperature: 0.3,
            integrationId: '', // Will need to be set by user
            outputVariable: 'analysis_result'
          },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
      {
        id: 'ai-2',
        type: 'ai',
        position: { x: 850, y: 100 },
        data: {
          id: 'ai-2',
          type: WorkflowNodeType.AI_OPENAI_TASK,
          label: 'Summary Report',
          description: 'Create a summary report',
          config: { 
            systemPrompt: 'You are a professional report writer. Create concise, actionable summaries.',
            userPrompt: 'Based on this analysis: {{ai-1.data.processed}}, create a 3-point executive summary with actionable recommendations.',
            model: 'gpt-4o-mini',
            maxTokens: 500,
            temperature: 0.2,
            integrationId: '', // Will need to be set by user
            outputVariable: 'final_summary'
          },
          isValid: true,
        } as unknown as Record<string, unknown>,
      },
    ];

    const testEdges: Edge[] = [
      { id: 'e1-2', source: 'trigger-1', target: 'serp-1' },
      { id: 'e2-3', source: 'serp-1', target: 'ai-1' },
      { id: 'e3-4', source: 'ai-1', target: 'ai-2' },
    ];

    setNodes(testNodes);
    setEdges(testEdges);
    setWorkflowName('Test Workflow: SERP → AI Analysis → Summary');
    setWorkflowDescription('Demo workflow: SERP data → AI analysis → Summary report. ⚠️ Requires DataForSEO and OpenAI integrations to be configured first!');
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <ReactFlowProvider>
      <Box
        sx={{
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : '100%',
          minHeight: isFullscreen ? '100vh' : '600px',
          zIndex: isFullscreen ? 9999 : 'auto',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
        }}
      >
        {/* Left Sidebar - Node Palette */}
        <Paper sx={{
          width: 280,
          borderRadius: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          overflow: 'auto',
          flexShrink: 0,
          backgroundColor: theme.palette.background.paper,
        }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Workflow Nodes
            </Typography>
            
            {/* Workflow Controls */}
            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={createTestWorkflow}
                sx={{ mb: 1 }}
              >
                Create Test Flow
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveWorkflow}
                color={hasUnsavedChanges ? "warning" : "primary"}
                sx={{ mb: 1 }}
              >
                {hasUnsavedChanges ? 'Save Changes' : 'Save Workflow'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PlayIcon />}
                onClick={() => setShowExecutionPanel(true)}
                disabled={nodes.length === 0}
                color="success"
                sx={{ mb: 1 }}
              >
                Test Full Flow
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={validating ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                onClick={handleValidateWorkflow}
                disabled={validating || nodes.length === 0}
                color="info"
                sx={{ mb: 1 }}
              >
                {validating ? 'Validating...' : 'Validate Workflow'}
              </Button>
              
              {workflowId && (
                <Button
                  fullWidth
                  variant={workflowActive ? "contained" : "outlined"}
                  startIcon={activating ? <CircularProgress size={16} /> : (workflowActive ? <StopIcon /> : <PlayArrowIcon />)}
                  onClick={workflowActive ? handleDeactivateWorkflow : handleActivateWorkflow}
                  disabled={activating || !workflowId}
                  color={workflowActive ? "success" : "primary"}
                  sx={{ mb: 1 }}
                >
                  {activating ? 'Processing...' : (workflowActive ? 'Deactivate' : 'Activate Workflow')}
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Search Box */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{ mb: 3 }}
            />

            {/* Node Categories */}
            {(() => {
              const categories = [
                'Triggers', 'AI Tools', 'Google Analytics', 'Google Ads', 'Meta Ads', 
                'Google Maps', 'Ahrefs', 'WordPress', 'CRM & Marketing', 'Social Media', 
                'E-commerce', 'SEO Tools', 'Content Tools', 'Client Data', 'Actions'
              ];
              
              // Filter categories and items based on search
              const filteredCategories = categories.filter(category => {
                if (!searchTerm) return true;
                const categoryItems = nodePaletteItems.filter(item => item.category === category);
                return categoryItems.some(item => 
                  item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  category.toLowerCase().includes(searchTerm.toLowerCase())
                );
              });
              
              return filteredCategories.map((category) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {category}
                </Typography>
                {nodePaletteItems
                  .filter(item => {
                    if (item.category !== category) return false;
                    if (!searchTerm) return true;
                    return item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
                  })
                  .map((item) => (
                    <Paper
                      key={item.type}
                      elevation={1}
                      draggable
                      onDragStart={(event: React.DragEvent) => onDragStart(event, item.type)}
                      sx={{
                        p: 2,
                        mb: 1,
                        cursor: 'grab',
                        border: `1px solid ${theme.palette.divider}`,
                        borderLeft: `4px solid ${item.color || getNodeColor(item.type)}`,
                        borderRadius: '4px',
                        backgroundColor: `${(item.color || getNodeColor(item.type))}08`, // Very subtle 3% tint
                        '&:hover': {
                          backgroundColor: `${(item.color || getNodeColor(item.type))}15`, // Slightly more visible on hover (8% tint)
                          borderColor: theme.palette.divider,
                          borderLeftColor: item.color || getNodeColor(item.type),
                          boxShadow: `0 2px 8px ${(item.color || getNodeColor(item.type))}20`,
                          transform: 'translateY(-1px)',
                        },
                        '&:active': {
                          cursor: 'grabbing',
                          transform: 'translateY(0)',
                          backgroundColor: `${(item.color || getNodeColor(item.type))}20`, // More visible when pressed
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Paper>
                  ))}
              </Box>
            ));
            })()}
          </Box>
        </Paper>

        {/* Main Canvas Area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: theme.palette.background.default }}
          >
            {/* Custom CSS for ReactFlow Controls and Dropdown visibility */}
            <style>
              {`
                /* Global override for Material-UI dropdown z-index */
                .MuiPopover-root, .MuiMenu-root, .MuiSelect-root .MuiPopover-paper {
                  z-index: 999999 !important;
                }
                .MuiBackdrop-root {
                  z-index: 999998 !important;
                }
                
                ${theme.palette.mode === 'dark' ? `
                  .react-flow__controls button {
                    background-color: #4a5568 !important;
                    border: 1px solid #718096 !important;
                    color: #e2e8f0 !important;
                  }
                  .react-flow__controls button:hover {
                    background-color: #5a6578 !important;
                    border-color: #81909f !important;
                  }
                  .react-flow__controls button svg {
                    fill: #e2e8f0 !important;
                  }
                  .react-flow__minimap {
                    background-color: #2d3748 !important;
                  }
                  .react-flow__minimap-mask {
                    fill: rgba(255, 255, 255, 0.1) !important;
                  }
                  .react-flow__minimap-node {
                    fill: #4a5568 !important;
                  }
                ` : `
                  .react-flow__controls button {
                    background-color: #ffffff !important;
                    border: 1px solid #e2e8f0 !important;
                    color: #4a5568 !important;
                  }
                  .react-flow__controls button:hover {
                    background-color: #f7fafc !important;
                    border-color: #cbd5e0 !important;
                  }
                  .react-flow__controls button svg {
                    fill: #4a5568 !important;
                  }
                `}
              `}
            </style>
            <Background 
              color={theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}
              gap={20}
              size={1}
            />
            <Controls 
              style={{
                backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#ffffff',
                borderRadius: '8px',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.palette.divider}`,
              }}
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />
            <MiniMap 
              style={{
                backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#ffffff',
                borderRadius: '8px',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.palette.divider}`,
              }}
              nodeColor={(node) => {
                if (node.type) {
                  return theme.palette.mode === 'dark' ? '#5f5eff' : '#5f5eff';
                }
                return theme.palette.mode === 'dark' ? '#4a5568' : '#cbd5e0';
              }}
              maskColor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            />
            
            {/* Top Controls Panel */}
            <Panel position="top-right">
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {hasUnsavedChanges && (
                  <Tooltip title="You have unsaved changes">
                    <WarningIcon color="warning" fontSize="small" />
                  </Tooltip>
                )}
                
                <Tooltip title={autoSaveEnabled ? "Auto-save enabled" : "Auto-save disabled"}>
                  <Button
                    size="small"
                    variant={autoSaveEnabled ? "contained" : "outlined"}
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Auto
                  </Button>
                </Tooltip>
                
                <Tooltip title="Open Data Browser">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setVariableSelectorOpen(true)}
                    sx={{ minWidth: 'auto', px: 1 }}
                    startIcon={<SearchIcon />}
                  >
                    Data
                  </Button>
                </Tooltip>
                
                <Tooltip title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                  <IconButton
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.background.paper, 
                      '&:hover': { backgroundColor: theme.palette.action.hover } 
                    }}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Close builder">
                  <IconButton
                    onClick={handleClose}
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.background.paper, 
                      '&:hover': { backgroundColor: theme.palette.action.hover } 
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Panel>

            {/* Auto-save Status */}
            {autoSaveEnabled && (
              <Panel position="bottom-right">
                <Box sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(31, 41, 55, 0.9)' 
                    : 'rgba(255, 255, 255, 0.9)', 
                  padding: '4px 8px', 
                  borderRadius: 1,
                  fontSize: '12px',
                  color: 'text.secondary'
                }}>
                  {hasUnsavedChanges ? 'Auto-saving...' : 'All changes saved'}
                </Box>
              </Panel>
            )}
          </ReactFlow>
        </Box>
      </Box>

      {/* Variable Selector - Use Dialog for Better UX */}
      <VariableSelector
        open={variableSelectorOpen}
        onClose={() => setVariableSelectorOpen(false)}
        onInsert={(variable) => {
          // TODO: Insert variable into currently focused field
          console.log('Variable selected:', variable);
          setVariableSelectorOpen(false);
        }}
        position="dialog"
      />

      {/* Right Settings Panel */}
      {settingsNode && (
        <Paper sx={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 400,
          zIndex: 50000, // Much higher z-index to ensure dropdown visibility
          borderRadius: 0,
          borderLeft: `1px solid ${theme.palette.divider}`,
          overflow: 'auto',
          // Ensure dropdown menus can appear above this panel
          '& .MuiSelect-root': {
            zIndex: 999999
          },
          '& .MuiPopover-root': {
            zIndex: 999999
          },
          '& .MuiMenu-root': {
            zIndex: 999999
          }
        }}>
          <NodeSettingsPanel
            node={settingsNode}
            onClose={() => setSettingsNode(null)}
            onSave={handleSettingsSave}
            onDelete={handleNodeDelete}
          />
        </Paper>
      )}

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="outlined"
            value={workflowName}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflowName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={workflowDescription}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflowDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={showCloseDialog} onClose={() => setShowCloseDialog(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Would you like to save them before closing?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseConfirm(false)} color="error">
            Don't Save
          </Button>
          <Button onClick={() => setShowCloseDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleCloseConfirm(true)} variant="contained">
            Save & Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* Validation Results Dialog */}
      <ValidationResultsDialog
        open={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        validationResult={validationResult}
        onActivate={workflowId ? handleActivateWorkflow : undefined}
      />

      {/* Workflow Execution Panel */}
      <WorkflowExecutionPanel
        nodes={nodes}
        edges={edges}
        open={showExecutionPanel}
        onClose={() => setShowExecutionPanel(false)}
      />
    </ReactFlowProvider>
  );
} 