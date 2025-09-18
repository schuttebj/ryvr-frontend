'use client'

// React Imports
import { ReactNode } from 'react'

// MUI Imports
import { Box, Container } from '@mui/material'

// Providers Import
import Providers from '@components/Providers'

interface Props {
  children: ReactNode
}

const Layout = ({ children }: Props) => {
  return (
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
  )
}

export default Layout
