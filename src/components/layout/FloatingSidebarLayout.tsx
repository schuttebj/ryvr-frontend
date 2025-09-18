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
  SettingsOutlined as SettingsIcon,
  LogoutOutlined as LogoutIcon,
  PersonOutlined as PersonIcon,
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

  const TopBar = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 2, 
        px: isExpanded ? 3 : 1.5,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Brand Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              fontSize: isExpanded ? '2rem' : '1.2rem',
              transition: 'all 0.3s ease',
            }}
          >
            {isExpanded ? 'Ryvr' : 'R'}
          </Typography>
        )}
      </Box>

      {/* Top Bar Icons */}
      {isExpanded && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorModeToggle />
          <Tooltip title="Account Settings">
            <IconButton 
              size="small" 
              onClick={handleUserMenuOpen}
              sx={{
                border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <PersonIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  )

  const UserSection = () => (
    <Box sx={{ p: isExpanded ? 2 : 1, mt: 'auto' }}>
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
      <TopBar />
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
              ? '#1f2937'
              : '#ffffff',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            borderRadius: '12px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? '#374151' 
              : '#e5e7eb'
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
          p: SIDEBAR_PADDING,
          pt: SIDEBAR_PADDING,
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.mode === 'dark' 
              ? '#1f2937'
              : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? '#374151' 
              : '#e5e7eb'
            }`,
            p: 3,
            minHeight: `calc(100vh - ${SIDEBAR_PADDING * 2}px)`,
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default FloatingSidebarLayout
