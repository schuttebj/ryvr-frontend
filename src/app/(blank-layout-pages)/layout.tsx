'use client'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

// React Imports
import { ReactNode } from 'react'

// Layout Component Imports
import BlankLayout from '@layouts/BlankLayout'

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
        <BlankLayout systemMode="dark">{children}</BlankLayout>
      </Providers>
    </ClientOnly>
  )
}

export default Layout
