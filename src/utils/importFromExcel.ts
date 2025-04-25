import { Trip, Vehicle } from '../types';
import { generateId } from './helpers';

interface ImportedTrip extends Omit<Trip, 'id' | 'vehicleId'> {
  fahrzeugkennzeichen: string;
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
      fahrzeugkennzeichen: columns[10],
      notes: columns[12] || ''
    };
  });
};

const formatDateForImport = (dateStr: string): string => {
  // Convert DD.MM.YYYY to YYYY-MM-DD
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const mapPurpose = (germanPurpose: string): 'business' | 'private' | 'commute' => {
  const purposeMap: Record<string, 'business' | 'private' | 'commute'> = {
    'Geschäftlich': 'business',
    'Privat': 'private',
    'Arbeitsweg': 'commute'
  };
  return purposeMap[germanPurpose] || 'business';
};

export const validateImportedTrips = (
  trips: ImportedTrip[],
  vehicles: Vehicle[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (let i = 0; i < trips.length; i++) {
    const trip = trips[i];
    const rowNumber = i + 2; // +2 because of 0-based index and header row

    // Check if vehicle exists
    const vehicle = vehicles.find(v => v.licensePlate === trip.fahrzeugkennzeichen);
    if (!vehicle) {
      errors.push(`Zeile ${rowNumber}: Fahrzeug mit Kennzeichen "${trip.fahrzeugkennzeichen}" nicht gefunden`);
      continue;
    }

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
      errors.push(`Zeile ${rowNumber}: Pflichtfelder fehlen`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

const isValidTime = (timeStr: string): boolean => {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
};

export const convertImportedTrips = (trips: ImportedTrip[], vehicles: Vehicle[]): Trip[] => {
  return trips.map(trip => {
    const vehicle = vehicles.find(v => v.licensePlate === trip.fahrzeugkennzeichen);
    if (!vehicle) throw new Error(`Vehicle not found: ${trip.fahrzeugkennzeichen}`);

    const { fahrzeugkennzeichen, ...tripData } = trip;
    return {
      ...tripData,
      id: generateId(),
      vehicleId: vehicle.id
    };
  });
};