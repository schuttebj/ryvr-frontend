// =============================================================================
// WORKFLOW V2 TYPES (New Schema: ryvr.workflow.v1)
// =============================================================================

// V2 Step Types - Universal and standardized
export enum WorkflowStepType {
  TASK = 'task',
  AI = 'ai', 
  TRANSFORM = 'transform',
  FOREACH = 'foreach',
  GATE = 'gate',
  CONDITION = 'condition',
  ASYNC_TASK = 'async_task',
  REVIEW = 'review'  // New: Review/approval step for flow management
}

// V2 Workflow Step Configuration
export interface WorkflowStepV2 {
  id: string;
  type: WorkflowStepType;
  name: string;
  connection_id?: string;
  operation?: string;
  depends_on?: string[];
  
  input?: {
    bindings?: Record<string, any>;
    static?: Record<string, any>;
  };
  
  transform?: {
    extract?: Array<{
      as: string;
      expr: string;
      description?: string;
    }>;
    aggregate?: Array<{
      as: string;
      function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'first' | 'last' | 'unique' | 'concat';
      source: string;
    }>;
    format?: Array<{
      as: string;
      function: 'join' | 'split' | 'upper' | 'lower' | 'title' | 'trim' | 'replace' | 'slice';
      source: string;
      separator?: string;
      old?: string;
      new?: string;
      start?: number;
      end?: number;
    }>;
    compute?: Array<{
      as: string;
      expr: string;
    }>;
  };
  
  projection?: {
    keep?: Array<string | { as: string; expr: string }>;
    artifacts?: Array<{
      name: string;
      expr: string;
      mime: string;
    }>;
    metrics?: Array<{
      name: string;
      expr: string;
    }>;
  };
  
  control?: {
    retry_policy?: {
      max_attempts: number;
      backoff_seconds: number;
    };
    timeout_seconds?: number;
    error_handling?: 'rollback' | 'skip' | 'fail_fast';
    rollback_strategy?: {
      revert_side_effects: boolean;
      cleanup_artifacts: boolean;
      credit_refund: 'full' | 'partial' | 'none';
    };
    default_output?: any;
  };
  
  async_config?: {
    submit_operation: string;
    check_operation: string;
    polling_interval_seconds?: number;
    max_wait_seconds?: number;
    completion_check: string;
    result_path?: string;
    task_id_path?: string;
    error_check?: string;
    progress_path?: string;
    error_message_path?: string;
  };
  
  plan?: {
    note?: string;
  };
  
  dry_run?: boolean;
  io_contract?: {
    outputs?: string[];
  };
  
  // Flow Management: Fields that can be customized when starting a flow
  editable_fields?: string[];  // Array of field paths that users can modify
  
  // Review Step Configuration
  review_config?: {
    title?: string;
    description?: string;
    required_approvers?: string[];  // Role/user IDs who can approve
    auto_approve_after?: number;    // Hours before auto-approval (optional)
  };
}

// V2 Workflow Template
export interface WorkflowTemplateV2 {
  id?: number;
  schema_version: 'ryvr.workflow.v1';
  name: string;
  description?: string;
  tags?: string[];
  
  ryvr_context?: {
    business_id?: string;
    agency_id?: string;
    user_id?: string;
    tenant_isolation?: boolean;
  };
  
  globals?: Record<string, any>;
  inputs?: Record<string, any>;
  
  connections?: Array<{
    id: string;
    provider: string;
    ryvr_integration_id?: string;
    auth_context?: any;
  }>;
  
  execution?: {
    concurrency?: number;
    retry_policy?: {
      max_attempts: number;
      backoff_seconds: number;
    };
    timeout_seconds?: number;
    execution_mode?: 'simulate' | 'record' | 'live';
    dry_run?: boolean;
    credit_policy?: {
      estimate_before_run: boolean;
      halt_on_insufficient: boolean;
      track_per_step: boolean;
      business_id?: string;
    };
  };
  
  plan?: {
    note?: string;
    cost_estimate?: {
      calls?: number;
      tokens?: number;
      credits?: number;
    };
  };
  
  steps: WorkflowStepV2[];
  
  // RYVR metadata
  category?: string;
  credit_cost?: number;
  estimated_duration?: number;
  tier_access?: string[];
  status?: 'draft' | 'testing' | 'beta' | 'published' | 'deprecated';
  created_at?: string;
  updated_at?: string;
  created_by?: number;
}

// V2 Workflow Execution
export interface WorkflowExecutionV2 {
  execution_id: number;
  template_id: number;
  business_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  execution_mode: 'simulate' | 'record' | 'live';
  current_step?: string;
  completed_steps: number;
  total_steps: number;
  credits_used: number;
  execution_time_ms: number;
  started_at?: string;
  completed_at?: string;
  runtime_state: {
    inputs: Record<string, any>;
    globals: Record<string, any>;
    steps: Record<string, any>;
    runtime: Record<string, any>;
  };
  step_results: Record<string, any>;
  error_message?: string;
  step_executions: WorkflowStepExecutionV2[];
  
  // Flow Management: Kanban-style status tracking
  flow_status: 'new' | 'scheduled' | 'in_progress' | 'in_review' | 'complete' | 'error';
  flow_title?: string;           // User-friendly flow name
  custom_field_values?: Record<string, any>;  // Values for editable fields
  review_data?: {
    pending_reviews: Array<{
      step_id: string;
      reviewer_id?: number;
      approved_at?: string;
      approved_by?: number;
      comments?: string;
    }>;
  };
}

// V2 Step Execution Tracking
export interface WorkflowStepExecutionV2 {
  step_id: string;
  step_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  credits_used: number;
  execution_time_ms: number;
  started_at?: string;
  completed_at?: string;
  output_data?: any;
  error_data?: any;
}

// V2 Tool Catalog
export interface ToolCatalogV2 {
  schema_version: 'ryvr.tools.v1';
  providers: ProviderDefinition[];
}

export interface ProviderDefinition {
  id: string;
  label: string;
  description: string;
  ryvr_service?: string;
  credit_multiplier?: number;
  tier_restrictions?: string[];
  operations: OperationDefinition[];
}

export interface OperationDefinition {
  id: string;
  summary: string;
  ryvr_method?: string;
  base_credits?: number;
  variable_credits?: string;
  is_async?: boolean;
  async_config?: {
    submit_operation?: string;
    check_operation?: string;
    polling_interval_seconds?: number;
    max_wait_seconds?: number;
    completion_check?: string;
    result_path?: string;
    task_id_path?: string;
  };
  inputs_schema: any; // JSON Schema
  output_example?: any;
  notes?: string[];
}

// V2 Expression and Template Types
export interface ExpressionResult {
  is_valid: boolean;
  error_message?: string;
}

export interface TemplateValidation {
  is_valid: boolean;
  errors: string[];
  variables: string[];
}

// V2 Data Transformation Types
export interface TransformationConfig {
  extract?: ExtractionRule[];
  aggregate?: AggregationRule[];
  format?: FormatRule[];
  compute?: ComputationRule[];
  keep_source?: boolean;
}

export interface ExtractionRule {
  as: string;
  expr: string;
  description?: string;
}

export interface AggregationRule {
  as: string;
  function: 'sum' | 'avg' | 'mean' | 'count' | 'min' | 'max' | 'first' | 'last' | 'unique' | 'concat';
  source: string;
}

export interface FormatRule {
  as: string;
  function: 'join' | 'split' | 'upper' | 'lower' | 'title' | 'trim' | 'replace' | 'slice';
  source: string;
  separator?: string;
  old?: string;
  new?: string;
  start?: number;
  end?: number;
}

export interface ComputationRule {
  as: string;
  expr: string;
}

// V2 Async Step Result
export interface AsyncStepResult {
  success: boolean;
  task_id?: string;
  result_data?: any;
  error_message?: string;
  execution_time_ms: number;
  polling_attempts: number;
  submit_response?: any;
  check_responses?: any[];
}

// V2 Workflow Builder UI Types
export interface StepPaletteItem {
  provider_id: string;
  operation_id: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  step_type: WorkflowStepType;
  inputs_schema: any;
  outputs_example: any;
  is_async: boolean;
  credit_cost: number;
}

export interface WorkflowCanvasNode {
  id: string;
  step: WorkflowStepV2;
  position: { x: number; y: number };
  selected: boolean;
  validation_errors: string[];
}

export interface WorkflowCanvasEdge {
  id: string;
  source: string;
  target: string;
  type: 'dependency' | 'data_flow';
}

// V2 Execution Controls
export interface ExecutionRequest {
  business_id: number;
  execution_mode: 'simulate' | 'record' | 'live';
  inputs: Record<string, any>;
}

export interface ExecutionControls {
  estimated_cost: number;
  available_credits: number;
  can_execute: boolean;
  validation_errors: string[];
}

// =============================================================================
// LEGACY V1 TYPES (Maintained for compatibility)
// =============================================================================

// Legacy Workflow Node Types
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
  
  // Flow Control
  REVIEW = 'review',
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

// =============================================================================
// FLOW MANAGEMENT TYPES (Frontend Kanban Interface)
// =============================================================================

// Kanban column statuses for Flow interface
export enum FlowStatus {
  NEW = 'new',
  SCHEDULED = 'scheduled', 
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETE = 'complete',
  ERROR = 'error'
}

// Flow card for Kanban interface
export interface FlowCard {
  id: number;                        // WorkflowExecution ID
  title: string;                     // User-friendly flow name
  template_name: string;             // Original workflow template name
  template_id: number;               // Reference to WorkflowTemplate
  business_id: number;               // Business this flow belongs to
  status: FlowStatus;                // Current Kanban status
  progress: number;                  // 0-100 percentage based on completed steps
  current_step: string | null;       // Name of current step
  total_steps: number;               // Total number of steps in flow
  completed_steps: number;           // Number of completed steps
  created_at: string;                // When flow was started
  created_by: number;                // User who started the flow
  credits_used: number;              // Credits consumed so far
  estimated_duration?: number;       // Expected completion time in minutes
  custom_field_values?: Record<string, any>;  // User-customized field values
  pending_reviews?: Array<{
    step_id: string;
    reviewer_needed: string;         // 'agency' | 'client' | 'admin'
    submitted_at: string;
  }>;
  tags?: string[];                   // Tags from template + custom tags
  error_message?: string;            // If status is ERROR
}

// Flow creation request
export interface CreateFlowRequest {
  template_id: number;
  business_id: number;
  title?: string;                    // Optional custom title
  custom_field_values?: Record<string, any>;  // Values for editable fields
  execution_mode?: 'simulate' | 'record' | 'live';
  scheduled_for?: string;            // ISO date if scheduling for later
}

// Flow update request  
export interface UpdateFlowRequest {
  status?: FlowStatus;
  title?: string;
  custom_field_values?: Record<string, any>;
  scheduled_for?: string;
}

// Review approval request
export interface ApproveReviewRequest {
  step_id: string;
  comments?: string;
  approved: boolean;
}

// Flow wizard step for creating flows
export interface FlowWizardStep {
  id: string;
  title: string;
  description?: string;
  fields: FlowFieldConfig[];
}

// Editable field configuration for wizard
export interface FlowFieldConfig {
  path: string;                      // JSON path to the field (e.g., "input.static.prompt")
  label: string;                     // Human-readable label
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
  description?: string;              // Help text
  required?: boolean;                // Is field required
  default_value?: any;               // Default value
  options?: Array<{                  // For select fields
    label: string;
    value: any;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Business context for flow management
export interface FlowBusinessContext {
  id: number;
  name: string;
  agency_id: number;
  active_flows_count: number;
  credits_remaining: number;
  tier: string;
} 