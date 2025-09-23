/**
 * BusinessSelector Component
 * 
 * Dropdown selector for switching between businesses (like Trello boards)
 * Shows business context information and allows easy switching
 */

import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  Chip,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccountBalance as CreditIcon,
} from '@mui/icons-material';

import { FlowBusinessContext } from '../../types/workflow';

interface BusinessSelectorProps {
  businesses: FlowBusinessContext[];
  selectedBusiness: FlowBusinessContext | null;
  onBusinessChange: (business: FlowBusinessContext) => void;
  disabled?: boolean;
}

export default function BusinessSelector({
  businesses,
  selectedBusiness,
  onBusinessChange,
  disabled = false
}: BusinessSelectorProps) {
  const theme = useTheme();
  
  const handleChange = (event: SelectChangeEvent<string>) => {
    const businessId = parseInt(event.target.value);
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      onBusinessChange(business);
    }
  };
  
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'basic':
        return theme.palette.grey[500];
      case 'pro':
        return theme.palette.info.main;
      case 'enterprise':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  };
  
  if (businesses.length === 0) {
    return (
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="body2" color="text.secondary">
          No businesses available
        </Typography>
      </Box>
    );
  }
  
  return (
    <FormControl sx={{ minWidth: 250 }} disabled={disabled}>
      <Select
        value={selectedBusiness?.id?.toString() || ''}
        onChange={handleChange}
        displayEmpty
        renderValue={(value) => {
          if (!value || !selectedBusiness) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="disabled" />
                <Typography color="text.secondary">
                  Select Business
                </Typography>
              </Box>
            );
          }
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: '0.75rem',
                }}
              >
                {selectedBusiness.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {selectedBusiness.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                  <Chip
                    label={getTierLabel(selectedBusiness.tier)}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.65rem',
                      backgroundColor: getTierColor(selectedBusiness.tier),
                      color: 'white',
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {selectedBusiness.credits_remaining} credits
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        }}
        sx={{
          '& .MuiSelect-select': {
            py: 1.5,
            display: 'flex',
            alignItems: 'center'
          }
        }}
      >
        {businesses.map((business) => (
          <MenuItem
            key={business.id}
            value={business.id.toString()}
            sx={{
              py: 1.5,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.selected,
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                }}
              >
                {business.name.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {business.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  {/* Tier Badge */}
                  <Chip
                    label={getTierLabel(business.tier)}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.7rem',
                      backgroundColor: getTierColor(business.tier),
                      color: 'white',
                      '& .MuiChip-label': { px: 0.75 }
                    }}
                  />
                  
                  {/* Credits */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CreditIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {business.credits_remaining} credits
                    </Typography>
                  </Box>
                  
                  {/* Active Flows Count */}
                  {business.active_flows_count > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      • {business.active_flows_count} active flows
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
