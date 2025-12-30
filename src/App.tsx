import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Organizations } from './pages/admin/Organizations';
import { Users } from './pages/admin/Users';
import { ActivityLogs } from './pages/ActivityLogs';
import { ConfigLayout } from './pages/OrganizationConfig/ConfigLayout';
import { General } from './pages/OrganizationConfig/General';
import { Tax } from './pages/OrganizationConfig/Tax';
import { Invoice } from './pages/OrganizationConfig/Invoice';
import { Numbering } from './pages/OrganizationConfig/Numbering';
import { Finance } from './pages/OrganizationConfig/Finance';
import { Features } from './pages/OrganizationConfig/Features';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organizations"
              element={
                <ProtectedRoute>
                  <Organizations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity-logs"
              element={
                <ProtectedRoute>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/config"
              element={
                <AdminProtectedRoute>
                  <ConfigLayout />
                </AdminProtectedRoute>
              }
            >
              <Route path="general" element={<General />} />
              <Route path="tax" element={<Tax />} />
              <Route path="invoice" element={<Invoice />} />
              <Route path="numbering" element={<Numbering />} />
              <Route path="finance" element={<Finance />} />
              <Route path="features" element={<Features />} />
              <Route index element={<Navigate to="/admin/config/general" replace />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
