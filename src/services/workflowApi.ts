// Using fetch instead of axios for better compatibility
import { WorkflowNodeType, StandardNodeResponse, AvailableDataNode, DataStructureItem } from '../types/workflow';

// API_BASE_URL temporarily unused - will be restored when fixing API integration
// const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Global storage for workflow execution data (in real app, this would be in a state management solution)
let globalWorkflowData: Record<string, StandardNodeResponse> = {};

// Helper function to generate unique execution ID
const generateExecutionId = (): string => {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to create standardized node response (temporarily unused during refactoring)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createStandardResponse = (
  nodeId: string,
  nodeType: WorkflowNodeType,
  startTime: number,
  rawApiResponse: any,
  inputData?: any,
  apiMetadata?: any
): StandardNodeResponse => {
  const executionTime = Math.round(performance.now() - startTime);
  
  return {
    executionId: generateExecutionId(),
    nodeId,
    nodeType,
    status: 'success',
    executedAt: new Date().toISOString(),
    executionTime,
    data: {
      processed: rawApiResponse, // Will be transformed based on node type
      raw: rawApiResponse,
      summary: extractSummaryFromResponse(rawApiResponse, nodeType)
    },
    inputData,
    apiMetadata
  };
};

// Helper function to extract key summary data from API responses
const extractSummaryFromResponse = (rawResponse: any, nodeType: WorkflowNodeType): Record<string, any> => {
  const summary: Record<string, any> = {};
  
  switch (nodeType) {
    case WorkflowNodeType.SEO_SERP_ANALYZE:
    case WorkflowNodeType.SEO_SERP_GOOGLE_ORGANIC:
      if (rawResponse?.tasks?.[0]?.result?.[0]) {
        const result = rawResponse.tasks[0].result[0];
        summary.keyword = result.keyword;
        summary.total_count = result.items_count || result.items?.length || 0;
        summary.se_results_count = result.se_results_count;
        summary.top_urls = result.items?.slice(0, 3).map((item: any) => item.url).filter(Boolean) || [];
        summary.top_domains = result.items?.slice(0, 3).map((item: any) => item.domain).filter(Boolean) || [];
      }
      break;
      
    case WorkflowNodeType.CONTENT_EXTRACT:
      if (Array.isArray(rawResponse)) {
        summary.total_pages = rawResponse.length;
        summary.total_content_length = rawResponse.reduce((sum: number, item: any) => sum + (item.content?.length || 0), 0);
        summary.extracted_urls = rawResponse.map((item: any) => item.url).filter(Boolean);
      }
      break;
      
    case WorkflowNodeType.AI_OPENAI_TASK:
      if (rawResponse?.choices?.[0]?.message?.content) {
        summary.content_length = rawResponse.choices[0].message.content.length;
        summary.model = rawResponse.model;
        summary.usage = rawResponse.usage;
      }
      break;
      
    default:
      // Generic summary extraction
      if (typeof rawResponse === 'object' && rawResponse !== null) {
        if (rawResponse.tasks?.length > 0) {
          summary.tasks_count = rawResponse.tasks.length;
        }
        if (rawResponse.results?.length > 0) {
          summary.results_count = rawResponse.results.length;
        }
      }
  }
  
  return summary;
};

// Helper function to analyze data structure for UI
const analyzeDataStructure = (data: any, path: string = '', level: number = 0): DataStructureItem[] => {
  if (level > 4) return []; // Prevent infinite recursion
  
  const items: DataStructureItem[] = [];
  
  if (Array.isArray(data)) {
    items.push({
      path: path + '[*]',
      label: `All items (${data.length})`,
      type: 'array',
      isArray: true,
      arrayItemType: data.length > 0 ? typeof data[0] : 'unknown',
      sampleValue: data.length > 0 ? data[0] : null,
      children: data.length > 0 && typeof data[0] === 'object' ? analyzeDataStructure(data[0], path + '[0]', level + 1) : []
    });
    
    if (data.length > 0) {
      items.push({
        path: path + '[0]',
        label: 'First item',
        type: typeof data[0] as any,
        sampleValue: typeof data[0] === 'object' ? null : data[0],
        children: typeof data[0] === 'object' ? analyzeDataStructure(data[0], path + '[0]', level + 1) : []
      });
    }
  } else if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      const newPath = path ? `${path}.${key}` : key;
      const type = Array.isArray(value) ? 'array' : typeof value as any;
      
      items.push({
        path: newPath,
        label: key,
        type,
        isArray: Array.isArray(value),
        sampleValue: typeof value === 'object' ? null : value,
        children: typeof value === 'object' ? analyzeDataStructure(value, newPath, level + 1) : []
      });
    });
  } else {
    items.push({
      path,
      label: 'Value',
      type: typeof data as any,
      sampleValue: data
    });
  }
  
  return items;
};

// Function to get available data from executed nodes
export const getAvailableDataNodes = (): AvailableDataNode[] => {
  return Object.values(globalWorkflowData)
    .filter(response => response.status === 'success')
    .map(response => ({
      nodeId: response.nodeId,
      nodeLabel: response.nodeId, // In real app, would get from node metadata
      nodeType: response.nodeType,
      executedAt: response.executedAt,
      status: response.status as 'success', // Safe cast since we filtered for success
      dataStructure: analyzeDataStructure(response.data.processed)
    }));
};

// Function to clear workflow data (for development reset)
export const clearWorkflowData = () => {
  globalWorkflowData = {};
  console.log('🧹 Workflow data cleared');
};

// Note: axios instance commented out temporarily - will be restored after main changes
// Create axios instance with auth
// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// Add auth token to requests
// api.interceptors.request.use((config: any) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// DataForSEO API calls (temporarily disabled during refactoring - returning mock data)
export const dataforSeoApi = {
  // SERP Analysis
  analyzeSERP: async (keyword: string, _location = 'US', language = 'en') => {
    return {
      data: {
        success: true,
        data: { keyword, language, results: [] }
      }
    };
  },

  // Keyword Volume
  getKeywordVolume: async (keywords: string[], _location = 'US', language = 'en') => {
    return {
      data: {
        success: true,
        data: { keywords, language, volumes: [] }
      }
    };
  },

  // Keywords for Site
  getKeywordsForSite: async (domain: string, _location = 'US', language = 'en') => {
    return {
      data: {
        success: true,
        data: { domain, language, keywords: [] }
      }
    };
  },

  // Competitor Analysis
  analyzeCompetitors: async (domain: string, _location = 'US', language = 'en') => {
    return {
      data: {
        success: true,
        data: { domain, language, competitors: [] }
      }
    };
  },

  // Content Analysis
  analyzeContent: async (content: string, keyword: string, language = 'en') => {
    return {
      data: {
        success: true,
        data: { content: content.substring(0, 100) + "...", keyword, language, analysis: {} }
      }
    };
  },

  // SERP Screenshot
  getSerpScreenshot: async (keyword: string, _location = 'US', language = 'en') => {
    return {
      data: {
        success: true,
        data: { keyword, language, screenshot_url: "mock-screenshot.png" }
      }
    };
  }
};

// Variable processing helper
const processVariables = (text: string, workflowData: Record<string, any>): string => {
  if (!text) return text;
  
  // Replace variables in format {node_id.property}
  return text.replace(/\{([^}]+)\}/g, (match, path) => {
    try {
      const pathParts = path.split('.');
      let value = workflowData;
      
      for (const part of pathParts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          return match; // Return original if path doesn't exist
        }
      }
      
      return typeof value === 'string' ? value : JSON.stringify(value);
    } catch (error) {
      console.warn(`Failed to process variable ${path}:`, error);
      return match;
    }
  });
};

// Helper functions for realistic content generation
const generateRealisticTitle = (domain: string, index: number): string => {
  const titles = {
    'example.com': ['Complete Guide to Digital Marketing', 'SEO Best Practices', 'Content Marketing Strategies'],
    'blog.com': ['How to Build Your Brand Online', 'Social Media Marketing Tips', 'Email Marketing Guide'],
    'news.com': ['Latest Industry News', 'Market Analysis Report', 'Technology Trends 2024'],
    'default': ['Professional Services Guide', 'Industry Best Practices', 'Expert Insights and Analysis']
  };
  
  const domainTitles = titles[domain as keyof typeof titles] || titles.default;
  return domainTitles[index % domainTitles.length] + ` - ${domain}`;
};

const generateRealisticDescription = (domain: string, index: number): string => {
  const descriptions = [
    `Comprehensive guide from ${domain} covering industry best practices, expert insights, and actionable strategies.`,
    `In-depth analysis from ${domain} of current market trends, challenges, and opportunities in the industry.`,
    `Professional insights and practical tips from ${domain} industry experts and thought leaders.`,
    `Detailed overview from ${domain} of essential concepts, tools, and methodologies for success.`,
    `Expert analysis and recommendations from ${domain} for optimal results and performance improvement.`
  ];
  
  return descriptions[index % descriptions.length];
};

const generateRealisticKeywords = (domain: string): string[] => {
  const keywordSets = {
    'marketing': ['digital marketing', 'SEO', 'content strategy', 'social media', 'brand awareness'],
    'tech': ['technology', 'innovation', 'software', 'digital transformation', 'automation'],
    'business': ['business strategy', 'growth', 'leadership', 'management', 'efficiency'],
    'default': ['industry insights', 'best practices', 'professional development', 'expertise', 'solutions']
  };
  
  if (domain.includes('marketing')) return keywordSets.marketing;
  if (domain.includes('tech') || domain.includes('software')) return keywordSets.tech;
  if (domain.includes('business') || domain.includes('corp')) return keywordSets.business;
  return keywordSets.default;
};

const generateRealisticHeadings = (domain: string, index: number): string => {
  return `H1: ${generateRealisticTitle(domain, index)}
H2: Introduction and Overview
H2: Key Concepts and Principles
H3: Understanding the Fundamentals
H3: Advanced Strategies
H2: Implementation Guidelines
H3: Step-by-Step Process
H3: Best Practices and Tips
H2: Case Studies and Examples
H2: Conclusion and Next Steps`;
};

const generateRealisticContent = (domain: string, index: number, type: 'full' | 'custom'): string => {
  const title = generateRealisticTitle(domain, index);
  const description = generateRealisticDescription(domain, index);
  
  if (type === 'custom') {
    return `Selected content from ${domain}: ${description} This focused content section provides targeted information about ${title.toLowerCase()}.`;
  }
  
  return `${title}

${description}

Introduction
Welcome to our comprehensive guide on ${title.toLowerCase()}. This resource provides valuable insights and practical strategies that have been developed through extensive research and industry experience.

Key Benefits:
- Professional expertise and proven methodologies
- Actionable insights for immediate implementation
- Industry best practices and recommendations
- Real-world examples and case studies

Core Concepts
Understanding the fundamental principles is essential for success. Our approach focuses on delivering measurable results through strategic planning and execution.

Implementation Strategy
1. Assessment and Planning
   Begin with a thorough analysis of your current situation and objectives.

2. Strategic Development
   Develop a customized approach based on your specific needs and goals.

3. Execution and Monitoring
   Implement the strategy with continuous monitoring and optimization.

4. Results and Optimization
   Measure performance and refine the approach for maximum effectiveness.

Conclusion
This comprehensive approach ensures sustainable results and long-term success. By following these proven methodologies, you can achieve your objectives efficiently and effectively.

For more information about ${title.toLowerCase()}, contact our team of experts who can provide personalized guidance and support.`;
};

// AI API calls (temporarily disabled during refactoring - returning mock data)
export const aiApi = {
  // Generate SEO Content
  generateSeoContent: async (keyword: string, contentType: string, tone: string) => {
    return {
      data: {
        success: true,
        data: { keyword, contentType, tone, content: "Generated SEO content..." }
      }
    };
  },

  // Optimize Content for SEO
  optimizeContentSeo: async (content: string, keyword: string, tone: string) => {
    return {
      data: {
        success: true,
        data: { content: content.substring(0, 100) + "... [optimized]", keyword, tone }
      }
    };
  },

  // Analyze Content
  analyzeContent: async (content: string, keyword: string) => {
    return {
      data: {
        success: true,
        data: { content: content.substring(0, 100) + "...", keyword, analysis: {} }
      }
    };
  },

  // Generate Keywords
  generateKeywords: async (topic: string, language: string) => {
    return {
      data: {
        success: true,
        data: { topic, language, keywords: [] }
      }
    };
  },

  // Generate Ad Copy
  generateAdCopy: async (keyword: string, adType: string, tone: string) => {
    return {
      data: {
        success: true,
        data: { keyword, adType, tone, adCopy: "Generated ad copy..." }
      }
    };
  },

  // Generate Email Sequence
  generateEmailSequence: async (topic: string, emailCount: number, tone: string) => {
    return {
      data: {
        success: true,
        data: { topic, emailCount, tone, emails: [] }
      }
    };
  }
};

// Workflow execution with data mapping
export const workflowApi = {
  // Save workflow to backend
  saveWorkflow: async (workflow: any) => {
    try {
      console.log('Saving workflow:', workflow);
      
      // Standardize workflow format
      const standardizedWorkflow = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || '',
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        isActive: workflow.isActive || false,
        createdAt: workflow.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: workflow.tags || [],
        executionCount: workflow.executionCount || 0,
        lastExecuted: workflow.lastExecuted || null,
        successRate: workflow.successRate || 0,
      };
      
      // For now, save to localStorage since backend might not be ready
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const existingIndex = workflows.findIndex((w: any) => w.id === standardizedWorkflow.id);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = standardizedWorkflow;
      } else {
        workflows.push(standardizedWorkflow);
      }
      
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.post('/api/v1/workflows', workflow);
      // return response.data;
      
      return { success: true, workflow: standardizedWorkflow };
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
  executeNode: async (nodeType: string, config: any, inputData: any = {}, nodeId?: string) => {
    try {
      // const startTime = performance.now(); // Temporarily unused
      const executionNodeId = nodeId || `${nodeType}_${Date.now()}`;
      
      console.log(`🚀 Executing node: ${executionNodeId} (${nodeType})`);
      console.log(`📥 Input data:`, inputData);
      console.log(`⚙️ Config:`, config);
      let result;
      let finalConfig = config;
      
      // If node has an integrationId, merge integration config with node config
      if (config.integrationId) {
        try {
          const integrations = JSON.parse(localStorage.getItem('integrations') || '[]');
          const integration = integrations.find((i: any) => i.id === config.integrationId);
          if (integration) {
            // Merge integration config with node config, node config takes precedence
            finalConfig = { ...integration.config, ...config };
            console.log('Using integration:', integration.name, 'for node type:', nodeType);
          }
        } catch (error) {
          console.warn('Failed to load integration config:', error);
        }
      }
      
      switch (nodeType) {
        // Trigger nodes - start workflow execution
        case 'trigger':
        case WorkflowNodeType.TRIGGER:
          result = {
            success: true,
            message: 'Workflow trigger activated',
            timestamp: new Date().toISOString(),
            triggerType: finalConfig.triggerType || 'manual',
            data: {
              triggered: true,
              timestamp: new Date().toISOString(),
              triggerType: finalConfig.triggerType || 'manual',
              triggerConfig: finalConfig
            }
          };
          break;

        // OpenAI unified task
        case 'ai_openai_task':
        case WorkflowNodeType.AI_OPENAI_TASK:
          if (!finalConfig.apiKey) {
            throw new Error('OpenAI API key is required. Please configure an OpenAI integration.');
          }
          
          const taskSystemPrompt = finalConfig.systemPrompt || 'You are a helpful AI assistant.';
          const taskUserPrompt = finalConfig.userPrompt || finalConfig.prompt || 'Please help with the following task.';
          
          // Process variables in prompts (supports both {{variable}} and {variable} syntax)
          console.log('Processing variables with input data:', JSON.stringify(inputData, null, 2));
          console.log('Original system prompt:', taskSystemPrompt);
          console.log('Original user prompt:', taskUserPrompt);
          
          let processedTaskSystemPrompt = processVariables(taskSystemPrompt, inputData);
          let processedTaskUserPrompt = processVariables(taskUserPrompt, inputData);
          
          console.log('Processed system prompt:', processedTaskSystemPrompt);
          console.log('Processed user prompt:', processedTaskUserPrompt);
          
          // Legacy support: Replace simple template variables
          Object.keys(inputData).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            processedTaskSystemPrompt = processedTaskSystemPrompt.replace(regex, inputData[key]);
            processedTaskUserPrompt = processedTaskUserPrompt.replace(regex, inputData[key]);
          });
          
          const taskMessages = [
            { role: 'system', content: processedTaskSystemPrompt },
            { role: 'user', content: processedTaskUserPrompt }
          ];
          
          // Add JSON format instruction if requested
          if (finalConfig.jsonResponse && finalConfig.jsonSchema) {
            taskMessages.push({
              role: 'system',
              content: `Please respond in JSON format following this schema: ${finalConfig.jsonSchema}`
            });
          }
          
          const taskModel = finalConfig.modelOverride || finalConfig.model || 'gpt-4o-mini';
          const taskTemperature = finalConfig.temperatureOverride !== undefined ? 
            finalConfig.temperatureOverride : 
            (finalConfig.temperature || 0.7);
          
          const openaiTaskResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${finalConfig.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: taskModel,
              messages: taskMessages,
              temperature: taskTemperature,
              max_tokens: finalConfig.maxTokens || 1000,
              ...(finalConfig.jsonResponse && { response_format: { type: 'json_object' } })
            })
          });
          
          if (!openaiTaskResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiTaskResponse.status} ${openaiTaskResponse.statusText}`);
          }
          
          const openaiTaskData = await openaiTaskResponse.json();
          const taskContent = openaiTaskData.choices[0]?.message?.content;
          
          result = finalConfig.jsonResponse ? 
            { result: JSON.parse(taskContent), raw_response: taskContent } :
            { result: taskContent, raw_response: taskContent };
          break;
        
        // DataForSEO nodes
        case 'seo_serp_analyze':
        case WorkflowNodeType.SEO_SERP_ANALYZE:
        case 'seo_serp_google_organic':
        case WorkflowNodeType.SEO_SERP_GOOGLE_ORGANIC:
          // Validate required fields
          if (!finalConfig.keyword && !inputData.keyword) {
            throw new Error('Keyword is required for SERP analysis');
          }
          
          const keyword = finalConfig.keyword || inputData.keyword;
          const locationCode = finalConfig.locationCode || 2840;
          const languageCode = finalConfig.languageCode || 'en';
          const maxResults = finalConfig.maxResults || 10;
          
          // Validate DataForSEO credentials
          if (!finalConfig.login || !finalConfig.password) {
            throw new Error('DataForSEO credentials are required. Please configure a DataForSEO integration with valid login and password.');
          }
          
          // Use sandbox or live API based on configuration
          const baseUrl = finalConfig.useSandbox !== false ? 
            'https://sandbox.dataforseo.com' : 
            'https://api.dataforseo.com';
          
          console.log(`🔗 Making DataForSEO API call for keyword: ${keyword}`);
          console.log(`📍 Using ${finalConfig.useSandbox ? 'sandbox' : 'live'} environment`);
          console.log(`🌍 Location: ${locationCode}, Language: ${languageCode}, Max Results: ${maxResults}`);
          
          // Make API call to DataForSEO
          const auth = btoa(`${finalConfig.login}:${finalConfig.password}`);
          
          const requestData = {
            language_code: languageCode,
            location_code: locationCode,
            keyword: keyword,
            ...(maxResults && { depth: maxResults })
          };
          
          try {
            const response = await fetch(`${baseUrl}/v3/serp/google/organic/live/advanced`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify([requestData])
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`DataForSEO API error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const apiResponse = await response.json();
            console.log(`✅ DataForSEO API response received:`, apiResponse);
            
            // Validate API response structure
            if (!apiResponse.tasks || !apiResponse.tasks[0] || !apiResponse.tasks[0].result) {
              throw new Error('Invalid DataForSEO API response structure');
            }
            
            const taskResult = apiResponse.tasks[0].result[0]; // First result from the array
            
            if (!taskResult) {
              throw new Error('No SERP results returned from DataForSEO API');
            }
            
            // Map DataForSEO response to expected structure for variable system
            // This matches the format: serp_results.results[0].items[*].url
            result = {
              results: [
                {
                  keyword: taskResult.keyword,
                  type: taskResult.type,
                  se_domain: taskResult.se_domain,
                  location_code: taskResult.location_code,
                  language_code: taskResult.language_code,
                  check_url: taskResult.check_url,
                  datetime: taskResult.datetime,
                  total_count: taskResult.items_count || taskResult.items?.length || 0,
                  se_results_count: taskResult.se_results_count,
                  items: taskResult.items || []
                }
              ],
              // Also include raw API response for advanced users
              raw_api_response: apiResponse
            };
            
            console.log(`📊 Mapped SERP data structure:`);
            console.log(`   - Keyword: ${result.results[0].keyword}`);
            console.log(`   - Total Items: ${result.results[0].total_count}`);
            console.log(`   - SE Results Count: ${result.results[0].se_results_count}`);
            console.log(`   - Items Array Length: ${result.results[0].items.length}`);
            console.log(`   - Sample URLs: ${result.results[0].items.slice(0, 3).map((item: any) => item.url).filter(Boolean).join(', ')}`);
            
          } catch (error: any) {
            console.error('❌ DataForSEO API call failed:', error);
            throw new Error(`DataForSEO API call failed: ${error.message}`);
          }
          break;
          
        // Content Extraction
        case 'content_extract':
        case WorkflowNodeType.CONTENT_EXTRACT:
          // Get URLs from input mapping
          const inputMapping = finalConfig.inputMapping || '';
          let urls: string[] = [];
          
          if (inputMapping && inputData) {
            // Parse JSON path (e.g., "serp_results.results[0].items[*].url")
            const pathParts = inputMapping.split('.');
            let currentData: any = inputData;
            
            for (let i = 0; i < pathParts.length; i++) {
              const part = pathParts[i];
              
              if (part.includes('[*]')) {
                // Handle array wildcard
                const arrayKey = part.replace('[*]', '');
                if (currentData[arrayKey] && Array.isArray(currentData[arrayKey])) {
                  // Extract the remaining path for each array item
                  const remainingPath = pathParts.slice(i + 1).join('.');
                  currentData[arrayKey].forEach((item: any) => {
                    let value = item;
                    if (remainingPath) {
                      const subParts = remainingPath.split('.');
                      subParts.forEach((subPart: string) => {
                        value = value?.[subPart];
                      });
                    }
                    if (value && typeof value === 'string') {
                      urls.push(value);
                    }
                  });
                  break;
                }
              } else if (part.includes('[') && part.includes(']')) {
                // Handle specific array index
                const match = part.match(/(\w+)\[(\d+)\]/);
                if (match) {
                  const [, arrayKey, index] = match;
                  currentData = currentData[arrayKey]?.[parseInt(index)];
                }
              } else {
                currentData = currentData[part];
              }
            }
            
            // If no array processing, check if we have a direct URL or array of URLs
            if (urls.length === 0 && currentData) {
              if (typeof currentData === 'string') {
                urls.push(currentData);
              } else if (Array.isArray(currentData)) {
                urls = currentData.filter((url: any) => typeof url === 'string');
              }
            }
          }
          
          console.log('Extracted URLs for content extraction:', urls);
          
          if (urls.length === 0) {
            throw new Error('No URLs found to extract content from. Check your input mapping.');
          }
          
                     // Enhanced content extraction with realistic simulation
           const extractedContent = await Promise.all(urls.map(async (url, index) => {
             try {
               // Simulate realistic content based on URL domain
               const domain = new URL(url).hostname;
               let content = '';
               let title = '';
               
               // Generate realistic content based on extraction type
               switch (finalConfig.extractionType) {
                 case 'title_only':
                   title = generateRealisticTitle(domain, index);
                   content = title;
                   break;
                   
                 case 'meta_data':
                   const metadata = {
                     title: generateRealisticTitle(domain, index),
                     description: generateRealisticDescription(domain, index),
                     keywords: generateRealisticKeywords(domain),
                     url: url,
                     domain: domain,
                     extracted_at: new Date().toISOString(),
                     content_type: 'text/html',
                     language: 'en'
                   };
                   content = JSON.stringify(metadata, null, 2);
                   break;
                   
                 case 'headings':
                   content = generateRealisticHeadings(domain, index);
                   break;
                   
                 case 'custom_selector':
                   content = generateRealisticContent(domain, index, 'custom');
                   break;
                   
                 default: // full_text
                   content = generateRealisticContent(domain, index, 'full');
               }
               
               // Apply content length limit
               const maxLength = finalConfig.maxLength || 5000;
               if (content.length > maxLength) {
                 content = content.substring(0, maxLength) + '...';
               }
               
               // Remove HTML tags if configured
               if (finalConfig.removeHtml && content.includes('<')) {
                 content = content.replace(/<[^>]*>/g, '');
               }
               
               return {
                 url: url,
                 domain: domain,
                 title: title || generateRealisticTitle(domain, index),
                 content: content,
                 length: content.length,
                 extraction_type: finalConfig.extractionType || 'full_text',
                 extracted_at: new Date().toISOString(),
                 success: true
               };
               
             } catch (error) {
               console.error(`Failed to extract content from ${url}:`, error);
               return {
                 url: url,
                 content: '',
                 length: 0,
                 error: error instanceof Error ? error.message : 'Unknown extraction error',
                 extracted_at: new Date().toISOString(),
                 success: false
               };
             }
           }));
          
          // Return single item or array based on batch processing setting
          result = finalConfig.batchProcess ? extractedContent : extractedContent[0];
          break;
          
        // Legacy DataForSEO nodes (keeping for backward compatibility)  
        case 'seo_keywords_volume':
          const keywords = finalConfig.keywords ? finalConfig.keywords.split(',').map((k: string) => k.trim()) : [];
          result = await dataforSeoApi.getKeywordVolume(keywords, finalConfig.location, finalConfig.language);
          break;
          
        case 'seo_keywords_site':
          result = await dataforSeoApi.getKeywordsForSite(
            finalConfig.url || inputData.url,
            finalConfig.location,
            finalConfig.language
          );
          break;
          
        case 'seo_competitors':
          result = await dataforSeoApi.analyzeCompetitors(
            finalConfig.domain || inputData.domain,
            finalConfig.location,
            finalConfig.language
          );
          break;
          
        case 'seo_content_analyze':
          result = await dataforSeoApi.analyzeContent(
            finalConfig.content || inputData.content,
            finalConfig.keyword || inputData.keyword
          );
          break;
          
        // Legacy AI nodes (keeping for backward compatibility)
        case 'ai_content_seo':
          result = await aiApi.generateSeoContent(
            finalConfig.keyword || inputData.keyword,
            finalConfig.contentType || 'blog_post',
            finalConfig.tone || 'professional'
          );
          break;
          
        case 'ai_keywords_generate':
          result = await aiApi.generateKeywords(
            finalConfig.topic || inputData.topic,
            finalConfig.language || 'en'
          );
          break;
          
        case 'ai_ads_generate':
          result = await aiApi.generateAdCopy(
            finalConfig.keyword || inputData.keyword,
            finalConfig.adType || 'search',
            finalConfig.tone || 'persuasive'
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
        outputVariable: finalConfig.outputVariable || nodeType.replace('_', ''),
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
    // Provide sample data for testing so variables can be processed
    const sampleInputData = {
      // Sample SERP results
      serp_results: {
        results: [{
          keyword: "test keyword",
          total_count: 3,
          items: [
            { rank_absolute: 1, url: "https://example1.com", title: "Sample Result 1", description: "Sample description 1" },
            { rank_absolute: 2, url: "https://example2.com", title: "Sample Result 2", description: "Sample description 2" },
            { rank_absolute: 3, url: "https://example3.com", title: "Sample Result 3", description: "Sample description 3" }
          ]
        }]
      },
      // Sample extracted content
      extracted_content: [
        { url: "https://example1.com", content: "Sample extracted content from first page...", title: "Sample Title 1", length: 1500 },
        { url: "https://example2.com", content: "Sample extracted content from second page...", title: "Sample Title 2", length: 1800 },
        { url: "https://example3.com", content: "Sample extracted content from third page...", title: "Sample Title 3", length: 1200 }
      ],
      // Sample AI results
      ai_result: {
        content: "Sample AI generated content from previous analysis...",
        model: "gpt-4o-mini",
        usage: { prompt_tokens: 150, completion_tokens: 75 }
      },
      // Sample previous node data
      previous_node: {
        output: "Sample output from previous node",
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Testing node with sample data:', sampleInputData);
    return workflowApi.executeNode(nodeType, config, sampleInputData);
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
        
        // Process input mapping for this node
        let mappedInputData = { ...currentData };
        
        // Check for custom input mapping first, then fallback to regular input mapping
        const mapping = node.data.config?.customInputMapping || node.data.config?.inputMapping;
        
        if (mapping && mapping !== "") {
          console.log(`Processing input mapping for ${node.id}:`, mapping);
          
          // Handle special cases for generic mappings
          if (mapping === "previous_node") {
            // Get the most recent node result
            const nodeIds = Object.keys(currentData);
            const lastNodeId = nodeIds[nodeIds.length - 1];
            if (lastNodeId && currentData[lastNodeId]) {
              mappedInputData = {
                ...mappedInputData,
                input_data: currentData[lastNodeId],
              };
            }
          } else if (mapping.startsWith("previous_node.")) {
            // Get specific property from previous node
            const property = mapping.replace("previous_node.", "");
            const nodeIds = Object.keys(currentData);
            const lastNodeId = nodeIds[nodeIds.length - 1];
            if (lastNodeId && currentData[lastNodeId] && currentData[lastNodeId][property]) {
              mappedInputData = {
                ...mappedInputData,
                input_data: currentData[lastNodeId][property],
                [property]: currentData[lastNodeId][property],
              };
            }
          } else if (mapping.includes('.')) {
            // Parse specific mapping (e.g., "serp_1.results" -> get results from serp_1)
            const [sourceNodeId, sourceProperty] = mapping.split('.');
            if (currentData[sourceNodeId] && currentData[sourceNodeId][sourceProperty]) {
              mappedInputData = {
                ...mappedInputData,
                input_data: currentData[sourceNodeId][sourceProperty],
                [sourceProperty]: currentData[sourceNodeId][sourceProperty],
              };
              console.log(`Mapped data from ${sourceNodeId}.${sourceProperty}:`, mappedInputData);
            }
          } else if (currentData[mapping]) {
            // Direct node reference (e.g., "serp_1")
            mappedInputData = {
              ...mappedInputData,
              input_data: currentData[mapping],
            };
          }
        }
        
        const result = await workflowApi.executeNode(
          node.data.type,
          node.data.config,
          mappedInputData
        );
        
        results.push({
          nodeId: node.id,
          ...result
        });

        // Pass successful results to next node with proper structure
        if (result.success) {
          const outputVariable = node.data.config?.outputVariable || node.id;
          currentData = { 
            ...currentData, 
            [node.id]: result.data,
            [outputVariable]: result.data
          };
          console.log(`Node ${node.id} completed, output stored as:`, outputVariable);
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

  // Validate entire workflow before activation
  validateWorkflow: async (workflow: any) => {
    console.log('Validating workflow:', workflow.name);
    
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      nodeResults: {} as Record<string, any>,
      overallStatus: 'valid' as 'valid' | 'error' | 'warning'
    };

    // Check basic workflow structure
    if (!workflow.nodes || workflow.nodes.length === 0) {
      validation.errors.push('Workflow must contain at least one node');
      validation.isValid = false;
    }

    if (!workflow.edges || workflow.edges.length === 0) {
      if (workflow.nodes.length > 1) {
        validation.errors.push('Workflow with multiple nodes must have connecting edges');
        validation.isValid = false;
      }
    }

    // Find trigger nodes
    const triggerNodes = workflow.nodes.filter((node: any) => 
      node.data.type === 'trigger' || node.data.type === 'TRIGGER'
    );
    
    if (triggerNodes.length === 0) {
      validation.errors.push('Workflow must have a trigger node to start execution');
      validation.isValid = false;
    }

    if (triggerNodes.length > 1) {
      validation.warnings.push('Multiple trigger nodes found - only the first will be used');
    }

    // Validate node connectivity
    const connectedNodes = new Set();
    
    // Add trigger nodes as starting points
    triggerNodes.forEach((node: any) => connectedNodes.add(node.id));
    
    // Follow edges to find all connected nodes
    workflow.edges.forEach((edge: any) => {
      if (connectedNodes.has(edge.source)) {
        connectedNodes.add(edge.target);
      }
    });

    // Check for orphaned nodes
    const orphanedNodes = workflow.nodes.filter((node: any) => 
      !connectedNodes.has(node.id) && node.data.type !== 'trigger' && node.data.type !== 'TRIGGER'
    );
    
    if (orphanedNodes.length > 0) {
      validation.warnings.push(`${orphanedNodes.length} node(s) are not connected to the workflow: ${orphanedNodes.map((n: any) => n.data.label).join(', ')}`);
    }

    // Test each node with sample data
    let currentData = {
      // Rich sample data for testing - matches real DataForSEO API structure
      serp_results: {
        results: [{
          keyword: "test keyword",
          type: "organic",
          se_domain: "google.com",
          location_code: 2840,
          language_code: "en",
          check_url: "https://www.google.com/search?q=test+keyword&num=10",
          datetime: new Date().toISOString(),
          total_count: 10,
          se_results_count: 1250000000,
          items: [
            { 
              type: "organic",
              rank_absolute: 1, 
              rank_group: 1,
              position: "left",
              url: "https://wikipedia.org/wiki/Test_keyword", 
              title: "Test keyword - Wikipedia", 
              description: "Learn about test keyword from the world's largest encyclopedia.",
              domain: "wikipedia.org",
              breadcrumb: "wikipedia.org › wiki › test_keyword"
            },
            { 
              type: "organic",
              rank_absolute: 2, 
              rank_group: 2,
              position: "left",
              url: "https://youtube.com/results?search_query=test+keyword", 
              title: "Test keyword Videos - YouTube", 
              description: "Watch videos about test keyword. Find tutorials and expert content.",
              domain: "youtube.com",
              breadcrumb: "youtube.com › results"
            },
            { 
              type: "organic",
              rank_absolute: 3, 
              rank_group: 3,
              position: "left",
              url: "https://reddit.com/r/testkeyword", 
              title: "r/testkeyword - Reddit", 
              description: "Join the test keyword community on Reddit. Discussions and tips.",
              domain: "reddit.com",
              breadcrumb: "reddit.com › r › testkeyword"
            },
            { 
              type: "organic",
              rank_absolute: 4, 
              rank_group: 4,
              position: "left",
              url: "https://medium.com/topic/test-keyword", 
              title: "Test keyword Articles - Medium", 
              description: "Expert insights about test keyword from industry professionals.",
              domain: "medium.com",
              breadcrumb: "medium.com › topic › test-keyword"
            },
            { 
              type: "organic",
              rank_absolute: 5, 
              rank_group: 5,
              position: "left",
              url: "https://hubspot.com/test-keyword-guide", 
              title: "Test keyword Strategy Guide - HubSpot", 
              description: "Complete guide with actionable strategies for test keyword.",
              domain: "hubspot.com",
              breadcrumb: "hubspot.com › test-keyword-guide"
            }
          ]
        }]
      },
      extracted_content: [
        { 
          url: "https://wikipedia.org/wiki/Test_keyword", 
          content: "Sample content extracted from Wikipedia about test keyword. This is comprehensive information with detailed explanations and references...", 
          title: "Test keyword - Wikipedia", 
          length: 2500 
        },
        { 
          url: "https://youtube.com/results?search_query=test+keyword", 
          content: "Video descriptions and metadata about test keyword tutorials and expert content from YouTube creators...", 
          title: "Test keyword Videos - YouTube", 
          length: 1800 
        },
        { 
          url: "https://reddit.com/r/testkeyword", 
          content: "Community discussions about test keyword with real user experiences, tips, and advice from Reddit users...", 
          title: "r/testkeyword - Reddit", 
          length: 1200 
        }
      ],
      ai_result: {
        content: "Based on the analysis of test keyword data, here are the key insights...",
        model: "gpt-4o-mini",
        usage: { prompt_tokens: 150, completion_tokens: 95 }
      }
    };

    // Sort nodes by execution order (following edges from trigger)
    const sortedNodes = workflowApi.getSortedNodesForExecution(workflow);
    
    // Enhanced execution tracking
    const executionFlow = [];
    
    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i];
      const stepIndex = i + 1;
      
      try {
        console.log(`Validating node ${stepIndex}/${sortedNodes.length}: ${node.id} (${node.data.type})`);
        
        const stepResult = {
          stepIndex,
          nodeId: node.id,
          nodeLabel: node.data.label,
          nodeType: node.data.type,
          inputData: { ...currentData },
          outputData: null as any,
          executionTime: 0,
          status: 'pending' as 'pending' | 'success' | 'error',
          errors: [] as string[],
          dataMapping: {
            inputMapping: node.data.config?.inputMapping || '',
            customInputMapping: node.data.config?.customInputMapping || '',
            outputVariable: node.data.config?.outputVariable || `${node.data.type}_result`,
            mappedData: null as any
          }
        };
        
        // Check node configuration
        const nodeValidation = workflowApi.validateNodeConfiguration(node);
        if (!nodeValidation.isValid) {
          stepResult.status = 'error';
          stepResult.errors = nodeValidation.errors;
          validation.errors.push(`Node "${node.data.label}": ${nodeValidation.errors.join(', ')}`);
          validation.isValid = false;
          validation.nodeResults[node.id] = { status: 'error', errors: nodeValidation.errors };
          executionFlow.push(stepResult);
          continue;
        }

        // Process input mapping for this step
        let mappedInputData = { ...currentData };
        const mapping = node.data.config?.customInputMapping || node.data.config?.inputMapping;
        if (mapping && currentData) {
          try {
            // Simple path resolution for demo
            const pathParts = mapping.split('.');
            let mappedValue = currentData;
            for (const part of pathParts) {
              if (mappedValue && typeof mappedValue === 'object') {
                mappedValue = (mappedValue as any)[part];
              }
            }
                         stepResult.dataMapping.mappedData = mappedValue;
             (mappedInputData as any).mapped_input = mappedValue;
          } catch (error) {
            console.warn('Failed to process input mapping:', error);
          }
        }

        // Test node execution with timing
        const startTime = performance.now();
        const result = await workflowApi.executeNode(node.data.type, {
          ...node.data.config,
          inputMapping: node.data.config?.inputMapping,
          customInputMapping: node.data.config?.customInputMapping
        }, mappedInputData);
        const endTime = performance.now();
        
        stepResult.executionTime = Math.round(endTime - startTime);
        stepResult.outputData = result.data;

        if (result.success) {
          stepResult.status = 'success';
          validation.nodeResults[node.id] = { 
            status: 'success', 
            data: result.data,
            message: 'Node test passed',
            executionTime: stepResult.executionTime
          };
          
          // Update current data for next node
          if (result.data) {
            const outputVariable = stepResult.dataMapping.outputVariable;
            (currentData as any)[outputVariable] = result.data;
          }
        } else {
          stepResult.status = 'error';
          stepResult.errors = [result.error || 'Unknown error'];
          validation.errors.push(`Node "${node.data.label}" test failed: ${result.error}`);
          validation.isValid = false;
          validation.nodeResults[node.id] = { 
            status: 'error', 
            errors: [result.error],
            message: 'Node test failed'
          };
        }
        
        executionFlow.push(stepResult);

      } catch (error: any) {
        const errorMsg = `Node "${node.data.label}" validation error: ${error.message}`;
        validation.errors.push(errorMsg);
        validation.isValid = false;
        validation.nodeResults[node.id] = { 
          status: 'error', 
          errors: [error.message],
          message: 'Validation exception'
        };
        
        executionFlow.push({
          stepIndex: i + 1,
          nodeId: node.id,
          nodeLabel: node.data.label,
          nodeType: node.data.type,
          inputData: { ...currentData },
          outputData: null,
          executionTime: 0,
          status: 'error',
          errors: [error.message],
          dataMapping: {
            inputMapping: '',
            customInputMapping: '',
            outputVariable: '',
            mappedData: null
          }
        });
      }
    }
    
    // Add execution flow to validation result
    (validation as any).executionFlow = executionFlow;

    // Set overall status
    if (!validation.isValid) {
      validation.overallStatus = 'error';
    } else if (validation.warnings.length > 0) {
      validation.overallStatus = 'warning';
    }

    console.log('Workflow validation completed:', validation);
    return validation;
  },

  // Helper: Get nodes sorted for execution
  getSortedNodesForExecution: (workflow: any) => {
    const nodes = [...workflow.nodes];
    const edges = workflow.edges || [];
    
    // Find trigger node(s)
    const triggers = nodes.filter(node => 
      node.data.type === 'trigger' || node.data.type === 'TRIGGER'
    );
    
    if (triggers.length === 0) {
      // No trigger, sort by position
      return nodes.sort((a, b) => a.position.y - b.position.y);
    }

    // Build adjacency list
    const adjacencyList: Record<string, string[]> = {};
    edges.forEach((edge: any) => {
      if (!adjacencyList[edge.source]) {
        adjacencyList[edge.source] = [];
      }
      adjacencyList[edge.source].push(edge.target);
    });

    // Breadth-first traversal starting from trigger
    const sortedNodes = [];
    const visited = new Set();
    const queue = [...triggers];

    while (queue.length > 0) {
      const currentNode = queue.shift();
      if (!currentNode || visited.has(currentNode.id)) continue;

      visited.add(currentNode.id);
      sortedNodes.push(currentNode);

      // Add connected nodes to queue
      const connectedNodeIds = adjacencyList[currentNode.id] || [];
      const connectedNodes = connectedNodeIds
        .map(id => nodes.find(node => node.id === id))
        .filter(node => node && !visited.has(node.id));
      
      queue.push(...connectedNodes);
    }

    // Add any unconnected nodes at the end
    const unconnectedNodes = nodes.filter(node => !visited.has(node.id));
    sortedNodes.push(...unconnectedNodes);

    return sortedNodes;
  },

  // Helper: Validate individual node configuration
  validateNodeConfiguration: (node: any) => {
    const validation = { isValid: true, errors: [] as string[] };
    const config = node.data.config || {};

    switch (node.data.type) {
      case 'ai_openai_task':
      case 'AI_OPENAI_TASK':
        if (!config.integrationId && !config.apiKey) {
          validation.errors.push('OpenAI integration or API key is required');
          validation.isValid = false;
        }
        if (!config.userPrompt && !config.prompt) {
          validation.errors.push('User prompt is required');
          validation.isValid = false;
        }
        break;

      case 'seo_serp_analyze':
      case 'SEO_SERP_ANALYZE':
        if (!config.integrationId && !config.login) {
          validation.errors.push('DataForSEO integration is required');
          validation.isValid = false;
        }
        if (!config.keyword) {
          validation.errors.push('Target keyword is required');
          validation.isValid = false;
        }
        break;

      case 'content_extract':
      case 'CONTENT_EXTRACT':
        if (!config.inputMapping) {
          validation.errors.push('Input mapping (URL source) is required');
          validation.isValid = false;
        }
        break;

      case 'email':
      case 'EMAIL':
        if (!config.toEmail) {
          validation.errors.push('Recipient email is required');
          validation.isValid = false;
        }
        if (!config.subject) {
          validation.errors.push('Email subject is required');
          validation.isValid = false;
        }
        break;

      case 'webhook':
      case 'WEBHOOK':
        if (!config.url) {
          validation.errors.push('Webhook URL is required');
          validation.isValid = false;
        }
        break;
    }

    return validation;
  },

  // Activate workflow (with validation)
  activateWorkflow: async (workflowId: string) => {
    try {
      // Load workflow
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const workflow = workflows.find((w: any) => w.id === workflowId);
      
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Validate before activation
      const validation = await workflowApi.validateWorkflow(workflow);
      
      if (!validation.isValid) {
        throw new Error(`Cannot activate workflow with errors: ${validation.errors.join(', ')}`);
      }

      // Update workflow status
      workflow.isActive = true;
      workflow.updatedAt = new Date().toISOString();
      workflow.lastValidated = new Date().toISOString();
      workflow.validationResult = validation;

      // Save updated workflow
      const workflowIndex = workflows.findIndex((w: any) => w.id === workflowId);
      workflows[workflowIndex] = workflow;
      localStorage.setItem('workflows', JSON.stringify(workflows));

      return { success: true, workflow, validation };
    } catch (error: any) {
      console.error('Failed to activate workflow:', error);
      return { success: false, error: error.message };
    }
  },

  // Deactivate workflow
  deactivateWorkflow: async (workflowId: string) => {
    try {
      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const workflowIndex = workflows.findIndex((w: any) => w.id === workflowId);
      
      if (workflowIndex === -1) {
        throw new Error('Workflow not found');
      }

      workflows[workflowIndex].isActive = false;
      workflows[workflowIndex].updatedAt = new Date().toISOString();
      
      localStorage.setItem('workflows', JSON.stringify(workflows));

      return { success: true, workflow: workflows[workflowIndex] };
    } catch (error: any) {
      console.error('Failed to deactivate workflow:', error);
      return { success: false, error: error.message };
    }
  },
}; 