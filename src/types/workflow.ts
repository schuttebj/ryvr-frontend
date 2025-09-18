// Workflow Node Types
export enum WorkflowNodeType {
  TRIGGER = 'trigger',
  ACTION = 'action',
  CONDITION = 'condition',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  DELAY = 'delay',
  
  // AI Tools (OpenAI Integration)
  AI_OPENAI_TASK = 'ai_openai_task',
  AI_CONTENT_SEO = 'ai_content_seo', 
  AI_KEYWORDS_GENERATE = 'ai_keywords_generate',
  AI_ADS_GENERATE = 'ai_ads_generate',
  AI_EMAIL_SEQUENCE = 'ai_email_sequence',
  
  // Content Extraction
  CONTENT_EXTRACT = 'content_extract',
  
  // Data Processing & Filtering
  DATA_FILTER = 'data_filter',
  
  // Client Management
  CLIENT_PROFILE = 'client_profile',
  
  // SEO Tools (DataForSEO Integration)
  // SERP Analysis
  SEO_SERP_ANALYZE = 'seo_serp_analyze',
  SEO_SERP_GOOGLE_ORGANIC = 'seo_serp_google_organic',
  SEO_SERP_GOOGLE_ADS = 'seo_serp_google_ads',
  SEO_SERP_GOOGLE_IMAGES = 'seo_serp_google_images',
  SEO_SERP_GOOGLE_NEWS = 'seo_serp_google_news',
  SEO_SERP_GOOGLE_MAPS = 'seo_serp_google_maps',
  SEO_SERP_GOOGLE_JOBS = 'seo_serp_google_jobs',
  SEO_SERP_BING_ORGANIC = 'seo_serp_bing_organic',
  SEO_SERP_SCREENSHOT = 'seo_serp_screenshot',
  
  // Keywords Data
  SEO_KEYWORDS_VOLUME = 'seo_keywords_volume',
  SEO_KEYWORDS_GOOGLE_ADS = 'seo_keywords_google_ads',
  SEO_KEYWORDS_GOOGLE_TRENDS = 'seo_keywords_google_trends',
  SEO_KEYWORDS_BING = 'seo_keywords_bing',
  SEO_KEYWORDS_SITE = 'seo_keywords_site',
  SEO_KEYWORDS_SUGGESTIONS = 'seo_keywords_suggestions',
  
  // DataForSEO Labs
  SEO_LABS_RANKED_KEYWORDS = 'seo_labs_ranked_keywords',
  SEO_LABS_SERP_COMPETITORS = 'seo_labs_serp_competitors',
  SEO_LABS_RELATED_KEYWORDS = 'seo_labs_related_keywords',
  SEO_LABS_SEARCH_INTENT = 'seo_labs_search_intent',
  SEO_LABS_HISTORICAL_SERPS = 'seo_labs_historical_serps',
  SEO_LABS_TOP_SEARCHES = 'seo_labs_top_searches',
  
  // Backlinks
  SEO_BACKLINKS_OVERVIEW = 'seo_backlinks_overview',
  SEO_BACKLINKS_BULK = 'seo_backlinks_bulk',
  SEO_BACKLINKS_ANCHORS = 'seo_backlinks_anchors',
  SEO_BACKLINKS_REFERRING_DOMAINS = 'seo_backlinks_referring_domains',
  SEO_BACKLINKS_COMPETITORS = 'seo_backlinks_competitors',
  
  // On-Page Analysis
  SEO_ONPAGE_SUMMARY = 'seo_onpage_summary',
  SEO_ONPAGE_PAGES = 'seo_onpage_pages',
  SEO_ONPAGE_LIGHTHOUSE = 'seo_onpage_lighthouse',
  
  // Content Analysis
  SEO_CONTENT_ANALYSIS = 'seo_content_analysis',
  SEO_CONTENT_SENTIMENT = 'seo_content_sentiment',
  
  // Google Analytics
  GOOGLE_ANALYTICS_OVERVIEW = 'google_analytics_overview',
  GOOGLE_ANALYTICS_TRAFFIC = 'google_analytics_traffic',
  GOOGLE_ANALYTICS_CONVERSIONS = 'google_analytics_conversions',
  GOOGLE_ANALYTICS_AUDIENCE = 'google_analytics_audience',
  GOOGLE_ANALYTICS_REALTIME = 'google_analytics_realtime',
  
  // Google Tag Manager
  GTM_CONTAINER_INFO = 'gtm_container_info',
  GTM_TAG_MANAGEMENT = 'gtm_tag_management',
  GTM_TRIGGER_SETUP = 'gtm_trigger_setup',
  GTM_VARIABLE_CONFIG = 'gtm_variable_config',
  
  // Google Ads
  GOOGLE_ADS_CAMPAIGNS = 'google_ads_campaigns',
  GOOGLE_ADS_KEYWORDS = 'google_ads_keywords',
  GOOGLE_ADS_PERFORMANCE = 'google_ads_performance',
  GOOGLE_ADS_AUDIENCE = 'google_ads_audience',
  GOOGLE_ADS_EXTENSIONS = 'google_ads_extensions',
  
  // Meta (Facebook) Ads
  META_ADS_CAMPAIGNS = 'meta_ads_campaigns',
  META_ADS_INSIGHTS = 'meta_ads_insights',
  META_ADS_AUDIENCE = 'meta_ads_audience',
  META_ADS_CREATIVE = 'meta_ads_creative',
  META_PIXEL_EVENTS = 'meta_pixel_events',
  
  // Google Maps
  GOOGLE_MAPS_PLACES = 'google_maps_places',
  GOOGLE_MAPS_REVIEWS = 'google_maps_reviews',
  GOOGLE_MAPS_BUSINESS = 'google_maps_business',
  GOOGLE_MAPS_DIRECTIONS = 'google_maps_directions',
  
  // Ahrefs
  AHREFS_SITE_EXPLORER = 'ahrefs_site_explorer',
  AHREFS_KEYWORDS = 'ahrefs_keywords',
  AHREFS_BACKLINKS = 'ahrefs_backlinks',
  AHREFS_RANK_TRACKER = 'ahrefs_rank_tracker',
  AHREFS_CONTENT_GAP = 'ahrefs_content_gap',
  
  // WordPress Integration
  WORDPRESS_POSTS = 'wordpress_posts',
  WORDPRESS_PAGES = 'wordpress_pages',
  WORDPRESS_MEDIA = 'wordpress_media',
  WORDPRESS_USERS = 'wordpress_users',
  WORDPRESS_PLUGINS = 'wordpress_plugins',
  
  // CRM & Marketing Automation
  HUBSPOT_CONTACTS = 'hubspot_contacts',
  HUBSPOT_DEALS = 'hubspot_deals',
  HUBSPOT_CAMPAIGNS = 'hubspot_campaigns',
  MAILCHIMP_LISTS = 'mailchimp_lists',
  MAILCHIMP_CAMPAIGNS = 'mailchimp_campaigns',
  
  // Social Media
  TWITTER_POSTS = 'twitter_posts',
  TWITTER_ANALYTICS = 'twitter_analytics',
  LINKEDIN_POSTS = 'linkedin_posts',
  LINKEDIN_ANALYTICS = 'linkedin_analytics',
  INSTAGRAM_POSTS = 'instagram_posts',
  
  // E-commerce
  SHOPIFY_PRODUCTS = 'shopify_products',
  SHOPIFY_ORDERS = 'shopify_orders',
  SHOPIFY_CUSTOMERS = 'shopify_customers',
  WOOCOMMERCE_PRODUCTS = 'woocommerce_products',
  WOOCOMMERCE_ORDERS = 'woocommerce_orders',
  
  // Communication
  SLACK_MESSAGES = 'slack_messages',
  DISCORD_MESSAGES = 'discord_messages',
  TEAMS_MESSAGES = 'teams_messages',
  
  // Project Management
  ASANA_TASKS = 'asana_tasks',
  TRELLO_CARDS = 'trello_cards',
  NOTION_PAGES = 'notion_pages',
  
  // Analytics & Reporting
  GOOGLE_SEARCH_CONSOLE = 'google_search_console',
  HOTJAR_ANALYTICS = 'hotjar_analytics',
  MIXPANEL_EVENTS = 'mixpanel_events',
}

// Standardized Node Response Interface
export interface StandardNodeResponse {

  // Execution metadata
  executionId: string;
  nodeId: string;
  nodeType: WorkflowNodeType;
  status: 'success' | 'error' | 'pending';
  executedAt: string;
  executionTime: number; // in ms
  
  // Data payload
  data: {

    // Processed/transformed data for easy consumption
    processed: any;

    // Raw API response (original format)
    raw: any;

    // Extracted key fields for quick access
    summary: Record<string, any>;
  };
  
  // Error information
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  
  // Input data that was used for this execution
  inputData?: any;
  
  // Metadata about the API call
  apiMetadata?: {
    provider: string; // 'DataForSEO', 'OpenAI', etc.
    endpoint: string;
    creditsUsed?: number;
    requestId?: string;
  };
}

// Enhanced data mapping interface
export interface DataMappingConfig {

  // Source node ID
  sourceNodeId: string;

  // JSON path to the data (supports arrays with [*], specific indices [0], deep paths)
  jsonPath: string;

  // Optional transformation function
  transform?: 'array_to_string' | 'extract_urls' | 'first_item' | 'count' | 'join_with_comma';

  // Fallback value if path doesn't exist
  fallback?: any;
}

// Available data structure for UI
export interface AvailableDataNode {
  nodeId: string;
  nodeLabel: string;
  nodeType: WorkflowNodeType;
  executedAt: string;
  status: 'success' | 'error';
  dataStructure: DataStructureItem[];

  // Additional properties for compatibility
  id: string;
  data?: any;
  // Comprehensive structure including processed, raw, summary, and metadata
  completeStructure?: {
    processed: {
      label: string;
      description: string;
      paths: any[];
    };
    raw: {
      label: string;
      description: string;
      paths: any[];
    };
    summary: {
      label: string;
      description: string;
      paths: any[];
    };
    metadata?: {
      label: string;
      description: string;
      paths: any[];
    };
  };
}

export interface DataStructureItem {
  path: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'info';
  sampleValue?: any;
  description?: string;
  isArray?: boolean;
  arrayItemType?: string;
  children?: DataStructureItem[];
}

// Base node data structure
export interface WorkflowNodeData {
  id: string;
  type: WorkflowNodeType;
  label: string;
  description?: string;
  config?: Record<string, any>;
  isValid?: boolean;
  errors?: string[];
}

// Custom node types for React Flow
export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  draggable?: boolean;
  selectable?: boolean;
  deletable?: boolean;
}

// Edge types
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  label?: string;
  conditions?: Record<string, any>;
}

// Complete workflow structure
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clientId?: string;
  tags?: string[];
  lastExecuted?: string;
  executionCount?: number;
  successRate?: number;
}

// Node palette item for dragging
export interface NodePaletteItem {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: string;
  category: NodeCategory;
  color: string;
  defaultConfig?: Record<string, any>;
}

// Node categories for organization
export enum NodeCategory {
  TRIGGERS = 'triggers',
  ACTIONS = 'actions',
  CONDITIONS = 'conditions',
  INTEGRATIONS = 'integrations',
  AI_TOOLS = 'ai_tools',
  SEO_TOOLS = 'seo_tools',
  MARKETING = 'marketing',
}

// Workflow execution status
export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
  COMPLETED = 'completed',
}

// Workflow execution log
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
  error?: string;
  nodeExecutions: NodeExecution[];
  metadata?: Record<string, any>;
}

// Individual node execution
export interface NodeExecution {
  nodeId: string;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration?: number;
}

// Workflow validation result
export interface WorkflowValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  type: 'error' | 'warning';
  message: string;
  field?: string;
} 