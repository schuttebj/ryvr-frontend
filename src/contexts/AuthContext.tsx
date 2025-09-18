import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  role: string; // admin, agency_owner, agency_manager, agency_viewer, individual_user, business_owner, business_user
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  email_verified?: boolean;
  is_active?: boolean;
  is_admin?: boolean; // legacy field for backward compatibility
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('ryvr_token');
      const savedUser = localStorage.getItem('ryvr_user');
      
      if (savedToken && savedUser) {
        try {
          // Parse user data
          const userData = JSON.parse(savedUser);
          
          // Validate token by making a request to /me endpoint
          const backendUrl = 'https://ryvr-backend.onrender.com';
          const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            // Token is valid, set auth state
            setToken(savedToken);
            setUser(userData);
            console.log('✅ Token validated successfully');
          } else {
            // Token is invalid, clear storage
            console.warn('🚫 Token validation failed, clearing auth data');
            localStorage.removeItem('ryvr_token');
            localStorage.removeItem('ryvr_user');
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('ryvr_token');
          localStorage.removeItem('ryvr_user');
        }
      }
      
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('ryvr_token', newToken);
    localStorage.setItem('ryvr_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ryvr_token');
    localStorage.removeItem('ryvr_user');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

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