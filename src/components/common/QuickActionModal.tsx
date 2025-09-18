import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  InputAdornment,
  useTheme,
  alpha,
} from '@mui/material'
import {
  SearchOutlined as SearchIcon,
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as UsersIcon,
  BusinessOutlined as BusinessIcon,
  AccountTreeOutlined as WorkflowIcon,
  AnalyticsOutlined as AnalyticsIcon,
  SettingsOutlined as SettingsIcon,
  PaymentOutlined as BillingIcon,
  SecurityOutlined as SecurityIcon,
  SupportOutlined as SupportIcon,
  IntegrationInstructionsOutlined as IntegrationIcon,
  LaunchOutlined as LaunchIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  path: string
  category: string
  roles?: string[]
  keywords: string[]
}

interface QuickActionModalProps {
  open: boolean
  onClose: () => void
}

const quickActions: QuickAction[] = [
  {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    description: 'System overview and management',
    icon: <DashboardIcon />,
    path: '/admin/dashboard',
    category: 'Navigation',
    roles: ['admin'],
    keywords: ['dashboard', 'admin', 'system', 'overview'],
  },
  {
    id: 'users-agencies',
    label: 'Users & Agencies',
    description: 'Manage users and agency accounts',
    icon: <UsersIcon />,
    path: '/admin/users',
    category: 'Management',
    roles: ['admin'],
    keywords: ['users', 'agencies', 'accounts', 'manage'],
  },
  {
    id: 'workflow-management',
    label: 'Workflow Management',
    description: 'Create and manage automation workflows',
    icon: <WorkflowIcon />,
    path: '/admin/workflows',
    category: 'Automation',
    roles: ['admin', 'agency'],
    keywords: ['workflow', 'automation', 'templates', 'builder'],
  },
  {
    id: 'workflow-builder',
    label: 'Workflow Builder',
    description: 'Build new automation workflows',
    icon: <WorkflowIcon />,
    path: '/workflow-builder',
    category: 'Tools',
    roles: ['admin', 'agency', 'business'],
    keywords: ['workflow', 'builder', 'create', 'automation', 'design'],
  },
  {
    id: 'system-analytics',
    label: 'System Analytics',
    description: 'View platform analytics and insights',
    icon: <AnalyticsIcon />,
    path: '/admin/analytics',
    category: 'Analytics',
    roles: ['admin'],
    keywords: ['analytics', 'insights', 'reports', 'data'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Manage third-party integrations',
    icon: <IntegrationIcon />,
    path: '/admin/integrations',
    category: 'Integrations',
    roles: ['admin', 'agency'],
    keywords: ['integrations', 'apis', 'connections', 'third-party'],
  },
  {
    id: 'billing-credits',
    label: 'Billing & Credits',
    description: 'Manage billing and credit system',
    icon: <BillingIcon />,
    path: '/admin/billing',
    category: 'Finance',
    roles: ['admin'],
    keywords: ['billing', 'credits', 'payments', 'finance'],
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    description: 'Configure platform settings',
    icon: <SettingsIcon />,
    path: '/admin/settings',
    category: 'Settings',
    roles: ['admin'],
    keywords: ['settings', 'configuration', 'system', 'preferences'],
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Security settings and audit logs',
    icon: <SecurityIcon />,
    path: '/admin/security',
    category: 'Security',
    roles: ['admin'],
    keywords: ['security', 'audit', 'logs', 'permissions'],
  },
  {
    id: 'support-center',
    label: 'Support Center',
    description: 'Help and support resources',
    icon: <SupportIcon />,
    path: '/admin/support',
    category: 'Support',
    roles: ['admin', 'agency', 'business'],
    keywords: ['support', 'help', 'documentation', 'assistance'],
  },
  // Agency-specific actions
  {
    id: 'agency-dashboard',
    label: 'Agency Dashboard',
    description: 'Manage your agency and clients',
    icon: <DashboardIcon />,
    path: '/agency/dashboard',
    category: 'Navigation',
    roles: ['agency'],
    keywords: ['dashboard', 'agency', 'clients'],
  },
  {
    id: 'client-management',
    label: 'Client Management',
    description: 'Manage your client businesses',
    icon: <BusinessIcon />,
    path: '/agency/clients',
    category: 'Management',
    roles: ['agency'],
    keywords: ['clients', 'businesses', 'manage'],
  },
  // Business-specific actions
  {
    id: 'business-dashboard',
    label: 'Business Dashboard',
    description: 'View your business metrics',
    icon: <DashboardIcon />,
    path: '/business/dashboard',
    category: 'Navigation',
    roles: ['business'],
    keywords: ['dashboard', 'business', 'metrics'],
  },
]

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()
  const theme = useTheme()

  // Filter actions based on user role and search query
  const filteredActions = useMemo(() => {
    let actions = quickActions.filter(action => 
      !action.roles || action.roles.includes(user?.role || 'business')
    )

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      actions = actions.filter(action =>
        action.label.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query) ||
        action.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    }

    return actions
  }, [searchQuery, user?.role])

  // Reset selection when filtered actions change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredActions])

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredActions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredActions.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (filteredActions[selectedIndex]) {
            handleActionSelect(filteredActions[selectedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredActions, selectedIndex, onClose])

  const handleActionSelect = (action: QuickAction) => {
    navigate(action.path)
    onClose()
    setSearchQuery('')
  }

  const handleClose = () => {
    onClose()
    setSearchQuery('')
    setSelectedIndex(0)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Navigation: theme.palette.primary.main,
      Management: theme.palette.success.main,
      Automation: theme.palette.info.main,
      Tools: theme.palette.warning.main,
      Analytics: theme.palette.secondary.main,
      Integrations: theme.palette.info.main,
      Finance: theme.palette.success.main,
      Settings: theme.palette.secondary.main,
      Security: theme.palette.error.main,
      Support: theme.palette.primary.main,
    }
    return colors[category as keyof typeof colors] || theme.palette.primary.main
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '70vh',
          backgroundColor: theme.palette.mode === 'dark' 
            ? '#1f2937'
            : '#ffffff',
          border: `1px solid ${theme.palette.mode === 'dark' 
            ? '#374151' 
            : '#e5e7eb'
          }`,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Search Input */}
        <Box sx={{ p: 3, pb: 0 }}>
          <TextField
            fullWidth
            autoFocus
            placeholder="Search for actions, pages, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Results */}
        <Box sx={{ p: 2, pt: 1 }}>
          {filteredActions.length > 0 ? (
            <List sx={{ p: 0 }}>
              {filteredActions.map((action, index) => (
                <ListItem key={action.id} disablePadding>
                  <ListItemButton
                    selected={index === selectedIndex}
                    onClick={() => handleActionSelect(action)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      border: '1px solid transparent',
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        borderColor: theme.palette.primary.main,
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {action.label}
                          </Typography>
                          <Chip
                            label={action.category}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.75rem',
                              height: 20,
                              borderColor: getCategoryColor(action.category),
                              color: getCategoryColor(action.category),
                            }}
                          />
                        </Box>
                      }
                      secondary={action.description}
                      primaryTypographyProps={{ component: 'div' }}
                    />
                    <LaunchIcon 
                      fontSize="small" 
                      sx={{ 
                        color: 'text.secondary',
                        opacity: index === selectedIndex ? 1 : 0.5,
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No actions found for "{searchQuery}"
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ 
          p: 2, 
          pt: 0, 
          borderTop: `1px solid ${theme.palette.divider}`,
          mt: 1,
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 2 }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default QuickActionModal
