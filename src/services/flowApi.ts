/**
 * Flow Management API Service
 * 
 * Handles all API interactions for the Flow Management system
 * (Kanban-style interface for workflow executions)
 */

import api from './api';
import { 
  FlowCard, 
  CreateFlowRequest, 
  UpdateFlowRequest, 
  ApproveReviewRequest,
  FlowBusinessContext 
} from '../types/workflow';

const API_BASE = '/api/v1';

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
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.skip !== undefined) params.append('skip', options.skip.toString());
    if (options.limit !== undefined) params.append('limit', options.limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`${API_BASE}/flows/businesses/${businessId}/flows${query}`);
    return response.data;
  }
  
  /**
   * Create a new flow from a template
   */
  static async createFlow(businessId: number, flowRequest: CreateFlowRequest): Promise<{
    flow_id: number;
    status: string;
    message: string;
  }> {
    const response = await api.post(`${API_BASE}/flows/businesses/${businessId}/flows`, flowRequest);
    return response.data;
  }
  
  /**
   * Update flow properties
   */
  static async updateFlow(flowId: number, updateRequest: UpdateFlowRequest): Promise<{
    message: string;
  }> {
    const response = await api.patch(`${API_BASE}/flows/flows/${flowId}`, updateRequest);
    return response.data;
  }
  
  /**
   * Start a flow execution
   */
  static async startFlow(flowId: number): Promise<{
    message: string;
  }> {
    const response = await api.post(`${API_BASE}/flows/flows/${flowId}/start`);
    return response.data;
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
    const response = await api.post(
      `${API_BASE}/flows/flows/${flowId}/reviews/${stepId}/approve`,
      approvalRequest
    );
    return response.data;
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
    
    const response = await api.get(`${API_BASE}/flows/templates${query}`);
    return response.data;
  }
  
  /**
   * Get template preview (simplified view for users)
   */
  static async getTemplatePreview(templateId: number): Promise<TemplatePreviewResponse> {
    const response = await api.get(`${API_BASE}/flows/templates/${templateId}/preview`);
    return response.data;
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
      const response = await api.get('/api/v1/businesses/my-businesses');
      
      // Transform to FlowBusinessContext format
      const businesses: FlowBusinessContext[] = response.data.businesses.map((business: any) => ({
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
