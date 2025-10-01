import React from 'react'
import {
  DashboardOutlined as DashboardIcon,
  TrendingUpOutlined as AnalyticsIcon,
  AssignmentOutlined as ReportsIcon,
  ScheduleOutlined as ScheduleIcon,
  SettingsOutlined as SettingsIcon,
  SupportOutlined as SupportIcon,
  InsightsOutlined as InsightsIcon,
  DynamicFeedOutlined as FlowsIcon,
  FolderOutlined as FilesIcon,
  ChatOutlined as ChatIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import FloatingSidebarLayout from './FloatingSidebarLayout'
import BusinessSelector from '../common/BusinessSelector'
import PageHeader from './PageHeader'

interface BusinessLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const BusinessLayout: React.FC<BusinessLayoutProps> = ({ 
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

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/business/dashboard',
      active: isActive('/business/dashboard'),
      onClick: () => navigate('/business/dashboard'),
    },
    {
      label: 'Flows',
      icon: <FlowsIcon />,
      path: '/business/flows',
      active: isActive('/business/flows'),
      onClick: () => navigate('/business/flows'),
    },
    {
      label: 'Files',
      icon: <FilesIcon />,
      path: '/business/files',
      active: isActive('/business/files'),
      onClick: () => navigate('/business/files'),
    },
    {
      label: 'Chat',
      icon: <ChatIcon />,
      path: '/business/chat',
      active: isActive('/business/chat'),
      onClick: () => navigate('/business/chat'),
    },
    {
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/business/analytics',
      active: isActive('/business/analytics'),
      onClick: () => navigate('/business/analytics'),
    },
    {
      label: 'Reports',
      icon: <ReportsIcon />,
      path: '/business/reports',
      active: isActive('/business/reports'),
      onClick: () => navigate('/business/reports'),
    },
    {
      label: 'Insights',
      icon: <InsightsIcon />,
      path: '/business/insights',
      active: isActive('/business/insights'),
      onClick: () => navigate('/business/insights'),
    },
    {
      label: 'Schedule',
      icon: <ScheduleIcon />,
      path: '/business/schedule',
      active: isActive('/business/schedule'),
      onClick: () => navigate('/business/schedule'),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/business/settings',
      active: isActive('/business/settings'),
      onClick: () => navigate('/business/settings'),
    },
    {
      label: 'Support',
      icon: <SupportIcon />,
      path: '/business/support',
      active: isActive('/business/support'),
      onClick: () => navigate('/business/support'),
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
        { label: 'Home', href: '/business' },
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

export default BusinessLayout
