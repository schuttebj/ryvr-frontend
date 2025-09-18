// Workflow API service for RYVR platform
import { apiClient } from '@/lib/api'

export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: any
}

export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  status: 'draft' | 'active' | 'paused' | 'archived'
  created_at: string
  updated_at: string
  business_id: string
  agency_id?: string
  is_template: boolean
  isActive?: boolean
}

export interface CreateWorkflowRequest {
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  business_id: string
  is_template?: boolean
}

export interface UpdateWorkflowRequest extends Partial<CreateWorkflowRequest> {
  id: string
  status?: Workflow['status']
}

export interface WorkflowListResponse {
  workflows: Workflow[]
  total: number
  page: number
  per_page: number
}

export interface WorkflowExecutionResult {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  results: any
  error_message?: string
}

class WorkflowApiService {
  // Get all workflows for a business
  async getWorkflows(businessId: string, page = 1, perPage = 20): Promise<WorkflowListResponse> {
    return apiClient.get(`/workflows?business_id=${businessId}&page=${page}&per_page=${perPage}`)
  }

  // Get workflow templates (admin/agency only)
  async getWorkflowTemplates(page = 1, perPage = 20): Promise<WorkflowListResponse> {
    return apiClient.get(`/workflows/templates?page=${page}&per_page=${perPage}`)
  }

  // Get single workflow by ID
  async getWorkflow(workflowId: string): Promise<Workflow> {
    return apiClient.get(`/workflows/${workflowId}`)
  }

  // Create new workflow
  async createWorkflow(workflow: CreateWorkflowRequest): Promise<Workflow> {
    return apiClient.post('/workflows', workflow)
  }

  // Update existing workflow
  async updateWorkflow(workflow: UpdateWorkflowRequest): Promise<Workflow> {
    const { id, ...data } = workflow

    return apiClient.put(`/workflows/${id}`, data)
  }

  // Delete workflow
  async deleteWorkflow(workflowId: string): Promise<void> {
    return apiClient.delete(`/workflows/${workflowId}`)
  }

  // Duplicate workflow
  async duplicateWorkflow(workflowId: string, name: string): Promise<Workflow> {
    return apiClient.post(`/workflows/${workflowId}/duplicate`, { name })
  }

  // Execute workflow
  async executeWorkflow(workflowId: string, input?: any): Promise<WorkflowExecutionResult> {
    return apiClient.post(`/workflows/${workflowId}/execute`, { input })
  }

  // Get workflow execution history
  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecutionResult[]> {
    return apiClient.get(`/workflows/${workflowId}/executions`)
  }

  // Validate workflow before saving
  async validateWorkflow(workflow: CreateWorkflowRequest): Promise<{ valid: boolean; errors: string[] }> {
    return apiClient.post('/workflows/validate', workflow)
  }

  // Save workflow as template (admin/agency only)
  async saveAsTemplate(workflowId: string, templateName: string): Promise<Workflow> {
    return apiClient.post(`/workflows/${workflowId}/save-as-template`, { name: templateName })
  }

  // Test a node configuration
  async testNode(nodeType: string, config: any): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post('/workflows/test-node', { nodeType, config })
  }

  // Store node result for use in other nodes
  async storeNodeResult(nodeId: string, result: any): Promise<void> {
    return apiClient.post(`/workflows/nodes/${nodeId}/result`, result)
  }

  // Load workflow (alias for getWorkflow for compatibility)
  async loadWorkflow(workflowId: string): Promise<Workflow> {
    return this.getWorkflow(workflowId)
  }

  // Activate workflow
  async activateWorkflow(workflowId: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(`/workflows/${workflowId}/activate`)
  }

  // Deactivate workflow
  async deactivateWorkflow(workflowId: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(`/workflows/${workflowId}/deactivate`)
  }
}

// Helper functions for workflow components
export const getAvailableDataNodes = (workflows: Workflow[] = []): any[] => {
  // Return mock data for now - this would typically come from executed workflow nodes
  return workflows.map(workflow => ({
    nodeId: workflow.id,
    nodeLabel: workflow.name,
    nodeType: 'trigger',
    executedAt: workflow.updated_at,
    status: workflow.status === 'active' ? 'success' : 'error',
    dataStructure: [],
    id: workflow.id,
    data: workflow.nodes
  }))
}

export const processVariables = (text: string, availableData: any[] | Record<string, any> = []): string => {
  // Simple variable replacement for now
  // This would typically process {{variable.path}} syntax
  let processedText = text
  
  // Replace common variable patterns
  processedText = processedText.replace(/\{\{(\w+\.?\w*)\}\}/g, (match, varName) => {
    // Simple variable replacement logic
    return `[${varName}]` // Placeholder replacement
  })
  
  return processedText
}

export const clearWorkflowData = (): void => {
  // Clear any stored workflow data in localStorage or state
  if (typeof window !== 'undefined') {
    localStorage.removeItem('workflowData')
    localStorage.removeItem('nodeResults')
  }
  console.log('Workflow data cleared from local storage')
}

export const getStoredNodeResponse = (nodeId: string): any => {
  // Get stored node response from localStorage
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem('nodeResults')
    if (storedData) {
      try {
        const results = JSON.parse(storedData)
        return results[nodeId] || null
      } catch (error) {
        console.error('Error parsing stored node results:', error)
        return null
      }
    }
  }
  return null
}

export const workflowApi = new WorkflowApiService()
export default workflowApi
