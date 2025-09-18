import React from 'react'
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Grid,
  Stack,
  useTheme,
} from '@mui/material'

// Card-based skeleton for dashboard stats
export const StatCardSkeleton: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
      
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={20} />
    </CardContent>
  </Card>
)

// Table skeleton loader
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <Card>
    <CardContent>
      {/* Table header */}
      <Stack direction="row" spacing={2} mb={2}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="100%" height={32} />
        ))}
      </Stack>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={2} mb={1}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="100%" height={24} />
          ))}
        </Stack>
      ))}
    </CardContent>
  </Card>
)

// Navigation skeleton for sidebar
export const NavigationSkeleton: React.FC<{ items?: number }> = ({ items = 8 }) => (
  <Box sx={{ p: 1 }}>
    {Array.from({ length: items }).map((_, index) => (
      <Box key={index} sx={{ mb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width="70%" height={20} />
        </Stack>
      </Box>
    ))}
  </Box>
)

// Business selector skeleton
export const BusinessSelectorSkeleton: React.FC = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
    <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '8px' }} />
  </Box>
)

// Dashboard page skeleton
export const DashboardSkeleton: React.FC = () => (
  <Box>
    {/* Header skeleton */}
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
      <Box>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={20} />
      </Box>
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: '8px' }} />
      </Stack>
    </Box>

    {/* System health skeleton */}
    <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: '8px', mb: 4 }} />

    {/* Stats grid skeleton */}
    <Grid container spacing={3} mb={4}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCardSkeleton />
        </Grid>
      ))}
    </Grid>

    {/* Content cards skeleton */}
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton variant="text" width={100} height={16} />
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Grid item xs={6} key={index}>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Grid>
              ))}
            </Grid>
            
            <Box mt={3}>
              <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: '4px' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton variant="text" width={100} height={16} />
              </Box>
            </Box>
            
            <Stack spacing={2}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Box key={index} display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
                    <Skeleton variant="text" width={100} height={20} />
                  </Box>
                  <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '12px' }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Quick actions skeleton */}
    <Card>
      <CardContent>
        <Skeleton variant="text" width={150} height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={250} height={16} sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item key={index}>
              <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: '8px' }} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  </Box>
)

// Form skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 3 }} />
      
      <Stack spacing={3}>
        {Array.from({ length: fields }).map((_, index) => (
          <Box key={index}>
            <Skeleton variant="text" width="25%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '8px' }} />
          </Box>
        ))}
        
        <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: '8px' }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
)

// Content list skeleton
export const ContentListSkeleton: React.FC<{ items?: number }> = ({ items = 6 }) => (
  <Stack spacing={2}>
    {Array.from({ length: items }).map((_, index) => (
      <Card key={index}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" flexGrow={1}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box flexGrow={1}>
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '12px' }} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    ))}
  </Stack>
)

// Login page skeleton (for loading states)
export const LoginSkeleton: React.FC = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}
  >
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Skeleton variant="text" width="40%" height={48} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto' }} />
        </Box>

        <Stack spacing={3}>
          <Box>
            <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '8px' }} />
          </Box>
          <Box>
            <Skeleton variant="text" width="25%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '8px' }} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: '8px', mt: 2 }} />
        </Stack>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Skeleton variant="text" width="60%" height={16} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width="50%" height={16} sx={{ mx: 'auto' }} />
        </Box>
      </CardContent>
    </Card>
  </Box>
)

// Full layout skeleton matching FloatingSidebarLayout
export const LayoutSkeleton: React.FC = () => {
  const theme = useTheme()
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Sidebar Skeleton */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          bottom: 16,
          width: 280,
          backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          zIndex: 1200,
        }}
      >
        {/* Top Bar Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="text" width={60} height={32} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
        
        <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
        
        {/* Quick Search Skeleton */}
        <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1, mb: 2 }} />
        
        {/* Navigation Items Skeleton */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={44} 
                sx={{ borderRadius: 2 }} 
              />
            </Box>
          ))}
        </Box>
        
        {/* User Section Skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="80%" height={16} />
            <Skeleton variant="text" width="60%" height={14} />
          </Box>
        </Box>
      </Box>

      {/* Main Content Area Skeleton */}
      <Box
        sx={{
          flexGrow: 1,
          ml: `${280 + 32}px`, // sidebar width + padding
          p: 2,
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Title Bar Skeleton */}
        <Box
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
            p: 2,
            mb: 2,
            flexShrink: 0,
          }}
        >
          <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={8} height={16} />
            <Skeleton variant="text" width={80} height={16} />
          </Box>
        </Box>
        
        {/* Content Area Skeleton */}
        <Box
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
            p: 1,
            flexGrow: 1,
            overflow: 'auto',
            boxSizing: 'border-box',
          }}
        >
          {/* Content Skeleton */}
          <Box sx={{ p: 2 }}>
            {/* Header area */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Skeleton variant="text" width={180} height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={250} height={16} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
            
            {/* Stats Grid */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
            
            {/* Content Cards */}
            <Grid container spacing={2}>
              {Array.from({ length: 2 }).map((_, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default {
  StatCardSkeleton,
  TableSkeleton,
  NavigationSkeleton,
  LayoutSkeleton,
  BusinessSelectorSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  ContentListSkeleton,
  LoginSkeleton,
}
