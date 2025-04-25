import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const authToken = Cookies.get('authToken');
    setIsAuthenticated(!!authToken);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Hardcoded credentials - replace with your actual auth logic if needed
    if (email === 'mail@lipalife.de' && password === 'lipalife#1001') {
      Cookies.set('authToken', 'authenticated', { expires: 7 }); // Set cookie for session persistence
      setIsAuthenticated(true); // Update state
      return true;
    }
    return false;
  };

  const logout = () => {
    Cookies.remove('authToken'); // Remove cookie
    setIsAuthenticated(false); // Update state
    // Optionally redirect to login page after logout
    // window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
