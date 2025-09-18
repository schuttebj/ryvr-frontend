// Test data populator for development - simulates real DataForSEO API responses
import { StandardNodeResponse, WorkflowNodeType } from '../types/workflow';

// Sample DataForSEO SERP response based on real API structure
const sampleSerpResponse = {
  version: "0.1.20240801",
  status_code: 20000,
  status_message: "Ok.",
  time: "0.0649 sec.",
  cost: 0.001,
  tasks_count: 1,
  tasks_error: 0,
  tasks: [
    {
      id: "12151718-1535-0216-0000-d4be88a1b07c",
      status_code: 20000,
      status_message: "Ok.",
      time: "0.0604 sec.",
      cost: 0.001,
      result_count: 1,
      result: [
        {
          keyword: "marketing strategies",
          type: "organic",
          se_domain: "google.com",
          location_code: 2840,
          language_code: "en",
          check_url: "https://www.google.com/search?q=marketing+strategies&num=10",
          datetime: "2024-01-15 12:30:45 +00:00",
          spell: null,
          item_types: ["organic", "paid", "featured_snippet"],
          se_results_count: 1250000000,
          items_count: 10,
          items: [
            {
              type: "organic",
              rank_group: 1,
              rank_absolute: 1,
              position: "left",
              xpath: "/html[1]/body[1]/div[7]/div[1]/div[9]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/span[1]/a[1]",
              domain: "hubspot.com",
              title: "10 Marketing Strategies to Fuel Your Business Growth",
              url: "https://blog.hubspot.com/marketing/marketing-strategies",
              cache_url: "https://webcache.googleusercontent.com/search?q=cache:123",
              breadcrumb: "HubSpot › Blog › Marketing",
              description: "Discover 10 proven marketing strategies that can help grow your business. From content marketing to social media, learn which tactics work best.",
              timestamp: "2024-01-15 12:30:45 +00:00"
            },
            {
              type: "organic", 
              rank_group: 2,
              rank_absolute: 2,
              position: "left",
              xpath: "/html[1]/body[1]/div[7]/div[1]/div[9]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[2]/div[1]/div[1]/span[1]/a[1]",
              domain: "salesforce.com",
              title: "Digital Marketing Strategies for 2024: Complete Guide",
              url: "https://www.salesforce.com/resources/articles/digital-marketing/",
              cache_url: "https://webcache.googleusercontent.com/search?q=cache:456",
              breadcrumb: "Salesforce › Resources › Articles",
              description: "Learn about the latest digital marketing strategies for 2024. Includes tactics for email marketing, social media, SEO, and more.",
              timestamp: "2024-01-15 12:30:45 +00:00"
            },
            {
              type: "organic",
              rank_group: 3,
              rank_absolute: 3,
              position: "left",
              xpath: "/html[1]/body[1]/div[7]/div[1]/div[9]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[3]/div[1]/div[1]/span[1]/a[1]",
              domain: "neil-patel.com",
              title: "7 Marketing Strategies That Actually Work in 2024",
              url: "https://neilpatel.com/blog/marketing-strategies-that-work/",
              cache_url: "https://webcache.googleusercontent.com/search?q=cache:789",
              breadcrumb: "Neil Patel › Blog",
              description: "Neil Patel shares 7 marketing strategies that are proven to work. Includes case studies and practical implementation tips.",
              timestamp: "2024-01-15 12:30:45 +00:00"
            }
          ]
        }
      ]
    }
  ]
};

// Sample Content Extraction response
const sampleContentExtractionResponse = [
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
    extracted_at: "2024-01-15T12:35:00Z"
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
    extracted_at: "2024-01-15T12:35:30Z"
  }
];

// Sample OpenAI response
const sampleOpenAIResponse = {
  id: "chatcmpl-8abc123def456",
  object: "chat.completion",
  created: 1705320945,
  model: "gpt-4o-mini",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content: "Based on the SERP analysis and content extraction, here are the top 5 marketing strategies trending in 2024:\n\n1. **AI-Powered Personalization** - Using machine learning to deliver personalized experiences at scale\n\n2. **Content Marketing Excellence** - Creating high-quality, valuable content that addresses specific customer pain points\n\n3. **Omnichannel Customer Experience** - Providing seamless experiences across all touchpoints\n\n4. **Data-Driven Decision Making** - Leveraging analytics and insights to guide marketing strategies\n\n5. **Social Commerce Integration** - Combining social media engagement with direct purchasing opportunities\n\nThese strategies are backed by current market data and are being successfully implemented by leading companies like HubSpot and Salesforce."
      },
      finish_reason: "stop"
    }
  ],
  usage: {
    prompt_tokens: 1250,
    completion_tokens: 185,
    total_tokens: 1435
  }
};

// Function to populate test data that matches our StandardNodeResponse format
export const populateTestData = (): { [key: string]: StandardNodeResponse } => {
  const testData: { [key: string]: StandardNodeResponse } = {};

  // SERP Analysis Node
  testData['serp_analysis_1'] = {
    executionId: 'exec_1705320900_abc123',
    nodeId: 'serp_analysis_1',
    nodeType: WorkflowNodeType.SEO_SERP_GOOGLE_ORGANIC,
    status: 'success',
    executedAt: '2024-01-15T12:30:00Z',
    executionTime: 1250,
    data: {
      processed: {
        results: [
          {
            keyword: sampleSerpResponse.tasks[0].result[0].keyword,
            type: sampleSerpResponse.tasks[0].result[0].type,
            se_domain: sampleSerpResponse.tasks[0].result[0].se_domain,
            location_code: sampleSerpResponse.tasks[0].result[0].location_code,
            language_code: sampleSerpResponse.tasks[0].result[0].language_code,
            check_url: sampleSerpResponse.tasks[0].result[0].check_url,
            datetime: sampleSerpResponse.tasks[0].result[0].datetime,
            total_count: sampleSerpResponse.tasks[0].result[0].items_count,
            se_results_count: sampleSerpResponse.tasks[0].result[0].se_results_count,
            items: sampleSerpResponse.tasks[0].result[0].items
          }
        ]
      },
      raw: sampleSerpResponse,
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
      requestId: '12151718-1535-0216-0000-d4be88a1b07c'
    }
  };

  // Content Extraction Node
  testData['content_extract_1'] = {
    executionId: 'exec_1705320950_def456',
    nodeId: 'content_extract_1',
    nodeType: WorkflowNodeType.CONTENT_EXTRACT,
    status: 'success',
    executedAt: '2024-01-15T12:35:00Z',
    executionTime: 2850,
    data: {
      processed: sampleContentExtractionResponse,
      raw: sampleContentExtractionResponse,
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
  };

  // AI Analysis Node
  testData['ai_analysis_1'] = {
    executionId: 'exec_1705321000_ghi789',
    nodeId: 'ai_analysis_1',
    nodeType: WorkflowNodeType.AI_OPENAI_TASK,
    status: 'success',
    executedAt: '2024-01-15T12:40:00Z',
    executionTime: 3200,
    data: {
      processed: {
        content: sampleOpenAIResponse.choices[0].message.content,
        model: sampleOpenAIResponse.model,
        usage: sampleOpenAIResponse.usage
      },
      raw: sampleOpenAIResponse,
      summary: {
        content_length: sampleOpenAIResponse.choices[0].message.content.length,
        model: sampleOpenAIResponse.model,
        usage: sampleOpenAIResponse.usage
      }
    },
    inputData: {
      inputMapping: "content_extract_1.extracted_content[*].content",
      prompt: "Analyze the extracted content and identify the top 5 marketing strategies for 2024"
    },
    apiMetadata: {
      provider: 'OpenAI',
      endpoint: '/v1/chat/completions',
      requestId: 'chatcmpl-8abc123def456'
    }
  };

  return testData;
};

// Function to inject test data into the global workflow data store
export const injectTestData = async () => {
  try {
    // We'll dynamically import to avoid circular dependencies
    const workflowModule = await import('../services/workflowApi');
    
    // Clear existing data first
    if (workflowModule.clearWorkflowData) {
      workflowModule.clearWorkflowData();
    }
    
    // Get the global workflow data reference (we'll need to modify the workflowApi to expose this)
    const testData = populateTestData();
    
    // For now, just log the test data structure
    console.log('🧪 Test data generated:', testData);
    console.log('📊 Available nodes:', Object.keys(testData));
    console.log('🔍 Sample data structure for serp_analysis_1:', testData.serp_analysis_1.data.processed);
    
    return testData;
    
  } catch (error) {
    console.error('Failed to inject test data:', error);
    return {};
  }
}; 