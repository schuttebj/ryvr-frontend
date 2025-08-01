// Simple API service that can work with backend or localStorage fallback
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

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
    if (backendAvailable) {
      try {
        const token = localStorage.getItem('ryvr_auth_token');
        const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/generate-profile`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ai_model: aiModel,
            include_recommendations: true
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          return { success: true, profile: result.business_profile };
        } else {
          const error = await response.json();
          return { success: false, error: error.detail || 'Failed to generate profile' };
        }
      } catch (error) {
        console.error('Backend profile generation failed:', error);
        return { success: false, error: 'Network error' };
      }
    }
    
    // Fallback: Mock profile generation
    console.log('Simulating profile generation for client:', clientId);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
    
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

  // Utility to check backend status
  async isBackendAvailable(): Promise<boolean> {
    return await checkBackend();
  }
}; 