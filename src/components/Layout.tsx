import React, { useState } from 'react';
import { Car, BarChart2, Settings as SettingsIcon, Menu, X, LogOut, PlusCircle } from 'lucide-react'; // Added PlusCircle
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activePage: 'dashboard' | 'vehicles' | 'settings' | 'record-trip'; // Added 'record-trip'
  onNavigate: (page: 'dashboard' | 'vehicles' | 'settings' | 'record-trip') => void; // Added 'record-trip'
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const NavItem = ({
    icon,
    label,
    page
  }: {
    icon: React.ReactNode;
    label: string;
    page: 'dashboard' | 'vehicles' | 'settings' | 'record-trip'; // Added 'record-trip'
  }) => {
    const isActive = activePage === page;

    return (
      <button
        onClick={() => {
          onNavigate(page);
          closeSidebar();
        }}
        className={`flex items-center w-full p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Fahrtenbuch</h1>
            <button className="lg:hidden" onClick={closeSidebar}>
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
             {/* New NavItem for recording trips */}
            <NavItem
              icon={<PlusCircle size={20} />}
              label="Neue Fahrt erfassen"
              page="record-trip"
            />
            <NavItem
              icon={<BarChart2 size={20} />}
              label="Dashboard"
              page="dashboard"
            />
            <NavItem
              icon={<Car size={20} />}
              label="Fahrzeuge"
              page="vehicles"
            />
            <NavItem
              icon={<SettingsIcon size={20} />}
              label="Einstellungen"
              page="settings"
            />
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="ml-3">Abmelden</span>
            </button>
            <div className="mt-4 text-sm text-gray-500">
              Fahrtenbuch © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu size={24} className="text-gray-500" />
            </button>
            <h1 className="text-lg font-medium text-gray-900 lg:hidden">
              {activePage === 'dashboard' && 'Dashboard'}
              {activePage === 'vehicles' && 'Fahrzeuge'}
              {activePage === 'settings' && 'Einstellungen'}
              {activePage === 'record-trip' && 'Neue Fahrt erfassen'} {/* Added mobile header text */}
            </h1>
            <div className="lg:hidden">
              {/* Placeholder for header right content on mobile */}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
