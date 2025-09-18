import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WhiteLabelProvider } from './theme/WhiteLabelProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AgencyDashboardPage from './pages/AgencyDashboardPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import ClientsPage from './pages/ClientsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import { WorkflowRunsPage } from './pages/WorkflowRunsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FlowTestPage from './pages/FlowTestPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return "/login";
    
    // Route based on user role
    if (user.role === 'admin') return "/admin/dashboard";
    if (user.role === 'agency_owner' || user.role === 'agency_manager' || user.role === 'agency_viewer') {
      return "/agency/dashboard";
    }
    return "/business/dashboard";
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <LoginPage />} 
      />
      <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <Routes>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="agencies" element={
                <AdminLayout title="Agency Management" subtitle="Manage all agencies in the system">
                  <div>Agencies Management</div>
                </AdminLayout>
              } />
              <Route path="businesses" element={
                <AdminLayout title="Business Management" subtitle="Manage all businesses in the system">
                  <div>Businesses Management</div>
                </AdminLayout>
              } />
              <Route path="workflows/*" element={<WorkflowsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings/*" element={
                <AdminLayout title="System Settings" subtitle="Configure platform settings">
                  <div>System Settings</div>
                </AdminLayout>
              } />
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Agency Routes */}
      <Route
        path="/agency/*"
        element={
          <ProtectedRoute requiredRole={['agency_owner', 'agency_manager', 'agency_viewer']}>
            <Routes>
              <Route path="dashboard" element={<AgencyDashboardPage />} />
              <Route path="businesses" element={<ClientsPage />} />
              <Route path="businesses/new" element={<div>Add New Business</div>} />
              <Route path="workflows/*" element={<WorkflowsPage />} />
              <Route path="workflows/builder" element={<FlowTestPage />} />
              <Route path="runs" element={<WorkflowRunsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="team" element={<div>Team Management</div>} />
              <Route path="settings" element={<div>Agency Settings</div>} />
              <Route path="*" element={<Navigate to="/agency/dashboard" />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Business Routes */}
      <Route
        path="/business/*"
        element={
          <ProtectedRoute requiredRole={['individual_user', 'business_owner', 'business_user']}>
            <Routes>
              <Route path="dashboard" element={<BusinessDashboardPage />} />
              <Route path="workflows/*" element={<WorkflowsPage />} />
              <Route path="workflows/builder" element={<FlowTestPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="onboarding" element={<div>Business Onboarding</div>} />
              <Route path="schedule" element={<div>Content Schedule</div>} />
              <Route path="settings" element={<div>Business Settings</div>} />
              <Route path="support" element={<div>Support Center</div>} />
              <Route path="*" element={<Navigate to="/business/dashboard" />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Legacy Routes - redirect based on role */}
      <Route path="/dashboard" element={<Navigate to={getDefaultRoute()} />} />
      <Route path="/clients" element={<Navigate to="/agency/businesses" />} />
      <Route path="/workflows" element={<Navigate to="/agency/workflows" />} />
      <Route path="/integrations" element={<Navigate to="/agency/integrations" />} />
      <Route path="/analytics" element={<Navigate to="/agency/analytics" />} />
      
      <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WhiteLabelProvider>
          <Router>
            <AppRoutes />
          </Router>
        </WhiteLabelProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 