/**
 * Authentication Utilities
 * Helper functions for token management and debugging
 */

export const getAuthToken = (): string | null => {
  return localStorage.getItem('ryvr_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('ryvr_token', token);
};

export const clearAuthData = (): void => {
  localStorage.removeItem('ryvr_token');
  localStorage.removeItem('ryvr_user');
  console.log('🧹 Auth data cleared');
};

export const redirectToLogin = (): void => {
  console.log('🔄 Redirecting to login page');
  window.location.href = '/login';
};

export const handleAuthError = (endpoint: string, status: number): void => {
  console.error(`🚫 Authentication failed for ${endpoint} (${status})`);
  
  if (status === 401 || status === 403) {
    clearAuthData();
    redirectToLogin();
  }
};

export const debugAuthState = (): void => {
  const token = getAuthToken();
  const user = localStorage.getItem('ryvr_user');
  
  console.log('🔍 Auth Debug State:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenStart: token?.substring(0, 20) + '...',
    hasUser: !!user,
    userValid: user ? (() => {
      try {
        JSON.parse(user);
        return true;
      } catch {
        return false;
      }
    })() : false,
    timestamp: new Date().toISOString()
  });
};

export const isValidJWT = (token: string): boolean => {
  try {
    // Basic JWT format check (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Try to decode the payload (base64)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if it has required fields and isn't expired
    const now = Date.now() / 1000;
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
};

export const getTokenInfo = (token: string): any => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      subject: payload.sub,
      role: payload.role,
      userId: payload.user_id,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      isExpired: payload.exp < Date.now() / 1000
    };
  } catch {
    return null;
  }
};
