import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Import the new RegisterPage
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Settings from './pages/Settings';
import RecordTrip from './pages/RecordTrip';
import Trips from './pages/Trips';
import LoadingIndicator from './components/LoadingIndicator';
import './index.css';
import { AppPages } from './types';

// ProtectedRoute remains the same: Checks auth and redirects if needed
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Component to handle the main application layout and page switching
const AppLayout: React.FC = () => {
  // Use AppPages type for state
  const [activePage, setActivePage] = useState<AppPages>('dashboard');
  const navigate = useNavigate();

  // Use effect to update activePage based on route changes
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/app/dashboard')) setActivePage('dashboard');
    else if (path.startsWith('/app/vehicles')) setActivePage('vehicles');
    else if (path.startsWith('/app/settings')) setActivePage('settings');
    else if (path.startsWith('/app/record-trip')) setActivePage('record-trip');
    else if (path.startsWith('/app/trips')) setActivePage('trips');
    else setActivePage('dashboard'); // Default
  }, [window.location.pathname]); // Update when pathname changes

  // Function to navigate and update activePage state
  const handleNavigate = (page: AppPages) => {
    setActivePage(page);
    navigate(`/app/${page}`); // Use navigate to change the URL
  };

  return (
    <Layout activePage={activePage} onNavigate={handleNavigate}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="settings" element={<Settings />} />
        <Route path="record-trip" element={<RecordTrip />} />
        <Route path="trips" element={<Trips />} />
        {/* Redirect /app to /app/dashboard by default */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

// Component to conditionally render Login or redirect to App
const LoginRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  }
  
  return isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />;
};

// Component to conditionally render Landing or redirect to App
const LandingRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  }
  
  return isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />;
};

// Component to conditionally render Register or redirect to App
const RegisterRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  }

  return isAuthenticated ? <Navigate to="/app" replace /> : <RegisterPage />;
};


function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Ensure the app is properly initialized
  useEffect(() => {
    // Simple initialization check
    setIsInitialized(true);
    
    // Log to help with debugging
    console.log('App initialized');
  }, []);

  if (!isInitialized) {
    return <LoadingIndicator message="Anwendung wird initialisiert..." />;
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - Do NOT need AppProvider */}
          <Route path="/" element={<LandingRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} /> {/* Add the new register route */}
          
          {/* Protected application route - NEEDS AppProvider */}
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

          {/* Fallback: Redirect to landing or app based on auth state */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
