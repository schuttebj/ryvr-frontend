/**
 * Business API Service
 * Handles all business-level API operations for simplified structure
 */

import { API_BASE_URL, getAuthHeaders } from '../config/api';

const API_BASE = API_BASE_URL;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class BusinessApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('ryvr_token');
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error: any) {
      console.error(`Agency API Error (${endpoint}):`, error);
      return {
        error: error.message || 'Network error occurred',
        status: 0,
      };
    }
  }

  // =============================================================================
  // AGENCY MANAGEMENT
  // =============================================================================

  async getAgencies(params: { skip?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/v1/agencies${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getAgency(agencyId: number) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}`);
  }

  async updateAgency(agencyId: number, updateData: any) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getAgencyStats(agencyId: number) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/stats`);
  }

  // =============================================================================
  // BUSINESS MANAGEMENT
  // =============================================================================

  async getBusinesses(params: { agency_id?: number; skip?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    if (params.agency_id) queryParams.append('agency_id', params.agency_id.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/v1/businesses${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getBusiness(businessId: number) {
    return this.makeRequest(`/api/v1/businesses/${businessId}`);
  }

  async createBusiness(businessData: any) {
    return this.makeRequest('/api/v1/businesses', {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  async updateBusiness(businessId: number, updateData: any) {
    return this.makeRequest(`/api/v1/businesses/${businessId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getBusinessStats(businessId: number) {
    return this.makeRequest(`/api/v1/businesses/${businessId}/stats`);
  }

  // =============================================================================
  // WORKFLOW MANAGEMENT
  // =============================================================================

  async getWorkflowInstances(params: { 
    business_id?: number; 
    agency_id?: number;
    skip?: number; 
    limit?: number; 
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.business_id) queryParams.append('business_id', params.business_id.toString());
    if (params.agency_id) queryParams.append('agency_id', params.agency_id.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/v1/workflows/instances${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async createWorkflowInstance(instanceData: any) {
    return this.makeRequest('/api/v1/workflows/instances', {
      method: 'POST',
      body: JSON.stringify(instanceData),
    });
  }

  async getWorkflowExecutions(params: {
    business_id?: number;
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.business_id) queryParams.append('business_id', params.business_id.toString());
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/v1/workflows/executions${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // =============================================================================
  // INTEGRATION MANAGEMENT
  // =============================================================================

  async getAgencyIntegrations(agencyId: number) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/integrations`);
  }

  async createAgencyIntegration(agencyId: number, integrationData: any) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/integrations`, {
      method: 'POST',
      body: JSON.stringify(integrationData),
    });
  }

  async updateAgencyIntegration(agencyId: number, integrationId: number, updateData: any) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getBusinessIntegrations(businessId: number) {
    return this.makeRequest(`/api/v1/businesses/${businessId}/integrations`);
  }

  async createBusinessIntegration(businessId: number, integrationData: any) {
    return this.makeRequest(`/api/v1/businesses/${businessId}/integrations`, {
      method: 'POST',
      body: JSON.stringify(integrationData),
    });
  }

  // =============================================================================
  // TEAM MANAGEMENT
  // =============================================================================

  async getAgencyUsers(agencyId: number) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/users`);
  }

  async inviteAgencyUser(agencyId: number, inviteData: {
    email: string;
    role: string;
    permissions?: any;
  }) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/users/invite`, {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }

  async updateAgencyUserRole(agencyId: number, userId: number, roleData: {
    role: string;
    permissions?: any;
  }) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async removeAgencyUser(agencyId: number, userId: number) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // =============================================================================
  // CREDIT MANAGEMENT
  // =============================================================================

  async getAgencyCreditPool(agencyId: number) {
    return this.makeRequest(`/api/v1/agencies/${agencyId}/credits`);
  }

  async getBusinessCreditUsage(businessId: number, params: {
    start_date?: string;
    end_date?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = `/api/v1/businesses/${businessId}/credits/usage${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async allocateCredits(businessId: number, allocationData: {
    amount: number;
    reason?: string;
  }) {
    return this.makeRequest(`/api/v1/businesses/${businessId}/credits/allocate`, {
      method: 'POST',
      body: JSON.stringify(allocationData),
    });
  }

  // =============================================================================
  // ANALYTICS & REPORTING
  // =============================================================================

  async getAgencyAnalytics(agencyId: number, params: {
    start_date?: string;
    end_date?: string;
    metric?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.metric) queryParams.append('metric', params.metric);

    const endpoint = `/api/v1/agencies/${agencyId}/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getBusinessAnalytics(businessId: number, params: {
    start_date?: string;
    end_date?: string;
    metric?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.metric) queryParams.append('metric', params.metric);

    const endpoint = `/api/v1/businesses/${businessId}/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // =============================================================================
  // ONBOARDING MANAGEMENT
  // =============================================================================

  async getBusinessOnboarding(businessId: number) {
    return this.makeRequest(`/api/v1/businesses/${businessId}/onboarding`);
  }

  async updateBusinessOnboarding(businessId: number, onboardingData: any) {
    return this.makeRequest(`/api/v1/businesses/${businessId}/onboarding`, {
      method: 'PUT',
      body: JSON.stringify(onboardingData),
    });
  }

  async uploadBusinessAsset(businessId: number, assetData: FormData) {
    const token = localStorage.getItem('ryvr_token');
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/businesses/${businessId}/assets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: assetData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.message || 'File upload failed',
        status: 0,
      };
    }
  }
}

export const businessApi = new BusinessApiService();
export default businessApi;
