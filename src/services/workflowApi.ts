// Using fetch instead of axios for better compatibility
import { WorkflowNodeType, StandardNodeResponse, AvailableDataNode, DataStructureItem } from '../types/workflow';

// API_BASE_URL temporarily unused - will be restored when fixing API integration
// const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Global storage for workflow execution data (in real app, this would be in a state management solution)
let globalWorkflowData: Record<string, StandardNodeResponse> = {};

// Helper function to generate unique execution ID (commented out temporarily during refactoring)
/*
const generateExecutionId = (): string => {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
*/

// Helper function to create standardized node response (commented out temporarily during refactoring)
/*
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
*/

// Helper function to extract key summary data from API responses (commented out temporarily during refactoring)
/*
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
*/

// Enhanced function to analyze complete data structure for comprehensive JSON access
const analyzeDataStructure = (data: any, path: string = '', level: number = 0, maxDepth: number = 20): DataStructureItem[] => {
  if (level > maxDepth) return []; // Prevent infinite recursion but allow deeper exploration
  
  const items: DataStructureItem[] = [];
  
  if (Array.isArray(data)) {
    // Add array accessor for all items
    items.push({
      path: path + '[*]',
      label: `All items (${data.length} total)`,
      type: 'array',
      isArray: true,
      arrayItemType: data.length > 0 ? typeof data[0] : 'unknown',
      sampleValue: `Array of ${data.length} items`,
      children: data.length > 0 && typeof data[0] === 'object' ? analyzeDataStructure(data[0], path + '[0]', level + 1, maxDepth) : []
    });
    
    // Add specific index accessors for first few items
    const maxIndexes = Math.min(data.length, 5); // Show first 5 items
    for (let i = 0; i < maxIndexes; i++) {
      const indexPath = `${path}[${i}]`;
      const item = data[i];
      
      items.push({
        path: indexPath,
        label: `Item ${i}`,
        type: Array.isArray(item) ? 'array' : typeof item as any,
        isArray: Array.isArray(item),
        sampleValue: typeof item === 'object' ? `${Array.isArray(item) ? 'Array' : 'Object'} with ${Object.keys(item || {}).length} properties` : item,
        children: typeof item === 'object' && item !== null ? analyzeDataStructure(item, indexPath, level + 1, maxDepth) : []
      });
    }
    
    // If array has more items, add a note
    if (data.length > 5) {
      items.push({
        path: `${path}[5+]`,
        label: `... and ${data.length - 5} more items`,
        type: 'info',
        sampleValue: `Use [*] to access all items or specify index like [${data.length - 1}]`
      });
    }
  } else if (typeof data === 'object' && data !== null) {
    // Sort keys for better UX - put common keys first
    const commonKeys = ['id', 'name', 'title', 'url', 'keyword', 'content', 'status', 'type'];
    const allKeys = Object.keys(data);
    const sortedKeys = [
      ...commonKeys.filter(key => allKeys.includes(key)),
      ...allKeys.filter(key => !commonKeys.includes(key)).sort()
    ];
    
    sortedKeys.forEach(key => {
      const value = data[key];
      const newPath = path ? `${path}.${key}` : key;
      const type = Array.isArray(value) ? 'array' : typeof value as any;
      
      let sampleValue;
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          sampleValue = `Array with ${value.length} items`;
        } else {
          sampleValue = `Object with ${Object.keys(value).length} properties`;
        }
      } else {
        sampleValue = value;
      }
      
      items.push({
        path: newPath,
        label: key,
        type,
        isArray: Array.isArray(value),
        sampleValue,
        children: typeof value === 'object' && value !== null ? analyzeDataStructure(value, newPath, level + 1, maxDepth) : []
      });
    });
  } else {
    // Primitive value
    items.push({
      path,
      label: 'Value',
      type: typeof data as any,
      sampleValue: data
    });
  }
  
  return items;
};

// Function to analyze both processed and raw data comprehensively
const analyzeCompleteDataStructure = (nodeResponse: StandardNodeResponse): any => {
  const structure: any = {
    processed: {
      label: 'Processed Data',
      description: 'Cleaned and structured data ready for use',
      paths: analyzeDataStructure(nodeResponse.data.processed, 'processed', 0, 15)
    },
    raw: {
      label: 'Raw API Response', 
      description: 'Complete original API response with all available data',
      paths: analyzeDataStructure(nodeResponse.data.raw, 'raw', 0, 15)
    },
    summary: {
      label: 'Summary Data',
      description: 'Key metrics and extracted insights',
      paths: analyzeDataStructure(nodeResponse.data.summary, 'summary', 0, 10)
    }
  };
  
  // Add metadata if available
  if (nodeResponse.apiMetadata) {
    structure.metadata = {
      label: 'API Metadata',
      description: 'Information about the API call',
      paths: analyzeDataStructure(nodeResponse.apiMetadata, 'metadata', 0, 5)
    };
  }
  
  return structure;
};

// Function to get available data from executed nodes with comprehensive structure
export const getAvailableDataNodes = (): AvailableDataNode[] => {
  return Object.values(globalWorkflowData)
    .filter(response => response.status === 'success')
    .map(response => ({
      nodeId: response.nodeId,
      nodeLabel: response.nodeId, // In real app, would get from node metadata
      nodeType: response.nodeType,
      executedAt: response.executedAt,
      status: response.status as 'success', // Safe cast since we filtered for success
      dataStructure: analyzeDataStructure(response.data.processed), // Keep for backward compatibility
      completeStructure: analyzeCompleteDataStructure(response), // New comprehensive structure
      // Required properties for compatibility
      id: response.nodeId,
      data: response.data
    }));
};

// Function to clear workflow data (for development reset)
export const clearWorkflowData = () => {
  globalWorkflowData = {};
  console.log('🧹 Workflow data cleared');
};

// Function to store node result (used by node testing)
export const storeNodeResult = async (nodeId: string, response: StandardNodeResponse) => {
  globalWorkflowData[nodeId] = response;
  console.log(`📊 Stored node result for ${nodeId}:`, response);
  return { success: true };
};

// Function to get stored node data for variable selector
export const getStoredNodeData = (nodeId: string) => {
  return globalWorkflowData[nodeId]?.data?.processed || null;
};

// Function to get full stored node response
export const getStoredNodeResponse = (nodeId: string) => {
  return globalWorkflowData[nodeId] || null;
};

// Function to populate test data for development
export const populateTestWorkflowData = () => {
  try {
    const testData = {
      serp_analysis_1: {
        executionId: 'exec_test_123',
        nodeId: 'serp_analysis_1',
        nodeType: WorkflowNodeType.SEO_SERP_GOOGLE_ORGANIC,
        status: 'success' as const,
        executedAt: new Date().toISOString(),
        executionTime: 1250,
        data: {
          processed: {
            results: [{
              keyword: "marketing strategies",
              type: "organic",
              se_domain: "google.com",
              location_code: 2840,
              language_code: "en",
              total_count: 10,
              se_results_count: 1250000000,
              items: [
                {
                  type: "organic",
                  rank_absolute: 1,
                  rank_group: 1,
                  position: "left",
                  url: "https://blog.hubspot.com/marketing/marketing-strategies",
                  title: "10 Marketing Strategies to Fuel Your Business Growth",
                  description: "Discover 10 proven marketing strategies that can help grow your business. From content marketing to social media, learn which tactics work best.",
                  domain: "hubspot.com",
                  breadcrumb: "HubSpot › Blog › Marketing"
                },
                {
                  type: "organic",
                  rank_absolute: 2,
                  rank_group: 2,
                  position: "left",
                  url: "https://www.salesforce.com/resources/articles/digital-marketing/",
                  title: "Digital Marketing Strategies for 2024: Complete Guide",
                  description: "Learn about the latest digital marketing strategies for 2024. Includes tactics for email marketing, social media, SEO, and more.",
                  domain: "salesforce.com",
                  breadcrumb: "Salesforce › Resources › Articles"
                },
                {
                  type: "organic",
                  rank_absolute: 3,
                  rank_group: 3,
                  position: "left",
                  url: "https://neilpatel.com/blog/marketing-strategies-that-work/",
                  title: "7 Marketing Strategies That Actually Work in 2024",
                  description: "Neil Patel shares 7 marketing strategies that are proven to work. Includes case studies and practical implementation tips.",
                  domain: "neil-patel.com",
                  breadcrumb: "Neil Patel › Blog"
                }
              ]
            }]
          },
          raw: {
            // Realistic DataForSEO raw API response structure
            version: "0.1.20240101",
            status_code: 20000,
            status_message: "Ok.",
            time: "0.1234 sec.",
            cost: 0.001,
            tasks_count: 1,
            tasks_error: 0,
            tasks: [{
              id: "01041758-1535-0216-0000-08b133c49f95",
              status_code: 20000,
              status_message: "Ok.",
              time: "0.0937 sec.",
              cost: 0.001,
              result_count: 1,
              path: ["v3", "serp", "google", "organic", "live", "advanced"],
              data: {
                api: "serp",
                function: "live",
                se: "google",
                se_type: "organic",
                language_code: "en",
                location_code: 2840,
                keyword: "marketing strategies",
                device: "desktop",
                os: "windows"
              },
              result: [{
                keyword: "marketing strategies",
                type: "organic",
                se_domain: "google.com",
                location_code: 2840,
                language_code: "en",
                check_url: "https://www.google.com/search?q=marketing+strategies&num=100&hl=en&gl=us&gws_rd=cr",
                datetime: "2024-01-15 12:34:56 +00:00",
                spell: null,
                refinement_chips: null,
                item_types: ["organic", "people_also_ask", "featured_snippet"],
                se_results_count: 1250000000,
                items_count: 100,
                items: [
                  {
                    type: "organic",
                    rank_group: 1,
                    rank_absolute: 1,
                    position: "left",
                    xpath: "/html[1]/body[1]/div[6]/div[1]/div[14]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/span[1]/a[1]",
                    domain: "hubspot.com",
                    title: "10 Marketing Strategies to Fuel Your Business Growth",
                    url: "https://blog.hubspot.com/marketing/marketing-strategies",
                    cache_url: "https://webcache.googleusercontent.com/search?q=cache:...",
                    related_search_url: "https://www.google.com/search?gl=us&hl=en&q=related:https://blog.hubspot.com/marketing/marketing-strategies+marketing+strategies",
                    breadcrumb: "HubSpot › Blog › Marketing",
                    website_name: "HubSpot Blog",
                    is_image: false,
                    is_video: false,
                    is_featured_snippet: false,
                    is_malicious: false,
                    description: "Discover 10 proven marketing strategies that can help grow your business. From content marketing to social media, learn which tactics work best.",
                    pre_snippet: null,
                    extended_snippet: null,
                    amp_version: false,
                    rating: null,
                    highlighted: ["marketing", "strategies"],
                    links: [
                      {
                        type: "sitelink",
                        title: "Content Marketing",
                        description: "Learn about content marketing strategies",
                        url: "https://blog.hubspot.com/marketing/content-marketing"
                      }
                    ],
                    about_this_result: {
                      type: "search_result",
                      url: "https://blog.hubspot.com/marketing/marketing-strategies",
                      source: {
                        description: "HubSpot is a leading CRM platform that provides software and support to help businesses grow better.",
                        source_info_url: "https://blog.hubspot.com/marketing/marketing-strategies",
                        security: "secure",
                        icon: "https://blog.hubspot.com/favicon.ico"
                      }
                    },
                    main_domain: "hubspot.com",
                    relative_url: "/marketing/marketing-strategies",
                    etv: 0.0012396671157330275,
                    impressions_etv: 0.0012396671157330275,
                    estimated_paid_traffic_cost: 0.0012396671157330275,
                    clickstream_etv: 0.0012396671157330275
                  }
                ]
              }]
            }]
          },
          summary: {
            keyword: "marketing strategies",
            total_count: 10,
            se_results_count: 1250000000,
            top_urls: [
              "https://blog.hubspot.com/marketing/marketing-strategies",
              "https://www.salesforce.com/resources/articles/digital-marketing/",
              "https://neilpatel.com/blog/marketing-strategies-that-work/"
            ],
            top_domains: ["hubspot.com", "salesforce.com", "neil-patel.com"]
          }
        },
        apiMetadata: {
          provider: 'DataForSEO',
          endpoint: '/v3/serp/google/organic/live/advanced',
          creditsUsed: 0.001,
          requestId: 'test-request-123'
        }
      },
      content_extract_1: {
        executionId: 'exec_test_456',
        nodeId: 'content_extract_1',
        nodeType: WorkflowNodeType.CONTENT_EXTRACT,
        status: 'success' as const,
        executedAt: new Date().toISOString(),
        executionTime: 2850,
        data: {
          processed: [
            {
              url: "https://blog.hubspot.com/marketing/marketing-strategies",
              title: "10 Marketing Strategies to Fuel Your Business Growth",
              content: "Marketing strategies are essential for business growth. Here are 10 proven tactics: 1. Content Marketing - Create valuable content that addresses your audience's pain points. 2. Social Media Marketing - Engage with customers on platforms where they spend time. 3. Email Marketing - Build relationships through personalized email campaigns...",
              word_count: 2847,
              meta_description: "Discover 10 proven marketing strategies that can help grow your business.",
              headings: [
                { level: 1, text: "10 Marketing Strategies to Fuel Your Business Growth" },
                { level: 2, text: "1. Content Marketing" },
                { level: 2, text: "2. Social Media Marketing" },
                { level: 2, text: "3. Email Marketing" }
              ],
              extracted_at: new Date().toISOString()
            },
            {
              url: "https://www.salesforce.com/resources/articles/digital-marketing/",
              title: "Digital Marketing Strategies for 2024: Complete Guide",
              content: "Digital marketing continues to evolve rapidly. In 2024, successful businesses focus on: Personalization at scale, AI-powered customer insights, Omnichannel experiences, Data-driven decision making...",
              word_count: 3156,
              meta_description: "Learn about the latest digital marketing strategies for 2024.",
              headings: [
                { level: 1, text: "Digital Marketing Strategies for 2024" },
                { level: 2, text: "Personalization at Scale" },
                { level: 2, text: "AI-Powered Insights" }
              ],
              extracted_at: new Date().toISOString()
            }
          ],
          raw: {
            // Realistic content extraction raw response
            request_id: "content_extract_456",
            status: "completed",
            urls_processed: 2,
            extraction_time: "2.85s",
            results: [
              {
                url: "https://blog.hubspot.com/marketing/marketing-strategies",
                status: "success",
                status_code: 200,
                headers: {
                  "content-type": "text/html; charset=utf-8",
                  "content-length": "45678",
                  "last-modified": "2024-01-15T10:30:00Z"
                },
                html: "<html><head><title>10 Marketing Strategies to Fuel Your Business Growth</title>...",
                text: "Marketing strategies are essential for business growth. Here are 10 proven tactics: 1. Content Marketing - Create valuable content that addresses your audience's pain points. 2. Social Media Marketing - Engage with customers on platforms where they spend time. 3. Email Marketing - Build relationships through personalized email campaigns...",
                structured_data: {
                  title: "10 Marketing Strategies to Fuel Your Business Growth",
                  meta_description: "Discover 10 proven marketing strategies that can help grow your business.",
                  meta_keywords: "marketing, strategies, business growth, digital marketing",
                  canonical_url: "https://blog.hubspot.com/marketing/marketing-strategies",
                  author: "HubSpot Marketing Team",
                  published_date: "2024-01-15",
                  word_count: 2847,
                  reading_time: "12 minutes",
                  language: "en",
                  headings: {
                    h1: ["10 Marketing Strategies to Fuel Your Business Growth"],
                    h2: ["1. Content Marketing", "2. Social Media Marketing", "3. Email Marketing", "4. SEO Optimization"],
                    h3: ["Content Types That Convert", "Best Platforms for Your Audience", "Email Automation Strategies"]
                  },
                  images: [
                    {
                      src: "https://blog.hubspot.com/hs-fs/hubfs/marketing-strategies-hero.jpg",
                      alt: "Marketing strategies infographic",
                      width: 1200,
                      height: 800
                    }
                  ],
                  links: {
                    internal: 15,
                    external: 8,
                    nofollow: 3
                  }
                },
                performance: {
                  load_time: 1.25,
                  content_extraction_time: 0.85,
                  parsing_time: 0.35
                }
              },
              {
                url: "https://www.salesforce.com/resources/articles/digital-marketing/",
                status: "success",
                status_code: 200,
                headers: {
                  "content-type": "text/html; charset=utf-8",
                  "content-length": "52341",
                  "last-modified": "2024-01-14T15:45:00Z"
                },
                html: "<html><head><title>Digital Marketing Strategies for 2024: Complete Guide</title>...",
                text: "Digital marketing continues to evolve rapidly. In 2024, successful businesses focus on: Personalization at scale, AI-powered customer insights, Omnichannel experiences, Data-driven decision making...",
                structured_data: {
                  title: "Digital Marketing Strategies for 2024: Complete Guide",
                  meta_description: "Learn about the latest digital marketing strategies for 2024.",
                  canonical_url: "https://www.salesforce.com/resources/articles/digital-marketing/",
                  author: "Salesforce Marketing Cloud",
                  published_date: "2024-01-14",
                  word_count: 3156,
                  reading_time: "15 minutes",
                  language: "en"
                }
              }
            ]
          },
          summary: {
            total_pages: 2,
            total_content_length: 6003,
            extracted_urls: [
              "https://blog.hubspot.com/marketing/marketing-strategies",
              "https://www.salesforce.com/resources/articles/digital-marketing/"
            ]
          }
        },
        inputData: {
          inputMapping: "serp_analysis_1.results[0].items[*].url",
          urls: [
            "https://blog.hubspot.com/marketing/marketing-strategies",
            "https://www.salesforce.com/resources/articles/digital-marketing/"
          ]
        }
      }
    };

    globalWorkflowData = testData;
    console.log('🧪 Test workflow data populated:', Object.keys(testData));
    console.log('📊 Available data nodes:', Object.keys(testData));
    return testData;
  } catch (error) {
    console.error('Failed to populate test data:', error);
    return {};
  }
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

// Enhanced variable processing helper for new format  
export const processVariables = (text: string, workflowData: Record<string, any>): string => {
  if (!text) return text;
  
  console.log('🔄 Processing variables in text:', text);
  console.log('📊 Available workflow data:', Object.keys(workflowData));
  
  // Replace variables in format {{node_id.property}} or {{node_id.property|format}}
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableExpression) => {
    try {
      // Split format if exists (e.g., "node_id.path|list")
      const [path, format] = variableExpression.split('|');
      const trimmedPath = path.trim();
      
      console.log(`🔍 Processing variable: ${trimmedPath}, format: ${format || 'none'}`);
      
      // Resolve the data path
      let value = resolveVariablePath(trimmedPath, workflowData);
      
      if (value === undefined || value === null) {
        console.warn(`❌ Variable ${trimmedPath} not found in workflow data`);
        return match; // Return original if not found
      }
      
      console.log(`✅ Variable ${trimmedPath} resolved to:`, value);
      
      // Apply formatting if specified
      if (format) {
        value = applyVariableFormat(value, format.trim());
      }
      
      return String(value || '');
    } catch (error) {
      console.warn(`❌ Failed to process variable ${variableExpression}:`, error);
      return match; // Return original on error
    }
  });
};

// Resolve variable path with support for arrays and complex paths
export const resolveVariablePath = (path: string, workflowData: Record<string, any>): any => {
  console.log('🔍 Resolving variable path:', path);
  console.log('📊 Available data keys:', Object.keys(workflowData));
  
  const pathParts = path.split('.');
  let current = workflowData;
  
  console.log('🗂️ Path parts:', pathParts);
    
  for (const part of pathParts) {
    if (part.includes('[') && part.includes(']')) {
      // Handle array access like items[0] or items[*]
      const match = part.match(/(\w+)\[([0-9*]+)\]/);
      if (match) {
        const [, arrayKey, index] = match;
        if (current[arrayKey] && Array.isArray(current[arrayKey])) {
          if (index === '*') {
            // Return the entire array for * index
            current = current[arrayKey];
          } else {
            current = current[arrayKey][parseInt(index)];
          }
        } else {
        return undefined;
        }
      }
    } else {
      console.log(`📝 Accessing property '${part}' on:`, typeof current, current ? Object.keys(current) : 'null/undefined');
      current = current[part];
      console.log(`📥 Result after '${part}':`, typeof current, current);
    }
    
    if (current === undefined) {
      console.log(`❌ Path resolution stopped at '${part}' - value undefined`);
      break;
    }
  }
  
  console.log('✅ Final resolved value:', current);
  return current;
};

// Apply formatting to variable values
const applyVariableFormat = (value: any, format: string): string => {
  switch (format.toLowerCase()) {
    case 'list':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value || '');
      
    case 'json':
      return JSON.stringify(value, null, 2);
      
    case 'count':
      if (Array.isArray(value)) {
        return String(value.length);
      }
      return '1';
      
    case 'first':
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }
      return String(value || '');
      
    case 'last':
      if (Array.isArray(value) && value.length > 0) {
        return String(value[value.length - 1]);
      }
      return String(value || '');
      
    default:
      return String(value || '');
  }
};

// Task polling function for asynchronous DataForSEO tasks
const pollTaskCompletion = async (taskId: string, initialResult: any): Promise<any> => {
  const maxAttempts = 10; // 5 minutes with 30-second intervals
  const pollInterval = 30000; // 30 seconds
  
  console.log(`🔄 Starting task polling for task ID: ${taskId}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Get authentication token
      const token = localStorage.getItem('ryvr_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Check task status
      const backendUrl = 'https://ryvr-backend.onrender.com';
      const statusUrl = `${backendUrl}/api/v1/seo/serp/status/${taskId}`;
      
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      console.log(`📊 Task status check ${attempt}/${maxAttempts}:`, statusData.status);
      
      if (statusData.status === 'completed') {
        // Task completed, try to get results
        const resultsUrl = `${backendUrl}/api/v1/seo/serp/results/${taskId}`;
        
        try {
          const resultsResponse = await fetch(resultsUrl, {
            method: 'GET',
            headers
          });
          
          if (!resultsResponse.ok) {
            if (resultsResponse.status === 500) {
              // Backend error processing results, treat as still processing
              console.warn(`⚠️ Backend error processing results (500), treating as still processing...`);
              if (attempt < maxAttempts) {
                console.log(`⏳ Waiting ${pollInterval/1000}s before next check...`);
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue; // Go back to status check
              } else {
                throw new Error(`Results processing failed after ${maxAttempts} attempts`);
              }
            }
            throw new Error(`Results retrieval failed: ${resultsResponse.status}`);
          }
          
          const resultsData = await resultsResponse.json();
          console.log(`✅ Task completed successfully, retrieved results`);
          
          // Convert backend standardized format to frontend expected format
          if (resultsData.data) {
            const backendData = resultsData.data;
            
            // Transform to expected frontend structure
            const frontendFormat = {
              results: [{
                keyword: backendData.keyword,
                type: 'organic',
                se_domain: backendData.se_domain || 'google.com',
                location_code: backendData.location,
                language_code: backendData.language,
                check_url: `https://www.google.com/search?q=${encodeURIComponent(backendData.keyword || '')}`,
                datetime: new Date().toISOString(),
                total_count: backendData.total_results || (backendData.all_results ? backendData.all_results.length : 0),
                se_results_count: backendData.total_results || 1000000,
                items: backendData.all_results || backendData.organic_results || []
              }],
              // Also include raw backend response for advanced users
              raw_api_response: resultsData
            };
            
            console.log(`🔄 Converted backend format to frontend format:`, frontendFormat);
            return frontendFormat;
          }
          
          // Fallback: return as-is if no data property
          return resultsData;
          
        } catch (fetchError: any) {
          // If results fetch fails, treat as still processing
          console.warn(`⚠️ Error fetching results: ${fetchError.message}, retrying...`);
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            continue; // Go back to status check
          } else {
            throw new Error(`Results retrieval failed after ${maxAttempts} attempts: ${fetchError.message}`);
          }
        }
      } else if (statusData.status === 'failed') {
        throw new Error(`Task failed: ${statusData.message}`);
      } else if (statusData.status === 'processing') {
        // Task still processing, wait and try again
        if (attempt < maxAttempts) {
          console.log(`⏳ Task still processing, waiting ${pollInterval/1000}s before next check...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        } else {
          throw new Error('Task timed out after maximum attempts');
        }
      } else {
        throw new Error(`Unknown task status: ${statusData.status}`);
      }
    } catch (error: any) {
      console.error(`❌ Task polling error (attempt ${attempt}):`, error.message);
      
      if (attempt === maxAttempts) {
        // Final attempt failed, return initial result with error
        return {
          ...initialResult,
          error: error.message,
          status: 'failed'
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  throw new Error('Task polling exceeded maximum attempts');
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
          // Process variables in config values
          const processedKeyword = finalConfig.keyword ? processVariables(finalConfig.keyword, inputData) : inputData.keyword;
          const processedTarget = finalConfig.target ? processVariables(finalConfig.target, inputData) : undefined;
          
          // Validate required fields
          if (!processedKeyword) {
            throw new Error('Keyword is required for SERP analysis');
          }
          
          const keyword = processedKeyword;
          const locationCode = finalConfig.locationCode || 2840;
          const languageCode = finalConfig.languageCode || 'en';
          const maxResults = finalConfig.maxResults || 10;
          
          console.log(`🔗 Making SERP API call for keyword: ${keyword}`);
          console.log(`🌍 Location: ${locationCode}, Language: ${languageCode}, Max Results: ${maxResults}`);
          
          // Use backend API instead of direct DataForSEO calls
          const params = new URLSearchParams({
            keyword: keyword,
            location_code: locationCode.toString(),
            language_code: languageCode,
            ...(maxResults && { depth: maxResults.toString() }),
            ...(finalConfig.device && { device: finalConfig.device }),
            ...(finalConfig.os && { os: finalConfig.os }),
            ...(processedTarget && { target: processedTarget }), // Use processed target
            ...(finalConfig.resultType && { result_type: finalConfig.resultType }),
            ...(finalConfig.dateRange && { date_range: finalConfig.dateRange }),
            // Set organic_only to true if result type is organic_only
            ...(finalConfig.resultType === 'organic_only' && { organic_only: 'true' })
          });
          
          try {
            console.log('🔍 SERP API Request params:', Object.fromEntries(params));
            
            // Try backend API first, fallback to mock data if not available
            // Production backend URL
            const backendUrl = 'https://ryvr-backend.onrender.com';
            
            // For local development, uncomment this line:
            // const backendUrl = 'http://localhost:8000';
            
            const apiUrl = `${backendUrl}/api/v1/seo/serp/analyze?${params}`;
            console.log(`🔗 Attempting API call to: ${apiUrl}`);
            
            // Get authentication token from localStorage
            const token = localStorage.getItem('ryvr_token');
            const headers: Record<string, string> = {
              'Content-Type': 'application/json'
            };
            
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
              console.log(`🔐 Using authentication token for API request`);
            } else {
              console.warn(`⚠️ No authentication token found - API call may fail`);
            }
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers
            });
            
            if (!response.ok) {
              // Handle authentication errors by redirecting to login
              if (response.status === 401 || response.status === 403) {
                console.warn(`🚫 Authentication failed (${response.status}) - redirecting to login`);
                
                // Clear stored authentication data
                localStorage.removeItem('ryvr_token');
                localStorage.removeItem('ryvr_user');
                
                // Redirect to login page
                window.location.href = '/login';
                
                throw new Error(`Authentication failed: ${response.status}`);
              }
              
              console.warn(`⚠️ Backend API not available (${response.status}), using mock data`);
              throw new Error(`Backend API error: ${response.status}`);
            }
            
            const apiResponse = await response.json();
            console.log(`✅ Backend SERP API response received:`, apiResponse);
            
            // Handle asynchronous task submission
            if (apiResponse.status === 'submitted' && apiResponse.task_id) {
              console.log(`📋 Task submitted with ID: ${apiResponse.task_id}`);
              
              // Start polling for task completion and get final results
              result = await pollTaskCompletion(apiResponse.task_id, {
                status: 'submitted',
                task_id: apiResponse.task_id,
                message: apiResponse.message,
                input_data: apiResponse.input_data,
                provider: apiResponse.provider,
                task_type: apiResponse.task_type,
                timestamp: apiResponse.timestamp
              });
            } else if (apiResponse.success && apiResponse.data) {
              // Use the standardized response from our backend
              result = apiResponse.data.processed || apiResponse.data;
            } else if (apiResponse.tasks && apiResponse.tasks[0] && apiResponse.tasks[0].result) {
              // Fallback: Handle direct DataForSEO API response format
              const taskResult = apiResponse.tasks[0].result[0];
            
            if (!taskResult) {
                  throw new Error('No SERP results returned from API');
            }
            
            // Map DataForSEO response to expected structure for variable system
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
            } else {
              throw new Error('Invalid API response structure');
            }
            
        } catch (error: any) {
            console.warn('⚠️ Backend API not available, using mock SERP data:', error.message);
            
            // Fallback to mock data when backend is not available
            const mockItems = [];
            const requestedCount = maxResults || 10;
            
            // Generate mock organic results based on settings
            for (let i = 0; i < requestedCount; i++) {
              const mockItem = {
                type: 'organic',
                rank_group: 1,
                rank_absolute: i + 1,
                position: 'left',
                title: `${keyword} - Example Result ${i + 1}`,
                domain: `example${i + 1}.com`,
                url: `https://example${i + 1}.com/page-about-${keyword.toLowerCase().replace(/\s+/g, '-')}`,
                description: `This is a mock organic search result for ${keyword}. Result ${i + 1} provides comprehensive information about ${keyword.toLowerCase()}.`,
                breadcrumb: `example${i + 1}.com › ${keyword.toLowerCase()}`,
                is_paid: false
              };
              
              // Add result type specific fields if needed
              if (finalConfig.resultType === 'news') {
                mockItem.title = `${keyword} News - Latest Updates ${i + 1}`;
                mockItem.description = `Breaking news about ${keyword}. Stay updated with the latest developments.`;
              }
              
              mockItems.push(mockItem);
            }
            
            // Create mock response matching expected structure
            result = {
              results: [{
                keyword: keyword,
                type: 'organic',
                se_domain: 'google.com',
                location_code: locationCode,
                language_code: languageCode,
                check_url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
                datetime: new Date().toISOString(),
                total_count: mockItems.length,
                se_results_count: 1000000,
                items: mockItems
              }]
            };
            
            // Mark as mock data using type assertion
            (result as any).is_mock_data = true;
            
            console.log(`🎭 Generated ${mockItems.length} mock SERP results for keyword: ${keyword}`);
            console.log(`ℹ️ To use real SERP data, ensure backend is running and accessible at the configured URL`);
          }
          
          // Log final result structure (works for both real and mock data)
          if (result && result.results && result.results[0]) {
            console.log(`📊 Final SERP data structure:`);
            console.log(`   - Keyword: ${result.results[0].keyword}`);
            console.log(`   - Total Items: ${result.results[0].total_count}`);
            console.log(`   - SE Results Count: ${result.results[0].se_results_count || 'N/A'}`);
            console.log(`   - Items Array Length: ${result.results[0].items.length}`);
            console.log(`   - Sample URLs: ${result.results[0].items.slice(0, 3).map((item: any) => item.url).filter(Boolean).join(', ')}`);
            console.log(`   - Data Source: ${(result as any).is_mock_data ? 'Mock Data' : 'Real API'}`);
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
          
        // Data Filter
        case 'data_filter':
        case WorkflowNodeType.DATA_FILTER:
          const dataSource = finalConfig.dataSource;
          if (!dataSource) {
            throw new Error('Data source is required for filtering');
          }

          // Extract data from input using the data source path
          let sourceData: any = inputData;
          const sourceParts = dataSource.split('.');
          
          for (const part of sourceParts) {
            if (part.includes('[') && part.includes(']')) {
              // Handle array access like items[0] or items[*]
              const arrayMatch = part.match(/(\w+)\[([^\]]*)\]/);
              if (arrayMatch) {
                const [, arrayKey, index] = arrayMatch;
                if (sourceData[arrayKey]) {
                  if (index === '*') {
                    sourceData = sourceData[arrayKey]; // Use entire array
                  } else {
                    sourceData = sourceData[arrayKey][parseInt(index)];
                  }
                }
              }
            } else {
              sourceData = sourceData?.[part];
            }
            
            if (sourceData === undefined) {
              throw new Error(`Data not found at path: ${dataSource}`);
            }
          }

          // Ensure we have an array to filter
          if (!Array.isArray(sourceData)) {
            throw new Error('Data source must point to an array for filtering');
          }

          // Apply filtering logic
          const filterProperty = finalConfig.filterProperty || '';
          const filterOperation = finalConfig.filterOperation || 'contains';
          const filterValue = finalConfig.filterValue || '';
          const caseSensitive = finalConfig.caseSensitive || false;
          const maxFilterResults = finalConfig.maxResults || 0;

          let filteredData = sourceData.filter((item: any) => {
            if (!filterProperty) return true; // No filter property means no filtering
            
            // Get the property value to filter on
            let itemValue = item;
            const propertyParts = filterProperty.split('.');
            for (const prop of propertyParts) {
              itemValue = itemValue?.[prop];
            }

            // Handle different filter operations
            switch (filterOperation) {
              case 'contains':
                return String(itemValue || '').toLowerCase().includes(
                  caseSensitive ? filterValue : filterValue.toLowerCase()
                );
              
              case 'not_contains':
                return !String(itemValue || '').toLowerCase().includes(
                  caseSensitive ? filterValue : filterValue.toLowerCase()
                );
              
              case 'equals':
                return caseSensitive 
                  ? String(itemValue) === filterValue 
                  : String(itemValue || '').toLowerCase() === filterValue.toLowerCase();
              
              case 'not_equals':
                return caseSensitive 
                  ? String(itemValue) !== filterValue 
                  : String(itemValue || '').toLowerCase() !== filterValue.toLowerCase();
              
              case 'starts_with':
                return String(itemValue || '').toLowerCase().startsWith(
                  caseSensitive ? filterValue : filterValue.toLowerCase()
                );
              
              case 'ends_with':
                return String(itemValue || '').toLowerCase().endsWith(
                  caseSensitive ? filterValue : filterValue.toLowerCase()
                );
              
              case 'greater_than':
                return Number(itemValue) > Number(filterValue);
              
              case 'less_than':
                return Number(itemValue) < Number(filterValue);
              
              case 'exists':
                return itemValue !== undefined && itemValue !== null;
              
              case 'not_exists':
                return itemValue === undefined || itemValue === null;
              
              default:
                return true;
            }
          });

          // Apply max results limit if specified
          if (maxFilterResults > 0) {
            filteredData = filteredData.slice(0, maxFilterResults);
          }

          result = {
            filtered_items: filteredData,
            total_filtered: filteredData.length,
            original_count: sourceData.length,
            filter_applied: {
              property: filterProperty,
              operation: filterOperation,
              value: filterValue,
              case_sensitive: caseSensitive
            }
          };

          console.log(`🔍 Data Filter applied:`);
          console.log(`   - Original count: ${sourceData.length}`);
          console.log(`   - Filtered count: ${filteredData.length}`);
          console.log(`   - Filter: ${filterProperty} ${filterOperation} "${filterValue}"`);
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

  // Store node result (used by node testing)
  storeNodeResult,

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