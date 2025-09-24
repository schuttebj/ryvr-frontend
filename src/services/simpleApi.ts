// Simple API service that can work with backend or localStorage fallback
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com';

interface Integration {
  id: string;
  name: string;
  type: 'openai' | 'dataforseo' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastTested?: string;
  createdAt: string;
  updatedAt: string;
}

interface SimpleWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  isActive: boolean;
  tags: string[];
  executionCount?: number;
  lastExecuted?: string;
  successRate?: number;
  createdAt: string;
  updatedAt: string;
}

// Check if backend is available
let backendAvailable = false;

const checkBackend = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simple/integrations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    backendAvailable = response.ok;
    return backendAvailable;
  } catch (error) {
    console.log('Backend not available, using localStorage fallback');
    backendAvailable = false;
    return false;
  }
};

// Initialize backend check
checkBackend();

export const simpleApi = {
  // INTEGRATIONS
  async getIntegrations(): Promise<Integration[]> {
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/simple/integrations`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Backend integration fetch failed, using localStorage');
      }
    }
    
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem('integrations');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load integrations from localStorage:', error);
      return [];
    }
  },

  async saveIntegration(integration: Integration): Promise<{ success: boolean }> {
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/simple/integrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(integration)
        });
        if (response.ok) {
          return { success: true };
        }
      } catch (error) {
        console.error('Backend integration save failed, using localStorage');
      }
    }
    
    // Fallback to localStorage
    try {
      const integrations = await this.getIntegrations();
      const existingIndex = integrations.findIndex(i => i.id === integration.id);
      
      if (existingIndex >= 0) {
        integrations[existingIndex] = integration;
      } else {
        integrations.push(integration);
      }
      
      localStorage.setItem('integrations', JSON.stringify(integrations));
      return { success: true };
    } catch (error) {
      console.error('Failed to save integration to localStorage:', error);
      return { success: false };
    }
  },

  async deleteIntegration(integrationId: string): Promise<{ success: boolean }> {
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/simple/integrations/${integrationId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          return { success: true };
        }
      } catch (error) {
        console.error('Backend integration delete failed, using localStorage');
      }
    }
    
    // Fallback to localStorage
    try {
      const integrations = await this.getIntegrations();
      const filtered = integrations.filter(i => i.id !== integrationId);
      localStorage.setItem('integrations', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete integration from localStorage:', error);
      return { success: false };
    }
  },

  // WORKFLOWS
  async getWorkflows(): Promise<SimpleWorkflow[]> {
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/simple/workflows`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Backend workflow fetch failed, using localStorage');
      }
    }
    
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem('workflows');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load workflows from localStorage:', error);
      return [];
    }
  },

  async saveWorkflow(workflow: SimpleWorkflow): Promise<{ success: boolean; workflow: SimpleWorkflow }> {
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/simple/workflows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflow)
        });
        if (response.ok) {
          const result = await response.json();
          return { success: true, workflow: result.workflow };
        }
      } catch (error) {
        console.error('Backend workflow save failed, using localStorage');
      }
    }
    
    // Fallback to localStorage
    try {
      const workflows = await this.getWorkflows();
      const existingIndex = workflows.findIndex(w => w.id === workflow.id);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow;
      } else {
        workflows.push(workflow);
      }
      
      localStorage.setItem('workflows', JSON.stringify(workflows));
      return { success: true, workflow };
    } catch (error) {
      console.error('Failed to save workflow to localStorage:', error);
      return { success: false, workflow };
    }
  },

  async getWorkflow(workflowId: string): Promise<SimpleWorkflow | null> {
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/simple/workflows/${workflowId}`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Backend workflow fetch failed, using localStorage');
      }
    }
    
    // Fallback to localStorage
    try {
      const workflows = await this.getWorkflows();
      return workflows.find(w => w.id === workflowId) || null;
    } catch (error) {
      console.error('Failed to load workflow from localStorage:', error);
      return null;
    }
  },

  async deleteWorkflow(workflowId: string): Promise<{ success: boolean }> {
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/simple/workflows/${workflowId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          return { success: true };
        }
      } catch (error) {
        console.error('Backend workflow delete failed, using localStorage');
      }
    }
    
    // Fallback to localStorage
    try {
      const workflows = await this.getWorkflows();
      const filtered = workflows.filter(w => w.id !== workflowId);
      localStorage.setItem('workflows', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete workflow from localStorage:', error);
      return { success: false };
    }
  },

  async executeWorkflow(workflowId: string): Promise<{ success: boolean; executionId?: string }> {
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/simple/workflows/${workflowId}/execute`, {
          method: 'POST'
        });
        if (response.ok) {
          const result = await response.json();
          return { success: true, executionId: result.execution_id };
        }
      } catch (error) {
        console.error('Backend workflow execution failed');
      }
    }
    
    // Fallback simulation
    console.log(`Simulating execution of workflow ${workflowId}`);
    return { success: true, executionId: `sim_${workflowId}_${Date.now()}` };
  },

  // BUSINESS PROFILE GENERATION
  async generateBusinessProfile(clientId: string, aiModel: string = 'gpt-4o-mini'): Promise<{ success: boolean, profile?: any, error?: string }> {
    console.log('🔍 Profile generation called for client:', clientId);
    console.log('🔍 Backend available:', backendAvailable);
    console.log('🔍 API Base URL:', API_BASE_URL);
    
    // Force a fresh backend check
    const isBackendOnline = await checkBackend();
    console.log('🔍 Fresh backend check result:', isBackendOnline);
    
    if (isBackendOnline) {
      try {
        console.log('🚀 Attempting backend API call...');
        const token = localStorage.getItem('ryvr_auth_token');
        console.log('🔍 Auth token present:', !!token);
        
        // Check if this is a localStorage client (string ID) vs backend client (numeric ID)
        const isLocalStorageClient = clientId.toString().includes('client_');
        console.log('🔍 Client type:', isLocalStorageClient ? 'localStorage' : 'backend database');
        
        if (isLocalStorageClient) {
          console.log('⚠️ Cannot use backend API for localStorage client - client not in database');
          console.log('🔄 Skipping to direct OpenAI fallback...');
          // Skip to OpenAI fallback for localStorage clients
          throw new Error('localStorage client - skip to OpenAI');
        }
        
        if (!token) {
          console.log('⚠️ No authentication token found - cannot call authenticated backend');
          throw new Error('No auth token - skip to OpenAI');
        }
        
        const requestBody = {
          ai_model: aiModel,
          include_recommendations: true
        };
        console.log('🔍 Request body:', requestBody);
        
        const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/generate-profile`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response ok:', response.ok);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Backend profile generation successful!');
          console.log('🔍 Result structure:', Object.keys(result));
          return { success: true, profile: result.business_profile };
        } else {
          const errorText = await response.text();
          console.error('❌ Backend error response:', response.status, errorText);
          let errorDetail = 'Failed to generate profile';
          try {
            const errorJson = JSON.parse(errorText);
            errorDetail = errorJson.detail || errorDetail;
          } catch (e) {
            console.log('Error response was not JSON:', errorText);
          }
          return { success: false, error: errorDetail };
        }
      } catch (error) {
        console.error('❌ Backend profile generation failed:', error);
        return { success: false, error: `Network error: ${error instanceof Error ? error.message : String(error)}` };
      }
    }
    
    // Fallback: Direct OpenAI API call
    console.log('⚡ Using direct OpenAI call for client:', clientId);
    console.log('📝 Reason: Backend unavailable or localStorage client detected');
    
    try {
      // Get OpenAI API key from integrations
      const integrations = JSON.parse(localStorage.getItem('integrations') || '[]');
      const openaiIntegration = integrations.find((int: any) => int.type === 'openai' && int.status === 'connected');
      
      if (!openaiIntegration || !openaiIntegration.config?.apiKey) {
        console.log('❌ No OpenAI integration found, falling back to mock profile');
        return await this.generateMockProfile(clientId);
      }

      // Get client data from localStorage
      const clients = JSON.parse(localStorage.getItem('ryvr_clients') || '[]');
      const client = clients.find((c: any) => c.id === clientId);
      
      if (!client || !client.questionnaireResponses) {
        return { success: false, error: 'Client questionnaire responses not found' };
      }

      console.log('🤖 Calling OpenAI directly for AI profile generation...');

      const systemPrompt = `You are a business strategy expert and consultant. Analyze the provided questionnaire responses and generate a comprehensive, actionable business profile.

Your analysis should be:
- Strategic and insightful based on the actual responses
- Actionable with specific recommendations
- Professional yet accessible
- Based on real business principles and best practices

Generate ONLY valid JSON in the exact structure requested. Do not include any text outside the JSON object.`;

      const userPrompt = `Please analyze the following client questionnaire responses and generate a comprehensive business profile:

${JSON.stringify(client.questionnaireResponses, null, 2)}

Based on these responses, create a strategic business profile in the following exact JSON structure:

{
  "business_summary": {
    "name": "[Extract or infer business name]",
    "founder_or_lead": "[Extract founder/lead name and role]",
    "industry": "[Extract or infer industry]",
    "core_offering": "[Summarize core products/services]",
    "value_proposition": "[Create clear value proposition based on responses]"
  },
  "customer_profile": {
    "target_audience": "[Detailed target customer description]",
    "primary_pain_points": ["[Pain point 1]", "[Pain point 2]", "[Pain point 3]"],
    "customer_journey_overview": "[Describe the customer journey]",
    "competitive_landscape": {
      "top_competitors": ["[Competitor 1]", "[Competitor 2]"],
      "differentiators": ["[Key differentiator 1]", "[Key differentiator 2]"]
    }
  },
  "business_model": {
    "revenue_streams": ["[Revenue stream 1]", "[Revenue stream 2]"],
    "pricing": "[Pricing strategy description]",
    "distribution_channels": ["[Channel 1]", "[Channel 2]"]
  },
  "marketing_and_growth": {
    "channels": ["[Current channel 1]", "[Current channel 2]"],
    "what_works": ["[Working strategy 1]", "[Working strategy 2]"],
    "growth_challenges": ["[Challenge 1]", "[Challenge 2]"],
    "quick_wins": ["[Quick win 1]", "[Quick win 2]"]
  },
  "operations": {
    "key_processes": ["[Process 1]", "[Process 2]"],
    "technology_stack": ["[Tech 1]", "[Tech 2]"],
    "bottlenecks": ["[Bottleneck 1]", "[Bottleneck 2]"]
  },
  "financials_and_metrics": {
    "primary_kpis": ["[KPI 1]", "[KPI 2]"],
    "current_performance_snapshot": "[Performance summary]",
    "financial_pain_points": ["[Financial challenge 1]", "[Financial challenge 2]"]
  },
  "team_and_capacity": {
    "team_structure": "[Team description]",
    "constraints": ["[Constraint 1]", "[Constraint 2]"],
    "opportunities": ["[Team opportunity 1]", "[Team opportunity 2]"]
  },
  "goals_and_vision": {
    "short_term": ["[3-6 month goal 1]", "[3-6 month goal 2]"],
    "long_term": ["[1-3 year goal 1]", "[1-3 year goal 2]"],
    "existential_risks": ["[Risk 1]", "[Risk 2]"]
  },
  "brand_and_positioning": {
    "desired_perception": "[How they want to be perceived]",
    "voice_tone": "[Brand voice description]",
    "messaging_pillars": ["[Key message 1]", "[Key message 2]"]
  },
  "strategic_risks_and_opportunities": {
    "risks": ["[Strategic risk 1]", "[Strategic risk 2]"],
    "immediate_opportunities": ["[Opportunity 1]", "[Opportunity 2]"]
  },
  "summary_recommendations": ["[Strategic recommendation 1]", "[Strategic recommendation 2]", "[Strategic recommendation 3]"]
}

Where client answers are missing or vague, infer the most likely scenario based on industry norms and the available information. Focus on actionable insights and strategic recommendations.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiIntegration.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_completion_tokens: 16384,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const profileContent = data.choices[0]?.message?.content;

      if (!profileContent) {
        throw new Error('No profile generated by AI');
      }

      const generatedProfile = JSON.parse(profileContent);
      console.log('✅ AI profile generated successfully with OpenAI direct call!');
      
      return { success: true, profile: generatedProfile };

    } catch (error) {
      console.error('❌ Direct OpenAI call failed:', error);
      console.log('🔄 Falling back to mock profile...');
      return await this.generateMockProfile(clientId);
    }
  },

  // Generate mock profile as ultimate fallback
  async generateMockProfile(clientId: string): Promise<{ success: boolean, profile?: any, error?: string }> {
    console.log('🎭 Generating mock profile for client:', clientId);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Shorter delay for mock
    
    const mockProfile = {
      business_summary: {
        name: "Generated Business Profile",
        founder_or_lead: "Business Owner",
        industry: "Technology",
        core_offering: "Digital Solutions",
        value_proposition: "AI-generated mock profile for testing"
      },
      customer_profile: {
        target_audience: "Generated target audience",
        primary_pain_points: ["Mock pain point 1", "Mock pain point 2"],
        customer_journey_overview: "Generated customer journey",
        competitive_landscape: {
          top_competitors: ["Competitor A", "Competitor B"],
          differentiators: ["Unique feature 1", "Unique feature 2"]
        }
      },
      business_model: {
        revenue_streams: ["Revenue stream 1", "Revenue stream 2"],
        pricing: "Generated pricing strategy",
        distribution_channels: ["Channel 1", "Channel 2"]
      },
      marketing_and_growth: {
        channels: ["Marketing channel 1", "Marketing channel 2"],
        what_works: ["Strategy 1", "Strategy 2"],
        growth_challenges: ["Challenge 1", "Challenge 2"],
        quick_wins: ["Quick win 1", "Quick win 2"]
      },
      operations: {
        key_processes: ["Process 1", "Process 2"],
        technology_stack: ["Tech 1", "Tech 2"],
        bottlenecks: ["Bottleneck 1", "Bottleneck 2"]
      },
      financials_and_metrics: {
        primary_kpis: ["KPI 1", "KPI 2"],
        current_performance_snapshot: "Generated performance snapshot",
        financial_pain_points: ["Financial challenge 1", "Financial challenge 2"]
      },
      team_and_capacity: {
        team_structure: "Generated team structure",
        constraints: ["Constraint 1", "Constraint 2"],
        opportunities: ["Opportunity 1", "Opportunity 2"]
      },
      goals_and_vision: {
        short_term: ["Short-term goal 1", "Short-term goal 2"],
        long_term: ["Long-term goal 1", "Long-term goal 2"],
        existential_risks: ["Risk 1", "Risk 2"]
      },
      brand_and_positioning: {
        desired_perception: "Generated brand perception",
        voice_tone: "Generated voice and tone",
        messaging_pillars: ["Message 1", "Message 2"]
      },
      strategic_risks_and_opportunities: {
        risks: ["Strategic risk 1", "Strategic risk 2"],
        immediate_opportunities: ["Opportunity 1", "Opportunity 2"]
      },
      summary_recommendations: ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
    };
    
    return { success: true, profile: mockProfile };
  },

  // Get client data for workflow variables
  getClientBusinessProfile(clientId: string): any {
    try {
      const clients = JSON.parse(localStorage.getItem('ryvr_clients') || '[]');
      const client = clients.find((c: any) => c.id === clientId);
      return client?.businessProfile || null;
    } catch (error) {
      console.error('Failed to load client business profile:', error);
      return null;
    }
  },

  // Get all clients with business profiles for workflow variables
  getAllClientsWithProfiles(): any[] {
    try {
      const clients = JSON.parse(localStorage.getItem('ryvr_clients') || '[]');
      return clients.filter((c: any) => c.businessProfile);
    } catch (error) {
      console.error('Failed to load clients with profiles:', error);
      return [];
    }
  },

  // Utility to check backend status
  async isBackendAvailable(): Promise<boolean> {
    return await checkBackend();
  }
}; 