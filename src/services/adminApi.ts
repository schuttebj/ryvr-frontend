/**
 * Admin API Service
 * Handles all admin-level API operations
 */

import { getAuthToken, handleAuthError, debugAuthState, getTokenInfo } from '../utils/auth';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class AdminApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = getAuthToken();
      
      // Debug auth state on first request
      if (endpoint.includes('dashboard') || endpoint.includes('users')) {
        debugAuthState();
        if (token) {
          const tokenInfo = getTokenInfo(token);
          console.log(`🔐 Admin API Request: ${endpoint}`, { tokenInfo });
        }
      }
      
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
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          handleAuthError(endpoint, response.status);
        }
        
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
      console.error(`Admin API Error (${endpoint}):`, error);
      return {
        error: error.message || 'Network error occurred',
        status: 0,
      };
    }
  }

  // =============================================================================
  // DEBUG & TESTING
  // =============================================================================

  async debugAuth() {
    const token = getAuthToken();
    if (!token) {
      return { error: 'No token found' };
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      return {
        status: response.status,
        ok: response.ok,
        data,
        tokenInfo: getTokenInfo(token)
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // =============================================================================
  // DASHBOARD & OVERVIEW
  // =============================================================================

  async getDashboardStats() {
    return this.makeRequest('/api/v1/admin/dashboard');
  }

  async getSystemHealth() {
    return this.makeRequest('/api/v1/admin/health');
  }

  async getSystemConfig() {
    return this.makeRequest('/api/v1/admin/config');
  }

  async updateSystemConfig(config: any) {
    return this.makeRequest('/api/v1/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================

  async getUsers(params: { skip?: number; limit?: number; role?: string } = {}) {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);

    const endpoint = `/api/v1/admin/users${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async updateUserStatus(userId: number, status: 'activate' | 'deactivate') {
    return this.makeRequest(`/api/v1/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: status }),
    });
  }

  async createUser(userData: any) {
    return this.makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // =============================================================================
  // SUBSCRIPTION TIER MANAGEMENT
  // =============================================================================

  async getSubscriptionTiers() {
    return this.makeRequest('/api/v1/admin/tiers');
  }

  async createSubscriptionTier(tierData: any) {
    return this.makeRequest('/api/v1/admin/tiers', {
      method: 'POST',
      body: JSON.stringify(tierData),
    });
  }

  async updateSubscriptionTier(tierId: number, tierData: any) {
    return this.makeRequest(`/api/v1/admin/tiers/${tierId}`, {
      method: 'PUT',
      body: JSON.stringify(tierData),
    });
  }

  // =============================================================================
  // INTEGRATION MANAGEMENT
  // =============================================================================

  async getIntegrations() {
    return this.makeRequest('/api/v1/admin/integrations');
  }

  async getIntegrationUsage(days: number = 30) {
    return this.makeRequest(`/api/v1/admin/integrations/usage?days=${days}`);
  }

  async createIntegration(integrationData: any) {
    return this.makeRequest('/api/v1/admin/integrations', {
      method: 'POST',
      body: JSON.stringify(integrationData),
    });
  }

  // =============================================================================
  // WORKFLOW TEMPLATE MANAGEMENT
  // =============================================================================

  async getWorkflowTemplates(params: { status?: string; skip?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/v1/admin/workflow-templates${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async updateWorkflowTemplateStatus(templateId: number, status: string) {
    return this.makeRequest(`/api/v1/admin/workflow-templates/${templateId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // =============================================================================
  // CREDIT MANAGEMENT
  // =============================================================================

  async getCreditOverview() {
    return this.makeRequest('/api/v1/admin/credits/overview');
  }

  async grantCredits(grantData: {
    owner_type: 'agency' | 'business';
    owner_id: number;
    amount: number;
    reason?: string;
  }) {
    return this.makeRequest('/api/v1/admin/credits/grant', {
      method: 'POST',
      body: JSON.stringify(grantData),
    });
  }

  // =============================================================================
  // DATABASE MANAGEMENT
  // =============================================================================

  async getDatabaseStatus() {
    return this.makeRequest('/api/v1/admin/database/status');
  }

  async resetDatabase(confirm: boolean = false) {
    return this.makeRequest(`/api/v1/admin/database/reset?confirm=${confirm}`, {
      method: 'POST',
    });
  }

  async initializeDatabase() {
    return this.makeRequest('/api/v1/admin/database/initialize', {
      method: 'POST',
    });
  }

  async migrateDatabase() {
    return this.makeRequest('/api/v1/admin/database/migrate', {
      method: 'POST',
    });
  }

  // =============================================================================
  // EMERGENCY OPERATIONS
  // =============================================================================

  async emergencyReset() {
    return this.makeRequest('/api/v1/admin/emergency-reset', {
      method: 'POST',
    });
  }

  async fullReset() {
    return this.makeRequest('/api/v1/admin/full-reset', {
      method: 'POST',
    });
  }

  async bootstrapSystem() {
    return this.makeRequest('/api/v1/admin/bootstrap', {
      method: 'POST',
    });
  }

  async debugModels() {
    return this.makeRequest('/api/v1/admin/debug-models');
  }

  // =============================================================================
  // ANALYTICS & REPORTING
  // =============================================================================

  async getSystemAnalytics(params: { 
    start_date?: string; 
    end_date?: string; 
    metric?: string; 
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.metric) queryParams.append('metric', params.metric);

    const endpoint = `/api/v1/admin/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // =============================================================================
  // AGENCIES & BUSINESSES (Admin View)
  // =============================================================================

  async getAllAgencies(params: { skip?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/v1/agencies/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getAllBusinesses(params: { agency_id?: number; skip?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    if (params.agency_id) queryParams.append('agency_id', params.agency_id.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/v1/businesses/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.makeRequest(endpoint);
  }
}

export const adminApi = new AdminApiService();
export default adminApi;
