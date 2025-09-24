/**
 * Hook for managing OpenAI models
 * Provides dynamic model fetching and caching
 */

import { useState, useEffect, useCallback } from 'react';
import { openaiApiService, OpenAIModel } from '../services/openaiApi';

export interface UseOpenAIModelsResult {
  models: OpenAIModel[];
  loading: boolean;
  error: string | null;
  recommendedModel: string | null;
  refreshModels: () => Promise<void>;
  getRecommendedModel: (taskType?: string) => Promise<string>;
  getModelOptions: () => Array<{ value: string; label: string; description?: string }>;
}

const MODEL_CACHE_KEY = 'openai_models_cache';
const MODEL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedModels {
  models: OpenAIModel[];
  timestamp: number;
}

export const useOpenAIModels = (): UseOpenAIModelsResult => {
  const [models, setModels] = useState<OpenAIModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedModel, setRecommendedModel] = useState<string | null>(null);

  // Load cached models on mount
  useEffect(() => {
    const loadCachedModels = () => {
      try {
        const cached = localStorage.getItem(MODEL_CACHE_KEY);
        if (cached) {
          const parsedCache: CachedModels = JSON.parse(cached);
          const now = Date.now();
          
          // Check if cache is still valid
          if (now - parsedCache.timestamp < MODEL_CACHE_DURATION) {
            setModels(parsedCache.models);
            return true;
          }
        }
      } catch (error) {
        console.error('Failed to load cached models:', error);
      }
      return false;
    };

    const cacheLoaded = loadCachedModels();
    
    // If no valid cache, fetch fresh models
    if (!cacheLoaded) {
      refreshModels();
    }
  }, []);

  const refreshModels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await openaiApiService.getAvailableModels();
      
      if (response.success && response.models) {
        setModels(response.models);
        
        // Cache the models
        const cacheData: CachedModels = {
          models: response.models,
          timestamp: Date.now(),
        };
        localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(cacheData));
      } else {
        throw new Error('Failed to fetch models from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching models:', err);
      
      // Use fallback models on error
      const fallbackModels: OpenAIModel[] = [
        { id: 'gpt-4o', created: 0, owned_by: 'openai' },
        { id: 'gpt-4o-mini', created: 0, owned_by: 'openai' },
        { id: 'gpt-4-turbo', created: 0, owned_by: 'openai' },
        { id: 'gpt-3.5-turbo', created: 0, owned_by: 'openai' },
      ];
      setModels(fallbackModels);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecommendedModel = useCallback(async (taskType: string = 'general'): Promise<string> => {
    try {
      const response = await openaiApiService.getRecommendedModel(taskType);
      
      if (response.success && response.recommended_model) {
        setRecommendedModel(response.recommended_model);
        return response.recommended_model;
      }
    } catch (error) {
      console.error('Failed to get recommended model:', error);
    }
    
    // Fallback to first available model or default
    return models.length > 0 ? models[0].id : 'gpt-4o-mini';
  }, [models]);

  const getModelOptions = useCallback(() => {
    const modelDescriptions: Record<string, string> = {
      'gpt-4o': 'Latest GPT-4 model (most capable)',
      'gpt-4o-mini': 'Faster, cost-effective GPT-4 (recommended)',
      'gpt-4-turbo': 'Previous generation GPT-4',
      'gpt-3.5-turbo': 'Fast and economical',
    };

    return models.map(model => ({
      value: model.id,
      label: model.id,
      description: modelDescriptions[model.id] || 'OpenAI model',
    }));
  }, [models]);

  return {
    models,
    loading,
    error,
    recommendedModel,
    refreshModels,
    getRecommendedModel,
    getModelOptions,
  };
};
