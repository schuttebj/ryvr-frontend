import React from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Button,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  AccountTree as WorkflowsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Extension as IntegrationIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import FloatingSidebarLayout from './FloatingSidebarLayout'
import { useAuth } from '../../contexts/AuthContext'

interface AgencyLayoutProps {
  children: React.ReactNode
}

export const AgencyLayout: React.FC<AgencyLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  // TODO: Add business/agency context when implementing multi-tenant architecture
  const userBusinesses: any[] = []
  const switchBusiness = (business: any) => { console.log('Switch business:', business) }

  const handleBusinessChange = (businessId: string) => {
    const business = userBusinesses.find(b => b.id === businessId)
    if (business) {
      switchBusiness(business)
    }
  }

  const handleAddBusiness = () => {
    navigate('/agency/businesses/new')
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  const BusinessSelector = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Active Business
      </Typography>
      
      {user ? (
        <FormControl fullWidth size="small">
           <Select
             value={user?.id ? String(user.id) : ''}
             onChange={(e) => handleBusinessChange(e.target.value)}
             displayEmpty
             sx={{
               '& .MuiSelect-select': {
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1,
               },
             }}
           >
             <MenuItem value={user?.id ? String(user.id) : ''}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                 <BusinessIcon fontSize="small" color="primary" />
                 <Box sx={{ flexGrow: 1 }}>
                   <Typography variant="body2" noWrap>
                     {user?.full_name || 'Default Business'}
                   </Typography>
                   <Typography variant="caption" color="text.secondary" noWrap>
                     Agency Dashboard
                   </Typography>
                 </Box>
                 <Chip 
                   label="Active" 
                   size="small" 
                   color="success" 
                   variant="outlined"
                 />
               </Box>
             </MenuItem>
           </Select>
        </FormControl>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please log in to manage businesses
        </Typography>
      )}
      
      <Button
        fullWidth
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddBusiness}
        sx={{ mt: 1 }}
      >
        Add Business
      </Button>
    </Box>
  )

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
    <BusinessSelector />
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

export default AgencyLayout
