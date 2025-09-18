// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

// Role-based navigation data for RYVR platform
export const getAdminMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard',
    icon: 'ri-dashboard-3-line',
    href: '/admin/dashboard'
  },
  {
    label: 'System Management',
    isSection: true,
    children: [
      {
        label: 'Users',
        icon: 'ri-user-settings-line',
        href: '/admin/users'
      },
      {
        label: 'Agencies',
        icon: 'ri-building-line',
        href: '/admin/agencies'
      },
      {
        label: 'Businesses',
        icon: 'ri-store-2-line',
        href: '/admin/businesses'
      },
      {
        label: 'System Settings',
        icon: 'ri-settings-4-line',
        href: '/admin/settings'
      }
    ]
  },
  {
    label: 'Platform Tools',
    isSection: true,
    children: [
      {
        label: 'Workflows',
        icon: 'ri-flow-chart',
        children: [
          {
            label: 'Templates',
            href: '/admin/workflows/templates'
          },
          {
            label: 'Builder',
            href: '/workflow-builder'
          },
          {
            label: 'Executions',
            href: '/admin/workflows/executions'
          }
        ]
      },
      {
        label: 'Integrations',
        icon: 'ri-plug-line',
        href: '/admin/integrations'
      },
      {
        label: 'Analytics',
        icon: 'ri-bar-chart-2-line',
        href: '/admin/analytics'
      },
      {
        label: 'Credit Management',
        icon: 'ri-coins-line',
        href: '/admin/credits'
      }
    ]
  }
]

export const getAgencyMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard',
    icon: 'ri-dashboard-3-line',
    href: '/agency/dashboard'
  },
  {
    label: 'Client Management',
    isSection: true,
    children: [
      {
        label: 'Businesses',
        icon: 'ri-store-2-line',
        children: [
          {
            label: 'All Businesses',
            href: '/agency/businesses'
          },
          {
            label: 'Add Business',
            href: '/agency/businesses/new'
          }
        ]
      },
      {
        label: 'Team',
        icon: 'ri-team-line',
        href: '/agency/team'
      }
    ]
  },
  {
    label: 'Marketing Tools',
    isSection: true,
    children: [
      {
        label: 'Workflows',
        icon: 'ri-flow-chart',
        children: [
          {
            label: 'My Workflows',
            href: '/agency/workflows'
          },
          {
            label: 'Builder',
            href: '/workflow-builder'
          },
          {
            label: 'Runs',
            href: '/agency/workflows/runs'
          }
        ]
      },
      {
        label: 'Integrations',
        icon: 'ri-plug-line',
        href: '/agency/integrations'
      },
      {
        label: 'Analytics',
        icon: 'ri-bar-chart-2-line',
        href: '/agency/analytics'
      }
    ]
  },
  {
    label: 'Agency Settings',
    isSection: true,
    children: [
      {
        label: 'Settings',
        icon: 'ri-settings-4-line',
        href: '/agency/settings'
      },
      {
        label: 'Billing',
        icon: 'ri-bill-line',
        href: '/agency/billing'
      }
    ]
  }
]

export const getBusinessMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard',
    icon: 'ri-dashboard-3-line',
    href: '/business/dashboard'
  },
  {
    label: 'Marketing',
    isSection: true,
    children: [
      {
        label: 'Workflows',
        icon: 'ri-flow-chart',
        children: [
          {
            label: 'Active Workflows',
            href: '/business/workflows'
          },
          {
            label: 'Builder',
            href: '/workflow-builder'
          }
        ]
      },
      {
        label: 'Content',
        icon: 'ri-file-text-line',
        children: [
          {
            label: 'Schedule',
            href: '/business/content/schedule'
          },
          {
            label: 'Library',
            href: '/business/content/library'
          }
        ]
      },
      {
        label: 'Analytics',
        icon: 'ri-bar-chart-2-line',
        href: '/business/analytics'
      }
    ]
  },
  {
    label: 'Setup',
    isSection: true,
    children: [
      {
        label: 'Business Profile',
        icon: 'ri-building-line',
        href: '/business/profile'
      },
      {
        label: 'Integrations',
        icon: 'ri-plug-line',
        href: '/business/integrations'
      },
      {
        label: 'Onboarding',
        icon: 'ri-guide-line',
        href: '/business/onboarding'
      }
    ]
  },
  {
    label: 'Support',
    isSection: true,
    children: [
      {
        label: 'Help Center',
        icon: 'ri-question-line',
        href: '/business/support'
      },
      {
        label: 'Settings',
        icon: 'ri-settings-4-line',
        href: '/business/settings'
      }
    ]
  }
]

// Function to get menu data based on user role
export const getMenuDataByRole = (role: string): VerticalMenuDataType[] => {
  switch (role) {
    case 'admin':
      return getAdminMenuData()
    case 'agency_owner':
    case 'agency_manager':
    case 'agency_viewer':
      return getAgencyMenuData()
    case 'individual_user':
    case 'business_owner':
    case 'business_user':
      return getBusinessMenuData()
    default:
      return getBusinessMenuData() // Default to business menu
  }
}
