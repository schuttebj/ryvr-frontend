import React from 'react'
import {
  Box,
  Typography,
  Chip,
} from '@mui/material'
import {
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as PeopleIcon,
  AccountTreeOutlined as WorkflowsIcon,
  AnalyticsOutlined as AnalyticsIcon,
  SettingsOutlined as SettingsIcon,
  ExtensionOutlined as IntegrationIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  PaymentOutlined as BillingIcon,
  SecurityOutlined as SecurityIcon,
  SupportOutlined as SupportIcon,
  StarOutlined as PremiumIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import FloatingSidebarLayout from './FloatingSidebarLayout'
import { useAuth } from '../../contexts/AuthContext'
import BusinessSelector from '../common/BusinessSelector'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

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
      label: 'Workflow Management',
      icon: <WorkflowsIcon />,
      path: '/admin/workflows',
      active: isActive('/admin/workflows'),
      onClick: () => navigate('/admin/workflows'),
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
      {/* Admin Info */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AdminIcon color="primary" />
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600 }}>
            System Admin
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {user?.first_name} {user?.last_name}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Chip 
            label="Super Admin" 
            size="small" 
            color="primary" 
            icon={<PremiumIcon />}
          />
        </Box>
      </Box>
      
      {/* Business/Agency Selector */}
      <BusinessSelector variant="full" />
    </Box>
  )

  return (
    <FloatingSidebarLayout
      navigationItems={navigationItems}
      headerContent={headerContent}
    >
      {children}
    </FloatingSidebarLayout>
  )
}

export default AdminLayout
