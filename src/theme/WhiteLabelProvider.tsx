import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createRyvrTheme, type WhiteLabelConfig } from './ryvr-theme'
import { useAuth } from '../contexts/AuthContext'

interface WhiteLabelContextType {
  isWhiteLabeled: boolean
  whiteLabelConfig: WhiteLabelConfig | null
  updateWhiteLabel: (config: WhiteLabelConfig | null) => void
  brandName: string
  logo: string
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined)

export const useWhiteLabel = () => {
  const context = useContext(WhiteLabelContext)
  if (!context) {
    throw new Error('useWhiteLabel must be used within WhiteLabelProvider')
  }
  return context
}

interface WhiteLabelProviderProps {
  children: React.ReactNode
}

export const WhiteLabelProvider: React.FC<WhiteLabelProviderProps> = ({ children }) => {
  const { user } = useAuth()
  // TODO: Add business/agency context when implementing multi-tenant architecture
  const currentBusiness: any = null
  const currentAgency: any = null
  const [whiteLabelConfig, setWhiteLabelConfig] = useState<WhiteLabelConfig | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to system preference
    const saved = localStorage.getItem('ryvr-dark-mode')
    if (saved !== null) {
      return JSON.parse(saved)
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Load white-label configuration based on current context
  useEffect(() => {
    const loadWhiteLabelConfig = async () => {
      try {
        let config: WhiteLabelConfig | null = null

        // Priority: Business branding > Agency branding > Default RYVR
        if (currentBusiness) {
          // Check if business has custom branding
          const businessBranding = await fetchBusinessBranding(currentBusiness.id)
          if (businessBranding) {
            config = businessBranding
          } else if (currentAgency) {
            // Fall back to agency branding
            const agencyBranding = await fetchAgencyBranding(currentAgency.id)
            if (agencyBranding) {
              config = agencyBranding
            }
          }
        } else if (currentAgency) {
          // Agency-only context (no specific business selected)
          const agencyBranding = await fetchAgencyBranding(currentAgency.id)
          if (agencyBranding) {
            config = agencyBranding
          }
        }

        setWhiteLabelConfig(config)
      } catch (error) {
        console.error('Failed to load white-label configuration:', error)
        setWhiteLabelConfig(null)
      }
    }

    if (user && (currentBusiness || currentAgency)) {
      loadWhiteLabelConfig()
    } else {
      setWhiteLabelConfig(null)
    }
  }, [user, currentBusiness, currentAgency])

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('ryvr-dark-mode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  // Create theme based on current mode and white-label config
  const theme = useMemo(() => {
    return createRyvrTheme(isDarkMode ? 'dark' : 'light', whiteLabelConfig || undefined)
  }, [isDarkMode, whiteLabelConfig])

  // Inject CSS custom properties for workflow builder and other legacy components
  useEffect(() => {
    const root = document.documentElement
    
    if (whiteLabelConfig) {
      // Set white-label CSS variables
      root.style.setProperty('--ryvr-primary-color', whiteLabelConfig.primaryColor || '#5f5eff')
      root.style.setProperty('--ryvr-secondary-color', whiteLabelConfig.secondaryColor || '#5a6678')
      root.style.setProperty('--ryvr-font-family', whiteLabelConfig.fontFamily || 'Poppins, sans-serif')
      
      // Update favicon if provided
      if (whiteLabelConfig.favicon) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
        if (favicon) {
          favicon.href = whiteLabelConfig.favicon
        }
      }

      // Update document title if brand name provided
      if (whiteLabelConfig.brandName) {
        document.title = `${whiteLabelConfig.brandName} - Marketing Automation Platform`
      }
    } else {
      // Reset to RYVR defaults
      root.style.setProperty('--ryvr-primary-color', '#5f5eff')
      root.style.setProperty('--ryvr-secondary-color', '#5a6678')
      root.style.setProperty('--ryvr-font-family', 'Poppins, sans-serif')
      document.title = 'RYVR - Marketing Automation Platform'
    }

    // Set theme mode variables
    root.style.setProperty('--ryvr-mode', isDarkMode ? 'dark' : 'light')
    root.style.setProperty('--ryvr-background', isDarkMode ? '#2d3142' : '#f8f9fb')
    root.style.setProperty('--ryvr-surface', isDarkMode ? '#3a3d4a' : '#ffffff')
    root.style.setProperty('--ryvr-text-primary', isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(45, 49, 66, 0.9)')
    
    // Set theme attribute for CSS selectors
    root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [whiteLabelConfig, isDarkMode])

  const contextValue: WhiteLabelContextType = {
    isWhiteLabeled: !!whiteLabelConfig,
    whiteLabelConfig,
    updateWhiteLabel: setWhiteLabelConfig,
    brandName: whiteLabelConfig?.brandName || 'RYVR',
    logo: whiteLabelConfig?.logo || '/ryvr-logo.png',
    isDarkMode,
    toggleDarkMode: () => setIsDarkMode((prev: boolean) => !prev),
  }

  return (
    <WhiteLabelContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </WhiteLabelContext.Provider>
  )
}

// API functions for fetching branding configurations
async function fetchBusinessBranding(businessId: string): Promise<WhiteLabelConfig | null> {
  try {
    const response = await fetch(`/api/businesses/${businessId}/branding`)
    if (response.ok) {
      const data = await response.json()
      return data.branding || null
    }
  } catch (error) {
    console.error('Error fetching business branding:', error)
  }
  return null
}

async function fetchAgencyBranding(agencyId: string): Promise<WhiteLabelConfig | null> {
  try {
    const response = await fetch(`/api/agencies/${agencyId}/branding`)
    if (response.ok) {
      const data = await response.json()
      return data.branding || null
    }
  } catch (error) {
    console.error('Error fetching agency branding:', error)
  }
  return null
}

export default WhiteLabelProvider
