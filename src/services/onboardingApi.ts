import { API_BASE_URL, getAuthHeaders } from '../config/api';
import type { OnboardingTemplate, OnboardingResponseCreate, OnboardingResponse } from '../types/onboarding';

export const onboardingApi = {
  /**
   * Get default onboarding template for business
   */
  async getBusinessOnboardingTemplate(token?: string): Promise<OnboardingTemplate> {
    const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' };
    
    const response = await fetch(
      `${API_BASE_URL}/businesses/onboarding/default`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch onboarding template: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get onboarding template for a specific business
   */
  async getBusinessTemplate(businessId: number, token: string): Promise<OnboardingTemplate> {
    const response = await fetch(
      `${API_BASE_URL}/businesses/${businessId}/onboarding`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch onboarding template: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Submit onboarding responses for a business
   */
  async submitOnboarding(
    businessId: number,
    responses: OnboardingResponseCreate[],
    token: string
  ): Promise<OnboardingResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/businesses/${businessId}/onboarding`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(responses),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to submit onboarding: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get onboarding responses for a business
   */
  async getOnboardingResponses(businessId: number, token: string): Promise<OnboardingResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/businesses/${businessId}/onboarding/responses`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch onboarding responses: ${response.statusText}`);
    }

    return response.json();
  },
};

