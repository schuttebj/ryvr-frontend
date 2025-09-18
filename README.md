# RYVR Frontend

React TypeScript frontend for the RYVR AI Marketing Automation Platform.

## Features

- **React 18** with TypeScript for type safety
- **Material-UI** with custom RYVR theme and branding
- **Vite** for fast development and building
- **React Router** for client-side routing
- **React Query** for server state management
- **Responsive design** optimized for desktop and mobile
- **Professional UI/UX** with RYVR brand colors

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## Access the Application

- Development: http://localhost:5173
- Production: Deployed on Vercel

## RYVR Brand Colors

- Primary Dark: `#2e3142`
- Secondary Dark: `#5a6577`
- Light Background: `#f8f9fb`
- Brand Accent: `#5f5fff`
- Light Accent: `#b8cdf8`

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service functions
│   ├── types/           # TypeScript type definitions
│   ├── theme.ts         # Material-UI theme configuration
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── vercel.json          # Vercel deployment configuration
```

## Key Pages

- **Login** - User authentication
- **Dashboard** - Main overview with analytics
- **Clients** - Client management interface
- **Workflows** - Workflow builder and management
- **Integrations** - API integration management
- **Analytics** - Detailed reporting and metrics

## Deployment

Configured for automatic deployment on Vercel. The `vercel.json` file contains all necessary configuration.

## Environment Variables

```env
VITE_API_URL=https://your-backend-url.com
```

## Development

The frontend is configured to proxy API requests to the backend during development. Update `vite.config.ts` if you need to change the backend URL.

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Data fetching
- **Emotion** - CSS-in-JS styling

## License

Proprietary software. All rights reserved. 