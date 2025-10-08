/**
 * Flow Management API Service
 * 
 * Handles all API interactions for the Flow Management system
 * (Kanban-style interface for workflow executions)
 */

import { getAuthToken, handleAuthError } from '../utils/auth';
import { 
  FlowCard, 
  CreateFlowRequest, 
  UpdateFlowRequest, 
  ApproveReviewRequest,
  FlowBusinessContext 
} from '../types/workflow';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com';
const API_BASE = `${API_BASE_URL}/api/v1`;

export interface FlowListResponse {
  flows: FlowCard[];
  total: number;
  skip: number;
  limit: number;
}

export interface FlowTemplateResponse {
  id: number;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  icon?: string;
  credit_cost: number;
  estimated_duration?: number;
  editable_fields: Array<{
    step_id: string;
    path: string;
    label: string;
    type: string;
    description?: string;
    default_value?: any;
    options?: Array<{
      label: string;
      value: any;
    }>;
  }>;
  step_count: number;
  created_at: string;
}

export interface TemplatePreviewResponse {
  template: {
    id: number;
    name: string;
    description?: string;
    category: string;
    credit_cost: number;
    estimated_duration?: number;
  };
  steps: Array<{
    order: number;
    name: string;
    description: string;
    is_review: boolean;
    is_editable: boolean;
  }>;
  total_steps: number;
  has_reviews: boolean;
  has_editable_fields: boolean;
}

export class FlowApiService {
  
  // =============================================================================
  // FLOW MANAGEMENT
  // =============================================================================
  
  /**
   * Get all flows for a business
   */
  static async getFlows(
    businessId: number,
    options: {
      status?: string;
      skip?: number;
      limit?: number;
    } = {}
  ): Promise<FlowListResponse> {
    // Validate businessId is a number
    if (!businessId || isNaN(businessId) || businessId <= 0) {
      throw new Error(`Invalid business ID: ${businessId}. Must be a positive number.`);
    }
    
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.skip !== undefined) params.append('skip', options.skip.toString());
    if (options.limit !== undefined) params.append('limit', options.limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    
    try {
      const response = await fetch(`${API_BASE}/flows/businesses/${businessId}/flows${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(`/flows/businesses/${businessId}/flows${query}`, response.status);
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching flows:', error);
      throw error;
    }
  }
  
  /**
   * Create a new flow from a template
   */
  static async createFlow(businessId: number, flowRequest: CreateFlowRequest): Promise<{
    flow_id: number;
    status: string;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE}/flows/businesses/${businessId}/flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(flowRequest),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(`/flows/businesses/${businessId}/flows`, response.status);
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating flow:', error);
      throw error;
    }
  }
  
  /**
   * Update flow properties
   */
  static async updateFlow(flowId: number, updateRequest: UpdateFlowRequest): Promise<{
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE}/flows/flows/${flowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(updateRequest),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(`/flows/flows/${flowId}`, response.status);
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating flow:', error);
      throw error;
    }
  }
  
  /**
   * Start a flow execution
   */
  static async startFlow(flowId: number): Promise<{
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE}/flows/flows/${flowId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(`/flows/flows/${flowId}/start`, response.status);
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error starting flow:', error);
      throw error;
    }
  }
  
  /**
   * Approve a review step
   */
  static async approveReview(
    flowId: number, 
    stepId: string, 
    approvalRequest: ApproveReviewRequest
  ): Promise<{
    message: string;
  }> {
    try {
      const response = await fetch(
        `${API_BASE}/flows/flows/${flowId}/reviews/${stepId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(approvalRequest),
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(`/flows/flows/${flowId}/reviews/${stepId}/approve`, response.status);
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  }
  
  // =============================================================================
  // TEMPLATES
  // =============================================================================
  
  /**
   * Get published workflow templates for flow creation
   */
  static async getPublishedTemplates(options: {
    category?: string;
    tags?: string;
    businessId?: number;
  } = {}): Promise<{
    templates: FlowTemplateResponse[];
  }> {
    const params = new URLSearchParams();
    if (options.category) params.append('category', options.category);
    if (options.tags) params.append('tags', options.tags);
    if (options.businessId) params.append('business_id', options.businessId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    
    try {
      const response = await fetch(`${API_BASE}/flows/templates${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(`/flows/templates${query}`, response.status);
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }
  
  /**
   * Get template preview (simplified view for users)
   */
  static async getTemplatePreview(templateId: number): Promise<TemplatePreviewResponse> {
    try {
      const response = await fetch(`${API_BASE}/flows/templates/${templateId}/preview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(`/flows/templates/${templateId}/preview`, response.status);
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching template preview:', error);
      throw error;
    }
  }
  
  // =============================================================================
  // BUSINESS CONTEXT
  // =============================================================================
  
  /**
   * Get available businesses for flow management
   * (Uses existing business API)
   */
  static async getAvailableBusinesses(): Promise<FlowBusinessContext[]> {
    try {
      // Use existing business API endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/businesses/my-businesses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(`/api/v1/businesses/my-businesses`, response.status);
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform to FlowBusinessContext format
      const businesses: FlowBusinessContext[] = data.businesses.map((business: any) => ({
        id: business.id,
        name: business.name,
        agency_id: business.agency_id,
        active_flows_count: 0, // TODO: Add to API response
        credits_remaining: business.credits_remaining || 0,
        tier: business.tier || 'basic'
      }));
      
      return businesses;
    } catch (error) {
      console.error('Error fetching available businesses:', error);
      return [];
    }
  }
  
  // =============================================================================
  // UTILITIES
  // =============================================================================
  
  /**
   * Get flow status display information
   */
  static getFlowStatusInfo(status: string): {
    label: string;
    color: string;
    description: string;
  } {
    const statusMap: Record<string, any> = {
      new: {
        label: 'New',
        color: '#6b7280',
        description: 'Flow created but not yet started'
      },
      scheduled: {
        label: 'Scheduled',
        color: '#f59e0b',
        description: 'Flow scheduled to run at a specific time'
      },
      in_progress: {
        label: 'In Progress',
        color: '#3b82f6',
        description: 'Flow is currently executing'
      },
      in_review: {
        label: 'In Review',
        color: '#8b5cf6',
        description: 'Flow paused for review and approval'
      },
      complete: {
        label: 'Complete',
        color: '#10b981',
        description: 'Flow completed successfully'
      },
      error: {
        label: 'Error',
        color: '#ef4444',
        description: 'Flow encountered an error'
      }
    };
    
    return statusMap[status] || {
      label: 'Unknown',
      color: '#6b7280',
      description: 'Unknown status'
    };
  }
  
  /**
   * Calculate flow progress percentage
   */
  static calculateProgress(completedSteps: number, totalSteps: number): number {
    if (totalSteps === 0) return 0;
    return Math.round((completedSteps / totalSteps) * 100);
  }
  
  // =============================================================================
  // OPTIONS SELECTION
  // =============================================================================
  
  /**
   * Submit options selection for a flow waiting for input
   */
  static async submitOptionsSelection(
    flowId: number,
    stepId: string,
    selection: { selected_options: any[]; selection_metadata?: Record<string, any> }
  ): Promise<any> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/flows/flows/${flowId}/select-options?step_id=${stepId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(selection),
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError(`/flows/flows/${flowId}/select-options`, response.status);
        }
        const error = await response.json();
        throw new Error(error.detail || 'Failed to submit options selection');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error submitting options selection:', error);
      throw error;
    }
  }
  
  /**
   * Get available options for a flow waiting for selection
   */
  static async getFlowOptionsData(flowId: number, stepId: string): Promise<any> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/flows/flows/${flowId}/options/${stepId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError(`/flows/flows/${flowId}/options/${stepId}`, response.status);
        }
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get flow options');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error getting flow options:', error);
      throw error;
    }
  }
  
  // =============================================================================
  // REVIEW WITH EDITS
  // =============================================================================
  
  /**
   * Approve or reject review with optional edits to previous steps
   */
  static async approveReviewWithEdits(
    flowId: number,
    stepId: string,
    approval: {
      approved: boolean;
      comments?: string;
      edited_steps?: string[];
      edited_data?: Record<string, any>;
      rerun_steps?: string[];
    }
  ): Promise<any> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/flows/flows/${flowId}/review/${stepId}/approve-with-edits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(approval),
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError(`/flows/flows/${flowId}/review/${stepId}/approve-with-edits`, response.status);
        }
        const error = await response.json();
        throw new Error(error.detail || 'Failed to process review');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error processing review:', error);
      throw error;
    }
  }
  
  /**
   * Get editable data from previous steps for review editing
   */
  static async getEditableData(flowId: number): Promise<{
    success: boolean;
    flow_id: number;
    editable_steps: Array<{
      step_id: string;
      step_name: string;
      step_type: string;
      output_data: any;
      input_data: any;
      editable_fields: string[];
    }>;
    runtime_state: Record<string, any>;
  }> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/flows/flows/${flowId}/editable-data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthError(`/flows/flows/${flowId}/editable-data`, response.status);
        }
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get editable data');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error getting editable data:', error);
      throw error;
    }
  }
  
  /**
   * Format duration for display
   */
  static formatDuration(minutes?: number): string {
    if (!minutes) return 'Unknown';
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }
  
  /**
   * Format credit cost for display
   */
  static formatCredits(credits: number): string {
    if (credits === 0) return 'Free';
    if (credits === 1) return '1 credit';
    return `${credits} credits`;
  }
}

export default FlowApiService;
