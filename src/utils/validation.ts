import { Trip, Vehicle } from '../types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Performs a comprehensive check of the Fahrtenbuch data.
 * Checks for required fields, odometer continuity, and potential issues.
 * @param trips - Array of Trip objects.
 * @param vehicles - Array of Vehicle objects.
 * @returns A ValidationResult object containing validity status, errors, and warnings.
 */
export const checkFahrtenbuch = (trips: Trip[], vehicles: Vehicle[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // --- Check 0: Check for any partial trips ---
  console.log("Validation: Checking for partial trips...");
  const partialTrips = trips.filter(trip => trip.status === 'partial');
  if (partialTrips.length > 0) {
      errors.push(`Es existieren ${partialTrips.length} unvollständige Fahrten. Bitte vervollständigen Sie diese.`);
      // We can list them as warnings if needed, but the requirement is to prevent reports if any exist.
      // Let's add them as warnings for visibility in the check result.
      partialTrips.forEach(trip => {
          warnings.push(`Unvollständige Fahrt: ${new Date(trip.date).toLocaleDateString('de-DE')} ${trip.startTime} - ${trip.startLocation} (${trip.id})`);
      });
  }
  console.log(`Validation: Partial trip check finished. Found ${partialTrips.length} partial trips.`);


  // Filter out partial trips for subsequent checks that assume complete data
  const completeTrips = trips.filter(trip => trip.status === 'complete');


  // --- Check 1: Required Fields & Basic Odometer Order (only for complete trips) ---
  console.log("Validation: Checking required fields and basic odometer order for complete trips...");
  completeTrips.forEach((trip) => {
    const tripIdentifier = `Fahrt vom ${new Date(trip.date).toLocaleDateString('de-DE')} (${trip.id})`;

    if (!trip.vehicleId) errors.push(`${tripIdentifier}: Fahrzeug fehlt.`);
    if (!trip.date) errors.push(`${tripIdentifier}: Datum fehlt.`);
    if (!trip.startTime) errors.push(`${tripIdentifier}: Startzeit fehlt.`);
    if (!trip.endTime) errors.push(`${tripIdentifier}: Endzeit fehlt.`);
    if (!trip.startLocation) errors.push(`${tripIdentifier}: Startort fehlt.`);
    if (!trip.endLocation) errors.push(`${tripIdentifier}: Zielort fehlt.`);
    if (!trip.purpose) errors.push(`${tripIdentifier}: Zweck fehlt.`);
    if (trip.startOdometer === null || trip.startOdometer === undefined || isNaN(trip.startOdometer) || trip.startOdometer < 0) {
        errors.push(`${tripIdentifier}: Ungültiger oder fehlender Start-Kilometerstand (${trip.startOdometer}).`);
    }
     if (trip.endOdometer === null || trip.endOdometer === undefined || isNaN(trip.endOdometer) || trip.endOdometer < 0) {
        errors.push(`${tripIdentifier}: Ungültiger oder fehlender End-Kilometerstand (${trip.endOdometer}).`);
    }
    if (!trip.driverName) errors.push(`${tripIdentifier}: Fahrer fehlt.`);

    // Basic check for odometer order if both are valid numbers
    if (trip.startOdometer !== null && trip.endOdometer !== null && !isNaN(trip.startOdometer) && !isNaN(trip.endOdometer) && trip.endOdometer < trip.startOdometer) {
        errors.push(`${tripIdentifier}: End-Kilometerstand (${trip.endOdometer}) ist kleiner als Start-Kilometerstand (${trip.startOdometer}).`);
    }
  });
  console.log(`Validation: Required fields and basic odometer order check finished. Found ${errors.length} errors.`);


  // --- Check 2: Odometer Gaps, Overlaps, and Unrealistic Jumps (per vehicle, only for complete trips) ---
  console.log("Validation: Checking odometer continuity and jumps for complete trips...");
  const tripsByVehicle: { [vehicleId: string]: Trip[] } = {};
  completeTrips.forEach(trip => { // Use completeTrips here
    if (trip.vehicleId) {
      if (!tripsByVehicle[trip.vehicleId]) {
        tripsByVehicle[trip.vehicleId] = [];
      }
      tripsByVehicle[trip.vehicleId].push(trip);
    }
  });

  const UNREALISTIC_JUMP_THRESHOLD = 1000; // km

  Object.keys(tripsByVehicle).forEach(vehicleId => {
    const vehicleTrips = tripsByVehicle[vehicleId];
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const vehicleIdentifier = vehicle ? `${vehicle.licensePlate} (${vehicle.make} ${vehicle.model})` : `Unbekanntes Fahrzeug (${vehicleId})`;

    // Sort trips chronologically by date and time
    vehicleTrips.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateA - dateB;
    });

    for (let i = 0; i < vehicleTrips.length; i++) {
      const currentTrip = vehicleTrips[i];
      const currentTripIdentifier = `Fahrt vom ${new Date(currentTrip.date).toLocaleDateString('de-DE')} (${currentTrip.id})`;

      // Check for unrealistic jump within the current trip
      if (
        currentTrip.startOdometer !== null && currentTrip.startOdometer !== undefined && !isNaN(currentTrip.startOdometer) &&
        currentTrip.endOdometer !== null && currentTrip.endOdometer !== undefined && !isNaN(currentTrip.endOdometer)
      ) {
        const distance = currentTrip.endOdometer - currentTrip.startOdometer;
        if (distance > UNREALISTIC_JUMP_THRESHOLD) {
          warnings.push(
            `Potenziell unrealistischer Kilometerstand-Sprung für Fahrzeug ${vehicleIdentifier} in ${currentTripIdentifier}: ` +
            `Fahrtstrecke beträgt ${distance} km. Bitte prüfen Sie die Eingabe.`
          );
        }
      }


      if (i < vehicleTrips.length - 1) {
        const nextTrip = vehicleTrips[i + 1];

        // Only check continuity if both are complete trips and have valid odometer readings
        if (
          currentTrip.status === 'complete' && nextTrip.status === 'complete' &&
          currentTrip.endOdometer !== null && currentTrip.endOdometer !== undefined && !isNaN(currentTrip.endOdometer) &&
          nextTrip.startOdometer !== null && nextTrip.startOdometer !== undefined && !isNaN(nextTrip.startOdometer)
        ) {
          if (nextTrip.startOdometer < currentTrip.endOdometer) {
            errors.push(
              `Kilometerstand-Überschneidung für Fahrzeug ${vehicleIdentifier}: ` +
              `Fahrt am ${new Date(currentTrip.date).toLocaleDateString('de-DE')} endet bei ${currentTrip.endOdometer} km, ` +
              `nächste Fahrt am ${new Date(nextTrip.date).toLocaleDateString('de-DE')} beginnt bei ${nextTrip.startOdometer} km.`
            );
          } else if (nextTrip.startOdometer > currentTrip.endOdometer) {
             // Only report as a warning if the gap is significant (e.g., > 0 km)
             if (nextTrip.startOdometer - currentTrip.endOdometer > 0) {
                warnings.push(
                  `Kilometerstand-Lücke für Fahrzeug ${vehicleIdentifier}: ` +
                  `Fahrt am ${new Date(currentTrip.date).toLocaleDateString('de-DE')} endet bei ${currentTrip.endOdometer} km, ` +
                  `nächste Fahrt am ${new Date(nextTrip.date).toLocaleDateString('de-DE')} beginnt bei ${nextTrip.startOdometer} km. ` +
                  `Lücke: ${nextTrip.startOdometer - currentTrip.endOdometer} km.`
                );
             }
          }
        } else if (currentTrip.status === 'partial' || nextTrip.status === 'partial') {
            // If either trip is partial, we skip this continuity check for this pair.
            // The presence of partial trips is already reported in Check 0.
        } else {
             // If odometer values are invalid for complete trips, an error is already reported in Check 1.
        }
      }
    }
  });
   console.log(`Validation: Odometer continuity and jumps check finished. Found ${errors.length} errors and ${warnings.length} warnings.`);


  // --- Check 3: Trip Time Plausibility (per vehicle, only for complete trips) ---
  console.log("Validation: Checking trip time plausibility for complete trips...");
   Object.keys(tripsByVehicle).forEach(vehicleId => {
    const vehicleTrips = tripsByVehicle[vehicleId];
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const vehicleIdentifier = vehicle ? `${vehicle.licensePlate} (${vehicle.make} ${vehicle.model})` : `Unbekanntes Fahrzeug (${vehicleId})`;

    // Trips are already sorted chronologically by date and time from Check 2

    for (let i = 0; i < vehicleTrips.length; i++) {
      const currentTrip = vehicleTrips[i];
      const currentTripIdentifier = `Fahrt vom ${new Date(currentTrip.date).toLocaleDateString('de-DE')} ${currentTrip.startTime}-${currentTrip.endTime} (${currentTrip.id})`;

      // Only check time plausibility for complete trips
      if (currentTrip.status !== 'complete') {
          continue;
      }

      // Check for valid time format (already done in Check 1, but good to be sure)
      if (!isValidTime(currentTrip.startTime) || !isValidTime(currentTrip.endTime)) {
         // Error already reported in Check 1
         continue;
      }

      // Check for end time before start time
      const currentStartTime = new Date(`${currentTrip.date}T${currentTrip.startTime}`).getTime();
      const currentEndTime = new Date(`${currentTrip.date}T${currentTrip.endTime}`).getTime();

      if (currentEndTime < currentStartTime) {
        errors.push(`${currentTripIdentifier}: Endzeit (${currentTrip.endTime}) liegt vor Startzeit (${currentTrip.startTime}).`);
      }

      // Check for unrealistic trip duration (e.g., more than 24 hours)
      const durationMs = currentEndTime - currentStartTime;
      const durationHours = durationMs / (1000 * 60 * 60);
      if (durationHours > 24) { // Assuming a single trip shouldn't exceed 24 hours
         warnings.push(`${currentTripIdentifier}: Potenziell unrealistische Fahrtdauer (${durationHours.toFixed(1)} Stunden). Bitte prüfen Sie die Eingabe.`);
      }


      // Check for overlaps with the next trip (only if next trip is also complete)
      if (i < vehicleTrips.length - 1) {
        const nextTrip = vehicleTrips[i + 1];

        if (nextTrip.status === 'complete') {
            // Check for valid time format for the next trip
            if (!isValidTime(nextTrip.startTime)) {
               // Error already reported in Check 1
               continue;
            }

            const nextStartTime = new Date(`${nextTrip.date}T${nextTrip.startTime}`).getTime();

            // An overlap occurs if the current trip's end time is after the next trip's start time
            if (currentEndTime > nextStartTime) {
              errors.push(
                `Zeitliche Überschneidung für Fahrzeug ${vehicleIdentifier}: ` +
                `Fahrt am ${new Date(currentTrip.date).toLocaleDateString('de-DE')} endet um ${currentTrip.endTime}, ` +
                `nächste Fahrt am ${new Date(nextTrip.date).toLocaleDateString('de-DE')} beginnt um ${nextTrip.startTime}.`
              );
            }
        }
      }
    }
  });
  console.log(`Validation: Trip time plausibility check finished. Found ${errors.length} errors and ${warnings.length} warnings.`);


  // --- Check 4: Daily Entries (Ambiguity Note) ---
  // This check remains an ambiguity as explained before. The odometer continuity check
  // is the closest we get.


  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// Helper function to check if a string is a valid date in YYYY-MM-DD format
const isValidDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  // Check if the date object is valid and the string matches the expected format YYYY-MM-DD
  return date instanceof Date && !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

// Helper function to check if a string is a valid time in HH:MM format
const isValidTime = (timeStr: string): boolean => {
  if (!timeStr) return false;
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
};
