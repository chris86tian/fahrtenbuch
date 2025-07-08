import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Settings from './pages/Settings';
import RecordTrip from './pages/RecordTrip';
import Trips from './pages/Trips';
import LoadingIndicator from './components/LoadingIndicator';
import './index.css';
import { AppPages } from './types';

// ProtectedRoute checks for authentication and redirects to the login page if the user is not authenticated.
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// AppLayout manages the main application view and navigation.
const AppLayout: React.FC = () => {
  const [activePage, setActivePage] = React.useState<AppPages>('dashboard');
  const navigate = useNavigate(); // Corrected: useNavigate is called directly.
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/app/dashboard')) setActivePage('dashboard');
    else if (path.startsWith('/app/vehicles')) setActivePage('vehicles');
    else if (path.startsWith('/app/settings')) setActivePage('settings');
    else if (path.startsWith('/app/record-trip')) setActivePage('record-trip');
    else if (path.startsWith('/app/trips')) setActivePage('trips');
  }, [location]);

  const handleNavigate = (page: AppPages) => {
    setActivePage(page);
    navigate(`/app/${page}`);
  };

  return (
    <Layout activePage={activePage} onNavigate={handleNavigate}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="settings" element={<Settings />} />
        <Route path="record-trip" element={<RecordTrip />} />
        <Route path="trips" element={<Trips />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

// The following components handle routing logic based on authentication status.
const LoginRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  return isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />;
};

const LandingRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  return isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />;
};

const RegisterRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  return isAuthenticated ? <Navigate to="/app" replace /> : <RegisterPage />;
};

// The main App component, simplified to focus on routing structure.
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes that are accessible to everyone */}
          <Route path="/" element={<LandingRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} />
          
          {/* Protected application routes that require authentication */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppProvider>
                  <AppLayout />
                </AppProvider>
              </ProtectedRoute>
            }
          />

          {/* A fallback route to redirect any unknown paths to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
