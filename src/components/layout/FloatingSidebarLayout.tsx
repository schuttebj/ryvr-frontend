import React, { useState, useEffect } from 'react'
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
  Collapse,
  Badge,
} from '@mui/material'
import {
  SettingsOutlined as SettingsIcon,
  LogoutOutlined as LogoutIcon,
  PersonOutlined as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { useWhiteLabel } from '../../theme/WhiteLabelProvider'
import { useAuth } from '../../contexts/AuthContext'
import ColorModeToggle from '../theme/ColorModeToggle'
import QuickActionModal from '../common/QuickActionModal'
import QuickActionSearchBar from '../common/QuickActionSearchBar'
import { useQuickActions } from '../../hooks/useQuickActions'

const COLLAPSED_WIDTH = 64
const EXPANDED_WIDTH = 280
const SIDEBAR_PADDING = 16 // Pixel value for positioning
const CONTENT_SPACING = 2 // Material-UI spacing units (2 * 8px = 16px)

interface FloatingSidebarLayoutProps {
  children: React.ReactNode
  navigationItems: Array<{
    label: string
    icon: React.ReactNode
    path?: string
    active?: boolean
    hasSubmenu?: boolean
    submenu?: Array<{ label: string; path: string; badge?: number; onClick?: () => void }>
    onClick?: () => void
  }>
  headerContent?: React.ReactNode
  pageHeader?: React.ReactNode
}

export const FloatingSidebarLayout: React.FC<FloatingSidebarLayoutProps> = ({
  children,
  navigationItems,
  headerContent,
  pageHeader,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [justCollapsed, setJustCollapsed] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({})
  
  const theme = useTheme()
  const { brandName, logo, isWhiteLabeled } = useWhiteLabel()
  const { user, logout } = useAuth()
  const { isOpen: isQuickActionOpen, openQuickActions, closeQuickActions } = useQuickActions()

  const isExpanded = !collapsed || (hovered && !justCollapsed)
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

  const handleCollapse = () => {
    setCollapsed(!collapsed)
    if (!collapsed) {
      // User is collapsing, prevent hover expansion for a brief moment
      setJustCollapsed(true)
      setTimeout(() => setJustCollapsed(false), 500)
    }
  }

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  // Reset hover when sidebar is collapsed
  useEffect(() => {
    if (collapsed) {
      setHovered(false)
    }
  }, [collapsed])

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
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: isExpanded ? 'flex-start' : 'center',
        width: '100%'
      }}>
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
          <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"} placement="bottom">
            <IconButton 
              onClick={handleCollapse}
              size="small"
              sx={{
                border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </Box>
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  )

  const UserSection = () => (
    <Box sx={{ px: 2, py: 1 }}>
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
    <List sx={{ px: 1 }}>
      {navigationItems.map((item) => (
        <React.Fragment key={item.label}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            {isExpanded ? (
              <ListItemButton
                selected={item.active}
                onClick={item.hasSubmenu ? () => toggleSubmenu(item.label) : item.onClick}
                sx={{
                  borderRadius: 2,
                  minHeight: 44,
                  border: '1px solid transparent',
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    borderColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.16),
                    },
                  },
                  '&:hover:not(.Mui-selected)': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
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
                    noWrap: true,
                  }}
                  sx={{ 
                    minWidth: 0,
                    '& .MuiListItemText-primary': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }
                  }}
                />
                {item.hasSubmenu && (
                  openSubmenus[item.label] ? <ExpandLessIcon /> : <ExpandMoreIcon />
                )}
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
                    border: '1px solid transparent',
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      borderColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.16),
                      },
                    },
                    '&:hover:not(.Mui-selected)': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
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
          
          {/* Submenu Items */}
          {item.hasSubmenu && item.submenu && isExpanded && (
            <Collapse in={openSubmenus[item.label]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.submenu.map((subItem) => (
                  <ListItem key={subItem.label} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        // Use custom onClick if provided, otherwise fallback to window.location
                        if (subItem.onClick) {
                          subItem.onClick()
                        } else if (subItem.path) {
                          window.location.href = subItem.path
                        }
                      }}
                      sx={{
                        pl: 7,
                        borderRadius: 2,
                        minHeight: 40,
                        border: '1px solid transparent',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <ListItemText
                        primary={subItem.label}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontSize: '0.875rem',
                        }}
                      />
                      {subItem.badge !== undefined && subItem.badge > 0 && (
                        <Badge 
                          badgeContent={subItem.badge} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
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
      
      {/* Quick Action Search Bar */}
      <QuickActionSearchBar 
        onOpen={openQuickActions}
        isExpanded={isExpanded}
      />
      
      {/* Optional Header Content */}
      {headerContent && isExpanded && (
        <>
          <Box sx={{ px: 0, py: 1 }}>
            {headerContent}
          </Box>
          <Divider />
        </>
      )}
      
      {/* Scrollable Navigation Section */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <NavigationItems />
      </Box>
      
      {/* Fixed User Section at Bottom */}
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
            width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
            minWidth: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
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
            transition: 'width 0.3s ease, min-width 0.3s ease',
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
          ml: `${sidebarWidth + SIDEBAR_PADDING}px`,
          p: CONTENT_SPACING,
          transition: 'margin-left 0.3s ease',
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          }}
      >
        {/* Page Header - Fixed */}
        {pageHeader && (
          <Box sx={{ flexShrink: 0 }}>
            {pageHeader}
          </Box>
        )}
        
        {/* Scrollable Content */}
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
            p: 2,
            flexGrow: 1,
            overflow: 'auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Box>
      </Box>
      
      {/* Quick Action Modal */}
      <QuickActionModal
        open={isQuickActionOpen}
        onClose={closeQuickActions}
      />
    </Box>
  )
}

export default FloatingSidebarLayout
