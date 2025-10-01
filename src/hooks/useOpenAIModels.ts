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
  fetchModelsWithApiKey: (apiKey: string) => Promise<OpenAIModel[]>;
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

  // Load cached models on mount (no automatic API calls)
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
    
    // If no valid cache, set static fallback models (no API call)
    if (!cacheLoaded) {
      const fallbackModels: OpenAIModel[] = [
        { id: 'gpt-4o', name: 'GPT-4o', is_default: false },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', is_default: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', is_default: false },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', is_default: false },
      ];
      setModels(fallbackModels);
    }
  }, []);

  const refreshModels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the updated API that returns models from database
      const models = await openaiApiService.getAvailableModels();
      
      if (Array.isArray(models) && models.length > 0) {
        setModels(models);
        
        // Cache the results
        const cacheData: CachedModels = {
          models,
          timestamp: Date.now()
        };
        localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(cacheData));
      } else {
        throw new Error('No models received from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching models:', err);
      
      // Use fallback models on error
      const fallbackModels: OpenAIModel[] = [
        { id: 'gpt-4o', name: 'GPT-4o', is_default: false },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', is_default: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', is_default: false },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', is_default: false },
      ];
      setModels(fallbackModels);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModelsWithApiKey = useCallback(async (apiKey: string): Promise<OpenAIModel[]> => {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is required');
    }

    setLoading(true);
    setError(null);

    try {
      const models = await openaiApiService.fetchModelsWithApiKey(apiKey);
      
      if (Array.isArray(models) && models.length > 0) {
        setModels(models);
        
        // Cache the models with a special key for this API key
        const cacheData: CachedModels = {
          models: models,
          timestamp: Date.now(),
        };
        localStorage.setItem(`${MODEL_CACHE_KEY}_${apiKey.slice(-8)}`, JSON.stringify(cacheData));
        
        return models;
      } else {
        throw new Error('No models returned from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching models with API key:', err);
      throw err;
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
    fetchModelsWithApiKey,
    getRecommendedModel,
    getModelOptions,
  };
};
