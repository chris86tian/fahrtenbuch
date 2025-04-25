import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Settings from './pages/Settings';
import './index.css';

// ProtectedRoute remains the same: Checks auth and redirects if needed
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Component to handle the main application layout and page switching
const AppLayout: React.FC = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'vehicles' | 'settings'>('dashboard');

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {/* Corrected: Use && instead of &amp;&amp; */}
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'vehicles' && <Vehicles />}
      {activePage === 'settings' && <Settings />}
    </Layout>
  );
};

// Component to conditionally render Login or redirect to App
const LoginRoute: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Needs AuthProvider
  return isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />;
};

// Component to conditionally render Landing or redirect to App
const LandingRoute: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Needs AuthProvider
  return isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />;
};


function App() {
  return (
    <Router>
      {/* AuthProvider wraps EVERYTHING because Landing/Login routes use useAuth */}
      <AuthProvider> 
        <Routes>
          {/* Public routes - Do NOT need AppProvider */}
          <Route path="/" element={<LandingRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          
          {/* Protected application route - NEEDS AppProvider */}
          <Route
            path="/app" // Base path for the protected app area
            element={
              <ProtectedRoute>
                {/* Wrap protected area with AppProvider */}
                <AppProvider> 
                  <AppLayout /> 
                </AppProvider>
              </ProtectedRoute>
            }
          >
            {/* Define sub-routes for the protected area if needed */}
            {/* These will inherit AppProvider from the parent route element */}
            {/* <Route path="dashboard" element={<Dashboard />} /> */}
            {/* <Route path="vehicles" element={<Vehicles />} /> */}
            {/* <Route path="settings" element={<Settings />} /> */}
            {/* Add an index route for /app */}
            {/* The element rendered here is AppLayout, which handles page switching */}
            <Route index element={<Navigate to="/app/dashboard" replace />} /> 
          </Route>

          {/* Fallback: Redirect to landing or app based on auth state */}
          {/* Consider adding a dedicated 404 component */}
          <Route path="*" element={<Navigate to="/" replace />} /> 
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
