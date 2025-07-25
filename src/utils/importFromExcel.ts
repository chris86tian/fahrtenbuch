import { Trip, Vehicle, TripStatus } from '../types'; // Import TripStatus
import { generateId } from './helpers'; // generateId is no longer needed here, but keep import for now

// Keep the original values to store the raw strings from the CSV
interface ImportedTrip extends Omit<Trip, 'id' | 'vehicleId' | 'startOdometer' | 'endOdometer' | 'user_id' | 'status'> { // Omit status
  fahrzeugkennzeichen: string;
  originalStartOdometerValue: string | null; // Store the raw value from CSV column 6
  originalEndOdometerValue: string | null; // Store the raw value from CSV column 7
}

export const parseCSV = (csvContent: string): ImportedTrip[] => {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];

  // Remove header row and empty lines
  const dataRows = lines.slice(1).filter(line => line.trim());

  return dataRows.map(row => {
    const columns = row.split(',').map(col => col.trim().replace(/^"(.*)"$/, '$1'));

    // Store the raw value for start odometer (column 6)
    const originalStartOdometerValue = columns[6] !== undefined ? columns[6] : null;

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
      originalStartOdometerValue: originalStartOdometerValue, // Store raw string or null
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

    // Validate start odometer (using the raw original value)
    let startOdometer: number | null = null;
    if (trip.originalStartOdometerValue === null || trip.originalStartOdometerValue.trim() === '') {
        errors.push(`Zeile ${rowNumber}: Fehlender Wert für Kilometerstand (Start). Bitte prüfen Sie die 7. Spalte Ihrer CSV-Datei.`);
    } else {
        const parsedStartOdometer = parseInt(trip.originalStartOdometerValue);
        if (isNaN(parsedStartOdometer)) {
            errors.push(`Zeile ${rowNumber}: Ungültiger Wert für Kilometerstand (Start). Erwartet wurde eine Zahl, gefunden wurde "${trip.originalStartOdometerValue}". Bitte prüfen Sie die 7. Spalte Ihrer CSV-Datei.`);
        } else {
            startOdometer = parsedStartOdometer; // Store the successfully parsed value
        }
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
    if (startOdometer !== null && endOdometer !== null && endOdometer < startOdometer) {
       errors.push(`Zeile ${rowNumber}: Kilometerstand Ende (${endOdometer}) muss größer oder gleich Kilometerstand Start (${startOdometer}) sein.`);
    }

    // Validate required fields
    if (!trip.startLocation || !trip.endLocation || !trip.driverName) {
      errors.push(`Zeile ${rowNumber}: Pflichtfelder fehlen (Startort, Zielort oder Fahrer)`);
    }

    // For imported trips, we assume they are complete.
    // Check if end time, end location, and end odometer are present.
    if (!trip.endTime || !trip.endLocation || endOdometer === null || endOdometer === undefined || isNaN(endOdometer)) {
         errors.push(`Zeile ${rowNumber}: Unvollständige Fahrt erkannt. Importierte Fahrten müssen vollständig sein (Endzeit, Zielort, Kilometerstand Ende).`);
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

// Type for the return value of convertImportedTrips, explicitly omitting 'id' and 'user_id'
type ConvertedTrip = Omit<Trip, 'id' | 'user_id'>;

export const convertImportedTrips = (trips: ImportedTrip[], vehicles: Vehicle[]): ConvertedTrip[] => {
  // Assign all trips to the first vehicle in the list
  const targetVehicleId = vehicles[0]?.id;

  if (!targetVehicleId) {
    // This should ideally be caught by the validation, but as a safeguard:
    throw new Error("Kein Fahrzeug zum Zuordnen der importierten Fahrten gefunden.");
  }

  return trips.map(trip => {
    // Ignore the fahrzeugkennzeichen from the CSV
    // Parse odometer values here, assuming validation passed
    const { fahrzeugkennzeichen, originalStartOdometerValue, originalEndOdometerValue, ...tripData } = trip;

    // Add checks here as a safeguard, although validation should prevent this
    const startOdometer = parseInt(originalStartOdometerValue!);
    const endOdometer = parseInt(originalEndOdometerValue!);

    if (isNaN(startOdometer)) {
        // This error should ideally be caught by validation, but included for robustness
        console.error(`Convert error: Start-Kilometerstand is NaN for trip on ${tripData.date}. Value: "${originalStartOdometerValue}"`);
        // Decide how to handle: throw error, return null, or default? Let's throw for now.
        throw new Error(`Konvertierungsfehler: Start-Kilometerstand ist ungültig für Fahrt am ${tripData.date}. Wert: "${originalStartOdometerValue}"`);
    }
    if (isNaN(endOdometer)) {
         // This error should ideally be caught by validation, but included for robustness
        console.error(`Convert error: End-Kilometerstand is NaN for trip on ${tripData.date}. Value: "${originalEndOdometerValue}"`);
         throw new Error(`Konvertierungsfehler: End-Kilometerstand ist ungültig für Fahrt am ${tripData.date}. Wert: "${originalEndOdometerValue}"`);
    }


    // Return the object WITHOUT the 'id' field, and set status to 'complete' for imported trips
    return {
      ...tripData,
      vehicleId: targetVehicleId, // Assign the ID of the first vehicle
      startOdometer: startOdometer, // Assign the parsed value
      endOdometer: endOdometer, // Assign the parsed value
      status: 'complete', // Imported trips are assumed to be complete
    };
  });
};
