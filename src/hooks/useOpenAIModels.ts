/**
 * Hook for managing OpenAI models
 * Uses stored models from database (System Settings)
 */

import { useState, useEffect, useCallback } from 'react';
import { openaiApiService, OpenAIModel } from '../services/openaiApi';
import { getAvailableModels, refreshOpenAIModels } from '../services/systemIntegrationApi';

export interface UseOpenAIModelsResult {
  models: OpenAIModel[];
  loading: boolean;
  error: string | null;
  recommendedModel: string | null;
  refreshModels: (apiKey?: string) => Promise<void>;
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

  // Load stored models on mount
  useEffect(() => {
    const loadStoredModels = async () => {
      try {
        // First try to get from cache
        const cached = localStorage.getItem(MODEL_CACHE_KEY);
        if (cached) {
          const parsedCache: CachedModels = JSON.parse(cached);
          const now = Date.now();
          
          // Check if cache is still valid
          if (now - parsedCache.timestamp < MODEL_CACHE_DURATION) {
            setModels(parsedCache.models);
            return;
          }
        }
        
        // If no valid cache, fetch from database
        console.log('🔄 Loading models from database...');
        const storedModels = await getAvailableModels();
        
        if (Array.isArray(storedModels) && storedModels.length > 0) {
          // Transform to expected format
          const transformedModels = storedModels.map(model => ({
            id: model.id,
            name: model.name || model.id,
            is_default: model.is_default || false,
            description: model.description,
            cost_per_1k_tokens: model.cost_per_1k_tokens,
            max_tokens: model.max_tokens,
          }));
          
          setModels(transformedModels);
          
          // Cache the results
          const cacheData: CachedModels = {
            models: transformedModels,
            timestamp: Date.now()
          };
          localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(cacheData));
          console.log('✅ Loaded', transformedModels.length, 'models from database');
        } else {
          // Use fallback models if database is empty
          console.warn('⚠️ No models in database, using fallback models');
          const fallbackModels: OpenAIModel[] = [
            { id: 'gpt-4o', name: 'GPT-4o', is_default: false },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', is_default: true },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', is_default: false },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', is_default: false },
          ];
          setModels(fallbackModels);
        }
      } catch (error) {
        console.error('❌ Failed to load stored models:', error);
        // Use fallback models on error
        const fallbackModels: OpenAIModel[] = [
          { id: 'gpt-4o', name: 'GPT-4o', is_default: false },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', is_default: true },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', is_default: false },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', is_default: false },
        ];
        setModels(fallbackModels);
      }
    };

    loadStoredModels();
  }, []);

  // Refresh models using the new system endpoint
  const refreshModels = useCallback(async (apiKey?: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Refreshing models from OpenAI API...');
      // Call the new refresh endpoint that updates the database
      const result = await refreshOpenAIModels(apiKey);
      
      if (result.success) {
        console.log('✅ Models refreshed:', result);
        
        // Reload from database to get the updated list
        const storedModels = await getAvailableModels();
        
        if (Array.isArray(storedModels) && storedModels.length > 0) {
          const transformedModels = storedModels.map(model => ({
            id: model.id,
            name: model.name || model.id,
            is_default: model.is_default || false,
            description: model.description,
            cost_per_1k_tokens: model.cost_per_1k_tokens,
            max_tokens: model.max_tokens,
          }));
          
          setModels(transformedModels);
          
          // Cache the results
          const cacheData: CachedModels = {
            models: transformedModels,
            timestamp: Date.now()
          };
          localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(cacheData));
        }
      } else {
        throw new Error(result.error || 'Failed to refresh models');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Error refreshing models:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch models with API key - now calls the refresh endpoint instead of direct fetch
  const fetchModelsWithApiKey = useCallback(async (apiKey: string): Promise<OpenAIModel[]> => {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is required');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching and storing models with provided API key...');
      // Use the refresh endpoint to fetch and store models
      const result = await refreshOpenAIModels(apiKey);
      
      if (result.success) {
        console.log('✅ Models fetched and stored:', result);
        
        // Reload from database
        const storedModels = await getAvailableModels();
        
        if (Array.isArray(storedModels) && storedModels.length > 0) {
          const transformedModels = storedModels.map(model => ({
            id: model.id,
            name: model.name || model.id,
            is_default: model.is_default || false,
            description: model.description,
            cost_per_1k_tokens: model.cost_per_1k_tokens,
            max_tokens: model.max_tokens,
          }));
          
          setModels(transformedModels);
          
          // Cache the results
          const cacheData: CachedModels = {
            models: transformedModels,
            timestamp: Date.now(),
          };
          localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(cacheData));
          
          return transformedModels;
        } else {
          throw new Error('No models returned after refresh');
        }
      } else {
        throw new Error(result.error || 'Failed to fetch models');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Error fetching models with API key:', err);
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
    
    // Fallback to default model from stored models
    const defaultModel = models.find((m: OpenAIModel) => m.is_default);
    if (defaultModel) {
      return defaultModel.id;
    }
    
    // Final fallback
    return models.length > 0 ? models[0].id : 'gpt-4o-mini';
  }, [models]);

  const getModelOptions = useCallback(() => {
    const modelDescriptions: Record<string, string> = {
      'gpt-4o': 'Latest GPT-4 model (most capable)',
      'gpt-4o-mini': 'Faster, cost-effective GPT-4 (recommended)',
      'gpt-4-turbo': 'Previous generation GPT-4',
      'gpt-3.5-turbo': 'Fast and economical',
      'o1-preview': 'Reasoning model (advanced)',
      'o1-mini': 'Reasoning model (faster)',
    };

    return models.map((model: OpenAIModel) => ({
      value: model.id,
      label: model.name || model.id,
      description: model.description || modelDescriptions[model.id] || 'OpenAI model',
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
