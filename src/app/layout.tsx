'use client'

// React Imports
import { ReactNode } from 'react'

// Next Imports
import { Inter } from 'next/font/google'

// Type Imports
import type { Metadata } from 'next'

// Config Imports
import { i18n } from '@configs/i18n'

// CSS Imports
import '@/globals.css'

// Font
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RYVR - Marketing Automation Platform',
  description: 'Multi-tenant SaaS marketing automation platform for agencies and businesses.',
}

interface RootLayoutProps {
  children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

export default RootLayout
