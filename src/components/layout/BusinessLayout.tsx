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
  Dashboard as DashboardIcon,
  TrendingUp as AnalyticsIcon,
  Assignment as ReportsIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Support as SupportIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import BaseLayout from './BaseLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useWhiteLabel } from '../../theme/WhiteLabelProvider'

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
      {/* Business Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {isWhiteLabeled ? 'Your Business' : 'Business'}
        </Typography>
        
        {user ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {user.full_name || 'Business Dashboard'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Business Dashboard
            </Typography>
            
            {/* Business Status */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="Active" 
                size="small" 
                color="success" 
                variant="outlined"
              />
              <Chip 
                label="Standard" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Please log in
          </Typography>
        )}
      </Box>
      
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
