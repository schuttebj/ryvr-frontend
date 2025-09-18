import React from 'react'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
  Stack,
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
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
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

      {/* Title and Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            gutterBottom={!!subtitle}
            sx={{ mb: subtitle ? 1 : 0 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Stack direction="row" spacing={2} alignItems="center">
            {actions}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default PageHeader
