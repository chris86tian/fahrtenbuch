import { Trip, Vehicle } from '../types';
import { generateId } from './helpers';

// Keep the originalEndOdometerValue to store the raw string from the CSV
interface ImportedTrip extends Omit<Trip, 'id' | 'vehicleId' | 'endOdometer'> {
  fahrzeugkennzeichen: string;
  startOdometer: number | null; // Allow null if parsing fails
  originalEndOdometerValue: string | null; // Store the raw value from CSV column 7
}

export const parseCSV = (csvContent: string): ImportedTrip[] => {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];

  // Remove header row and empty lines
  const dataRows = lines.slice(1).filter(line => line.trim());

  return dataRows.map(row => {
    const columns = row.split(',').map(col => col.trim().replace(/^"(.*)"$/, '$1'));

    // Attempt to parse start odometer, store null if NaN
    const parsedStartOdometer = parseInt(columns[6]);
    const startOdometer = isNaN(parsedStartOdometer) ? null : parsedStartOdometer;

    // Store the raw value for end odometer (column 7)
    const originalEndOdometerValue = columns[7] !== undefined ? columns[7] : null;

    // Map German headers to our data structure
    return {
      date: formatDateForImport(columns[0]),
      startTime: columns[1],
      endTime: columns[2],
      startLocation: columns[3],
      endLocation: columns[4],
      purpose: mapPurpose(columns[5]),
      startOdometer: startOdometer, // Store potentially null value
      originalEndOdometerValue: originalEndOdometerValue, // Store raw string or null
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
  vehicles: Vehicle[]
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

    // Validate date
    if (!isValidDate(trip.date)) {
      errors.push(`Zeile ${rowNumber}: Ungültiges Datum "${trip.date}"`);
    }

    // Validate times
    if (!isValidTime(trip.startTime) || !isValidTime(trip.endTime)) {
      errors.push(`Zeile ${rowNumber}: Ungültige Zeit (Start: "${trip.startTime}", Ende: "${trip.endTime}")`);
    }

    // Validate start odometer
    if (trip.startOdometer === null) {
       errors.push(`Zeile ${rowNumber}: Ungültiger Wert für Kilometerstand (Start). Erwartet wurde eine Zahl, gefunden wurde "${columns[6]}".`); // Use original column value for error
    }

    // Validate end odometer (using the raw original value)
    let endOdometer: number | null = null;
    if (trip.originalEndOdometerValue === null || trip.originalEndOdometerValue.trim() === '') {
        errors.push(`Zeile ${rowNumber}: Fehlender Wert für Kilometerstand (Ende). Bitte prüfen Sie die 8. Spalte Ihrer CSV-Datei.`);
    } else {
        const parsedEndOdometer = parseInt(trip.originalEndOdometerValue);
        if (isNaN(parsedEndOdometer)) {
            errors.push(`Zeile ${rowNumber}: Ungültiger Wert für Kilometerstand (Ende). Erwartet wurde eine Zahl, gefunden wurde "${trip.originalEndOdometerValue}". Bitte prüfen Sie die 8. Spalte Ihrer CSV-Datei.`);
        } else {
            endOdometer = parsedEndOdometer; // Store the successfully parsed value
        }
    }

    // Check odometer order only if both are valid numbers
    if (trip.startOdometer !== null && endOdometer !== null && endOdometer < trip.startOdometer) {
       errors.push(`Zeile ${rowNumber}: Kilometerstand Ende (${endOdometer}) muss größer oder gleich Kilometerstand Start (${trip.startOdometer}) sein.`);
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
    // Parse endOdometer here, assuming validation passed
    const { fahrzeugkennzeichen, originalEndOdometerValue, ...tripData } = trip;
    const endOdometer = parseInt(originalEndOdometerValue!); // Use non-null assertion as validation should catch null/invalid

    if (tripData.startOdometer === null) {
        // This case should technically be caught by validation, but handle defensively
        throw new Error(`Konvertierungsfehler: Start-Kilometerstand ist ungültig für Fahrt am ${tripData.date}`);
    }

    return {
      ...tripData,
      id: generateId(),
      vehicleId: targetVehicleId, // Assign the ID of the first vehicle
      startOdometer: tripData.startOdometer, // Use the potentially null value (validation should prevent null here)
      endOdometer: endOdometer, // Assign the parsed value
    };
  });
};
