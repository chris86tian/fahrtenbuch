import React, { useState, useEffect, useMemo } from 'react';
import { Trip, Vehicle, TripPurpose, TripStatus } from '../types'; // Import TripStatus
import { useAppContext } from '../context/AppContext';

interface TripFormProps {
  trip?: Trip;
  vehicleId?: string;
  onSubmit: (trip: Omit<Trip, 'id' | 'user_id'>) => void; // Adjusted type
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, vehicleId, onSubmit, onCancel }) => {
  const { vehicles, trips, activeVehicle } = useAppContext(); // Get trips and activeVehicle from context

  const [selectedVehicleId, setSelectedVehicleId] = useState(trip?.vehicleId || vehicleId || '');
  const [date, setDate] = useState(trip?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(trip?.startTime || '');
  const [endTime, setEndTime] = useState(trip?.endTime || '');
  const [startLocation, setStartLocation] = useState(trip?.startLocation || '');
  const [endLocation, setEndLocation] = useState(trip?.endLocation || '');
  const [purpose, setPurpose] = useState<TripPurpose>(trip?.purpose || 'business');
  const [startOdometer, setStartOdometer] = useState(trip?.startOdometer || 0);
  const [endOdometer, setEndOdometer] = useState(trip?.endOdometer || 0);
  const [driverName, setDriverName] = useState(trip?.driverName || '');
  const [notes, setNotes] = useState(trip?.notes || '');
  const [distance, setDistance] = useState(0);
  const [isPartial, setIsPartial] = useState(trip?.status === 'partial'); // State for partial trip

  // Get the selected vehicle (either the one from the trip being edited or the active vehicle)
  const currentSelectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId);
  }, [vehicles, selectedVehicleId]);


  // Extract unique driver names from all trips
  const uniqueDrivers = useMemo(() => {
    const drivers = new Set<string>();
    trips.forEach(t => {
      if (t.driverName) {
        drivers.add(t.driverName);
      }
    });
    return Array.from(drivers).sort(); // Sort alphabetically
  }, [trips]);

  // Set initial odometer readings and default start location when creating a new trip
  useEffect(() => {
    if (!trip && currentSelectedVehicle) { // Only for new trips and if a vehicle is selected
      // Set initial odometer from vehicle's current odometer
      if (currentSelectedVehicle.currentOdometer > 0) {
        setStartOdometer(currentSelectedVehicle.currentOdometer);
        setEndOdometer(currentSelectedVehicle.currentOdometer); // End odometer defaults to start for new trips
      } else {
         setStartOdometer(0);
         setEndOdometer(0);
      }

      // Set default start location if available
      if (currentSelectedVehicle.defaultStartLocation) {
        setStartLocation(currentSelectedVehicle.defaultStartLocation);
      } else {
         setStartLocation(''); // Clear if no default
      }
    } else if (trip) {
       // When editing, ensure state matches the trip data
       setStartOdometer(trip.startOdometer);
       setEndOdometer(trip.endOdometer);
       setStartLocation(trip.startLocation);
       setEndLocation(trip.endLocation);
       setIsPartial(trip.status === 'partial');
    }
  }, [trip, currentSelectedVehicle]); // Depend on trip and the currently selected vehicle


  // Calculate distance when odometer readings change
  useEffect(() => {
    setDistance(endOdometer - startOdometer);
  }, [startOdometer, endOdometer]);

  // Handle vehicle selection change - update start odometer and default location for NEW trips
  useEffect(() => {
      if (!trip && currentSelectedVehicle) { // Only for new trips
          if (currentSelectedVehicle.currentOdometer > 0) {
              setStartOdometer(currentSelectedVehicle.currentOdometer);
              setEndOdometer(currentSelectedVehicle.currentOdometer);
          } else {
              setStartOdometer(0);
              setEndOdometer(0);
          }
          if (currentSelectedVehicle.defaultStartLocation) {
              setStartLocation(currentSelectedVehicle.defaultStartLocation);
          } else {
              setStartLocation('');
          }
      }
  }, [trip, currentSelectedVehicle]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for required fields even for partial trips
    if (!selectedVehicleId || !date || !startTime || !startLocation || !driverName || purpose === undefined) {
        alert('Bitte füllen Sie die erforderlichen Felder aus: Fahrzeug, Datum, Startzeit, Startort, Fahrer, Zweck.');
        return;
    }

    // Additional validation for complete trips
    if (!isPartial) {
        if (!endTime || !endLocation || endOdometer === null || endOdometer === undefined || isNaN(endOdometer)) {
             alert('Bitte füllen Sie die Felder für das Ende der Fahrt aus oder markieren Sie die Fahrt als unvollständig.');
             return;
        }
         if (endOdometer < startOdometer) {
            alert('Der End-Kilometerstand kann nicht kleiner sein als der Start-Kilometerstand.');
            return;
         }
    } else {
        // If saving as partial, ensure end odometer is 0 or null (database default is 0)
        // and end time/location are empty.
        setEndTime('');
        setEndLocation('');
        setEndOdometer(0); // Ensure it's 0 for partial saves
    }


    onSubmit({
      vehicleId: selectedVehicleId,
      date,
      startTime,
      endTime: isPartial ? '' : endTime, // Save empty string if partial
      startLocation,
      endLocation: isPartial ? '' : endLocation, // Save empty string if partial
      purpose,
      startOdometer,
      endOdometer: isPartial ? 0 : endOdometer, // Save 0 if partial
      driverName,
      notes,
      status: isPartial ? 'partial' : 'complete', // Set status based on checkbox
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="overflow-y-auto pr-2 flex-1">
        <div className="space-y-4">
          {/* Fahrzeug and Zweck side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
                Fahrzeug
              </label>
              <select
                id="vehicleId"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              >
                <option value="">Fahrzeug wählen</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Zweck
              </label>
              <select
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as TripPurpose)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              >
                <option value="business">Geschäftlich</option>
                <option value="private">Privat</option>
                <option value="commute">Arbeitsweg</option>
              </select>
            </div>
          </div>

          {/* Datum and Fahrer side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Datum
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">
                Fahrer
              </label>
              <select
                id="driverName"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              >
                <option value="">Fahrer wählen oder eingeben</option>
                {uniqueDrivers.map((driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                ))}
                 {driverName && !uniqueDrivers.includes(driverName) && (
                    <option value={driverName}>{driverName} (Neu)</option>
                 )}
              </select>
            </div>
          </div>

          {/* Startzeit and Endzeit side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Startzeit
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                Endzeit
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border disabled:bg-gray-100"
                required={!isPartial} // Required only if not partial
                disabled={isPartial} // Disable if partial
              />
            </div>
          </div>

          {/* Startort and Zielort side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700">
                Startort
              </label>
              <input
                type="text"
                id="startLocation"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="endLocation" className="block text-sm font-medium text-gray-700">
                Zielort
              </label>
              <input
                type="text"
                id="endLocation"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border disabled:bg-gray-100"
                required={!isPartial} // Required only if not partial
                disabled={isPartial} // Disable if partial
              />
            </div>
          </div>

          {/* Kilometerstand Start, Ende, and Distanz side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startOdometer" className="block text-sm font-medium text-gray-700">
                Kilometerstand Start
              </label>
              <input
                type="number"
                id="startOdometer"
                value={startOdometer}
                onChange={(e) => setStartOdometer(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="endOdometer" className="block text-sm font-medium text-gray-700">
                Kilometerstand Ende
              </label>
              <input
                type="number"
                id="endOdometer"
                value={endOdometer}
                onChange={(e) => setEndOdometer(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border disabled:bg-gray-100"
                min={startOdometer}
                required={!isPartial} // Required only if not partial
                disabled={isPartial} // Disable if partial
              />
            </div>
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                Distanz (km)
              </label>
              <input
                type="number"
                id="distance"
                value={distance}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2 border"
                readOnly
                disabled={isPartial} // Disable distance display if partial
              />
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notizen
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              rows={3}
            />
          </div>

          {/* Checkbox for Partial Trip */}
          {!trip && ( // Only show for new trips
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPartial"
                checked={isPartial}
                onChange={(e) => setIsPartial(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPartial" className="ml-2 block text-sm text-gray-900">
                Fahrt nur starten (später vervollständigen)
              </label>
            </div>
          )}
           {trip && trip.status === 'partial' && ( // Show info for existing partial trips
             <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
               Diese Fahrt ist unvollständig. Bitte füllen Sie die fehlenden Felder aus, um sie zu vervollständigen.
             </div>
           )}
        </div>
      </div>

      {/* Fixed button area */}
      <div className="flex justify-end space-x-3 pt-4 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {trip && trip.status === 'partial' ? 'Fahrt vervollständigen' : 'Speichern'}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
