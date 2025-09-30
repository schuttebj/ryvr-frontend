/**
 * System Integration API Service
 * Handles admin system integration management
 */

import { apiRequest } from './api';

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

/**
 * Get system integration status for an integration
 */
export const getSystemIntegrationStatus = async (integrationId: number): Promise<SystemIntegrationStatus> => {
  const response = await apiRequest(`/api/v1/integrations/${integrationId}/system-status`);
  return response;
};

/**
 * Toggle system integration status
 */
export const toggleSystemIntegration = async (
  integrationId: number,
  credentials: Record<string, any> = {},
  customConfig: Record<string, any> = {}
): Promise<SystemIntegrationToggleResponse> => {
  const response = await apiRequest(`/api/v1/integrations/${integrationId}/toggle-system`, {
    method: 'POST',
    body: JSON.stringify({
      credentials,
      custom_config: customConfig
    })
  });
  return response;
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
  const response = await apiRequest('/api/v1/integrations/system');
  return response;
};
