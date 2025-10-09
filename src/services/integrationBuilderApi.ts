// Integration Builder API Service
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ryvr_auth_token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
};

export interface OperationParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'select' | 'file';
  required: boolean;
  fixed: boolean;
  default?: any;
  description?: string;
  location: 'body' | 'query' | 'path' | 'header';
  options?: string[];
}

export interface OperationHeader {
  name: string;
  value: string;
  fixed: boolean;
}

export interface AsyncOperationConfig {
  task_endpoint: string;
  result_endpoint: string;
  polling_interval_seconds: number;
  max_polling_attempts: number;
  completion_field: string;
  completion_value: any;
  task_id_field: string;
}

export interface ResponseMapping {
  success_field?: string;
  success_value?: any;
  data_field?: string;
  error_field?: string;
}

export interface IntegrationOperation {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  category: string;
  base_credits: number;
  is_async: boolean;
  async_config?: AsyncOperationConfig;
  parameters: OperationParameter[];
  headers: OperationHeader[];
  response_mapping?: ResponseMapping;
}

export interface IntegrationBuilderCreate {
  name: string;
  provider: string;
  integration_type: 'system' | 'agency' | 'business';
  level: 'system' | 'agency' | 'business';
  is_system_wide: boolean;
  requires_user_config: boolean;
  platform_config: {
    name: string;
    base_url: string;
    auth_type: 'basic' | 'bearer' | 'api_key' | 'oauth2';
    color?: string;
    icon_url?: string;
    documentation_url?: string;
  };
  auth_config: {
    type: 'basic' | 'bearer' | 'api_key' | 'oauth2';
    credentials: Array<{
      name: string;
      type: string;
      required: boolean;
      fixed: boolean;
      description?: string;
    }>;
  };
  oauth_config?: {
    provider: string;
    auth_url: string;
    token_url: string;
    scopes: string[];
    client_id?: string;
    client_secret?: string;
  };
  operations: IntegrationOperation[];
}

export interface IntegrationParseRequest {
  platform_name: string;
  documentation: string;
  instructions?: string;
}

export const integrationBuilderApi = {
  // Create new integration
  async createIntegration(data: IntegrationBuilderCreate) {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/integrations/builder/create`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Update existing integration
  async updateIntegration(integrationId: number, data: Partial<IntegrationBuilderCreate>) {
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/integrations/builder/${integrationId}`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Parse API documentation with AI
  async parseDocumentation(data: IntegrationParseRequest) {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/integrations/builder/parse-docs`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Test an operation
  async testOperation(
    integrationId: number,
    operationId: string,
    testParameters: Record<string, any>,
    businessId?: number
  ) {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/integrations/builder/${integrationId}/operations/${operationId}/test`,
      {
        integration_id: integrationId,
        operation_id: operationId,
        test_parameters: testParameters,
        business_id: businessId,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  // Get all integrations
  async getIntegrations() {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/integrations/`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get integration by ID
  async getIntegration(integrationId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/integrations/${integrationId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get operations for an integration
  async getIntegrationOperations(integrationId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/integrations/${integrationId}/operations`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Delete integration
  async deleteIntegration(integrationId: number) {
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/integrations/${integrationId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // OAuth methods
  async startOAuthFlow(integrationId: number, businessId: number, redirectUri: string) {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/integrations/oauth/authorize/${integrationId}`,
      {
        params: { business_id: businessId, redirect_uri: redirectUri },
        ...getAuthHeaders(),
      }
    );
    return response.data;
  },

  async disconnectOAuth(businessId: number, integrationId: number) {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/integrations/business/${businessId}/oauth/disconnect/${integrationId}`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },
};

