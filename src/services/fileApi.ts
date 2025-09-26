/**
 * File Management API Service
 * Handles file upload, management, and operations
 */

import { getAuthToken, handleAuthError } from '../utils/auth';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://ryvr-backend.onrender.com';

// Types for file management
export interface FileItem {
  id: number;
  account_id: number;
  account_type: string;
  business_id?: number;
  uploaded_by: number;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  content_text?: string;
  summary?: string;
  summary_credits_used: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  tags: string[];
  file_metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface FileUploadResponse {
  id: number;
  file_name: string;
  original_name: string;
  file_size: number;
  file_type: string;
  processing_status: string;
  created_at: string;
}

export interface FileListResponse {
  files: FileItem[];
  total_count: number;
  offset: number;
  limit: number;
}

export interface StorageUsageResponse {
  total_bytes: number;
  file_count: number;
  account_files_bytes: number;
  business_files_bytes: number;
  total_gb: number;
  limit_gb: number;
  usage_percentage: number;
}

export interface FileSearchRequest {
  business_id?: number;
  search_query?: string;
  file_type?: string;
  limit?: number;
  offset?: number;
}

export interface FileSummaryRequest {
  force_regenerate?: boolean;
}

export interface FileMoveRequest {
  target_business_id?: number;
}

// Helper function to create request headers
const createHeaders = (includeAuth: boolean = true, contentType?: string): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response, endpoint: string): Promise<T> => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      handleAuthError(endpoint, response.status);
      throw new Error('Authentication failed');
    }
    
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // If we can't parse error response, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

export const fileApi = {
  // =============================================================================
  // ACCOUNT-LEVEL FILE OPERATIONS
  // =============================================================================
  
  /**
   * Upload file to account level
   */
  uploadAccountFile: async (
    file: File, 
    autoProcess: boolean = true, 
    tags: string[] = []
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auto_process', autoProcess.toString());
    if (tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    
    const response = await fetch(`${API_BASE}/api/v1/files/upload`, {
      method: 'POST',
      headers: createHeaders(true), // No content-type for FormData
      body: formData,
    });
    
    return handleResponse<FileUploadResponse>(response, 'uploadAccountFile');
  },
  
  /**
   * List account-level files
   */
  listAccountFiles: async (
    searchQuery?: string,
    fileType?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<FileListResponse> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search_query', searchQuery);
    if (fileType) params.append('file_type', fileType);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    const response = await fetch(`${API_BASE}/api/v1/files/?${params}`, {
      headers: createHeaders(true, 'application/json'),
    });
    
    return handleResponse<FileListResponse>(response, 'listAccountFiles');
  },
  
  // =============================================================================
  // BUSINESS-LEVEL FILE OPERATIONS
  // =============================================================================
  
  /**
   * Upload file to business level
   */
  uploadBusinessFile: async (
    businessId: number,
    file: File,
    autoProcess: boolean = true,
    tags: string[] = []
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auto_process', autoProcess.toString());
    if (tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    
    const response = await fetch(`${API_BASE}/api/v1/files/businesses/${businessId}/upload`, {
      method: 'POST',
      headers: createHeaders(true),
      body: formData,
    });
    
    return handleResponse<FileUploadResponse>(response, 'uploadBusinessFile');
  },
  
  /**
   * List business-level files
   */
  listBusinessFiles: async (
    businessId: number,
    searchQuery?: string,
    fileType?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<FileListResponse> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search_query', searchQuery);
    if (fileType) params.append('file_type', fileType);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    const response = await fetch(`${API_BASE}/api/v1/files/businesses/${businessId}/?${params}`, {
      headers: createHeaders(true, 'application/json'),
    });
    
    return handleResponse<FileListResponse>(response, 'listBusinessFiles');
  },
  
  // =============================================================================
  // INDIVIDUAL FILE OPERATIONS
  // =============================================================================
  
  /**
   * Get file details
   */
  getFile: async (fileId: number): Promise<FileItem> => {
    const response = await fetch(`${API_BASE}/api/v1/files/${fileId}`, {
      headers: createHeaders(true, 'application/json'),
    });
    
    return handleResponse<FileItem>(response, 'getFile');
  },
  
  /**
   * Get file download URL
   */
  getDownloadUrl: (fileId: number): string => {
    return `${API_BASE}/api/v1/files/${fileId}/download`;
  },
  
  /**
   * Download file
   */
  downloadFile: async (fileId: number): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/api/v1/files/${fileId}/download`, {
      headers: createHeaders(true),
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    
    return response.blob();
  },
  
  /**
   * Get file content (extracted text)
   */
  getFileContent: async (fileId: number): Promise<{
    file_id: number;
    original_name: string;
    content_text: string;
    summary: string;
    processing_status: string;
  }> => {
    const response = await fetch(`${API_BASE}/api/v1/files/${fileId}/content`, {
      headers: createHeaders(true, 'application/json'),
    });
    
    return handleResponse(response, 'getFileContent');
  },
  
  /**
   * Update file metadata
   */
  updateFile: async (fileId: number, updates: {
    original_name?: string;
    tags?: string[];
  }): Promise<FileItem> => {
    const response = await fetch(`${API_BASE}/api/v1/files/${fileId}`, {
      method: 'PUT',
      headers: createHeaders(true, 'application/json'),
      body: JSON.stringify(updates),
    });
    
    return handleResponse<FileItem>(response, 'updateFile');
  },
  
  /**
   * Delete file
   */
  deleteFile: async (fileId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/api/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: createHeaders(true, 'application/json'),
    });
    
    return handleResponse(response, 'deleteFile');
  },
  
  /**
   * Generate or regenerate file summary
   */
  generateSummary: async (fileId: number, forceRegenerate: boolean = false): Promise<{
    file_id: number;
    summary: string;
    credits_used: number;
    regenerated: boolean;
  }> => {
    const response = await fetch(`${API_BASE}/api/v1/files/${fileId}/summarize`, {
      method: 'POST',
      headers: createHeaders(true, 'application/json'),
      body: JSON.stringify({ force_regenerate: forceRegenerate }),
    });
    
    return handleResponse(response, 'generateSummary');
  },
  
  /**
   * Move file between account and business contexts
   */
  moveFile: async (fileId: number, targetBusinessId?: number): Promise<{
    message: string;
    new_business_id?: number;
  }> => {
    const response = await fetch(`${API_BASE}/api/v1/files/${fileId}/move`, {
      method: 'POST',
      headers: createHeaders(true, 'application/json'),
      body: JSON.stringify({ target_business_id: targetBusinessId }),
    });
    
    return handleResponse(response, 'moveFile');
  },
  
  // =============================================================================
  // STORAGE MANAGEMENT
  // =============================================================================
  
  /**
   * Get storage usage statistics
   */
  getStorageUsage: async (): Promise<StorageUsageResponse> => {
    const response = await fetch(`${API_BASE}/api/v1/files/storage/usage`, {
      headers: createHeaders(true, 'application/json'),
    });
    
    return handleResponse<StorageUsageResponse>(response, 'getStorageUsage');
  },
  
  // =============================================================================
  // SEARCH AND FILTER
  // =============================================================================
  
  /**
   * Search across all accessible files
   */
  searchFiles: async (searchRequest: FileSearchRequest): Promise<FileListResponse> => {
    const response = await fetch(`${API_BASE}/api/v1/files/search`, {
      method: 'POST',
      headers: createHeaders(true, 'application/json'),
      body: JSON.stringify(searchRequest),
    });
    
    return handleResponse<FileListResponse>(response, 'searchFiles');
  },
  
  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================
  
  /**
   * Format file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  /**
   * Get file type icon/color
   */
  getFileTypeInfo: (fileType: string): { icon: string; color: string } => {
    const type = fileType.toLowerCase();
    
    if (type === 'pdf') {
      return { icon: '📄', color: '#e53e3e' };
    } else if (['docx', 'doc'].includes(type)) {
      return { icon: '📝', color: '#2b6cb0' };
    } else if (['txt', 'text', 'md'].includes(type)) {
      return { icon: '📃', color: '#38a169' };
    } else if (type === 'rtf') {
      return { icon: '📄', color: '#9f7aea' };
    }
    
    return { icon: '📁', color: '#718096' };
  },
  
  /**
   * Check if file type is supported
   */
  isSupportedFileType: (file: File): boolean => {
    const supportedTypes = [
      'text/plain',
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/markdown',
      'text/rtf'
    ];
    
    const supportedExtensions = ['txt', 'pdf', 'docx', 'doc', 'md', 'rtf'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    return supportedTypes.includes(file.type) || (extension ? supportedExtensions.includes(extension) : false);
  },
  
  /**
   * Get processing status display info
   */
  getProcessingStatusInfo: (status: string): { label: string; color: string } => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: 'warning' };
      case 'processing':
        return { label: 'Processing', color: 'info' };
      case 'completed':
        return { label: 'Ready', color: 'success' };
      case 'failed':
        return { label: 'Failed', color: 'error' };
      default:
        return { label: status, color: 'default' };
    }
  }
};

export default fileApi;
