// Workflow Node Types
export enum WorkflowNodeType {
  TRIGGER = 'trigger',
  ACTION = 'action',
  CONDITION = 'condition',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  DELAY = 'delay',
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