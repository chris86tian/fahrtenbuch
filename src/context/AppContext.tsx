import React, { createContext, useContext, useEffect, useState } from 'react';
import { Trip, Vehicle, ReminderSettings, DashboardStats } from '../types';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';

interface AppContextType {
  vehicles: Vehicle[];
  trips: Trip[];
  reminderSettings: ReminderSettings;
  stats: DashboardStats;
  activeVehicle: Vehicle | null;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'user_id'>) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  addTrip: (trip: Omit<Trip, 'id' | 'user_id'>) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  deleteAllTrips: () => Promise<void>; // Added deleteAllTrips to context type
  updateReminderSettings: (settings: ReminderSettings) => void;
  loading: boolean;
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
  const { isAuthenticated, user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(defaultReminderSettings);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [stats, setStats] = useState<DashboardStats>(() => calculateStats(trips));
  const [loading, setLoading] = useState(true);

  // Fahrzeuge aus Supabase laden
  useEffect(() => {
    const loadVehicles = async () => {
      if (!isAuthenticated || !user) {
        setVehicles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("AppContext: Loading vehicles for user:", user.id);
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('AppContext: Fehler beim Laden der Fahrzeuge:', error);
          return;
        }

        console.log("AppContext: Vehicles loaded:", data);
        setVehicles(data || []);
      } catch (error) {
        console.error('AppContext: Fehler beim Laden der Fahrzeuge:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [isAuthenticated, user]);

  // Fahrten aus Supabase laden
  useEffect(() => {
    const loadTrips = async () => {
      if (!isAuthenticated || !user) {
        setTrips([]);
        return;
      }

      try {
        setLoading(true);
        console.log("AppContext: Loading trips for user:", user.id);
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .range(0, 25000); // <-- Increased the limit here

        if (error) {
          console.error('AppContext: Fehler beim Laden der Fahrten:', error);
          return;
        }

        console.log("AppContext: Trips loaded:", data);
        setTrips(data || []);
      } catch (error) {
        console.error('AppContext: Fehler beim Laden der Fahrten:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [isAuthenticated, user]);

  // Statistiken aktualisieren, wenn sich die Fahrten ändern
  useEffect(() => {
    setStats(calculateStats(trips));
  }, [trips]);

  // Aktives Fahrzeug setzen, wenn Fahrzeuge geladen werden
  useEffect(() => {
    if (vehicles.length > 0 && !activeVehicle) {
      setActiveVehicle(vehicles[0]);
    }
  }, [vehicles, activeVehicle]);

  // Erinnerungseinstellungen aus localStorage laden (bleibt vorerst in localStorage)
  useEffect(() => {
    const savedSettings = localStorage.getItem('reminderSettings');
    if (savedSettings) {
      setReminderSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Erinnerungseinstellungen in localStorage speichern
  useEffect(() => {
    localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
  }, [reminderSettings]);

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'user_id'>) => {
    if (!isAuthenticated || !user) return;
    console.log("AppContext: Adding vehicle:", vehicle);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{ ...vehicle, user_id: user.id }])
        .select();

      if (error) {
        console.error('AppContext: Fehler beim Hinzufügen des Fahrzeugs:', error);
        return;
      }

      if (data && data.length > 0) {
        const newVehicle = data[0] as Vehicle;
        console.log("AppContext: Vehicle added successfully:", newVehicle);
        setVehicles(prev => [...prev, newVehicle]);
        
        if (!activeVehicle) {
          setActiveVehicle(newVehicle);
        }
      }
    } catch (error) {
      console.error('AppContext: Fehler beim Hinzufügen des Fahrzeugs:', error);
    }
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    if (!isAuthenticated || !user) return;
    console.log("AppContext: Updating vehicle:", vehicle);
    try {
      const { error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', vehicle.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('AppContext: Fehler beim Aktualisieren des Fahrzeugs:', error);
        return;
      }
      console.log("AppContext: Vehicle updated successfully.");
      setVehicles(prev => prev.map(v => (v.id === vehicle.id ? vehicle : v)));
      
      if (activeVehicle?.id === vehicle.id) {
        setActiveVehicle(vehicle);
      }
    } catch (error) {
      console.error('AppContext: Fehler beim Aktualisieren des Fahrzeugs:', error);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!isAuthenticated || !user) return;
    console.log("AppContext: Deleting vehicle:", id);
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('AppContext: Fehler beim Löschen des Fahrzeugs:', error);
        return;
      }
      console.log("AppContext: Vehicle deleted successfully.");
      setVehicles(prev => prev.filter(v => v.id !== id));
      
      if (activeVehicle?.id === id) {
        setActiveVehicle(vehicles.length > 1 ? vehicles.find(v => v.id !== id) || null : null);
      }
      
      // Fahrten werden automatisch durch die Datenbank-Constraints gelöscht (ON DELETE CASCADE)
      // Wir müssen aber auch den lokalen Zustand aktualisieren
      setTrips(prev => prev.filter(t => t.vehicleId !== id));
    } catch (error) {
      console.error('AppContext: Fehler beim Löschen des Fahrzeugs:', error);
    }
  };

  const addTrip = async (trip: Omit<Trip, 'id' | 'user_id'>) => {
    if (!isAuthenticated || !user) return;
    console.log("AppContext: Adding trip:", trip);
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{ ...trip, user_id: user.id }])
        .select();

      if (error) {
        console.error('AppContext: Fehler beim Hinzufügen der Fahrt:', error);
        // Optionally: throw error or display a message to the user
        return; // Stop execution if there's an error
      }

      if (data && data.length > 0) {
        const newTrip = data[0] as Trip;
        console.log("AppContext: Trip added successfully:", newTrip);
        setTrips(prev => [...prev, newTrip]);
        
        // Aktualisiere den aktuellen Kilometerstand des Fahrzeugs
        if (trip.endOdometer > 0) {
          const vehicle = vehicles.find(v => v.id === trip.vehicleId);
          if (vehicle && trip.endOdometer > vehicle.currentOdometer) {
            updateVehicle({
              ...vehicle,
              currentOdometer: trip.endOdometer
            });
          }
        }
      } else {
         console.warn("AppContext: Add trip returned no data or error.");
      }
    } catch (error) {
      console.error('AppContext: Fehler beim Hinzufügen der Fahrt (catch block):', error);
    }
  };

  const updateTrip = async (trip: Trip) => {
    if (!isAuthenticated || !user) return;
    console.log("AppContext: Updating trip:", trip);
    try {
      const { error } = await supabase
        .from('trips')
        .update(trip)
        .eq('id', trip.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('AppContext: Fehler beim Aktualisieren der Fahrt:', error);
        return;
      }
      console.log("AppContext: Trip updated successfully.");
      setTrips(prev => prev.map(t => (t.id === trip.id ? trip : t)));
      
      // Aktualisiere den Kilometerstand des Fahrzeugs, wenn dies die neueste Fahrt ist
      const vehicleTrips = trips
        .filter(t => t.vehicleId === trip.vehicleId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (vehicleTrips.length > 0 && vehicleTrips[0].id === trip.id) {
        const vehicle = vehicles.find(v => v.id === trip.vehicleId);
        if (vehicle && trip.endOdometer > vehicle.currentOdometer) {
          updateVehicle({
            ...vehicle,
            currentOdometer: trip.endOdometer
          });
        }
      }
    } catch (error) {
      console.error('AppContext: Fehler beim Aktualisieren der Fahrt:', error);
    }
  };

  const deleteTrip = async (id: string) => {
    if (!isAuthenticated || !user) return;
    console.log("AppContext: Deleting trip:", id);
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('AppContext: Fehler beim Löschen der Fahrt:', error);
        return;
      }
      console.log("AppContext: Trip deleted successfully.");
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('AppContext: Fehler beim Löschen der Fahrt:', error);
    }
  };

  // New function to delete all trips for the current user
  const deleteAllTrips = async () => {
    if (!isAuthenticated || !user) return;
    console.log("AppContext: Deleting all trips for user:", user.id);
    try {
      // CRITICAL: Use eq('user_id', user.id) to ensure only the current user's trips are deleted
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('AppContext: Fehler beim Löschen aller Fahrten:', error);
        // Optionally: display an error message to the user
      } else {
        console.log("AppContext: All trips deleted successfully.");
        setTrips([]); // Clear local state
      }
    } catch (error) {
      console.error('AppContext: Fehler beim Löschen aller Fahrten (catch block):', error);
      // Optionally: display an error message to the user
    }
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
        deleteAllTrips, // Provide the new function
        updateReminderSettings,
        loading
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
