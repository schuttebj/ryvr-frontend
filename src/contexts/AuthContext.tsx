'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient, type User, type LoginRequest } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('ryvr_token')
        const savedUser = localStorage.getItem('ryvr_user')
        
        if (savedToken && savedUser) {
          // Set token in API client
          apiClient.setToken(savedToken)
          
          try {
            // Validate token by fetching current user
            const currentUser = await apiClient.getCurrentUser()
            
            // Token is valid, set auth state
            setToken(savedToken)
            setUser(currentUser)
            
            // Update saved user data
            localStorage.setItem('ryvr_user', JSON.stringify(currentUser))
            
            console.log('✅ Token validated successfully')
          } catch (error) {
            // Token is invalid, clear storage
            console.warn('🚫 Token validation failed, clearing auth data')
            handleLogout(false) // Don't redirect during initialization
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        handleLogout(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.login(credentials)
      
      // Set token in API client
      apiClient.setToken(response.access_token)
      
      // Update state
      setToken(response.access_token)
      setUser(response.user)
      
      // Save to localStorage
      localStorage.setItem('ryvr_token', response.access_token)
      localStorage.setItem('ryvr_user', JSON.stringify(response.user))
      
      console.log('✅ Login successful')
      
      // Redirect based on user role
      const redirectPath = getDefaultRoute(response.user)
      router.push(redirectPath)
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  }

  const handleLogout = (shouldRedirect = true) => {
    // Clear API client token
    apiClient.setToken(null)
    
    // Clear state
    setToken(null)
    setUser(null)
    
    // Clear localStorage
    localStorage.removeItem('ryvr_token')
    localStorage.removeItem('ryvr_user')
    
    console.log('👋 Logout successful')
    
    if (shouldRedirect) {
      router.push('/login')
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await apiClient.getCurrentUser()
      setUser(currentUser)
      localStorage.setItem('ryvr_user', JSON.stringify(currentUser))
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // If refresh fails, logout user
      handleLogout()
      throw error
    }
  }

  const getDefaultRoute = (user: User): string => {
    if (!user) return '/login'
    
    // Route based on user role
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'agency_owner' || user.role === 'agency_manager' || user.role === 'agency_viewer') {
      return '/agency/dashboard'
    }
    return '/business/dashboard'
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string | string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login')
          return
        }

        if (requiredRole && user) {
          const hasRequiredRole = Array.isArray(requiredRole)
            ? requiredRole.includes(user.role)
            : user.role === requiredRole

          if (!hasRequiredRole) {
            // Redirect to appropriate dashboard based on user's actual role
            const defaultRoute = user.role === 'admin' 
              ? '/admin/dashboard'
              : user.role.startsWith('agency_')
              ? '/agency/dashboard'
              : '/business/dashboard'
            router.push(defaultRoute)
            return
          }
        }
      }
    }, [isAuthenticated, isLoading, user, router])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null // Will redirect to login
    }

    if (requiredRole && user) {
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole

      if (!hasRequiredRole) {
        return null // Will redirect to appropriate dashboard
      }
    }

    return <Component {...props} />
  }
}
