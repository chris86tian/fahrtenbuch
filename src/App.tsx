import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Settings from './pages/Settings';
import RecordTrip from './pages/RecordTrip'; // Import the new page
import LoadingIndicator from './components/LoadingIndicator';
import './index.css';

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
  // Added 'record-trip' to the state type
  const [activePage, setActivePage] = useState<'dashboard' | 'vehicles' | 'settings' | 'record-trip'>('dashboard');

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'vehicles' && <Vehicles />}
      {activePage === 'settings' && <Settings />}
      {activePage === 'record-trip' && <RecordTrip />} {/* Added conditional render */}
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
          >
             {/* Added nested route for the new page */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="settings" element={<Settings />} />
            <Route path="record-trip" element={<RecordTrip />} />
            {/* Redirect /app to /app/dashboard by default */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback: Redirect to landing or app based on auth state */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
