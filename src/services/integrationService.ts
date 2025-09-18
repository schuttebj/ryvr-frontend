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

class IntegrationService {
  private storageKey = 'integrations';

  /**
   * Load all integrations from localStorage
   */
  loadIntegrations(): Integration[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load integrations:', error);
      return [];
    }
  }

  /**
   * Save integrations to localStorage
   */
  saveIntegrations(integrations: Integration[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(integrations));
    } catch (error) {
      console.error('Failed to save integrations:', error);
      throw new Error('Failed to save integrations');
    }
  }

  /**
   * Get integrations by type and status
   */
  getIntegrationsByType(type: 'openai' | 'dataforseo' | 'custom', status?: string): Integration[] {
    const integrations = this.loadIntegrations();
    return integrations.filter(i => {
      if (status) {
        return i.type === type && i.status === status;
      }
      return i.type === type;
    });
  }

  /**
   * Get connected integrations by type
   */
  getConnectedIntegrations(type: 'openai' | 'dataforseo' | 'custom'): Integration[] {
    return this.getIntegrationsByType(type, 'connected');
  }

  /**
   * Get integration by ID
   */
  getIntegrationById(id: string): Integration | undefined {
    const integrations = this.loadIntegrations();
    return integrations.find(i => i.id === id);
  }

  /**
   * Add or update an integration
   */
  saveIntegration(integration: Integration): void {
    const integrations = this.loadIntegrations();
    const existingIndex = integrations.findIndex(i => i.id === integration.id);
    
    if (existingIndex >= 0) {
      integrations[existingIndex] = integration;
    } else {
      integrations.push(integration);
    }
    
    this.saveIntegrations(integrations);
  }

  /**
   * Delete an integration
   */
  deleteIntegration(id: string): void {
    const integrations = this.loadIntegrations();
    const filtered = integrations.filter(i => i.id !== id);
    this.saveIntegrations(filtered);
  }

  /**
   * Update integration status
   */
  updateIntegrationStatus(id: string, status: 'connected' | 'disconnected' | 'error'): void {
    const integrations = this.loadIntegrations();
    const integration = integrations.find(i => i.id === id);
    
    if (integration) {
      integration.status = status;
      integration.lastTested = new Date().toISOString();
      integration.updatedAt = new Date().toISOString();
      this.saveIntegrations(integrations);
    }
  }

  /**
   * Merge integration config with node config
   * Node config takes precedence over integration config
   */
  mergeConfigWithIntegration(nodeConfig: Record<string, any>): Record<string, any> {
    if (!nodeConfig.integrationId) {
      return nodeConfig;
    }

    const integration = this.getIntegrationById(nodeConfig.integrationId);
    if (!integration) {
      console.warn('Integration not found:', nodeConfig.integrationId);
      return nodeConfig;
    }

    // Merge integration config with node config, node config takes precedence
    return { ...integration.config, ...nodeConfig };
  }

  /**
   * Check if there are any connected integrations of a specific type
   */
  hasConnectedIntegrations(type: 'openai' | 'dataforseo' | 'custom'): boolean {
    return this.getConnectedIntegrations(type).length > 0;
  }

  /**
   * Get integration options for dropdowns
   */
  getIntegrationOptions(type: 'openai' | 'dataforseo' | 'custom'): Array<{ value: string; label: string }> {
    const integrations = this.getConnectedIntegrations(type);
    return integrations.map(integration => ({
      value: integration.id,
      label: integration.name
    }));
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();
export type { Integration }; 