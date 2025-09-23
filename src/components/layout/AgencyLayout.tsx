import React from 'react'
import {
  DashboardOutlined as DashboardIcon,
  BusinessOutlined as BusinessIcon,
  AccountTreeOutlined as WorkflowsIcon,
  AnalyticsOutlined as AnalyticsIcon,
  SettingsOutlined as SettingsIcon,
  PeopleOutlined as PeopleIcon,
  ExtensionOutlined as IntegrationIcon,
  DynamicFeedOutlined as FlowsIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import FloatingSidebarLayout from './FloatingSidebarLayout'
import BusinessSelector from '../common/BusinessSelector'
import PageHeader from './PageHeader'

interface AgencyLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const AgencyLayout: React.FC<AgencyLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  actions 
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  // Using the new BusinessSelector component instead

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/agency/dashboard',
      active: isActive('/agency/dashboard'),
      onClick: () => navigate('/agency/dashboard'),
    },
    {
      label: 'Businesses',
      icon: <BusinessIcon />,
      path: '/agency/businesses',
      active: isActive('/agency/businesses'),
      onClick: () => navigate('/agency/businesses'),
    },
    {
      label: 'Workflows',
      icon: <WorkflowsIcon />,
      path: '/agency/workflows',
      active: isActive('/agency/workflows'),
      onClick: () => navigate('/agency/workflows'),
    },
    {
      label: 'Flows',
      icon: <FlowsIcon />,
      path: '/agency/flows',
      active: isActive('/agency/flows'),
      onClick: () => navigate('/agency/flows'),
    },
    {
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/agency/analytics',
      active: isActive('/agency/analytics'),
      onClick: () => navigate('/agency/analytics'),
    },
    {
      label: 'Team',
      icon: <PeopleIcon />,
      path: '/agency/team',
      active: isActive('/agency/team'),
      onClick: () => navigate('/agency/team'),
    },
    {
      label: 'Integrations',
      icon: <IntegrationIcon />,
      path: '/agency/integrations',
      active: isActive('/agency/integrations'),
      onClick: () => navigate('/agency/integrations'),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/agency/settings',
      active: isActive('/agency/settings'),
      onClick: () => navigate('/agency/settings'),
    },
  ]

  const headerContent = (
    <BusinessSelector variant="full" />
  )

  const pageHeaderContent = title ? (
    <PageHeader
      title={title}
      subtitle={subtitle}
      breadcrumbs={[
        { label: 'Home', href: '/agency' },
        { label: 'Dashboard', current: true },
      ]}
      actions={actions}
    />
  ) : undefined

  return (
    <FloatingSidebarLayout
      navigationItems={navigationItems}
      headerContent={headerContent}
      pageHeader={pageHeaderContent}
    >
      {children}
    </FloatingSidebarLayout>
  )
}

export default AgencyLayout
