import React from 'react'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
} from '@mui/material'
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  const theme = useTheme()

  return (
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
        mb: 2,
      }}
    >
      {/* Title and Actions Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: subtitle || (breadcrumbs && breadcrumbs.length > 0) ? 1 : 0 }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          sx={{ 
            fontSize: '1.7rem' // 15% smaller than default h4 (2rem)
          }}
        >
          {title}
        </Typography>
        
        {/* Actions (e.g., buttons) */}
        {actions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Box>

      {/* Subtitle */}
      {subtitle && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: breadcrumbs && breadcrumbs.length > 0 ? 1 : 0 }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Breadcrumbs Below Title */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
        >
          {breadcrumbs.map((item, index) => (
            item.current ? (
              <Typography
                key={index}
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                {item.label}
              </Typography>
            ) : (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                href={item.href || '#'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {index === 0 && <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />}
                {item.label}
              </Link>
            )
          ))}
        </Breadcrumbs>
      )}
    </Box>
  )
}

export default PageHeader
