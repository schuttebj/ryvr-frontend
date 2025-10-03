/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Get API base URL from environment variable or use production default
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    ME: '/api/v1/auth/me',
    SWITCH_BUSINESS: '/api/v1/auth/switch-business',
  },
  
  // Admin
  ADMIN: {
    SYSTEM_RESET: '/api/v1/admin/system/reset-and-initialize',
    USERS: '/api/v1/admin/users',
    BUSINESSES: '/api/v1/admin/businesses',
  },
  
  // Businesses
  BUSINESSES: {
    LIST: '/api/v1/businesses',
    CREATE: '/api/v1/businesses',
    DETAIL: (id: number) => `/api/v1/businesses/${id}`,
  },
  
  // Files
  FILES: {
    LIST: '/api/v1/files',
    UPLOAD: '/api/v1/files/upload',
    DELETE: (id: number) => `/api/v1/files/${id}`,
    LIST_ALL_BUSINESS: '/api/v1/files',
    BUSINESS_UPLOAD: (businessId: number) => `/api/v1/files/businesses/${businessId}/upload`,
    BUSINESS_LIST: (businessId: number) => `/api/v1/files/businesses/${businessId}`,
  },
  
  // Chat/Embeddings
  EMBEDDINGS: {
    CHAT: '/api/v1/embeddings/chat',
    CHAT_ALL: '/api/v1/embeddings/chat-all',
  },
  
  // Workflows
  WORKFLOWS: {
    LIST: '/api/v1/workflows',
    CREATE: '/api/v1/workflows',
    DETAIL: (id: number) => `/api/v1/workflows/${id}`,
  },
  
  // Integrations
  INTEGRATIONS: {
    SIMPLE: '/api/simple/integrations',
    SYSTEM: '/api/v1/system-integrations',
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const authToken = token || localStorage.getItem('token');
  return {
    ...DEFAULT_HEADERS,
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
};
