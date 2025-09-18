// API service for connecting to FastAPI backend
const API_BASE_URL = (typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://ryvr-backend.onrender.com'
  : 'https://ryvr-backend.onrender.com');

interface User {
  id: number;
  email: string;
  username: string;
  role: string; // admin, agency_owner, agency_manager, agency_viewer, individual_user, business_owner, business_user
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  email_verified?: boolean;
  is_active?: boolean;
  is_admin?: boolean; // legacy field for backward compatibility
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
  expires_in: number;
}

interface ApiError {
  detail: string;
  status_code: number;
}

// Create axios-like interface with fetch
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('ryvr_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('ryvr_token', token);
      } else {
        localStorage.removeItem('ryvr_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          detail: 'An error occurred', 
          status_code: response.status 
        }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        detail: 'Login failed' 
      }));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();

    return data;
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/api/v1/auth/me');
  }

  async refreshToken(): Promise<LoginResponse> {
    return this.post<LoginResponse>('/api/v1/auth/refresh');
  }

  // Workflow methods
  async getWorkflows(): Promise<any[]> {
    return this.get<any[]>('/api/workflows');
  }

  async getWorkflow(id: string): Promise<any> {
    return this.get<any>(`/api/workflows/${id}`);
  }

  async saveWorkflow(workflow: any): Promise<any> {
    if (workflow.id) {
      return this.put<any>(`/api/workflows/${workflow.id}`, workflow);
    } else {
      return this.post<any>('/api/workflows', workflow);
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.delete<void>(`/api/workflows/${id}`);
  }

  // Integration methods
  async getIntegrations(): Promise<any[]> {
    return this.get<any[]>('/api/integrations');
  }

  async saveIntegration(integration: any): Promise<any> {
    if (integration.id) {
      return this.put<any>(`/api/integrations/${integration.id}`, integration);
    } else {
      return this.post<any>('/api/integrations', integration);
    }
  }

  async deleteIntegration(id: string): Promise<void> {
    return this.delete<void>(`/api/integrations/${id}`);
  }

  // Business/Client methods
  async getClients(): Promise<any[]> {
    return this.get<any[]>('/api/clients');
  }

  async getClient(id: string): Promise<any> {
    return this.get<any>(`/api/clients/${id}`);
  }

  async saveClient(client: any): Promise<any> {
    if (client.id) {
      return this.put<any>(`/api/clients/${client.id}`, client);
    } else {
      return this.post<any>('/api/clients', client);
    }
  }

  async deleteClient(id: string): Promise<void> {
    return this.delete<void>(`/api/clients/${id}`);
  }

  // Analytics methods
  async getAnalytics(timeframe?: string): Promise<any> {
    const params = timeframe ? `?timeframe=${timeframe}` : '';

    return this.get<any>(`/api/analytics${params}`);
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { User, LoginRequest, LoginResponse, ApiError };
