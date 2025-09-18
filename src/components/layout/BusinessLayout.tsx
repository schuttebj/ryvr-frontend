import React from 'react'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  Typography,
} from '@mui/material'
import {
  DashboardOutlined as DashboardIcon,
  TrendingUpOutlined as AnalyticsIcon,
  AssignmentOutlined as ReportsIcon,
  ScheduleOutlined as ScheduleIcon,
  SettingsOutlined as SettingsIcon,
  SupportOutlined as SupportIcon,
  InsightsOutlined as InsightsIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import BaseLayout from './BaseLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useWhiteLabel } from '../../theme/WhiteLabelProvider'
import BusinessSelector from '../common/BusinessSelector'

interface BusinessLayoutProps {
  children: React.ReactNode
  title?: string
}

export const BusinessLayout: React.FC<BusinessLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { brandName, isWhiteLabeled } = useWhiteLabel()

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/business/dashboard',
      active: isActive('/business/dashboard'),
    },
    {
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/business/analytics',
      active: isActive('/business/analytics'),
    },
    {
      label: 'Reports',
      icon: <ReportsIcon />,
      path: '/business/reports',
      active: isActive('/business/reports'),
    },
    {
      label: 'Insights',
      icon: <InsightsIcon />,
      path: '/business/insights',
      active: isActive('/business/insights'),
    },
    {
      label: 'Schedule',
      icon: <ScheduleIcon />,
      path: '/business/schedule',
      active: isActive('/business/schedule'),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/business/settings',
      active: isActive('/business/settings'),
    },
    {
      label: 'Support',
      icon: <SupportIcon />,
      path: '/business/support',
      active: isActive('/business/support'),
    },
  ]

  const sidebar = (
    <Box>
      {/* Business Selector */}
      <BusinessSelector variant="full" />
      
      {/* Navigation */}
      <List sx={{ pt: 0 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              selected={item.active}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.active ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* White-label Attribution (if applicable) */}
      {isWhiteLabeled && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ textAlign: 'center', display: 'block' }}
          >
            Powered by {brandName}
          </Typography>
        </Box>
      )}
    </Box>
  )

  const headerActions = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {user && (
        <Typography variant="body2" color="text.secondary">
          {user.full_name || user.email}
        </Typography>
      )}
    </Box>
  )

  return (
    <BaseLayout
      sidebar={sidebar}
      title={title}
      headerActions={headerActions}
    >
      {children}
    </BaseLayout>
  )
}

export default BusinessLayout
