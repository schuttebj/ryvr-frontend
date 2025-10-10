import React from 'react'
import {
  Box,
} from '@mui/material'
import {
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as PeopleIcon,
  AccountTreeOutlined as WorkflowsIcon,
  AnalyticsOutlined as AnalyticsIcon,
  SettingsOutlined as SettingsIcon,
  ExtensionOutlined as IntegrationIcon,
  PaymentOutlined as BillingIcon,
  SecurityOutlined as SecurityIcon,
  SupportOutlined as SupportIcon,
  DynamicFeedOutlined as FlowsIcon,
  FolderOutlined as FilesIcon,
  ChatOutlined as ChatIcon,
  BuildOutlined as BuildIcon,
  CalendarMonth as CalendarIcon,
  Comment as CommentIcon,
  Assessment as ReportsIcon,
  Schedule as ScheduleIcon,
  Description as DocumentIcon,
  Store as MarketplaceIcon,
  Publish as PublishIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import FloatingSidebarLayout from './FloatingSidebarLayout'
import BusinessSelector from '../common/BusinessSelector'
import PageHeader from './PageHeader'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
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
      label: 'System Overview',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      active: isActive('/admin/dashboard'),
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      label: 'Users & Agencies',
      icon: <PeopleIcon />,
      path: '/admin/users',
      active: isActive('/admin/users'),
      onClick: () => navigate('/admin/users'),
    },
    {
      label: 'Content & Campaigns',
      icon: <CalendarIcon />,
      path: '/admin/content-calendar',
      active: isActive('/admin/content-calendar') || isActive('/admin/campaign-timeline') || isActive('/admin/approval-dashboard'),
      hasSubmenu: true,
      submenu: [
        { label: 'Content Calendar', path: '/admin/content-calendar', onClick: () => navigate('/admin/content-calendar') },
        { label: 'Campaign Timeline', path: '/admin/campaign-timeline', onClick: () => navigate('/admin/campaign-timeline') },
        { label: 'Approval Dashboard', path: '/admin/approval-dashboard', onClick: () => navigate('/admin/approval-dashboard') },
      ],
    },
    {
      label: 'Collaboration',
      icon: <CommentIcon />,
      path: '/admin/content-review',
      active: isActive('/admin/content-review') || isActive('/admin/feedback-inbox') || isActive('/admin/team-permissions'),
      hasSubmenu: true,
      submenu: [
        { label: 'Content Review', path: '/admin/content-review', onClick: () => navigate('/admin/content-review') },
        { label: 'Feedback Inbox', path: '/admin/feedback-inbox', onClick: () => navigate('/admin/feedback-inbox') },
        { label: 'Team Permissions', path: '/admin/team-permissions', onClick: () => navigate('/admin/team-permissions') },
      ],
    },
    {
      label: 'Reports & Analytics',
      icon: <ReportsIcon />,
      path: '/admin/campaign-reports',
      active: isActive('/admin/campaign-reports') || isActive('/admin/workflow-analytics') || isActive('/admin/roi-tracking'),
      hasSubmenu: true,
      submenu: [
        { label: 'Campaign Reports', path: '/admin/campaign-reports', onClick: () => navigate('/admin/campaign-reports') },
        { label: 'Workflow Analytics', path: '/admin/workflow-analytics', onClick: () => navigate('/admin/workflow-analytics') },
        { label: 'ROI Tracking', path: '/admin/roi-tracking', onClick: () => navigate('/admin/roi-tracking') },
      ],
    },
    {
      label: 'Automation',
      icon: <ScheduleIcon />,
      path: '/admin/automation-scheduler',
      active: isActive('/admin/automation-scheduler'),
      onClick: () => navigate('/admin/automation-scheduler'),
    },
    {
      label: 'Knowledge Base',
      icon: <DocumentIcon />,
      path: '/admin/document-library',
      active: isActive('/admin/document-library') || isActive('/admin/version-control'),
      hasSubmenu: true,
      submenu: [
        { label: 'Document Library', path: '/admin/document-library', onClick: () => navigate('/admin/document-library') },
        { label: 'Version Control', path: '/admin/version-control', onClick: () => navigate('/admin/version-control') },
      ],
    },
    {
      label: 'Marketplace',
      icon: <MarketplaceIcon />,
      path: '/admin/template-marketplace',
      active: isActive('/admin/template-marketplace'),
      onClick: () => navigate('/admin/template-marketplace'),
    },
    {
      label: 'Publishing',
      icon: <PublishIcon />,
      path: '/admin/publishing-hub',
      active: isActive('/admin/publishing-hub'),
      onClick: () => navigate('/admin/publishing-hub'),
    },
    {
      label: 'Workflow Management',
      icon: <WorkflowsIcon />,
      path: '/admin/workflows',
      active: isActive('/admin/workflows'),
      onClick: () => navigate('/admin/workflows'),
    },
    {
      label: 'Flows',
      icon: <FlowsIcon />,
      path: '/admin/flows',
      active: isActive('/admin/flows'),
      onClick: () => navigate('/admin/flows'),
    },
    {
      label: 'Files',
      icon: <FilesIcon />,
      path: '/admin/files',
      active: isActive('/admin/files'),
      onClick: () => navigate('/admin/files'),
    },
    {
      label: 'Chat',
      icon: <ChatIcon />,
      path: '/admin/chat',
      active: isActive('/admin/chat'),
      onClick: () => navigate('/admin/chat'),
    },
    {
      label: 'System Analytics',
      icon: <AnalyticsIcon />,
      path: '/admin/analytics',
      active: isActive('/admin/analytics'),
      onClick: () => navigate('/admin/analytics'),
    },
    {
      label: 'Integrations',
      icon: <IntegrationIcon />,
      path: '/admin/integrations',
      active: isActive('/admin/integrations'),
      onClick: () => navigate('/admin/integrations'),
    },
    {
      label: 'Integration Builder',
      icon: <BuildIcon />,
      path: '/admin/integration-builder',
      active: isActive('/admin/integration-builder') || isActive('/admin/integration-builder/all'),
      hasSubmenu: true,
      submenu: [
        { label: 'Builder', path: '/admin/integration-builder', onClick: () => navigate('/admin/integration-builder') },
        { label: 'All Integrations', path: '/admin/integration-builder/all', onClick: () => navigate('/admin/integration-builder/all') },
      ],
    },
    {
      label: 'System Integrations',
      icon: <SettingsIcon />,
      path: '/admin/system-integrations',
      active: isActive('/admin/system-integrations'),
      onClick: () => navigate('/admin/system-integrations'),
    },
    {
      label: 'Billing & Credits',
      icon: <BillingIcon />,
      path: '/admin/billing',
      active: isActive('/admin/billing'),
      onClick: () => navigate('/admin/billing'),
    },
    {
      label: 'System Settings',
      icon: <SettingsIcon />,
      path: '/admin/settings',
      active: isActive('/admin/settings'),
      onClick: () => navigate('/admin/settings'),
    },
    {
      label: 'Security',
      icon: <SecurityIcon />,
      path: '/admin/security',
      active: isActive('/admin/security'),
      onClick: () => navigate('/admin/security'),
    },
    {
      label: 'Support Center',
      icon: <SupportIcon />,
      path: '/admin/support',
      active: isActive('/admin/support'),
      onClick: () => navigate('/admin/support'),
    },
  ]

  const headerContent = (
    <Box>
      {/* Business selector for admin to preview/manage businesses */}
      <BusinessSelector variant="full" />
    </Box>
  )

  const pageHeaderContent = title ? (
    <PageHeader
      title={title}
      subtitle={subtitle}
      breadcrumbs={[
        { label: 'Home', href: '/admin' },
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

export default AdminLayout
