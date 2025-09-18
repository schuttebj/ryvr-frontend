import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  // Simplified redirect to our dashboard
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/admin/dashboard',
        permanent: false,
        locale: false
      }
    ]
  }
}

export default nextConfig
