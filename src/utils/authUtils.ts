/**
 * Authentication utility functions for handling auth errors and redirects
 */

/**
 * Handles authentication errors by clearing local storage and redirecting to login
 * @param status HTTP status code
 * @param context Context where the error occurred (for logging)
 */
export const handleAuthError = (status: number, context: string = 'API call') => {
  if (status === 401 || status === 403) {
    console.warn(`🚫 Authentication failed (${status}) in ${context} - redirecting to login`);
    
    // Clear stored authentication data
    localStorage.removeItem('ryvr_token');
    localStorage.removeItem('ryvr_user');
    
    // Redirect to login page
    window.location.href = '/login';
    
    return true; // Indicates auth error was handled
  }
  return false; // Not an auth error
};

/**
 * Creates headers with authentication token if available
 * @param additionalHeaders Additional headers to include
 * @returns Headers object with authentication
 */
export const createAuthHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  const token = localStorage.getItem('ryvr_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Checks if the user is authenticated
 * @returns boolean indicating authentication status
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('ryvr_token');
  const user = localStorage.getItem('ryvr_user');
  return !!(token && user);
};

/**
 * Gets the current user from localStorage
 * @returns User object or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('ryvr_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Logs out the user by clearing localStorage and redirecting
 */
export const logout = () => {
  localStorage.removeItem('ryvr_token');
  localStorage.removeItem('ryvr_user');
  window.location.href = '/login';
};

/**
 * Makes an authenticated API request with automatic auth error handling
 * @param url API endpoint URL
 * @param options Fetch options
 * @returns Promise with fetch response
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const headers = createAuthHeaders(options.headers as Record<string, string> || {});
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle authentication errors automatically
  if (!response.ok && handleAuthError(response.status, `API call to ${url}`)) {
    throw new Error(`Authentication failed: ${response.status}`);
  }
  
  return response;
};