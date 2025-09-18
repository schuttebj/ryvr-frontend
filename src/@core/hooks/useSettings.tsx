// React Imports
import { useContext } from 'react'

// Context Imports
import { SettingsContext } from '@core/contexts/settingsContext'

export const useSettings = () => {
  // Hooks
  const context = useContext(SettingsContext)

  if (!context) {
    // Return default settings during SSR or when context is unavailable
    return {
      settings: {
        mode: 'dark' as const,
        skin: 'default' as const,
        semiDark: false,
        primaryColor: '#5f5eff',
        layout: 'vertical' as const,
        layoutPadding: 24,
        compactContentWidth: 1440,
        navbar: {
          type: 'fixed' as const,
          contentWidth: 'compact' as const,
          floating: false,
          detached: true,
          blur: true
        },
        contentWidth: 'compact' as const,
        footer: {
          type: 'static' as const,
          contentWidth: 'compact' as const
        },
        navbarContentWidth: 'compact' as const,
        footerContentWidth: 'compact' as const
      },
      updateSettings: () => {},
      resetSettings: () => {},
      updatePageSettings: () => {},
      isSettingsChanged: false
    }
  }

  return context
}
