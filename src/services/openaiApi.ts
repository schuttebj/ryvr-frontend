/**
 * OpenAI API Service for frontend
 * Handles communication with backend OpenAI endpoints
 */

import { getAuthToken } from '../utils/auth';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com';

export interface OpenAIModel {
  id: string;
  name?: string;
  created?: number;
  owned_by?: string;
  is_default?: boolean;
  description?: string;
  cost_per_1k_tokens?: number;
  max_tokens?: number;
}

export type ModelsResponse = OpenAIModel[];

export interface RecommendedModelResponse {
  success: boolean;
  recommended_model: string;
  task_type: string;
}

export interface ContentGenerationRequest {
  prompt: string;
  model?: string;
  max_completion_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  system_message?: string;
  response_format?: { type: string };
}

export interface ContentGenerationResponse {
  provider: string;
  task_type: string;
  timestamp: string;
  status: string;
  credits_used: number;
  model: string;
  data: {
    content: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    finish_reason: string;
  };
}

class OpenAIApiService {
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API request failed:`, {
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
   * Get available OpenAI models (from database)
   */
  async getAvailableModels(): Promise<ModelsResponse> {
    try {
      return await this.makeRequest<ModelsResponse>('/ai/models/available');
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      // Return fallback models if API fails
      return [
        { id: 'gpt-4o', name: 'GPT-4o', is_default: false },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', is_default: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', is_default: false },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', is_default: false },
      ];
    }
  }

  /**
   * Fetch models using a specific API key
   */
  async fetchModelsWithApiKey(apiKey: string): Promise<ModelsResponse> {
    try {
      return await this.makeRequest<ModelsResponse>('/ai/models/fetch-with-key', 'POST', { api_key: apiKey });
    } catch (error) {
      console.error('Failed to fetch models with API key:', error);
      throw error;
    }
  }

  /**
   * Get recommended model for a task type
   */
  async getRecommendedModel(taskType: string = 'general'): Promise<RecommendedModelResponse> {
    try {
      return await this.makeRequest<RecommendedModelResponse>(
        `/ai/models/recommended?task_type=${encodeURIComponent(taskType)}`
      );
    } catch (error) {
      console.error('Failed to get recommended model:', error);
      return {
        success: false,
        recommended_model: 'gpt-4o-mini',
        task_type: taskType,
      };
    }
  }

  /**
   * Generate content using OpenAI
   */
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    return await this.makeRequest<ContentGenerationResponse>('/ai/content/generate', 'POST', request);
  }

  /**
   * Generate SEO content
   */
  async generateSEOContent(params: {
    keyword: string;
    content_type?: string;
    tone?: string;
    length?: number;
    target_audience?: string;
  }): Promise<ContentGenerationResponse> {
    return await this.makeRequest<ContentGenerationResponse>('/ai/content/seo', 'POST', params);
  }

  /**
   * Analyze content
   */
  async analyzeContent(params: {
    content: string;
    keyword: string;
    analysis_type?: string;
  }): Promise<ContentGenerationResponse> {
    return await this.makeRequest<ContentGenerationResponse>('/ai/content/analyze', 'POST', params);
  }

  /**
   * Generate keywords
   */
  async generateKeywords(params: {
    topic: string;
    industry?: string;
    keyword_type?: string;
    count?: number;
  }): Promise<ContentGenerationResponse> {
    return await this.makeRequest<ContentGenerationResponse>('/ai/keywords/generate', 'POST', params);
  }

  /**
   * Generate ad copy
   */
  async generateAdCopy(params: {
    product: string;
    platform?: string;
    campaign_type?: string;
    target_audience?: string;
  }): Promise<ContentGenerationResponse> {
    return await this.makeRequest<ContentGenerationResponse>('/ai/ads/generate', 'POST', params);
  }

  /**
   * Generate email sequence
   */
  async generateEmailSequence(params: {
    topic: string;
    sequence_type?: string;
    email_count?: number;
    tone?: string;
  }): Promise<ContentGenerationResponse> {
    return await this.makeRequest<ContentGenerationResponse>('/ai/email/sequence', 'POST', params);
  }

  /**
   * Batch generate content
   */
  async batchGenerate(params: {
    prompts: string[];
    model?: string;
    max_completion_tokens?: number;
    temperature?: number;
  }): Promise<ContentGenerationResponse[]> {
    return await this.makeRequest<ContentGenerationResponse[]>('/ai/batch/generate', 'POST', params);
  }
}

// Export singleton instance
export const openaiApiService = new OpenAIApiService();
