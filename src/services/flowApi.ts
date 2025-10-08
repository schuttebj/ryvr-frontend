import apiClient from './apiClient';

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

export const flowApi = {
  // List flows for a business
  listFlows: async (businessId: number, status?: string): Promise<{ flows: Flow[]; total: number }> => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/flows/businesses/${businessId}/flows`, { params });
    return response.data;
  },

  // Get flow details with step executions
  getFlowDetails: async (flowId: number): Promise<FlowDetails> => {
    const response = await apiClient.get(`/flows/flows/${flowId}/details`);
    return response.data;
  },

  // Create a new flow
  createFlow: async (businessId: number, flowRequest: CreateFlowRequest): Promise<{ flow_id: number; status: string; message: string }> => {
    const response = await apiClient.post(`/flows/businesses/${businessId}/flows`, flowRequest);
    return response.data;
  },

  // Update flow
  updateFlow: async (flowId: number, updates: Partial<Pick<Flow, 'title' | 'custom_field_values'>>): Promise<void> => {
    await apiClient.patch(`/flows/flows/${flowId}`, updates);
  },

  // Start a flow
  startFlow: async (flowId: number): Promise<{ message: string; flow_id: number; status: string }> => {
    const response = await apiClient.post(`/flows/flows/${flowId}/start`);
    return response.data;
  },

  // Rerun a flow (creates new flow from completed/failed one)
  rerunFlow: async (flowId: number): Promise<{ message: string; original_flow_id: number; new_flow_id: number; status: string }> => {
    const response = await apiClient.post(`/flows/flows/${flowId}/rerun`);
    return response.data;
  },

  // Delete a flow
  deleteFlow: async (flowId: number): Promise<void> => {
    await apiClient.delete(`/flows/flows/${flowId}`);
  },

  // List available templates
  listTemplates: async (category?: string, tags?: string): Promise<{ templates: FlowTemplate[] }> => {
    const params: any = {};
    if (category) params.category = category;
    if (tags) params.tags = tags;
    const response = await apiClient.get('/flows/templates', { params });
    return response.data;
  },

  // Get template preview
  getTemplatePreview: async (templateId: number): Promise<any> => {
    const response = await apiClient.get(`/flows/templates/${templateId}/preview`);
    return response.data;
  },

  // Submit options selection
  submitOptionsSelection: async (
    flowId: number, 
    stepId: string, 
    selectedOptions: any[]
  ): Promise<any> => {
    const response = await apiClient.post(`/flows/flows/${flowId}/select-options`, {
      step_id: stepId,
      selected_options: selectedOptions
    });
    return response.data;
  },

  // Get options data
  getOptionsData: async (flowId: number, stepId: string): Promise<any> => {
    const response = await apiClient.get(`/flows/flows/${flowId}/options/${stepId}`);
    return response.data;
  },

  // Approve review with edits
  approveReview: async (
    flowId: number,
    stepId: string,
    approvalData: {
      approved: boolean;
      comments?: string;
      edited_steps?: string[];
      edited_data?: Record<string, any>;
    }
  ): Promise<any> => {
    const response = await apiClient.post(
      `/flows/flows/${flowId}/review/${stepId}/approve-with-edits`,
      approvalData
    );
    return response.data;
  },

  // Get editable data for review
  getEditableData: async (flowId: number): Promise<any> => {
    const response = await apiClient.get(`/flows/flows/${flowId}/editable-data`);
    return response.data;
  },
};

export default flowApi;
