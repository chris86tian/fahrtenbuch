export type Vehicle = {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  initialOdometer: number;
  currentOdometer: number;
};

export type TripPurpose = 'business' | 'private' | 'commute';

export type Trip = {
  id: string;
  vehicleId: string;
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