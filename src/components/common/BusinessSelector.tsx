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
} from '@mui/material'
import { BusinessSelectorSkeleton } from './SkeletonLoaders'
import {
  BusinessOutlined as BusinessIcon,
  AddOutlined as AddIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  CorporateFareOutlined as AgencyIcon,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

interface Business {
  id: string
  name: string
  agency_name?: string
  agency_id?: string
  industry?: string
  status: 'active' | 'inactive'
  is_trial?: boolean
}

interface BusinessSelectorProps {
  selectedBusinessId?: string
  onBusinessChange?: (businessId: string) => void
  variant?: 'compact' | 'full'
}

export const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  selectedBusinessId,
  onBusinessChange,
  variant = 'full',
}) => {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      
      // Mock businesses based on user role
      let mockBusinesses: Business[] = []
      
      if (user?.role === 'admin') {
        // Admin can see all businesses across all agencies
        mockBusinesses = [
          {
            id: 'admin-overview',
            name: 'System Overview',
            status: 'active',
          },
          {
            id: 'biz-1',
            name: 'TechCorp Marketing',
            agency_name: 'Digital Growth Agency',
            agency_id: 'agency-1',
            industry: 'Technology',
            status: 'active',
          },
          {
            id: 'biz-2',
            name: 'RetailMax Solutions',
            agency_name: 'Digital Growth Agency',
            agency_id: 'agency-1',
            industry: 'Retail',
            status: 'active',
          },
          {
            id: 'biz-3',
            name: 'Healthcare Plus',
            agency_name: 'MarketPro Agency',
            agency_id: 'agency-2',
            industry: 'Healthcare',
            status: 'active',
            is_trial: true,
          },
          {
            id: 'biz-4',
            name: 'Local Restaurant Chain',
            agency_name: 'MarketPro Agency',
            agency_id: 'agency-2',
            industry: 'Food & Beverage',
            status: 'active',
          },
        ]
      } else if (user?.role === 'agency') {
        // Agency can see their businesses
        mockBusinesses = [
          {
            id: 'biz-1',
            name: 'TechCorp Marketing',
            industry: 'Technology',
            status: 'active',
          },
          {
            id: 'biz-2',
            name: 'RetailMax Solutions',
            industry: 'Retail',
            status: 'active',
          },
          {
            id: 'biz-new',
            name: 'New Client Onboarding',
            industry: 'Pending',
            status: 'inactive',
          },
        ]
      } else {
        // Individual user can see their businesses
        mockBusinesses = [
          {
            id: 'personal-1',
            name: 'My Business',
            industry: 'Consulting',
            status: 'active',
          },
          {
            id: 'personal-2',
            name: 'Side Project',
            industry: 'E-commerce',
            status: 'active',
          },
        ]
      }
      
      setBusinesses(mockBusinesses)
      
      // Set initial selection
      if (selectedBusinessId) {
        const selected = mockBusinesses.find(b => b.id === selectedBusinessId)
        setSelectedBusiness(selected || null)
      } else if (mockBusinesses.length > 0) {
        setSelectedBusiness(mockBusinesses[0])
        onBusinessChange?.(mockBusinesses[0].id)
      }
      
      setLoading(false)
    }

    fetchBusinesses()
  }, [user?.role, selectedBusinessId, onBusinessChange])

  const handleBusinessChange = (event: SelectChangeEvent<string>) => {
    const businessId = event.target.value
    const business = businesses.find(b => b.id === businessId)
    setSelectedBusiness(business || null)
    onBusinessChange?.(businessId)
  }

  const handleAddBusiness = () => {
    if (user?.role === 'agency') {
      // Navigate to business creation
      console.log('Navigate to business creation')
    } else if (user?.role === 'individual') {
      // Navigate to business setup
      console.log('Navigate to business setup')
    }
  }

  const getBusinessIcon = (business: Business) => {
    if (business.id === 'admin-overview') {
      return <AdminIcon fontSize="small" />
    }
    if (user?.role === 'admin' && business.agency_name) {
      return <AgencyIcon fontSize="small" />
    }
    return <BusinessIcon fontSize="small" />
  }

  const getBusinessSubtitle = (business: Business) => {
    if (business.id === 'admin-overview') {
      return 'System Administration'
    }
    if (user?.role === 'admin' && business.agency_name) {
      return business.agency_name
    }
    return business.industry || 'Business'
  }

  if (loading) {
    return <BusinessSelectorSkeleton />
  }

  if (variant === 'compact') {
    return (
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select
          value={selectedBusiness?.id || ''}
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
          {businesses.map((business) => (
            <MenuItem key={business.id} value={business.id}>
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
                {business.is_trial && (
                  <Chip label="Trial" size="small" color="warning" variant="outlined" />
                )}
                {business.status === 'active' && business.id !== 'admin-overview' && (
                  <Chip label="Active" size="small" color="success" variant="outlined" />
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
          value={selectedBusiness?.id || ''}
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
          {businesses.map((business) => (
            <MenuItem key={business.id} value={business.id}>
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
                  {business.is_trial && (
                    <Chip label="Trial" size="small" color="warning" variant="outlined" />
                  )}
                  {business.status === 'active' && business.id !== 'admin-overview' && (
                    <Chip label="Active" size="small" color="success" variant="outlined" />
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {(user?.role === 'agency' || user?.role === 'individual') && (
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
            {user?.role === 'agency' ? 'Add New Business' : 'Add Business'}
          </Button>
        </>
      )}
    </Box>
  )
}

export default BusinessSelector
