import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// DataForSEO API calls
export const dataforSeoApi = {
  // SERP Analysis
  analyzeSERP: async (keyword: string, _location = 'US', language = 'en') => {
    const response = await api.post('/api/v1/seo/serp/analyze', null, {
      params: { keyword, location_code: 2840, language_code: language }
    });
    return response.data;
  },

  // Keyword Search Volume
  getKeywordVolume: async (keywords: string[], _location = 'US', language = 'en') => {
    const response = await api.post('/api/v1/seo/keywords/search-volume', null, {
      params: { keywords: keywords.join(','), location_code: 2840, language_code: language }
    });
    return response.data;
  },

  // Keywords for Site
  getKeywordsForSite: async (url: string, _location = 'US', language = 'en') => {
    const response = await api.post('/api/v1/seo/keywords/for-site', null, {
      params: { url, location_code: 2840, language_code: language }
    });
    return response.data;
  },

  // Competitor Analysis
  analyzeCompetitors: async (domain: string, _location = 'US', language = 'en') => {
    const response = await api.post('/api/v1/seo/competitors/domain', null, {
      params: { domain, location_code: 2840, language_code: language }
    });
    return response.data;
  },

  // Content Analysis
  analyzeContent: async (content: string, keyword: string) => {
    const response = await api.post('/api/v1/seo/content/analyze', null, {
      params: { content, keyword }
    });
    return response.data;
  },

  // SERP Screenshot
  getSerpScreenshot: async (keyword: string, _location = 'US', language = 'en') => {
    const response = await api.post('/api/v1/seo/serp/screenshot', null, {
      params: { keyword, location_code: 2840, language_code: language }
    });
    return response.data;
  },
};

// AI/OpenAI API calls
export const aiApi = {
  // Content Generation
  generateContent: async (prompt: string, model = 'gpt-4o-mini', maxTokens = 2000) => {
    const response = await api.post('/api/v1/ai/content/generate', {
      prompt,
      model,
      max_tokens: maxTokens,
      temperature: 0.7
    });
    return response.data;
  },

  // SEO Content Generation
  generateSeoContent: async (topic: string, keyword: string, contentType = 'blog_post') => {
    const response = await api.post('/api/v1/ai/content/seo', {
      topic,
      keyword,
      content_type: contentType,
      model: 'gpt-4o-mini'
    });
    return response.data;
  },

  // Content Analysis
  analyzeContent: async (content: string, keyword: string, analysisType = 'seo') => {
    const response = await api.post('/api/v1/ai/content/analyze', {
      content,
      keyword,
      analysis_type: analysisType
    });
    return response.data;
  },

  // Keyword Generation
  generateKeywords: async (topic: string, audience = 'general', intent = 'informational') => {
    const response = await api.post('/api/v1/ai/keywords/generate', {
      topic,
      audience,
      intent,
      count: 20
    });
    return response.data;
  },

  // Ad Copy Generation
  generateAdCopy: async (product: string, platform = 'google_ads', audience = 'general') => {
    const response = await api.post('/api/v1/ai/ads/generate', {
      product,
      platform,
      campaign_type: 'search',
      target_audience: audience
    });
    return response.data;
  },

  // Email Sequence Generation
  generateEmailSequence: async (product: string, audience = 'general', sequenceType = 'welcome') => {
    const response = await api.post('/api/v1/ai/email/sequence', {
      product,
      audience,
      sequence_type: sequenceType,
      sequence_length: 5
    });
    return response.data;
  },
};

// Workflow execution with data mapping
export const workflowApi = {
  // Execute a single node with input data
  executeNode: async (nodeType: string, config: any, inputData: any = {}) => {
    try {
      let result;
      
      switch (nodeType) {
        // DataForSEO nodes
        case 'seo_serp_analyze':
          result = await dataforSeoApi.analyzeSERP(
            config.keyword || inputData.keyword,
            config.location,
            config.language
          );
          break;
          
        case 'seo_keywords_volume':
          const keywords = config.keywords ? config.keywords.split(',').map((k: string) => k.trim()) : [];
          result = await dataforSeoApi.getKeywordVolume(keywords, config.location, config.language);
          break;
          
        case 'seo_keywords_site':
          result = await dataforSeoApi.getKeywordsForSite(
            config.url || inputData.url,
            config.location,
            config.language
          );
          break;
          
        case 'seo_competitors':
          result = await dataforSeoApi.analyzeCompetitors(
            config.domain || inputData.domain,
            config.location,
            config.language
          );
          break;
          
        case 'seo_content_analyze':
          result = await dataforSeoApi.analyzeContent(
            config.content || inputData.content,
            config.keyword || inputData.keyword
          );
          break;
          
        // AI nodes
        case 'ai_content_generate':
          result = await aiApi.generateContent(
            config.prompt || inputData.prompt,
            config.model,
            config.maxTokens
          );
          break;
          
        case 'ai_content_seo':
          result = await aiApi.generateSeoContent(
            config.topic || inputData.topic,
            config.keyword || inputData.keyword,
            config.contentType
          );
          break;
          
        case 'ai_keywords_generate':
          result = await aiApi.generateKeywords(
            config.topic || inputData.topic,
            config.audience,
            config.intent
          );
          break;
          
        case 'ai_ads_generate':
          result = await aiApi.generateAdCopy(
            config.product || inputData.product,
            config.platform,
            config.audience
          );
          break;
          
        default:
          throw new Error(`Unsupported node type: ${nodeType}`);
      }
      
      return {
        success: true,
        data: result,
        nodeType,
        executedAt: new Date().toISOString(),
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        nodeType,
        executedAt: new Date().toISOString(),
      };
    }
  },

  // Test a node configuration
  testNode: async (nodeType: string, config: any) => {
    return workflowApi.executeNode(nodeType, config, {});
  },
}; 