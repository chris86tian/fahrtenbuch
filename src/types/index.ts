export type Vehicle = {
  id: string; // Supabase UUID
  user_id: string; // Foreign key to auth.users
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  initialOdometer: number;
  currentOdometer: number;
  created_at?: string; // Optional: Supabase timestamp
};

export type TripPurpose = 'business' | 'private' | 'commute';

export type Trip = {
  id: string; // Supabase UUID
  user_id: string; // Foreign key to auth.users
  vehicleId: string; // Foreign key to vehicles table
  date: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  purpose: TripPurpose;
  startOdometer: number;
  endOdometer: number;
  driverName: string;
  notes?: string;
  created_at?: string; // Optional: Supabase timestamp
};

export type ReminderSettings = {
  enabled: boolean;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time: string;
};

export type DashboardStats = {
  totalTrips: number;
  businessTrips: number;
  privateTrips: number;
  commuteTrips: number;
  totalDistance: number;
  businessDistance: number;
  privateDistance: number;
  commuteDistance: number;
};

// Added new page type
export type AppPages = 'dashboard' | 'vehicles' | 'settings' | 'record-trip' | 'trips';
