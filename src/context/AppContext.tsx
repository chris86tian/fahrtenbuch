import React, { createContext, useContext, useEffect, useState } from 'react';
import { Trip, Vehicle, ReminderSettings, DashboardStats } from '../types';
import { generateId } from '../utils/helpers';

interface AppContextType {
  vehicles: Vehicle[];
  trips: Trip[];
  reminderSettings: ReminderSettings;
  stats: DashboardStats;
  activeVehicle: Vehicle | null;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  updateReminderSettings: (settings: ReminderSettings) => void;
}

const defaultReminderSettings: ReminderSettings = {
  enabled: true,
  day: 'friday',
  time: '18:00',
};

const calculateStats = (trips: Trip[]): DashboardStats => {
  const stats: DashboardStats = {
    totalTrips: trips.length,
    businessTrips: 0,
    privateTrips: 0,
    commuteTrips: 0,
    totalDistance: 0,
    businessDistance: 0,
    privateDistance: 0,
    commuteDistance: 0,
  };

  trips.forEach(trip => {
    const distance = trip.endOdometer - trip.startOdometer;
    stats.totalDistance += distance;

    switch (trip.purpose) {
      case 'business':
        stats.businessTrips++;
        stats.businessDistance += distance;
        break;
      case 'private':
        stats.privateTrips++;
        stats.privateDistance += distance;
        break;
      case 'commute':
        stats.commuteTrips++;
        stats.commuteDistance += distance;
        break;
    }
  });

  return stats;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const savedVehicles = localStorage.getItem('vehicles');
    return savedVehicles ? JSON.parse(savedVehicles) : [];
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    const savedTrips = localStorage.getItem('trips');
    return savedTrips ? JSON.parse(savedTrips) : [];
  });

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    const savedSettings = localStorage.getItem('reminderSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultReminderSettings;
  });

  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  const [stats, setStats] = useState<DashboardStats>(() => calculateStats(trips));

  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
    setStats(calculateStats(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
  }, [reminderSettings]);

  useEffect(() => {
    if (vehicles.length > 0 && !activeVehicle) {
      setActiveVehicle(vehicles[0]);
    }
  }, [vehicles, activeVehicle]);

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: generateId() };
    setVehicles(prev => [...prev, newVehicle]);
    if (!activeVehicle) {
      setActiveVehicle(newVehicle);
    }
  };

  const updateVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => (v.id === vehicle.id ? vehicle : v)));
    if (activeVehicle?.id === vehicle.id) {
      setActiveVehicle(vehicle);
    }
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    if (activeVehicle?.id === id) {
      setActiveVehicle(vehicles.length > 1 ? vehicles.find(v => v.id !== id) || null : null);
    }
    // Also delete all trips for this vehicle
    setTrips(prev => prev.filter(t => t.vehicleId !== id));
  };

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip = { ...trip, id: generateId() };
    setTrips(prev => [...prev, newTrip]);
    
    // Update the current odometer reading for the vehicle
    if (trip.endOdometer > 0) {
      setVehicles(prev => 
        prev.map(v => 
          v.id === trip.vehicleId 
            ? { ...v, currentOdometer: Math.max(v.currentOdometer, trip.endOdometer) } 
            : v
        )
      );
    }
  };

  const updateTrip = (trip: Trip) => {
    setTrips(prev => prev.map(t => (t.id === trip.id ? trip : t)));
    
    // Update the vehicle's current odometer if this is the latest trip
    const vehicleTrips = trips
      .filter(t => t.vehicleId === trip.vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (vehicleTrips.length > 0 && vehicleTrips[0].id === trip.id) {
      setVehicles(prev => 
        prev.map(v => 
          v.id === trip.vehicleId 
            ? { ...v, currentOdometer: trip.endOdometer } 
            : v
        )
      );
    }
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  const updateReminderSettings = (settings: ReminderSettings) => {
    setReminderSettings(settings);
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        trips,
        reminderSettings,
        stats,
        activeVehicle,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        setActiveVehicle,
        addTrip,
        updateTrip,
        deleteTrip,
        updateReminderSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};