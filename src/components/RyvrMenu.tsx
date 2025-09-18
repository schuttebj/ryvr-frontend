'use client'

// React Imports
import { useEffect, useState } from 'react'

// Component Imports
import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Navigation Data Imports
import { getMenuDataByRole } from '@/data/navigation/ryvrMenuData'

// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const RyvrMenu = () => {
  const { user, isAuthenticated } = useAuth()
  const [menuData, setMenuData] = useState<VerticalMenuDataType[]>([])

  // Update menu when user changes
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const roleBasedMenu = getMenuDataByRole(user.role)
      setMenuData(roleBasedMenu)
    } else {
      setMenuData([])
    }
  }, [user, isAuthenticated])

  // Don't render menu if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return <GenerateVerticalMenu menuData={menuData} />
}

export default RyvrMenu
