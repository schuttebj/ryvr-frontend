'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import { ThemeProvider, lighten, darken, createTheme } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import type {} from '@mui/material/themeCssVarsAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build
import type {} from '@mui/lab/themeAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build

// Third-party Imports
import { useMedia } from 'react-use'
import stylisRTLPlugin from 'stylis-plugin-rtl'

// Type Imports
import type { ChildrenType, Direction, SystemMode } from '@core/types'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

type Props = ChildrenType & {
  direction: Direction
  systemMode: SystemMode
}

const CustomThemeProvider = (props: Props) => {
  // Props
  const { children, direction, systemMode } = props

  // Vars
  const isServer = typeof window === 'undefined'
  let currentMode: SystemMode

  // Hooks
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  // Default settings fallback for SSR
  const safeSettings = settings || {
    mode: 'dark' as const,
    skin: 'default' as const,
    primaryColor: '#5f5eff' as string,
    layout: 'vertical',
    layoutPadding: 24,
    compactContentWidth: 1440,
    navbar: {
      type: 'fixed',
      contentWidth: 'compact',
      floating: false,
      detached: true,
      blur: true
    },
    contentWidth: 'compact',
    footer: {
      type: 'static',
      contentWidth: 'compact'
    },
    navbarContentWidth: 'compact',
    footerContentWidth: 'compact'
  }

  if (isServer) {
    currentMode = systemMode
  } else {
    if (safeSettings.mode === 'system') {
      currentMode = isDark ? 'dark' : 'light'
    } else {
      currentMode = safeSettings.mode as SystemMode
    }
  }

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    const primaryColor: string = safeSettings.primaryColor || '#5f5eff'
    const newTheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: primaryColor,
              light: lighten(primaryColor, 0.2),
              dark: darken(primaryColor, 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: primaryColor,
              light: lighten(primaryColor, 0.2),
              dark: darken(primaryColor, 0.1)
            }
          }
        }
      },
      cssVariables: {
        colorSchemeSelector: 'data'
      }
    }

    const coreTheme = deepmerge(defaultCoreTheme(safeSettings, currentMode, direction), newTheme)

    return createTheme(coreTheme)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSettings.primaryColor, safeSettings.skin, currentMode])

  return (
    <AppRouterCacheProvider
      options={{
        prepend: true,
        ...(direction === 'rtl' && {
          key: 'rtl',
          stylisPlugins: [stylisRTLPlugin]
        })
      }}
    >
      <ThemeProvider
        theme={theme}
        defaultMode={systemMode}
        modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
      >
        <>
          <ModeChanger systemMode={systemMode} />
          <CssBaseline />
          {children}
        </>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default CustomThemeProvider
