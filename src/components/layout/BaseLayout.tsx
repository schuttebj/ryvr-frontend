import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { useWhiteLabel } from '../../theme/WhiteLabelProvider'
import { useAuth } from '../../contexts/AuthContext'
import ColorModeToggle from '../theme/ColorModeToggle'

const DRAWER_WIDTH = 280

interface BaseLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  title?: string
  headerActions?: React.ReactNode
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  sidebar,
  title,
  headerActions,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  
  const { brandName, logo, isWhiteLabeled } = useWhiteLabel()
  const { user, logout } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

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
    <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 3 }}>
      {isWhiteLabeled && logo ? (
        <img 
          src={logo} 
          alt={brandName}
          style={{ height: 32, maxWidth: 120, objectFit: 'contain' }}
        />
      ) : (
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Yellowtail", cursive',
            color: 'primary.main',
            fontWeight: 400,
          }}
        >
          RYVR
        </Typography>
      )}
    </Box>
  )

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <BrandLogo />
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {sidebar}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {title && (
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Header Actions */}
          {headerActions && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              {headerActions}
            </Box>
          )}
          
          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* Dark Mode Toggle */}
          <ColorModeToggle />
          
          {/* User Menu */}
          <IconButton
            onClick={handleUserMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
              }}
            >
              {user?.full_name?.[0] || user?.email?.[0] || 'U'}
            </Avatar>
          </IconButton>
          
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
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                },
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
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {sidebarContent}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8, // Height of the AppBar
        }}
      >
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default BaseLayout
