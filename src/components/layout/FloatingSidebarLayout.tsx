import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useWhiteLabel } from '../../theme/WhiteLabelProvider'
import { useAuth } from '../../contexts/AuthContext'
import ColorModeToggle from '../theme/ColorModeToggle'

const COLLAPSED_WIDTH = 64
const EXPANDED_WIDTH = 280
const SIDEBAR_PADDING = 16

interface FloatingSidebarLayoutProps {
  children: React.ReactNode
  navigationItems: Array<{
    label: string
    icon: React.ReactNode
    path?: string
    active?: boolean
    hasSubmenu?: boolean
    submenu?: Array<{ label: string; path: string; badge?: number }>
    onClick?: () => void
  }>
  headerContent?: React.ReactNode
}

export const FloatingSidebarLayout: React.FC<FloatingSidebarLayoutProps> = ({
  children,
  navigationItems,
  headerContent,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  
  const theme = useTheme()
  const { brandName, logo, isWhiteLabeled } = useWhiteLabel()
  const { user, logout } = useAuth()

  const isExpanded = !collapsed || hovered
  const sidebarWidth = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleLogout = async () => {
    handleUserMenuClose()
    await logout()
  }

  const BrandLogo = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isExpanded ? 'flex-start' : 'center',
        py: 2, 
        px: isExpanded ? 3 : 1.5,
        transition: 'all 0.3s ease',
      }}
    >
      {isWhiteLabeled && logo ? (
        <img 
          src={logo} 
          alt={brandName}
          style={{ 
            height: 32, 
            maxWidth: isExpanded ? 120 : 32, 
            objectFit: 'contain',
            transition: 'all 0.3s ease',
          }}
        />
      ) : (
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Yellowtail", cursive',
            color: 'primary.main',
            fontWeight: 400,
            fontSize: isExpanded ? '1.5rem' : '1rem',
            transition: 'all 0.3s ease',
          }}
        >
          {isExpanded ? 'RYVR' : 'R'}
        </Typography>
      )}
    </Box>
  )

  const UserSection = () => (
    <Box sx={{ p: isExpanded ? 2 : 1, mt: 'auto' }}>
      {/* Dark Mode Toggle */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: isExpanded ? 'flex-start' : 'center',
          mb: 2 
        }}
      >
        {isExpanded ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              Dark Mode
            </Typography>
            <ColorModeToggle />
          </Box>
        ) : (
          <Tooltip title="Toggle Dark Mode" placement="right">
            <Box>
              <ColorModeToggle />
            </Box>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* User Profile */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          cursor: 'pointer',
          p: 1,
          borderRadius: 2,
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
        onClick={handleUserMenuOpen}
      >
        <Avatar 
          sx={{ 
            width: isExpanded ? 40 : 32, 
            height: isExpanded ? 40 : 32,
            bgcolor: 'primary.main',
            fontSize: isExpanded ? '1rem' : '0.875rem',
            transition: 'all 0.3s ease',
          }}
        >
          {user?.full_name?.[0] || user?.email?.[0] || 'U'}
        </Avatar>
        
        {isExpanded && (
          <Box sx={{ flexGrow: 1, ml: 2, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        )}
        
        {isExpanded && (
          <IconButton size="small">
            <SettingsIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
          },
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )

  const NavigationItems = () => (
    <List sx={{ flexGrow: 1, px: 1 }}>
      {navigationItems.map((item) => (
        <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
          {isExpanded ? (
            <ListItemButton
              selected={item.active}
              onClick={item.onClick}
              sx={{
                borderRadius: 2,
                minHeight: 44,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ 
                  variant: 'body2',
                  fontWeight: item.active ? 600 : 400,
                }}
              />
            </ListItemButton>
          ) : (
            <Tooltip title={item.label} placement="right">
              <ListItemButton
                selected={item.active}
                onClick={item.onClick}
                sx={{
                  borderRadius: 2,
                  minHeight: 44,
                  justifyContent: 'center',
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.16),
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          )}
        </ListItem>
      ))}
    </List>
  )

  const sidebarContent = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <BrandLogo />
      <Divider />
      
      {/* Optional Header Content */}
      {headerContent && isExpanded && (
        <>
          <Box sx={{ p: 2 }}>
            {headerContent}
          </Box>
          <Divider />
        </>
      )}
      
      <NavigationItems />
      
      {/* Collapse Toggle */}
      <Box sx={{ p: 1, display: 'flex', justifyContent: isExpanded ? 'flex-end' : 'center' }}>
        <IconButton 
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16),
            },
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      
      <UserSection />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Floating Sidebar */}
      <Box
        sx={{
          position: 'fixed',
          top: SIDEBAR_PADDING,
          left: SIDEBAR_PADDING,
          bottom: SIDEBAR_PADDING,
          width: sidebarWidth,
          zIndex: theme.zIndex.drawer,
          transition: 'width 0.3s ease',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(45, 49, 66, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.06)'
            }`,
            overflow: 'hidden',
          }}
        >
          {sidebarContent}
        </Box>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${sidebarWidth + (SIDEBAR_PADDING * 2)}px`,
          p: 3,
          pt: SIDEBAR_PADDING + 1.5,
          transition: 'margin-left 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default FloatingSidebarLayout
