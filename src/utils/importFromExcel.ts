import { Trip, Vehicle } from '../types';
import { generateId } from './helpers';

interface ImportedTrip extends Omit<Trip, 'id' | 'vehicleId'> {
  fahrzeugkennzeichen: string; // Keep this for parsing, but we'll ignore it later
}

export const parseCSV = (csvContent: string): ImportedTrip[] => {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];

  // Remove header row and empty lines
  const dataRows = lines.slice(1).filter(line => line.trim());

  return dataRows.map(row => {
    const columns = row.split(',').map(col => col.trim().replace(/^"(.*)"$/, '$1'));
    
    // Map German headers to our data structure
    return {
      date: formatDateForImport(columns[0]),
      startTime: columns[1],
      endTime: columns[2],
      startLocation: columns[3],
      endLocation: columns[4],
      purpose: mapPurpose(columns[5]),
      startOdometer: parseInt(columns[6]),
      endOdometer: parseInt(columns[7]),
      driverName: columns[9],
      fahrzeugkennzeichen: columns[10], // Parse the license plate, but we won't use it for validation
      notes: columns[12] || ''
    };
  });
};

const formatDateForImport = (dateStr: string): string => {
  // Convert DD.MM.YYYY to YYYY-MM-DD
  const [day, month, year] = dateStr.split('.');
  if (!day || !month || !year) return ''; // Basic validation
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const mapPurpose = (germanPurpose: string): 'business' | 'private' | 'commute' => {
  const purposeMap: Record<string, 'business' | 'private' | 'commute'> = {
    'Geschäftlich': 'business',
    'Privat': 'private',
    'Arbeitsweg': 'commute'
  };
  return purposeMap[germanPurpose] || 'business'; // Default to business if mapping fails
};

export const validateImportedTrips = (
  trips: ImportedTrip[],
  vehicles: Vehicle[] // Keep vehicles parameter for potential future use, but don't use it here
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if there is at least one vehicle to assign trips to
  if (vehicles.length === 0) {
    errors.push("Kein Fahrzeug vorhanden, dem die Fahrten zugeordnet werden können. Bitte legen Sie zuerst ein Fahrzeug an.");
    return { valid: false, errors };
  }

  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    const rowNumber = i + 2; // +2 because of 0-based index and header row

    // REMOVED: Vehicle existence check based on license plate
    // const vehicle = vehicles.find(v => v.licensePlate === trip.fahrzeugkennzeichen);
    // if (!vehicle) {
    //   errors.push(`Zeile ${rowNumber}: Fahrzeug mit Kennzeichen "${trip.fahrzeugkennzeichen}" nicht gefunden`);
    //   continue; // Skip further validation for this row if vehicle not found
    // }

    // Validate date
    if (!isValidDate(trip.date)) {
      errors.push(`Zeile ${rowNumber}: Ungültiges Datum "${trip.date}"`);
    }

    // Validate times
    if (!isValidTime(trip.startTime) || !isValidTime(trip.endTime)) {
      errors.push(`Zeile ${rowNumber}: Ungültige Zeit (Start: "${trip.startTime}", Ende: "${trip.endTime}")`);
    }

    // Validate odometer readings
    if (isNaN(trip.startOdometer) || isNaN(trip.endOdometer) || trip.endOdometer < trip.startOdometer) {
      errors.push(`Zeile ${rowNumber}: Ungültige Kilometerstände (Start: ${trip.startOdometer}, Ende: ${trip.endOdometer})`);
    }

    // Validate required fields
    if (!trip.startLocation || !trip.endLocation || !trip.driverName) {
      errors.push(`Zeile ${rowNumber}: Pflichtfelder fehlen (Startort, Zielort oder Fahrer)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const isValidDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  // Check if the date object is valid and the string matches the expected format YYYY-MM-DD
  return date instanceof Date && !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

const isValidTime = (timeStr: string): boolean => {
  if (!timeStr) return false;
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
};

export const convertImportedTrips = (trips: ImportedTrip[], vehicles: Vehicle[]): Trip[] => {
  // Assign all trips to the first vehicle in the list
  const targetVehicleId = vehicles[0]?.id; 

  if (!targetVehicleId) {
    // This should ideally be caught by the validation, but as a safeguard:
    throw new Error("Kein Fahrzeug zum Zuordnen der importierten Fahrten gefunden.");
  }

  return trips.map(trip => {
    // Ignore the fahrzeugkennzeichen from the CSV
    const { fahrzeugkennzeichen, ...tripData } = trip; 
    return {
      ...tripData,
      id: generateId(),
      vehicleId: targetVehicleId // Assign the ID of the first vehicle
    };
  });
};
