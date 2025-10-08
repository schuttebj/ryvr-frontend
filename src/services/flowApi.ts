import { getAuthToken } from '../utils/auth';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com';

// ============================================================================
// TYPES
// ============================================================================

export interface Flow {
  id: number;
  title: string;
  template_name: string;
  template_id: number;
  business_id: number;
  status: string;
  progress: number;
  current_step: string | null;
  total_steps: number;
  completed_steps: number;
  created_at: string;
  created_by: number;
  credits_used: number;
  estimated_duration: number | null;
  custom_field_values: Record<string, any>;
  pending_reviews: any[];
  tags: string[];
  error_message: string | null;
}

export interface FlowDetails extends Flow {
  step_executions: StepExecution[];
}

export interface StepExecution {
  id: number;
  step_id: string;
  step_name: string;
  step_type: string;
  status: string;
  input_data: any;
  output_data: any;
  error_data: any;
  credits_used: number;
  execution_time_ms: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface FlowTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string | null;
  credit_cost: number;
  estimated_duration: number | null;
  editable_fields: any[];
  step_count: number;
  created_at: string;
}

export interface CreateFlowRequest {
  template_id: number;
  title?: string;
  execution_mode?: 'live' | 'simulate' | 'record';
  scheduled_for?: string;
  custom_field_values?: Record<string, any>;
}

export interface FlowTemplateResponse {
  templates: FlowTemplate[];
}

export interface TemplatePreviewResponse {
  template_id: number;
  name: string;
  description: string;
  step_count: number;
  editable_fields: any[];
  credit_cost: number;
  estimated_duration: number | null;
  steps: any[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCredits(credits: number): string {
  if (credits === 0) return '0 credits';
  if (credits < 1) return `${(credits * 100).toFixed(0)}¢`;
  return `${credits.toFixed(2)} credits`;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return 'Unknown duration';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// ============================================================================
// FLOW API SERVICE
// ============================================================================

class FlowApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE}/api/v1`;
  }

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<any> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.statusText}`);
    }

    return await response.json();
  }

  // List flows for a business
  async getFlows(businessId: number, status?: string): Promise<{ flows: Flow[]; total: number }> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest(`/flows/businesses/${businessId}/flows${queryString}`);
  }

  // Get flow details with step executions
  async getFlowDetails(flowId: number): Promise<FlowDetails> {
    return this.makeRequest(`/flows/flows/${flowId}/details`);
  }

  // Create a new flow
  async createFlow(businessId: number, flowRequest: CreateFlowRequest): Promise<{ flow_id: number; status: string; message: string }> {
    return this.makeRequest(`/flows/businesses/${businessId}/flows`, 'POST', flowRequest);
  }

  // Update flow
  async updateFlow(flowId: number, updates: { title?: string; custom_field_values?: Record<string, any>; status?: string }): Promise<void> {
    await this.makeRequest(`/flows/flows/${flowId}`, 'PATCH', updates);
  }

  // Start a flow
  async startFlow(flowId: number): Promise<{ message: string; flow_id: number; status: string }> {
    return this.makeRequest(`/flows/flows/${flowId}/start`, 'POST');
  }

  // Rerun a flow (creates new flow from completed/failed one)
  async rerunFlow(flowId: number): Promise<{ message: string; original_flow_id: number; new_flow_id: number; status: string }> {
    return this.makeRequest(`/flows/flows/${flowId}/rerun`, 'POST');
  }

  // Delete a flow
  async deleteFlow(flowId: number): Promise<void> {
    await this.makeRequest(`/flows/flows/${flowId}`, 'DELETE');
  }

  // List available templates
  async listTemplates(category?: string, tags?: string): Promise<FlowTemplateResponse> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (tags) params.set('tags', tags);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest(`/flows/templates${queryString}`);
  }

  // Get template preview
  async getTemplatePreview(templateId: number): Promise<TemplatePreviewResponse> {
    return this.makeRequest(`/flows/templates/${templateId}/preview`);
  }

  // Submit options selection
  async submitOptionsSelection(
    flowId: number,
    stepId: string,
    selectedOptions: any[]
  ): Promise<any> {
    return this.makeRequest(`/flows/flows/${flowId}/select-options`, 'POST', {
      step_id: stepId,
      selected_options: selectedOptions,
    });
  }

  // Get options data for a specific step
  async getFlowOptionsData(flowId: number, stepId: string): Promise<any> {
    return this.makeRequest(`/flows/flows/${flowId}/options/${stepId}`);
  }

  // Approve review with edits
  async approveReview(
    flowId: number,
    stepId: string,
    approvalData: {
      approved: boolean;
      comments?: string;
      edited_steps?: string[];
      edited_data?: Record<string, any>;
      step_id?: string;
    }
  ): Promise<any> {
    return this.makeRequest(
      `/flows/flows/${flowId}/review/${stepId}/approve-with-edits`,
      'POST',
      approvalData
    );
  }

  // Get editable data for review
  async getEditableData(flowId: number): Promise<any> {
    return this.makeRequest(`/flows/flows/${flowId}/editable-data`);
  }

  // Helper formatters
  formatCredits = formatCredits;
  formatDuration = formatDuration;
}

// Export singleton instance
const flowApiService = new FlowApiService();
export default flowApiService;

// Also export the flowApi object for convenience
export const flowApi = {
  getFlows: (businessId: number, status?: string) => flowApiService.getFlows(businessId, status),
  getFlowDetails: (flowId: number) => flowApiService.getFlowDetails(flowId),
  createFlow: (businessId: number, flowRequest: CreateFlowRequest) => flowApiService.createFlow(businessId, flowRequest),
  updateFlow: (flowId: number, updates: any) => flowApiService.updateFlow(flowId, updates),
  startFlow: (flowId: number) => flowApiService.startFlow(flowId),
  rerunFlow: (flowId: number) => flowApiService.rerunFlow(flowId),
  deleteFlow: (flowId: number) => flowApiService.deleteFlow(flowId),
  listTemplates: (category?: string, tags?: string) => flowApiService.listTemplates(category, tags),
  getTemplatePreview: (templateId: number) => flowApiService.getTemplatePreview(templateId),
  submitOptionsSelection: (flowId: number, stepId: string, selectedOptions: any[]) => 
    flowApiService.submitOptionsSelection(flowId, stepId, selectedOptions),
  getFlowOptionsData: (flowId: number, stepId: string) => flowApiService.getFlowOptionsData(flowId, stepId),
  approveReview: (flowId: number, stepId: string, approvalData: any) => 
    flowApiService.approveReview(flowId, stepId, approvalData),
  getEditableData: (flowId: number) => flowApiService.getEditableData(flowId),
  formatCredits,
  formatDuration,
};
