import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WhiteLabelProvider } from './theme/WhiteLabelProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
// import AgencyDashboardPage from './pages/AgencyDashboardPage'; // Unused in simplified structure
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import ClientsPage from './pages/ClientsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import { WorkflowRunsPage } from './pages/WorkflowRunsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import SystemIntegrationsPage from './pages/SystemIntegrationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FlowTestPage from './pages/FlowTestPage';
import FlowsPage from './pages/FlowsPage';
import FilesPage from './pages/FilesPage';
import ChatPage from './pages/ChatPage';
import IntegrationBuilderPage from './pages/admin/IntegrationBuilderPage';
import AllIntegrationsPage from './pages/admin/AllIntegrationsPage';

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
  
  console.log('🔍 AppRoutes rendering:', { isAuthenticated, user: user?.role });

  const getDefaultRoute = () => {
    if (!user) return "/login";
    
    // Simplified role-based routing
    if (user.role === 'admin') return "/admin/dashboard";
    return "/dashboard"; // All users go to unified dashboard
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <RegisterPage />} 
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
              <Route path="flows" element={<FlowsPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="integration-builder" element={<IntegrationBuilderPage />} />
              <Route path="integration-builder/edit/:id" element={<IntegrationBuilderPage />} />
              <Route path="integration-builder/all" element={<AllIntegrationsPage />} />
              <Route path="system-integrations" element={<SystemIntegrationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings/*" element={<SystemSettingsPage />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* User Routes - Simplified structure for all users */}
      <Route
        path="/*"
        element={
          <ProtectedRoute requiredRole="user">
            <Routes>
              <Route path="dashboard" element={<BusinessDashboardPage />} />
              <Route path="businesses" element={<ClientsPage />} />
              <Route path="businesses/new" element={<div>Add New Business</div>} />
              <Route path="workflows/*" element={<WorkflowsPage />} />
              <Route path="workflows/builder" element={<FlowTestPage />} />
              <Route path="flows" element={<FlowsPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="runs" element={<WorkflowRunsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="team" element={<div>Team Management</div>} />
              <Route path="settings" element={<div>User Settings</div>} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Legacy Routes - redirect to simplified routes */}
      <Route path="/agency/*" element={<Navigate to="/dashboard" />} />
      <Route path="/business/*" element={<Navigate to="/dashboard" />} />
      <Route path="/clients" element={<Navigate to="/businesses" />} />
      <Route path="/workflows" element={<Navigate to="/workflows" />} />
      <Route path="/integrations" element={<Navigate to="/integrations" />} />
      <Route path="/analytics" element={<Navigate to="/analytics" />} />
      
      <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
}

function App() {
  console.log('🎨 App component rendering...');
  
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