import React from 'react'
import {
  Box,
  Typography,
  Chip,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountTree as WorkflowsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Extension as IntegrationIcon,
  AdminPanelSettings as AdminIcon,
  Payment as BillingIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Star as PremiumIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import FloatingSidebarLayout from './FloatingSidebarLayout'
import { useAuth } from '../../contexts/AuthContext'

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
      
      {/* Quick Stats */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Quick Stats
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Active Users</Typography>
          <Typography variant="body2" fontWeight={600}>1,247</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Agencies</Typography>
          <Typography variant="body2" fontWeight={600}>89</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">Active Workflows</Typography>
          <Typography variant="body2" fontWeight={600}>2,156</Typography>
        </Box>
      </Box>
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
