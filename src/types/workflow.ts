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
  SEO_ONPAGE_RESOURCES = 'seo_onpage_resources',
  SEO_ONPAGE_DUPLICATE_CONTENT = 'seo_onpage_duplicate_content',
  SEO_ONPAGE_LIGHTHOUSE = 'seo_onpage_lighthouse',
  
  // Content Analysis
  SEO_CONTENT_ANALYSIS = 'seo_content_analysis',
  SEO_CONTENT_SUMMARY = 'seo_content_summary',
  SEO_CONTENT_SENTIMENT = 'seo_content_sentiment',
  
  // Business Data  
  SEO_BUSINESS_LISTINGS = 'seo_business_listings',
  SEO_BUSINESS_REVIEWS = 'seo_business_reviews',
  
  // Domain Analytics
  SEO_DOMAIN_WHOIS = 'seo_domain_whois',
  SEO_DOMAIN_TECHNOLOGIES = 'seo_domain_technologies',
  
  // Legacy (for backward compatibility)
  SEO_COMPETITORS = 'seo_competitors',
  SEO_CONTENT_ANALYZE = 'seo_content_analyze',
  
  // Legacy (for backward compatibility)
  AI_ANALYSIS = 'ai_analysis',
  SEO_AUDIT = 'seo_audit',
  KEYWORD_RESEARCH = 'keyword_research',
  SOCIAL_MEDIA_POST = 'social_media_post',
  CONTENT_GENERATION = 'content_generation',
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