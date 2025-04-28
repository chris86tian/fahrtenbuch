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
  addTrip: (trip: Omit<Trip, 'id' | 'user_id'>) => Promise<Trip | null>;
  addTripsBatch: (trips: Omit<Trip, 'id' | 'user_id'>[]) => Promise<{ data: Trip[] | null; error: any }>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  deleteAllTrips: () => Promise<void>;
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
    totalTrips: 0, // Count only complete trips for stats
    businessTrips: 0,
    privateTrips: 0,
    commuteTrips: 0,
    totalDistance: 0,
    businessDistance: 0,
    privateDistance: 0,
    commuteDistance: 0,
  };

  // Only include complete trips in stats calculation
  const completeTrips = trips.filter(trip => trip.status === 'complete');

  stats.totalTrips = completeTrips.length;

  completeTrips.forEach(trip => {
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
        console.log("AppContext: Loading all trips for user:", user.id);

        // Fetch all trips including the new 'status' column
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('AppContext: Fehler beim Laden der Fahrten:', error);
          return;
        }

        console.log(`AppContext: Total trips loaded count: ${data ? data.length : 0}`);

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
    } else if (vehicles.length === 0) {
      setActiveVehicle(null); // Clear active vehicle if no vehicles exist
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

      // If the deleted vehicle was the active one, set the first available vehicle as active
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

  const addTrip = async (trip: Omit<Trip, 'id' | 'user_id'>): Promise<Trip | null> => {
    if (!isAuthenticated || !user) {
      console.warn("AppContext: addTrip called without authenticated user.");
      return null;
    }
    console.log("AppContext: Attempting to add single trip:", trip);
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{ ...trip, user_id: user.id }])
        .select();

      if (error) {
        console.error('AppContext: Fehler beim Hinzufügen der Fahrt:', error);
        return null;
      }

      if (data && data.length > 0) {
        const newTrip = data[0] as Trip;
        console.log("AppContext: Single trip added successfully:", newTrip);
        // Update local state immediately on success
        setTrips(prev => [...prev, newTrip]);

        // Aktualisiere den aktuellen Kilometerstand des Fahrzeugs NUR wenn die Fahrt vollständig ist
        if (newTrip.status === 'complete' && newTrip.endOdometer > 0) {
          const vehicle = vehicles.find(v => v.id === newTrip.vehicleId);
          if (vehicle && newTrip.endOdometer > vehicle.currentOdometer) {
            updateVehicle({
              ...vehicle,
              currentOdometer: newTrip.endOdometer
            });
          }
        }
        return newTrip;
      } else {
         console.warn("AppContext: Add single trip returned no data or error.");
         return null;
      }
    } catch (error) {
      console.error('AppContext: Fehler beim Hinzufügen der Fahrt (catch block):', error);
      return null;
    }
  };

  const addTripsBatch = async (trips: Omit<Trip, 'id' | 'user_id'>[]): Promise<{ data: Trip[] | null; error: any }> => {
    if (!isAuthenticated || !user) {
      console.warn("AppContext: addTripsBatch called without authenticated user.");
      return { data: null, error: new Error("User not authenticated") };
    }
    if (trips.length === 0) {
        return { data: [], error: null };
    }

    console.log(`AppContext: Attempting to add batch of ${trips.length} trips.`);
    // Ensure status is 'complete' for imported trips as per validation logic
    const tripsWithUserIdAndStatus = trips.map(trip => ({ ...trip, user_id: user.id, status: 'complete' as TripStatus }));


    try {
      const { data, error } = await supabase
        .from('trips')
        .insert(tripsWithUserIdAndStatus)
        .select();

      if (error) {
        console.error('AppContext: Fehler beim Hinzufügen der Fahrten (Batch):', error);
        return { data: null, error };
      }

      if (data && data.length > 0) {
        console.log(`AppContext: Batch of ${data.length} trips added successfully.`);
        // Update local state with the newly added trips
        setTrips(prev => [...prev, ...(data as Trip[])]);

        // Note: Updating vehicle odometer for batches is complex.
        // A full data reload after import is recommended to ensure consistency.
        // For now, we won't update odometer here for batches.

        return { data: data as Trip[], error: null };
      } else {
         console.warn("AppContext: Add trips batch returned no data or error.");
         return { data: null, error: new Error("No data returned from batch insert") };
      }
    } catch (error) {
      console.error('AppContext: Fehler beim Hinzufügen der Fahrten (Batch - catch block):', error);
      return { data: null, error };
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

      // Aktualisiere den Kilometerstand des Fahrzeugs NUR wenn die Fahrt vollständig ist
      // und dies die neueste Fahrt für das Fahrzeug ist.
      if (trip.status === 'complete' && trip.endOdometer > 0) {
         // Find the latest complete trip for this vehicle after the update
         const vehicleTrips = trips
            .filter(t => t.vehicleId === trip.vehicleId && t.status === 'complete')
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.endTime}`).getTime(); // Sort by end time for latest
                const dateB = new Date(`${b.date}T${b.endTime}`).getTime();
                return dateB - dateA; // Descending order
            });

         // Check if the updated trip is the latest complete trip
         if (vehicleTrips.length > 0 && vehicleTrips[0].id === trip.id) {
            const vehicle = vehicles.find(v => v.id === trip.vehicleId);
            if (vehicle && trip.endOdometer > vehicle.currentOdometer) {
              updateVehicle({
                ...vehicle,
                currentOdometer: trip.endOdometer
              });
            }
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

      // Note: Deleting a trip might affect the latest odometer reading of a vehicle.
      // A full data reload or recalculation of the latest odometer for the affected vehicle
      // might be necessary after deletion for perfect accuracy.
      // For simplicity now, we won't trigger a vehicle odometer update on trip deletion.
      // The next trip addition/update for that vehicle will correct it.

    } catch (error) {
      console.error('AppContext: Fehler beim Löschen der Fahrt:', error);
    }
  };

  const deleteAllTrips = async () => {
    if (!isAuthenticated || !user) return;
    console.log("AppContext: Deleting all trips for user:", user.id);
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('AppContext: Fehler beim Löschen aller Fahrten:', error);
      } else {
        console.log("AppContext: All trips deleted successfully.");
        setTrips([]); // Clear local state
        // Reset vehicle current odometers to initial odometer after deleting all trips
        setVehicles(prev => prev.map(v => ({ ...v, currentOdometer: v.initialOdometer })));
      }
    } catch (error) {
      console.error('AppContext: Fehler beim Löschen aller Fahrten (catch block):', error);
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
        addTripsBatch,
        updateTrip,
        deleteTrip,
        deleteAllTrips,
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
