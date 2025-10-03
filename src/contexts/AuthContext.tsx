import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

// Updated User interface for simplified structure
interface User {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'user'; // Simplified roles
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  email_verified?: boolean;
  is_active?: boolean;
  is_master_account: boolean;
  master_account_id?: number;
  seat_name?: string;
}

// User's subscription tier
interface SubscriptionTier {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  credits_included: number;
  business_limit: number;
  seat_limit: number;
  storage_limit_gb: number;
  max_file_size_mb: number;
  features: string[];
  cross_business_chat: boolean;
  cross_business_files: boolean;
  client_access_enabled: boolean;
  workflow_access: string[];
  integration_access: string[];
}

// Business interface
interface Business {
  id: number;
  name: string;
  slug?: string;
  industry?: string;
  website?: string;
  description?: string;
  owner_id: number;
  is_active: boolean;
  user_role: 'admin' | 'owner' | 'manager' | 'viewer';
  created_at: string;
  updated_at?: string;
}

// User context with subscription and business info
interface UserContext {
  user: User;
  subscription_tier?: SubscriptionTier;
  businesses: Business[];
  current_business_id?: number;
  seat_users: User[]; // Only for master accounts
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userContext: UserContext | null;
  currentBusinessId: number | null;
  currentBusiness: Business | null;
  
  // Actions
  login: (token: string, user: User, businessId?: number) => void;
  logout: () => void;
  switchBusiness: (businessId?: number) => Promise<void>;
  refreshUserContext: () => Promise<void>;
  
  // Utility functions
  hasFeature: (feature: string) => boolean;
  canAccessIntegration: (integration: string) => boolean;
  isBusinessLimitReached: () => boolean;
  isSeatLimitReached: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [currentBusinessId, setCurrentBusinessId] = useState<number | null>(null);

  // API base URL from centralized config
  const API_BASE = API_BASE_URL;

  // Current business derived from context
  const currentBusiness = userContext?.businesses.find((b: Business) => b.id === currentBusinessId) || null;

  // Utility functions
  const hasFeature = (feature: string): boolean => {
    if (user?.role === 'admin') return true;
    return userContext?.subscription_tier?.features.includes(feature) || false;
  };

  const canAccessIntegration = (integration: string): boolean => {
    if (user?.role === 'admin') return true;
    const integrationAccess = userContext?.subscription_tier?.integration_access || [];
    return integrationAccess.includes('all') || integrationAccess.includes(integration);
  };

  const isBusinessLimitReached = (): boolean => {
    if (user?.role === 'admin') return false;
    const businessCount = userContext?.businesses.length || 0;
    const limit = userContext?.subscription_tier?.business_limit || 0;
    return businessCount >= limit;
  };

  const isSeatLimitReached = (): boolean => {
    if (user?.role === 'admin') return false;
    const seatCount = userContext?.seat_users.length || 0;
    const limit = userContext?.subscription_tier?.seat_limit || 0;
    return seatCount >= limit;
  };

  // Fetch user context from API
  const fetchUserContext = async (authToken: string): Promise<UserContext | null> => {
    try {
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.AUTH.ME}`, {
        headers: getAuthHeaders(authToken),
      });

      if (response.ok) {
        const context = await response.json();
        console.log('🔍 Fetched user context:', context);
        return context;
      } else {
        console.warn('Failed to fetch user context:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user context:', error);
      return null;
    }
  };

  // Switch business context
  const switchBusiness = async (businessId?: number): Promise<void> => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.AUTH.SWITCH_BUSINESS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ business_id: businessId }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update token with new business context
        setToken(result.access_token);
        setCurrentBusinessId(businessId || null);
        localStorage.setItem('ryvr_token', result.access_token);
        localStorage.setItem('ryvr_current_business_id', businessId?.toString() || '');
      }
    } catch (error) {
      console.error('Error switching business context:', error);
    }
  };

  // Refresh user context
  const refreshUserContext = async (): Promise<void> => {
    if (!token) return;

    const context = await fetchUserContext(token);
    if (context) {
      setUserContext(context);
    }
  };

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('ryvr_token');
      const savedUser = localStorage.getItem('ryvr_user');
      const savedBusinessId = localStorage.getItem('ryvr_current_business_id');
      
      if (savedToken && savedUser) {
        try {
          // Parse user data
          const userData = JSON.parse(savedUser);
          
          // Fetch full user context
          const context = await fetchUserContext(savedToken);
          
          if (context) {
            // Token is valid, set auth state
            console.log('🔍 Setting user from context:', context.user);
            setToken(savedToken);
            setUser(context.user); // Use fresh user data from API
            setUserContext(context);
            
            // Set current business
            if (savedBusinessId && !isNaN(Number(savedBusinessId))) {
              setCurrentBusinessId(Number(savedBusinessId));
            } else if (context.businesses.length > 0) {
              setCurrentBusinessId(context.businesses[0].id);
            }
            
            console.log('✅ Token validated successfully');
          } else {
            // Token is invalid, clear storage
            console.warn('🚫 Token validation failed, clearing auth data');
            localStorage.removeItem('ryvr_token');
            localStorage.removeItem('ryvr_user');
            localStorage.removeItem('ryvr_current_business_id');
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('ryvr_token');
          localStorage.removeItem('ryvr_user');
          localStorage.removeItem('ryvr_current_business_id');
        }
      }
      
      setIsLoading(false);
    };

    validateToken();
  }, [API_BASE]);

  const login = (newToken: string, userData: User, businessId?: number) => {
    setToken(newToken);
    setUser(userData);
    if (businessId) {
      setCurrentBusinessId(businessId);
    }
    
    localStorage.setItem('ryvr_token', newToken);
    localStorage.setItem('ryvr_user', JSON.stringify(userData));
    if (businessId) {
      localStorage.setItem('ryvr_current_business_id', businessId.toString());
    }

    // Fetch full user context after login
    fetchUserContext(newToken).then(context => {
      if (context) {
        setUserContext(context);
      }
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserContext(null);
    setCurrentBusinessId(null);
    localStorage.removeItem('ryvr_token');
    localStorage.removeItem('ryvr_user');
    localStorage.removeItem('ryvr_current_business_id');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    userContext,
    currentBusinessId,
    currentBusiness,
    login,
    logout,
    switchBusiness,
    refreshUserContext,
    hasFeature,
    canAccessIntegration,
    isBusinessLimitReached,
    isSeatLimitReached,
  };

  console.log('🔐 AuthContext state:', { 
    isAuthenticated: value.isAuthenticated, 
    isLoading: value.isLoading, 
    hasUser: !!user,
    userRole: user?.role 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export types for use in other components
export type { User, SubscriptionTier, Business, UserContext };