import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Vehicle, Trip, ReminderSettings, TripStatus } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface AppState {
  vehicles: Vehicle[];
  trips: Trip[];
  activeVehicle: Vehicle | null;
  reminderSettings: ReminderSettings;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'SET_ACTIVE_VEHICLE'; payload: Vehicle | null }
  | { type: 'SET_REMINDER_SETTINGS'; payload: ReminderSettings };

const initialState: AppState = {
  vehicles: [],
  trips: [],
  activeVehicle: null,
  reminderSettings: {
    enabled: false,
    day: 'friday',
    time: '17:00',
  },
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map(v => v.id === action.payload.id ? action.payload : v),
        activeVehicle: state.activeVehicle?.id === action.payload.id ? action.payload : state.activeVehicle,
      };
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(v => v.id !== action.payload),
        trips: state.trips.filter(t => t.vehicleId !== action.payload),
        activeVehicle: state.activeVehicle?.id === action.payload ? null : state.activeVehicle,
      };
    case 'SET_TRIPS':
      return { ...state, trips: action.payload };
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload] };
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(t => t.id !== action.payload),
      };
    case 'SET_ACTIVE_VEHICLE':
      return { ...state, activeVehicle: action.payload };
    case 'SET_REMINDER_SETTINGS':
      return { ...state, reminderSettings: action.payload };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'user_id'>) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addTrip: (trip: Omit<Trip, 'id' | 'user_id'>) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  updateReminderSettings: (settings: ReminderSettings) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // Load data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Clear data when user logs out
      dispatch({ type: 'SET_VEHICLES', payload: [] });
      dispatch({ type: 'SET_TRIPS', payload: [] });
      dispatch({ type: 'SET_ACTIVE_VEHICLE', payload: null });
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Load vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      dispatch({ type: 'SET_VEHICLES', payload: vehiclesData || [] });

      // Load trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (tripsError) throw tripsError;

      dispatch({ type: 'SET_TRIPS', payload: tripsData || [] });

      // Load reminder settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('reminder_settings')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (settingsData?.reminder_settings) {
        dispatch({ type: 'SET_REMINDER_SETTINGS', payload: settingsData.reminder_settings });
      }

    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Laden der Daten' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{ ...vehicleData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_VEHICLE', payload: data });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Hinzufügen des Fahrzeugs' });
    }
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', vehicle.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_VEHICLE', payload: vehicle });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Aktualisieren des Fahrzeugs' });
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_VEHICLE', payload: id });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Löschen des Fahrzeugs' });
    }
  };

  const addTrip = async (tripData: Omit<Trip, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const tripWithDefaults = {
        ...tripData,
        user_id: user.id,
        status: (tripData.status || 'complete') as TripStatus,
      };

      const { data, error } = await supabase
        .from('trips')
        .insert([tripWithDefaults])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_TRIP', payload: data });
    } catch (error) {
      console.error('Error adding trip:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Hinzufügen der Fahrt' });
    }
  };

  const updateTrip = async (trip: Trip) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update(trip)
        .eq('id', trip.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_TRIP', payload: trip });
    } catch (error) {
      console.error('Error updating trip:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Aktualisieren der Fahrt' });
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_TRIP', payload: id });
    } catch (error) {
      console.error('Error deleting trip:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Löschen der Fahrt' });
    }
  };

  const setActiveVehicle = (vehicle: Vehicle | null) => {
    dispatch({ type: 'SET_ACTIVE_VEHICLE', payload: vehicle });
  };

  const updateReminderSettings = async (settings: ReminderSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert([{
          user_id: user.id,
          reminder_settings: settings,
        }]);

      if (error) throw error;

      dispatch({ type: 'SET_REMINDER_SETTINGS', payload: settings });
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Fehler beim Aktualisieren der Erinnerungseinstellungen' });
    }
  };

  const contextValue: AppContextType = {
    ...state,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addTrip,
    updateTrip,
    deleteTrip,
    setActiveVehicle,
    updateReminderSettings,
    refreshData,
  };

  return (
    <AppContext.Provider value={contextValue}>
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
