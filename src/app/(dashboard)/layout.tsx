'use client'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

// React Imports
import { ReactNode } from 'react'

// MUI Imports
import { Box, Container } from '@mui/material'

// Component Imports
import Providers from '@components/Providers'
import ClientOnly from '@components/ClientOnly'

interface Props {
  children: ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      <Providers direction="ltr">
        <Box sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary'
        }}>
          <Container maxWidth={false} sx={{ 
            p: 3,
            maxWidth: '1440px'
          }}>
            {children}
          </Container>
        </Box>
      </Providers>
    </ClientOnly>
  )
}

export default Layout
