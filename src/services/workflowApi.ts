import axios from 'axios';
import { WorkflowNodeType } from '../types/workflow';

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
  // Save workflow to backend
  saveWorkflow: async (workflow: any) => {
    try {
      console.log('Saving workflow:', workflow);
      
      // For now, save to localStorage since backend might not be ready
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const existingIndex = workflows.findIndex((w: any) => w.id === workflow.id);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = { ...workflow, updatedAt: new Date().toISOString() };
      } else {
        workflows.push(workflow);
      }
      
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.post('/api/v1/workflows', workflow);
      // return response.data;
      
      return { success: true, workflow };
    } catch (error: any) {
      console.error('Failed to save workflow:', error);
      throw new Error('Failed to save workflow: ' + error.message);
    }
  },

  // Load workflow from backend
  loadWorkflow: async (workflowId: string) => {
    try {
      // For now, load from localStorage
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const workflow = workflows.find((w: any) => w.id === workflowId);
      
      if (!workflow) {
        throw new Error('Workflow not found');
      }
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get(`/api/v1/workflows/${workflowId}`);
      // return response.data;
      
      return workflow;
    } catch (error: any) {
      console.error('Failed to load workflow:', error);
      throw new Error('Failed to load workflow: ' + error.message);
    }
  },

  // List all workflows
  listWorkflows: async () => {
    try {
      // For now, load from localStorage
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get('/api/v1/workflows');
      // return response.data;
      
      return workflows;
    } catch (error: any) {
      console.error('Failed to list workflows:', error);
      throw new Error('Failed to list workflows: ' + error.message);
    }
  },

  // Delete workflow
  deleteWorkflow: async (workflowId: string) => {
    try {
      // For now, delete from localStorage
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const filteredWorkflows = workflows.filter((w: any) => w.id !== workflowId);
      localStorage.setItem('workflows', JSON.stringify(filteredWorkflows));
      
      // TODO: Replace with actual API call when backend is ready
      // await api.delete(`/api/v1/workflows/${workflowId}`);
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete workflow:', error);
      throw new Error('Failed to delete workflow: ' + error.message);
    }
  },

  // Execute a single node with input data
  executeNode: async (nodeType: string, config: any, inputData: any = {}) => {
    try {
      let result;
      
      switch (nodeType) {
        // DataForSEO nodes
        case 'seo_serp_analyze':
        case WorkflowNodeType.SEO_SERP_ANALYZE:
          // Validate required fields
          if (!config.keyword && !inputData.keyword) {
            throw new Error('Keyword is required for SERP analysis');
          }
          
          const keyword = config.keyword || inputData.keyword;
          const locationCode = config.locationCode || 2840;
          const languageCode = config.languageCode || 'en';
          const maxResults = config.maxResults || 10;
          
          // Use sandbox or live API based on configuration
          const baseUrl = config.useSandbox !== false ? 
            'https://sandbox.dataforseo.com' : 
            'https://api.dataforseo.com';
          
          if (!config.dataforSeoLogin || !config.dataforSeoPassword) {
            // Return mock data if no credentials provided
            result = {
              results: [
                {
                  keyword: keyword,
                  location_code: locationCode,
                  language_code: languageCode,
                  total_count: 10,
                  items: Array.from({ length: maxResults }, (_, i) => ({
                    type: 'organic',
                    rank_group: i + 1,
                    rank_absolute: i + 1,
                    position: 'left',
                    xpath: `/html/body/div[${i + 1}]`,
                    domain: `example${i + 1}.com`,
                    title: `Sample Result ${i + 1} for ${keyword}`,
                    description: `This is a sample SERP result description for testing purposes. Result #${i + 1}`,
                    url: `https://example${i + 1}.com/page`,
                    is_featured_snippet: i === 0,
                    ...(config.includeMetrics && {
                      metrics: {
                        organic_etv: Math.random() * 1000,
                        organic_count: Math.floor(Math.random() * 50),
                        paid_etv: Math.random() * 500
                      }
                    })
                  }))
                }
              ]
            };
          } else {
            // Make actual API call to DataForSEO
            const auth = btoa(`${config.dataforSeoLogin}:${config.dataforSeoPassword}`);
            
            const requestData = {
              language_code: languageCode,
              location_code: locationCode,
              keyword: keyword,
              ...(maxResults && { depth: maxResults })
            };
            
            const response = await fetch(`${baseUrl}/v3/serp/google/organic/live/advanced`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify([requestData])
            });
            
            if (!response.ok) {
              throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            result = data.tasks?.[0]?.result || data;
          }
          break;
          
        // AI nodes with OpenAI integration
        case 'ai_content_analyze':
        case WorkflowNodeType.AI_CONTENT_ANALYZE:
          if (!config.apiKey) {
            throw new Error('OpenAI API key is required');
          }
          
          const systemPrompt = config.systemPrompt || 'You are a helpful AI assistant that analyzes content.';
          const userPrompt = config.userPrompt || 'Analyze the following content: {input_content}';
          
          // Replace template variables
          let processedPrompt = userPrompt;
          Object.keys(inputData).forEach(key => {
            processedPrompt = processedPrompt.replace(new RegExp(`{${key}}`, 'g'), inputData[key]);
          });
          
          const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: processedPrompt }
          ];
          
          // Add JSON format instruction if requested
          if (config.jsonResponse && config.jsonSchema) {
            messages.push({
              role: 'system',
              content: `Please respond in JSON format following this schema: ${config.jsonSchema}`
            });
          }
          
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: config.model || 'gpt-4o-mini',
              messages: messages,
              temperature: config.temperature || 0.7,
              max_tokens: config.maxTokens || 1000,
              ...(config.jsonResponse && { response_format: { type: 'json_object' } })
            })
          });
          
          if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
          }
          
          const openaiData = await openaiResponse.json();
          const content = openaiData.choices[0]?.message?.content;
          
          result = config.jsonResponse ? 
            { analysis: JSON.parse(content), raw_response: content } :
            { analysis: content, raw_response: content };
          break;
          
        case 'ai_content_generate':
        case WorkflowNodeType.AI_CONTENT_GENERATE:
          if (!config.apiKey) {
            throw new Error('OpenAI API key is required');
          }
          
          let generationPrompt = config.prompt || 'Generate content based on the provided information.';
          
          // Replace template variables
          Object.keys(inputData).forEach(key => {
            generationPrompt = generationPrompt.replace(new RegExp(`{${key}}`, 'g'), inputData[key]);
          });
          
          const generationMessages = [
            { role: 'user', content: generationPrompt }
          ];
          
          // Add JSON format instruction if requested
          if (config.jsonResponse && config.jsonSchema) {
            generationMessages.unshift({
              role: 'system',
              content: `Please respond in JSON format following this schema: ${config.jsonSchema}`
            });
          }
          
          const generateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: config.model || 'gpt-4o-mini',
              messages: generationMessages,
              temperature: config.temperature || 0.7,
              max_tokens: config.maxTokens || 1000,
              ...(config.jsonResponse && { response_format: { type: 'json_object' } })
            })
          });
          
          if (!generateResponse.ok) {
            throw new Error(`OpenAI API error: ${generateResponse.status} ${generateResponse.statusText}`);
          }
          
          const generateData = await generateResponse.json();
          const generateContent = generateData.choices[0]?.message?.content;
          
          result = config.jsonResponse ? 
            { content: JSON.parse(generateContent), raw_response: generateContent } :
            { content: generateContent, raw_response: generateContent };
          break;
          
        // Legacy DataForSEO nodes (keeping for backward compatibility)  
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
          
        // Legacy AI nodes (keeping for backward compatibility)
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
        outputVariable: config.outputVariable || nodeType.replace('_', ''),
      };
      
    } catch (error: any) {
      console.error(`Node execution failed for ${nodeType}:`, error);
      return {
        success: false,
        error: error.message || 'Execution failed',
        nodeType,
        executedAt: new Date().toISOString(),
      };
    }
  },

  // Test a node configuration
  testNode: async (nodeType: string, config: any) => {
    return workflowApi.executeNode(nodeType, config, {});
  },

  // Execute entire workflow
  executeWorkflow: async (workflow: any) => {
    try {
      console.log('Executing workflow:', workflow.name);
      const results: any[] = [];
      let currentData: any = {};

      // Sort nodes by their position to execute in order
      const sortedNodes = [...workflow.nodes].sort((a, b) => a.position.y - b.position.y);

      for (const node of sortedNodes) {
        console.log(`Executing node: ${node.id} (${node.data.type})`);
        
        const result = await workflowApi.executeNode(
          node.data.type,
          node.data.config,
          currentData
        );
        
        results.push({
          nodeId: node.id,
          ...result
        });

        // Pass successful results to next node
        if (result.success) {
          currentData = { ...currentData, [node.id]: result.data };
        } else {
          console.error(`Node ${node.id} failed:`, result.error);
          break; // Stop execution on first failure
        }
      }

      return {
        success: true,
        workflowId: workflow.id,
        results,
        executedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Workflow execution failed:', error);
      return {
        success: false,
        error: error.message,
        workflowId: workflow.id,
        executedAt: new Date().toISOString(),
      };
    }
  },
}; 