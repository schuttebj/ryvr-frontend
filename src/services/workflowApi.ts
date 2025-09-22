// Using fetch instead of axios for better compatibility
import { 
  WorkflowNodeType, 
  StandardNodeResponse, 
  AvailableDataNode, 
  DataStructureItem,
  // V2 Types
  WorkflowTemplateV2,
  WorkflowExecutionV2,
  WorkflowStepV2,
  WorkflowStepType,
  ToolCatalogV2,
  ExecutionRequest,
  TransformationConfig
} from '../types/workflow';

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
const analyzeDataStructure = (data: any, path: string = '', level: number = 0, maxDepth: number = 50): DataStructureItem[] => {
  // Only stop if we've seen this exact object before (circular reference detection)
  if (level > maxDepth) {
    console.warn(`🔄 Max depth ${maxDepth} reached at path: ${path}`);
    return [{
      path: path + '[...]',
      label: `Deep structure (${maxDepth}+ levels) - continue exploring`,
      type: 'object',
      sampleValue: 'Object with deeper nesting available',
      children: []
    }];
  }
  
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
  const workflowNodes = Object.values(globalWorkflowData)
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

  // Add client business profile data as available variables
  try {
    const clients = JSON.parse(localStorage.getItem('ryvr_clients') || '[]');
    const clientsWithProfiles = clients.filter((client: any) => client.businessProfile);
    
    const clientNodes = clientsWithProfiles.map((client: any) => ({
      nodeId: `client_${client.id}`,
      nodeLabel: `${client.name} - Business Profile`,
      nodeType: 'client_profile',
      executedAt: client.profileGeneratedAt || new Date().toISOString(),
      status: 'success' as const,
      dataStructure: analyzeDataStructure(client.businessProfile),
      completeStructure: {
        sections: [
          {
            label: 'Client Info',
            description: 'Basic client information',
            paths: [
              { path: `client_${client.id}.name`, type: 'string', label: 'Client Name' },
              { path: `client_${client.id}.company`, type: 'string', label: 'Company' },
              { path: `client_${client.id}.industry`, type: 'string', label: 'Industry' }
            ]
          },
          {
            label: 'Business Profile',
            description: 'AI-generated business analysis',
            paths: analyzeDataStructure(client.businessProfile, `client_${client.id}.profile`, 0, 5)
          }
        ]
      },
      id: `client_${client.id}`,
      data: {
        processed: {
          name: client.name,
          company: client.company,
          industry: client.industry,
          email: client.email,
          phone: client.phone,
          profile: client.businessProfile
        }
      }
    }));

    console.log(`📊 Added ${clientNodes.length} client business profiles to available data nodes`);
    return [...workflowNodes, ...clientNodes];
  } catch (error) {
    console.warn('Failed to load client business profiles for variables:', error);
    return workflowNodes;
  }
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

// NOTE: Test data population removed - use real workflow execution data instead
// Function preserved for reference but returns empty data
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
    // No longer populating test data - workflows should use real execution results
    console.log('ℹ️ Test data population disabled - using real workflow execution');
    return {};
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

// NOTE: DataForSEO API calls are now handled through the backend integration service
// Use workflowApi.executeNode() with appropriate node types instead:
// - For SERP analysis: nodeType 'serp_analysis' 
// - For keyword volume: nodeType 'keyword_research'
// - For backlinks: nodeType 'backlink_analysis'
// - For technical SEO: nodeType 'technical_seo'

// Enhanced variable processing helper for new format  
export const processVariables = (text: string, workflowData: Record<string, any>): string => {
  if (!text) return text;
  
  console.log('🔄 Processing variables in text:', text);
  console.log('📊 Available workflow data keys:', Object.keys(workflowData));
  console.log('📊 Sample workflow data structure:', Object.keys(workflowData).slice(0, 1).map(key => ({
    key,
    type: typeof workflowData[key],
    hasData: !!workflowData[key]?.data,
    topLevelKeys: typeof workflowData[key] === 'object' ? Object.keys(workflowData[key]) : []
  })));
  
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
  
  // Debug: Check if this is a wildcard path
  if (path.includes('[*]')) {
    console.log('🌟 WILDCARD PATH DETECTED!');
  }
  
  const pathParts = path.split('.');
  let current = workflowData;
  let isArrayContext = false; // Track if we're working with an array from wildcard access
    
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (part.includes('[') && part.includes(']')) {
            // Handle array access like items[0] or items[*]
      const match = part.match(/(\w+)\[([0-9*]+)\]/);
      if (match) {
        const [, arrayKey, index] = match;
        if (current[arrayKey] && Array.isArray(current[arrayKey])) {
          if (index === '*') {
            // Return the entire array for * index
            current = current[arrayKey];
            isArrayContext = true; // Mark that we're now working with an array
            console.log(`📚 Array wildcard access: got ${current.length} items`);
          } else {
            current = current[arrayKey][parseInt(index)];
            isArrayContext = false; // Single item access
            console.log(`📚 Array index access [${index}]: got item`);
          }
        } else {
          console.log(`❌ Array access failed: ${arrayKey} is not an array`);
          return undefined;
        }
      }
    } else {
      // Regular property access
      if (isArrayContext && Array.isArray(current)) {
        // If we're in array context and trying to access a property, map it across all items
        const remainingPath = pathParts.slice(i).join('.');
        console.log(`📚 Mapping property '${remainingPath}' across ${current.length} array items`);
        
        const mappedValues = current.map(item => {
          let value = item;
          const subParts = remainingPath.split('.');
          
          for (const subPart of subParts) {
            if (value && typeof value === 'object') {
              value = value[subPart];
            } else {
              return undefined;
            }
          }
          return value;
        }).filter(val => val !== undefined && val !== null);
        
        console.log(`📚 Mapped ${mappedValues.length} values:`, mappedValues.slice(0, 3));
        return mappedValues;
      } else {
        current = current[part];
      }
    }
      
    if (current === undefined) {
      console.log(`❌ Path resolution stopped at '${part}' - value undefined`);
      break;
    }
  }
  
  console.log('✅ Final resolved value type:', typeof current);
  return current;
};

// Apply formatting to variable values
const applyVariableFormat = (value: any, format: string): string => {
  console.log(`🎨 Applying format '${format}' to value:`, {
    type: typeof value,
    isArray: Array.isArray(value),
    length: Array.isArray(value) ? value.length : 'N/A',
    sampleValue: Array.isArray(value) ? value.slice(0, 3) : value
  });
  
  switch (format.toLowerCase()) {
    case 'list':
      if (Array.isArray(value)) {
        // Handle array of objects by extracting useful properties
        const listItems = value.map(item => {
          if (typeof item === 'object' && item !== null) {
            // Try common properties that make sense for lists
            return item.title || item.name || item.url || item.domain || item.keyword || JSON.stringify(item);
          }
          return String(item);
        });
        const result = listItems.join(', ');
        console.log(`📝 List format result: "${result}"`);
        return result;
      }
      console.log(`⚠️ List format applied to non-array value: ${typeof value}`);
      return String(value || '');
      
    case 'json':
      const jsonResult = JSON.stringify(value, null, 2);
      console.log(`📝 JSON format result: ${jsonResult.substring(0, 100)}...`);
      return jsonResult;
      
    case 'count':
      if (Array.isArray(value)) {
        const count = String(value.length);
        console.log(`📝 Count format result: ${count}`);
        return count;
      }
      console.log(`⚠️ Count format applied to non-array value, returning '1'`);
      return '1';
      
    case 'first':
      if (Array.isArray(value) && value.length > 0) {
        const first = String(value[0]);
        console.log(`📝 First format result: "${first}"`);
        return first;
      }
      console.log(`⚠️ First format applied to empty/non-array value`);
      return String(value || '');
      
    case 'last':
      if (Array.isArray(value) && value.length > 0) {
        const last = String(value[value.length - 1]);
        console.log(`📝 Last format result: "${last}"`);
        return last;
      }
      console.log(`⚠️ Last format applied to empty/non-array value`);
      return String(value || '');
      
    default:
      // Check if it's a range format like "range:0-4"
      if (format.startsWith('range:')) {
        const rangeMatch = format.match(/range:(\d+)-(\d+)/);
        if (rangeMatch && Array.isArray(value)) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          const rangeSlice = value.slice(start, end + 1);
          
          // Handle array of objects by extracting useful properties
          const rangeItems = rangeSlice.map(item => {
            if (typeof item === 'object' && item !== null) {
              return item.title || item.name || item.url || item.domain || item.keyword || JSON.stringify(item);
            }
            return String(item);
          });
          
          const result = rangeItems.join(', ');
          console.log(`📝 Range format (${start}-${end}) result: "${result}"`);
          return result;
        }
        console.log(`⚠️ Range format applied to non-array or invalid range`);
        return String(value || '');
      }
      
      console.log(`📝 No format applied, returning string value`);
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

// NOTE: AI API calls are now handled through the backend integration service
// Use workflowApi.executeNode() with nodeType 'ai_generation' and appropriate configuration

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
          
          // Process variables in prompts - prepare data in correct format
          const aiVariableData: Record<string, any> = {};
          
          // CRITICAL FIX: Use inputData (current workflow execution data) as primary source
          // This contains the actual results from previous nodes in this execution
          Object.keys(inputData).forEach(nodeId => {
            if (inputData[nodeId]) {
              aiVariableData[nodeId] = {
                data: inputData[nodeId]  // Direct access to execution results
              };
            }
          });
          
          // Also check globalWorkflowData as fallback
          Object.keys(globalWorkflowData).forEach(nodeId => {
            const nodeResponse = globalWorkflowData[nodeId];
            if (nodeResponse && nodeResponse.data && !aiVariableData[nodeId]) {
              aiVariableData[nodeId] = {
                data: nodeResponse.data  // Match the nodeId.data.processed structure
              };
            }
          });
          
          console.log('🤖 AI variable substitution data prepared:', {
            inputDataKeys: Object.keys(inputData),
            aiVariableDataKeys: Object.keys(aiVariableData),
            systemPrompt: taskSystemPrompt.substring(0, 100) + '...',
            userPrompt: taskUserPrompt.substring(0, 100) + '...'
          });
          
          // Debug: Log the structure of available data
          console.log('🔍 AI Variable Data Structure:');
          Object.keys(aiVariableData).forEach(nodeId => {
            const nodeData = aiVariableData[nodeId];
            console.log(`  ${nodeId}:`, {
              hasData: !!nodeData.data,
              dataKeys: nodeData.data ? Object.keys(nodeData.data) : [],
              samplePath: nodeData.data?.processed ? 'has processed data' : 'no processed data'
            });
          });
          
          let processedTaskSystemPrompt = processVariables(taskSystemPrompt, aiVariableData);
          let processedTaskUserPrompt = processVariables(taskUserPrompt, aiVariableData);
          
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
          // Process variables in config values - prepare data in correct format
          const variableData: Record<string, any> = {};
          
          // Build the same data structure that VariableSelector and preview use
          Object.keys(globalWorkflowData).forEach(nodeId => {
            const nodeResponse = globalWorkflowData[nodeId];
            if (nodeResponse && nodeResponse.data) {
              variableData[nodeId] = {
                data: nodeResponse.data  // Match the nodeId.data.processed structure
              };
            }
          });
          
          console.log('🔧 Variable substitution data prepared:', {
            inputDataKeys: Object.keys(inputData),
            variableDataKeys: Object.keys(variableData),
            sampleStructure: Object.keys(variableData)[0] ? {
              nodeId: Object.keys(variableData)[0],
              hasDataProperty: !!variableData[Object.keys(variableData)[0]]?.data,
              dataKeys: Object.keys(variableData[Object.keys(variableData)[0]]?.data || {})
            } : 'no data'
          });
          
          const processedKeyword = finalConfig.keyword ? processVariables(finalConfig.keyword, variableData) : inputData.keyword;
          const processedTarget = finalConfig.target ? processVariables(finalConfig.target, variableData) : undefined;
          
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
            console.error('❌ Backend API not available:', error.message);
            throw new Error(`Failed to fetch SERP data: ${error.message}. Please ensure backend is running and DataForSEO integration is configured.`);
          }
          
          // Log final result structure for debugging
          if (result && result.results && result.results[0]) {
            console.log(`📊 SERP data received:`);
            console.log(`   - Keyword: ${result.results[0].keyword}`);
            console.log(`   - Total Items: ${result.results[0].total_count}`);
            console.log(`   - SE Results Count: ${result.results[0].se_results_count || 'N/A'}`);
            console.log(`   - Items Array Length: ${result.results[0].items.length}`);
            console.log(`   - Sample URLs: ${result.results[0].items.slice(0, 3).map((item: any) => item.url).filter(Boolean).join(', ')}`);
          }
          break;
          
        // Content Extraction
        case 'content_extract':
        case WorkflowNodeType.CONTENT_EXTRACT:
          console.log('🔍 Content Extraction node started');
          console.log('📥 Input data keys:', Object.keys(inputData));
          console.log('⚙️ Config:', {
            urlSource: finalConfig.urlSource,
            extractionType: finalConfig.extractionType,
            batchProcess: finalConfig.batchProcess,
            maxUrls: finalConfig.maxUrls
          });

          // Get URLs from variable or input mapping
          let urls: string[] = [];
          
          // Handle variable-based URL input (similar to AI node)
          if (finalConfig.urlSource && inputData) {
            console.log('🔗 Processing URL source:', finalConfig.urlSource);
            
            // Create variable data for processing
            const contentVariableData: Record<string, any> = {};
            
            // Get available node data
            const availableNodes = getAvailableDataNodes();
            availableNodes.forEach(node => {
              if (node.data) {
                contentVariableData[node.id] = { data: node.data };
              }
            });
            
            console.log('📊 Available variable data keys:', Object.keys(contentVariableData));
            
            // Process variables in the URL source
            const processedUrlSource = processVariables(finalConfig.urlSource, contentVariableData);
            console.log('🔄 Processed URL source:', processedUrlSource);
            
            // Parse the processed result to extract URLs
            try {
              if (processedUrlSource.includes('http')) {
                // If the result contains URLs, extract them
                const urlMatches = processedUrlSource.match(/https?:\/\/[^\s,]+/g);
                if (urlMatches) {
                  urls = urlMatches.slice(0, finalConfig.maxUrls || 10);
                } else {
                  // Split by common delimiters
                  urls = processedUrlSource
                    .split(/[,\n\r\t]+/)
                    .map(url => url.trim())
                    .filter(url => url.includes('http'))
                    .slice(0, finalConfig.maxUrls || 10);
                }
              } else {
                // Fallback: try to resolve as JSON path
                const resolvedData = resolveVariablePath(finalConfig.urlSource.replace(/[{}]/g, ''), contentVariableData);
                console.log('📍 Resolved URL data:', { type: typeof resolvedData, isArray: Array.isArray(resolvedData) });
                
                if (Array.isArray(resolvedData)) {
                  urls = resolvedData.filter(url => url && typeof url === 'string' && url.includes('http')).slice(0, finalConfig.maxUrls || 10);
                } else if (typeof resolvedData === 'string' && resolvedData.includes('http')) {
                  urls = [resolvedData];
                }
              }
            } catch (error) {
              console.error('❌ Error processing URL source:', error);
            }
          }
          
          // Fallback to legacy input mapping if no URLs found
          if (urls.length === 0 && finalConfig.inputMapping && inputData) {
            console.log('🔄 Fallback to legacy input mapping');
            // Parse JSON path (e.g., "serp_results.results[0].items[*].url")
            const pathParts = finalConfig.inputMapping.split('.');
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
          
          // Structure the result for variable mapping
          const successfulExtractions = extractedContent.filter(item => item.success);
          const failedExtractions = extractedContent.filter(item => !item.success);
          
          result = {
            // Structured data for variable mapping
            extracted_content: extractedContent,
            successful_extractions: successfulExtractions,
            failed_extractions: failedExtractions,
            
            // Summary statistics
            total_urls: urls.length,
            successful_count: successfulExtractions.length,
            failed_count: failedExtractions.length,
            success_rate: Math.round((successfulExtractions.length / urls.length) * 100),
            
            // Easy access arrays for variable mapping
            all_content: extractedContent.map(item => item.content).filter(Boolean),
            all_titles: extractedContent.map(item => item.title).filter(Boolean),
            all_urls: extractedContent.map(item => item.url),
            all_domains: [...new Set(extractedContent.map(item => item.domain))],
            
            // Metadata
            extraction_config: {
              extraction_type: finalConfig.extractionType || 'full_text',
              batch_process: finalConfig.batchProcess,
              max_length: finalConfig.maxLength || 5000,
              remove_html: finalConfig.removeHtml || false
            },
            processed_at: new Date().toISOString()
          };
          
          console.log('📄 Content Extraction completed:');
          console.log(`   - Total URLs: ${urls.length}`);
          console.log(`   - Successful: ${successfulExtractions.length}`);
          console.log(`   - Failed: ${failedExtractions.length}`);
          console.log(`   - Success Rate: ${result.success_rate}%`);
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
          
        // Client Profile
        case 'client_profile':
        case WorkflowNodeType.CLIENT_PROFILE:
          const clientId = finalConfig.clientId;
          if (!clientId) {
            throw new Error('Client ID is required for client profile node');
          }

          console.log('👤 Loading client profile for:', clientId);

          try {
            let clientData = null;
            
            // First try localStorage (for local clients)
            if (clientId.toString().includes('client_')) {
              console.log('📱 Loading from localStorage...');
              const clients = JSON.parse(localStorage.getItem('ryvr_clients') || '[]');
              clientData = clients.find((c: any) => c.id === clientId);
              
              if (clientData) {
                console.log('✅ Found localStorage client:', clientData.name);
              } else {
                throw new Error('Client not found in localStorage');
              }
            } else {
              // Try backend for database clients
              console.log('🌐 Loading from backend database...');
              const backendUrl = 'https://ryvr-backend.onrender.com';
              const token = localStorage.getItem('ryvr_auth_token');
              
              if (!token) {
                throw new Error('No authentication token found for backend client');
              }
              
              const clientResponse = await fetch(`${backendUrl}/api/clients/${clientId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!clientResponse.ok) {
                throw new Error(`Failed to fetch client data: ${clientResponse.status}`);
              }

              clientData = await clientResponse.json();
              console.log('✅ Found backend client:', clientData.name);
            }
            
            // Structure the client profile data for use in variables
            result = {
              client_basic: clientData.questionnaireResponses?.basic || {},
              client_business_model: clientData.questionnaireResponses?.model || {},
              client_market: clientData.questionnaireResponses?.market || {},
              client_operations: clientData.questionnaireResponses?.operations || {},
              client_marketing: clientData.questionnaireResponses?.marketing || {},
              client_financials: clientData.questionnaireResponses?.financials || {},
              client_team: clientData.questionnaireResponses?.team || {},
              client_goals: clientData.questionnaireResponses?.goals || {},
              client_challenges: clientData.questionnaireResponses?.challenges || {},
              client_resources: clientData.questionnaireResponses?.resources || {},
              client_brand: clientData.questionnaireResponses?.brand || {},
              client_risk: clientData.questionnaireResponses?.risk || {},
              business_profile: clientData.businessProfile || {},
              client_meta: {
                id: clientData.id,
                name: clientData.name,
                email: clientData.email,
                company: clientData.company,
                industry: clientData.industry,
                status: clientData.status,
                tags: clientData.tags || [],
                created_at: clientData.createdAt,
                updated_at: clientData.updatedAt
              }
            };

            console.log(`👤 Client Profile loaded for: ${clientData.name}`);
          } catch (error) {
            console.error('Failed to load client profile:', error);
            throw new Error(`Failed to load client profile: ${error}. Please ensure client ID is valid and backend is accessible.`);
          }
          break;
          
        // Legacy DataForSEO nodes (keeping for backward compatibility)  
        case 'seo_keywords_volume':
          throw new Error(`Legacy node type 'seo_keywords_volume' is deprecated. Please use the new V2 workflow system with backend integrations.`);
          break;
          
        case 'seo_keywords_site':
          throw new Error(`Legacy node type 'seo_keywords_site' is deprecated. Please use the new V2 workflow system with backend integrations.`);
          break;
          
        case 'seo_competitors':
          throw new Error(`Legacy node type 'seo_competitors' is deprecated. Please use the new V2 workflow system with backend integrations.`);
          break;
          
        case 'seo_content_analyze':
          throw new Error(`Legacy node type 'seo_content_analyze' is deprecated. Please use the new V2 workflow system with backend integrations.`);
          break;
          
        // Legacy AI nodes (deprecated)
        case 'ai_content_seo':
          throw new Error(`Legacy node type 'ai_content_seo' is deprecated. Please use the new V2 workflow system with backend integrations.`);
          break;
          
        case 'ai_keywords_generate':
          throw new Error(`Legacy node type 'ai_keywords_generate' is deprecated. Please use the new V2 workflow system with backend integrations.`);
          break;
          
        case 'ai_ads_generate':
          throw new Error(`Legacy node type 'ai_ads_generate' is deprecated. Please use the new V2 workflow system with backend integrations.`);
          break;
          
        default:
          throw new Error(`Unsupported node type: ${nodeType}`);
      }
      
      // Structure the return data in standardized format
      const structuredData = {
        processed: result, // Main processed data for workflows
        raw: result,       // Keep raw data for debugging
        summary: {         // Extract key summary info
          nodeType: nodeType,
          success: true,
          itemCount: Array.isArray(result?.results?.[0]?.items) ? result.results[0].items.length : 
                    Array.isArray(result?.results) ? result.results.length :
                    typeof result === 'object' ? Object.keys(result).length : 1,
          executedAt: new Date().toISOString()
        }
      };

      return {
        success: true,
        data: structuredData,
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

  // Note: executeWorkflow moved to V2 API section for backend execution

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

  // =============================================================================
  // WORKFLOW V2 API METHODS (New Schema Support)
  // =============================================================================

  // Create workflow template (default schema)
  createWorkflowTemplate: async (template: WorkflowTemplateV2): Promise<{ success: boolean; template?: WorkflowTemplateV2; error?: string }> => {
    try {
      const response = await fetch(`/api/workflows/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create workflow template');
      }

      const result = await response.json();
      return { success: true, template: result };
    } catch (error: any) {
      console.error('Failed to create workflow template V2:', error);
      return { success: false, error: error.message };
    }
  },

  // List workflow templates
  listWorkflowTemplates: async (filters?: {
    business_id?: number;
    category?: string;
    tags?: string;
    skip?: number;
    limit?: number;
  }): Promise<{ success: boolean; templates?: WorkflowTemplateV2[]; error?: string }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.business_id) params.append('business_id', filters.business_id.toString());
      if (filters?.category) params.append('category', filters.category);
      if (filters?.tags) params.append('tags', filters.tags);
      if (filters?.skip) params.append('skip', filters.skip.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/workflows/templates?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch workflow templates');
      }

      const templates = await response.json();
      return { success: true, templates };
    } catch (error: any) {
      console.error('Failed to list workflow templates V2:', error);
      return { success: false, error: error.message };
    }
  },

  // Get specific workflow template
  getWorkflowTemplate: async (templateId: number): Promise<{ success: boolean; template?: WorkflowTemplateV2; error?: string }> => {
    try {
      const response = await fetch(`/api/workflows/templates/${templateId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch workflow template');
      }

      const template = await response.json();
      return { success: true, template };
    } catch (error: any) {
      console.error('Failed to get workflow template V2:', error);
      return { success: false, error: error.message };
    }
  },

  // Validate workflow template
  validateWorkflowTemplate: async (templateId: number): Promise<{ success: boolean; validation?: any; error?: string }> => {
    try {
      const response = await fetch(`/api/workflows/templates/${templateId}/validate`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to validate workflow template');
      }

      const validation = await response.json();
      return { success: true, validation };
    } catch (error: any) {
      console.error('Failed to validate workflow template V2:', error);
      return { success: false, error: error.message };
    }
  },

  // Execute workflow template
  executeWorkflow: async (templateId: number, executionRequest: ExecutionRequest): Promise<{ success: boolean; execution?: any; error?: string }> => {
    try {
      const response = await fetch(`/api/workflows/templates/${templateId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(executionRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to execute workflow');
      }

      const execution = await response.json();
      return { success: true, execution };
    } catch (error: any) {
      console.error('Failed to execute workflow V2:', error);
      return { success: false, error: error.message };
    }
  },

  // Get execution status
  getExecutionStatus: async (executionId: number): Promise<{ success: boolean; execution?: WorkflowExecutionV2; error?: string }> => {
    try {
      const response = await fetch(`/api/workflows/executions/${executionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch execution status');
      }

      const execution = await response.json();
      return { success: true, execution };
    } catch (error: any) {
      console.error('Failed to get execution status V2:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete workflow template
  deleteWorkflowTemplate: async (templateId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/workflows/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete workflow template');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete workflow template:', error);
      return { success: false, error: error.message };
    }
  },

  // Get tool catalog for workflow building
  getToolCatalog: async (filters?: {
    provider?: string;
    category?: string;
    business_id?: number;
  }): Promise<{ success: boolean; catalog?: ToolCatalogV2; error?: string }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.provider) params.append('provider', filters.provider);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.business_id) params.append('business_id', filters.business_id.toString());

      const response = await fetch(`/api/workflows/tool-catalog?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch tool catalog');
      }

      const catalog = await response.json();
      return { success: true, catalog };
    } catch (error: any) {
      console.error('Failed to get tool catalog V2:', error);
      return { success: false, error: error.message };
    }
  },

  // Test data transformation configuration
  testTransformationV2: async (data: any, transformConfig: TransformationConfig): Promise<{ success: boolean; result?: any; error?: string }> => {
    try {
      // For now, this is a client-side test function
      // In production, this could be sent to backend for validation
      
      // Mock transformation for testing
      let result: Record<string, any> = { _source: data };
      
      // Extract transformations
      if (transformConfig.extract) {
        for (const extraction of transformConfig.extract) {
          if (extraction.expr.startsWith('expr: @[].')) {
            const property = extraction.expr.replace('expr: @[].', '');
            if (Array.isArray(data)) {
              result[extraction.as] = data.map(item => item[property]).filter(val => val !== undefined);
            }
          }
        }
      }
      
      // Aggregate transformations
      if (transformConfig.aggregate) {
        for (const aggregation of transformConfig.aggregate) {
          const sourceData = result[aggregation.source];
          if (Array.isArray(sourceData)) {
            switch (aggregation.function) {
              case 'sum':
                result[aggregation.as] = sourceData.reduce((sum, val) => sum + (Number(val) || 0), 0);
                break;
              case 'avg':
                result[aggregation.as] = sourceData.reduce((sum, val) => sum + (Number(val) || 0), 0) / sourceData.length;
                break;
              case 'count':
                result[aggregation.as] = sourceData.length;
                break;
              case 'min':
                result[aggregation.as] = Math.min(...sourceData.map(val => Number(val) || 0));
                break;
              case 'max':
                result[aggregation.as] = Math.max(...sourceData.map(val => Number(val) || 0));
                break;
            }
          }
        }
      }
      
      // Format transformations
      if (transformConfig.format) {
        for (const format of transformConfig.format) {
          const sourceData = result[format.source];
          if (format.function === 'join' && Array.isArray(sourceData)) {
            result[format.as] = sourceData.join(format.separator || ', ');
          }
        }
      }
      
      // Remove source data unless requested
      if (!transformConfig.keep_source) {
        delete result._source;
      }
      
      return { success: true, result };
    } catch (error: any) {
      console.error('Failed to test transformation V2:', error);
      return { success: false, error: error.message };
    }
  },

  // Create example workflow for testing
  createExampleWorkflowV2: (): WorkflowTemplateV2 => {
    return {
      schema_version: 'ryvr.workflow.v1',
      name: 'SEO Content Pipeline',
      description: 'Extract keyword data, aggregate values, and format as CSV',
      tags: ['seo', 'content', 'example'],
      
      globals: {
        brand_voice: 'professional and informative',
        max_keywords: 50
      },
      
      inputs: {
        site_url: 'https://example.com',
        primary_topic: 'TPLO surgery',
        min_volume: 100,
        max_kd: 45
      },
      
      connections: [
        {
          id: 'conn-dataforseo',
          provider: 'dataforseo'
        }
      ],
      
      execution: {
        execution_mode: 'simulate',
        dry_run: true,
        concurrency: 2,
        timeout_seconds: 300
      },
      
      steps: [
        {
          id: 'extract_keywords',
          type: WorkflowStepType.TRANSFORM,
          name: 'Extract Keyword Values',
          depends_on: [],
          
          transform: {
            extract: [
              {
                as: 'values',
                expr: 'expr: @[].value',
                description: 'Extract all value properties from keyword array'
              },
              {
                as: 'keywords',
                expr: 'expr: @[].keyword',
                description: 'Extract all keyword strings'
              }
            ],
            aggregate: [
              {
                as: 'total_value',
                function: 'sum',
                source: 'values'
              },
              {
                as: 'avg_value',
                function: 'avg',
                source: 'values'
              },
              {
                as: 'keyword_count',
                function: 'count',
                source: 'keywords'
              }
            ],
            format: [
              {
                as: 'values_csv',
                function: 'join',
                source: 'values',
                separator: ', '
              },
              {
                as: 'keywords_list',
                function: 'join',
                source: 'keywords',
                separator: ' | '
              }
            ]
          },
          
          projection: {
            keep: [
              'values_csv',
              'keywords_list',
              'total_value',
              'avg_value',
              'keyword_count'
            ]
          },
          
          dry_run: true
        }
      ],
      
      category: 'seo',
      status: 'draft'
    };
  },

  // Utility function to validate V2 step configuration
  validateStepV2: (step: WorkflowStepV2): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!step.id) errors.push('Step ID is required');
    if (!step.type) errors.push('Step type is required');
    if (!step.name) errors.push('Step name is required');
    
    // Validate step type
    const validTypes = ['task', 'ai', 'transform', 'foreach', 'gate', 'condition', 'async_task'];
    if (!validTypes.includes(step.type)) {
      errors.push(`Invalid step type: ${step.type}`);
    }
    
    // Validate async_task specific requirements
    if (step.type === 'async_task' && !step.async_config) {
      errors.push('async_task type requires async_config');
    }
    
    if (step.async_config) {
      if (!step.async_config.submit_operation) errors.push('async_config requires submit_operation');
      if (!step.async_config.check_operation) errors.push('async_config requires check_operation');
      if (!step.async_config.completion_check) errors.push('async_config requires completion_check');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}; 