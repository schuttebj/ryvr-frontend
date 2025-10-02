import React, { useState, useEffect } from 'react'
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
  Divider,
  Button,
  SelectChangeEvent,
  Alert,
  CircularProgress,
} from '@mui/material'
import { BusinessSelectorSkeleton } from './SkeletonLoaders'
import {
  BusinessOutlined as BusinessIcon,
  AddOutlined as AddIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  AllInclusiveOutlined as AllIcon,
} from '@mui/icons-material'
import { useAuth, Business } from '../../contexts/AuthContext'

interface BusinessSelectorProps {
  selectedBusinessId?: number | null
  onBusinessChange?: (businessId: number | null) => void
  variant?: 'compact' | 'full'
  allowAllOption?: boolean // For cross-business features
}

export const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  selectedBusinessId,
  onBusinessChange,
  variant = 'full',
  allowAllOption = false,
}) => {
  const { user, currentBusinessId, userContext, switchBusiness, hasFeature } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use current business from auth context if no specific selection
  const effectiveBusinessId = selectedBusinessId !== undefined ? selectedBusinessId : currentBusinessId
  const businesses = userContext?.businesses || []

  // Check if user can access cross-business features
  const canUseCrossBusiness = hasFeature('cross_business_chat') || hasFeature('cross_business_files')

  const handleBusinessChange = async (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    
    if (value === 'all') {
      // Cross-business selection
      onBusinessChange?.(null)
      if (!selectedBusinessId) {
        // If this is the global selector, switch context
        await switchBusiness(undefined)
      }
      return
    }

    const businessId = value ? parseInt(value) : null
    onBusinessChange?.(businessId)
    
    if (selectedBusinessId === undefined) {
      // This is the global selector, switch context
      setLoading(true)
      try {
        await switchBusiness(businessId || undefined)
      } catch (err: any) {
        setError(err.message || 'Failed to switch business')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddBusiness = () => {
    // Navigate to business creation page
    window.location.href = '/settings/businesses/new'
  }

  const getBusinessIcon = (business: Business) => {
    if (user?.role === 'admin') {
      return <AdminIcon fontSize="small" />
    }
    return <BusinessIcon fontSize="small" />
  }

  const getBusinessSubtitle = (business: Business) => {
    if (user?.role === 'admin') {
      return `Owner: ${business.owner_id}` // You might want to fetch owner name
    }
    return business.industry || business.user_role || 'Business'
  }

  if (!userContext && !loading) {
    return (
      <Alert severity="warning" sx={{ mx: 2 }}>
        Unable to load business data
      </Alert>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
        <CircularProgress size={16} />
        <Typography variant="body2">Switching business...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mx: 2 }}>
        {error}
      </Alert>
    )
  }

  if (variant === 'compact') {
    return (
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select
          value={effectiveBusinessId?.toString() || (allowAllOption && canUseCrossBusiness ? 'all' : '')}
          onChange={handleBusinessChange}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {allowAllOption && canUseCrossBusiness && (
            <MenuItem value="all">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <AllIcon fontSize="small" />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    All Businesses
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Cross-business access
                  </Typography>
                </Box>
                <Chip label="Premium" size="small" color="primary" variant="outlined" />
              </Box>
            </MenuItem>
          )}
          
          {businesses.map((business) => (
            <MenuItem key={business.id} value={business.id.toString()}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {getBusinessIcon(business)}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {business.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {getBusinessSubtitle(business)}
                  </Typography>
                </Box>
                {business.user_role === 'owner' && (
                  <Chip label="Owner" size="small" color="primary" variant="outlined" />
                )}
                {business.user_role === 'manager' && (
                  <Chip label="Manager" size="small" color="info" variant="outlined" />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <FormControl fullWidth size="small">
        <Select
          value={effectiveBusinessId?.toString() || (allowAllOption && canUseCrossBusiness ? 'all' : '')}
          onChange={handleBusinessChange}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {allowAllOption && canUseCrossBusiness && (
            <MenuItem value="all">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <AllIcon fontSize="small" />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    All Businesses
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Access files and chat across all businesses
                  </Typography>
                </Box>
                <Chip label="Premium" size="small" color="primary" variant="outlined" />
              </Box>
            </MenuItem>
          )}
          
          {businesses.map((business) => (
            <MenuItem key={business.id} value={business.id.toString()}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {getBusinessIcon(business)}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {business.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {getBusinessSubtitle(business)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {business.user_role === 'owner' && (
                    <Chip label="Owner" size="small" color="primary" variant="outlined" />
                  )}
                  {business.user_role === 'manager' && (
                    <Chip label="Manager" size="small" color="info" variant="outlined" />
                  )}
                  {business.user_role === 'admin' && (
                    <Chip label="Admin" size="small" color="error" variant="outlined" />
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {user?.role === 'user' && !userContext?.isBusinessLimitReached() && (
        <>
          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddBusiness}
            sx={{ 
              borderStyle: 'dashed',
              '&:hover': {
                borderStyle: 'dashed',
              }
            }}
          >
            Add New Business
          </Button>
        </>
      )}
      
      {userContext?.isBusinessLimitReached() && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Business limit reached ({userContext.subscription_tier?.business_limit}). 
          <Button size="small" onClick={() => window.location.href = '/settings/subscription'}>
            Upgrade Plan
          </Button>
        </Alert>
      )}
    </Box>
  )
}

export default BusinessSelector
