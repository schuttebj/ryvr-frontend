/**
 * System Integration API Service
 * Handles admin system integration management
 */

import { getAuthToken } from '../utils/auth';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com';

export interface SystemIntegrationStatus {
  integration_id: number;
  is_system_integration: boolean;
  system_integration_id?: number;
  has_credentials: boolean;
}

export interface SystemIntegrationToggleResponse {
  success: boolean;
  action: 'enabled' | 'disabled';
  message: string;
  is_system_integration: boolean;
  system_integration_id?: number;
}

export interface ModelRefreshResult {
  success: boolean;
  models_added: number;
  models_updated: number;
  total_models: number;
  refreshed_at: string;
  error?: string;
}

/**
 * Helper function to make authenticated API requests
 */
async function makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`System Integration API request failed:`, {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get system integration status for an integration
 */
export const getSystemIntegrationStatus = async (integrationId: number): Promise<SystemIntegrationStatus> => {
  return await makeRequest<SystemIntegrationStatus>(`/api/v1/integrations/${integrationId}/system-status`);
};

/**
 * Toggle system integration status
 */
export const toggleSystemIntegration = async (
  integrationId: number,
  credentials: Record<string, any> = {},
  customConfig: Record<string, any> = {}
): Promise<SystemIntegrationToggleResponse> => {
  return await makeRequest<SystemIntegrationToggleResponse>(
    `/api/v1/integrations/${integrationId}/toggle-system`,
    'POST',
    {
      credentials,
      custom_config: customConfig
    }
  );
};

/**
 * Configure OpenAI system integration with API key
 */
export const configureOpenAISystemIntegration = async (
  integrationId: number,
  apiKey: string,
  model: string = 'gpt-4o-mini',
  maxTokens: number = 2000
): Promise<SystemIntegrationToggleResponse> => {
  return await toggleSystemIntegration(
    integrationId,
    { api_key: apiKey },
    { model, max_tokens: maxTokens }
  );
};

/**
 * Get all system integrations
 */
export const getSystemIntegrations = async (): Promise<any[]> => {
  return await makeRequest<any[]>('/api/v1/integrations/system');
};

/**
 * Get all database integrations (for system integration management)
 */
export const getDatabaseIntegrations = async (): Promise<any[]> => {
  return await makeRequest<any[]>('/api/v1/integrations/');
};

// Model management functions
export const refreshOpenAIModels = async (apiKey?: string): Promise<ModelRefreshResult> => {
  return await makeRequest<ModelRefreshResult>('/api/v1/ai/models/refresh', 'POST', { api_key: apiKey });
};

export const setDefaultModel = async (modelId: string) => {
  return await makeRequest(`/api/v1/ai/models/${modelId}/set-default`, 'PUT');
};

export const getDefaultModel = async () => {
  return await makeRequest('/api/v1/ai/models/default');
};

export const getAvailableModels = async () => {
  return await makeRequest('/api/v1/ai/models/available');
};
