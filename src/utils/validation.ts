import { Trip, Vehicle } from '../types';

export const validateTrip = (trip: Partial<Trip>): string[] => {
  const errors: string[] = [];

  if (!trip.vehicleId) {
    errors.push('Fahrzeug ist erforderlich');
  }

  if (!trip.date) {
    errors.push('Datum ist erforderlich');
  }

  if (!trip.startTime) {
    errors.push('Startzeit ist erforderlich');
  }

  if (!trip.endTime) {
    errors.push('Endzeit ist erforderlich');
  }

  if (!trip.startLocation?.trim()) {
    errors.push('Startort ist erforderlich');
  }

  if (!trip.endLocation?.trim()) {
    errors.push('Zielort ist erforderlich');
  }

  if (!trip.driverName?.trim()) {
    errors.push('Fahrername ist erforderlich');
  }

  if (trip.startOdometer !== undefined && trip.startOdometer < 0) {
    errors.push('Start-Kilometerstand muss positiv sein');
  }

  if (trip.endOdometer !== undefined && trip.startOdometer !== undefined) {
    if (trip.endOdometer <= trip.startOdometer) {
      errors.push('End-Kilometerstand muss größer als Start-Kilometerstand sein');
    }
  }

  // Validate time order
  if (trip.date && trip.startTime && trip.endTime) {
    const startDateTime = new Date(`${trip.date}T${trip.startTime}`);
    const endDateTime = new Date(`${trip.date}T${trip.endTime}`);
    if (endDateTime <= startDateTime) {
      errors.push('Endzeit muss nach der Startzeit liegen');
    }
  }

  return errors;
};

export const validateVehicle = (vehicle: Partial<Vehicle>): string[] => {
  const errors: string[] = [];

  if (!vehicle.licensePlate?.trim()) {
    errors.push('Kennzeichen ist erforderlich');
  }

  if (!vehicle.make?.trim()) {
    errors.push('Marke ist erforderlich');
  }

  if (!vehicle.model?.trim()) {
    errors.push('Modell ist erforderlich');
  }

  if (vehicle.year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (vehicle.year < 1900 || vehicle.year > currentYear + 1) {
      errors.push(`Baujahr muss zwischen 1900 und ${currentYear + 1} liegen`);
    }
  }

  if (vehicle.initialOdometer !== undefined && vehicle.initialOdometer < 0) {
    errors.push('Anfangs-Kilometerstand muss positiv sein');
  }

  if (vehicle.currentOdometer !== undefined && vehicle.initialOdometer !== undefined) {
    if (vehicle.currentOdometer < vehicle.initialOdometer) {
      errors.push('Aktueller Kilometerstand muss größer oder gleich dem Anfangs-Kilometerstand sein');
    }
  }

  return errors;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Passwort muss mindestens 6 Zeichen lang sein');
  }

  return errors;
};

export const validateLicensePlate = (licensePlate: string): boolean => {
  // German license plate format (simplified)
  const germanPlateRegex = /^[A-ZÄÖÜ]{1,3}-[A-Z]{1,2}\s?\d{1,4}[EH]?$/;
  return germanPlateRegex.test(licensePlate.toUpperCase());
};

export const validateOdometerReading = (reading: number, previousReading?: number): string[] => {
  const errors: string[] = [];

  if (reading < 0) {
    errors.push('Kilometerstand muss positiv sein');
  }

  if (previousReading !== undefined && reading < previousReading) {
    errors.push('Kilometerstand kann nicht rückwärts gehen');
  }

  // Check for unrealistic jumps (more than 5000km in one trip)
  if (previousReading !== undefined && (reading - previousReading) > 5000) {
    errors.push('Kilometersprung erscheint unrealistisch (mehr als 5000km)');
  }

  return errors;
};

export const validateTimeRange = (startTime: string, endTime: string, date?: string): string[] => {
  const errors: string[] = [];

  if (!startTime || !endTime) {
    return errors;
  }

  const baseDate = date || new Date().toISOString().split('T')[0];
  const startDateTime = new Date(`${baseDate}T${startTime}`);
  const endDateTime = new Date(`${baseDate}T${endTime}`);

  if (endDateTime <= startDateTime) {
    errors.push('Endzeit muss nach der Startzeit liegen');
  }

  // Check for unrealistic trip duration (more than 24 hours)
  const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
  if (durationHours > 24) {
    errors.push('Fahrtdauer kann nicht länger als 24 Stunden sein');
  }

  return errors;
};

// Helper function to check if a date is valid
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const validateDateRange = (startDate: string, endDate?: string): string[] => {
  const errors: string[] = [];

  if (!isValidDate(startDate)) {
    errors.push('Ungültiges Startdatum');
    return errors;
  }

  const start = new Date(startDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  // Check if date is not in the future
  if (start > today) {
    errors.push('Datum kann nicht in der Zukunft liegen');
  }

  // Check if date is not too far in the past (more than 10 years)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  if (start < tenYearsAgo) {
    errors.push('Datum kann nicht mehr als 10 Jahre in der Vergangenheit liegen');
  }

  if (endDate) {
    if (!isValidDate(endDate)) {
      errors.push('Ungültiges Enddatum');
      return errors;
    }

    const end = new Date(endDate);
    if (end < start) {
      errors.push('Enddatum muss nach dem Startdatum liegen');
    }
  }

  return errors;
};
