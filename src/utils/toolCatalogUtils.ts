/**
 * Tool Catalog Utilities
 * Converts backend tool catalog to frontend node palette items
 */

export interface ToolCatalogProvider {
  name: string;
  description: string;
  category: string;
  auth_type: string;
  operations: Record<string, ToolCatalogOperation>;
}

export interface ToolCatalogOperation {
  name: string;
  description: string;
  is_async: boolean;
  base_credits: number;
  fields: ToolCatalogField[];
  async_config?: any;
}

export interface ToolCatalogField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface NodePaletteItem {
  type: string; // e.g., "dataforseo_serp_google_organic"
  category: string;
  label: string;
  description: string;
  icon: string;
  provider: string;
  operation: string;
  baseCredits: number;
  isAsync: boolean;
  fields: ToolCatalogField[];
  authType: string;
}

export interface ToolCatalog {
  schema_version: string;
  providers: Record<string, ToolCatalogProvider> | ToolCatalogProvider[];
}

/**
 * Get icon for a category
 */
export const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    trigger: '⚡',
    seo: '🔍',
    ai: '🤖',
    content: '📝',
    data: '🔄',
    email: '📧',
    analytics: '📊',
    social: '📱',
    advertising: '📢',
    crm: '👥',
    ecommerce: '🛒',
    communication: '💬',
    project: '📋',
    storage: '💾',
    marketing: '📈',
  };
  
  return iconMap[category] || '🔧';
};

/**
 * Get color for a provider category
 */
export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    trigger: '#9C27B0',   // Purple
    seo: '#FF6B6B',       // Red
    ai: '#10B981',        // Green (OpenAI)
    content: '#3B82F6',   // Blue
    data: '#64748B',      // Gray
    email: '#F59E0B',     // Amber
    analytics: '#8B5CF6', // Purple
    social: '#EC4899',    // Pink
    advertising: '#EF4444', // Red
    crm: '#06B6D4',       // Cyan
    ecommerce: '#A855F7', // Purple
    communication: '#14B8A6', // Teal
    project: '#6366F1',   // Indigo
    storage: '#84CC16',   // Lime
    marketing: '#F97316', // Orange
  };
  
  return colorMap[category] || '#64748B';
};

/**
 * Convert tool catalog to node palette items
 * Handles both V1 (Record) and V2 (Array) provider formats
 */
export const convertToolCatalogToNodePalette = (catalog: any): NodePaletteItem[] => {
  const nodes: NodePaletteItem[] = [];
  
  // Add built-in trigger node
  nodes.push({
    type: 'trigger',
    category: 'trigger',
    label: 'Manual Trigger',
    description: 'Start workflow manually',
    icon: getCategoryIcon('trigger'),
    provider: 'builtin',
    operation: 'trigger',
    baseCredits: 0,
    isAsync: false,
    fields: [],
    authType: 'none',
  });
  
  // Handle both V1 (Record) and V2 (Array) formats
  const providersData = catalog.providers || [];
  const providersList = Array.isArray(providersData) 
    ? providersData 
    : Object.entries(providersData).map(([id, provider]: [string, any]) => ({ id, ...provider }));
  
  // Convert each provider's operations to nodes
  for (const provider of providersList) {
    const providerId = provider.id || provider.name?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
    const operations = provider.operations || {};
    const category = provider.category || provider.label || 'other';
    
    for (const [operationId, operation] of Object.entries(operations)) {
      const op = operation as any;
      nodes.push({
        type: `${providerId}_${operationId}`,
        category,
        label: op.name || operationId,
        description: op.description || '',
        icon: getCategoryIcon(category),
        provider: providerId,
        operation: operationId,
        baseCredits: op.base_credits || op.baseCredits || 0,
        isAsync: op.is_async || op.isAsync || false,
        fields: op.fields || [],
        authType: provider.auth_type || provider.authType || 'none',
      });
    }
  }
  
  return nodes;
};

/**
 * Group nodes by category for the palette
 */
export const groupNodesByCategory = (nodes: NodePaletteItem[]): Record<string, NodePaletteItem[]> => {
  const grouped: Record<string, NodePaletteItem[]> = {};
  
  for (const node of nodes) {
    if (!grouped[node.category]) {
      grouped[node.category] = [];
    }
    grouped[node.category].push(node);
  }
  
  return grouped;
};

/**
 * Search nodes by term (searches label, description, provider)
 */
export const searchNodes = (nodes: NodePaletteItem[], searchTerm: string): NodePaletteItem[] => {
  if (!searchTerm) return nodes;
  
  const term = searchTerm.toLowerCase();
  
  return nodes.filter(node => 
    node.label.toLowerCase().includes(term) ||
    node.description.toLowerCase().includes(term) ||
    node.provider.toLowerCase().includes(term) ||
    node.category.toLowerCase().includes(term)
  );
};

/**
 * Filter nodes by category
 */
export const filterNodesByCategory = (nodes: NodePaletteItem[], category: string): NodePaletteItem[] => {
  if (!category) return nodes;
  return nodes.filter(node => node.category === category);
};

/**
 * Get unique categories from nodes
 */
export const getUniqueCategories = (nodes: NodePaletteItem[]): string[] => {
  const categories = new Set(nodes.map(node => node.category));
  return Array.from(categories).sort();
};

/**
 * Get category display name
 */
export const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    trigger: 'Triggers',
    seo: 'SEO & Search',
    ai: 'AI & ML',
    content: 'Content',
    data: 'Data Processing',
    email: 'Email',
    analytics: 'Analytics',
    social: 'Social Media',
    advertising: 'Advertising',
    crm: 'CRM',
    ecommerce: 'E-Commerce',
    communication: 'Communication',
    project: 'Project Management',
    storage: 'Storage',
    marketing: 'Marketing',
  };
  
  return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

