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

  // Utility to check backend status
  async isBackendAvailable(): Promise<boolean> {
    return await checkBackend();
  }
}; 