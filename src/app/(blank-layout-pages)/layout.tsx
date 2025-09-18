'use client'

// React Imports
import { ReactNode } from 'react'

// Context Imports
import { AuthProvider } from '@/contexts/AuthContext'

// Layout Component Imports
import BlankLayout from '@layouts/BlankLayout'

// Providers Import
import Providers from '@components/Providers'

interface Props {
  children: ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <Providers direction="ltr">
      <BlankLayout systemMode="dark">{children}</BlankLayout>
    </Providers>
  )
}

export default Layout
