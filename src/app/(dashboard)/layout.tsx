'use client'

// React Imports
import { ReactNode } from 'react'

// Layout Component Imports
import LayoutWrapper from '@layouts/LayoutWrapper'

// Providers Import
import Providers from '@components/Providers'

interface Props {
  children: ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <Providers>
      <LayoutWrapper>{children}</LayoutWrapper>
    </Providers>
  )
}

export default Layout
