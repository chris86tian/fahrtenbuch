import React, { useState, useEffect } from 'react';
import { Trip, Vehicle, TripPurpose } from '../types';
import { useAppContext } from '../context/AppContext';

interface TripFormProps {
  trip?: Trip;
  vehicleId?: string;
  onSubmit: (trip: Omit<Trip, 'id'>) => void;
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, vehicleId, onSubmit, onCancel }) => {
  const { vehicles } = useAppContext();
  
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

  // Get the selected vehicle
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Set initial odometer readings from vehicle when creating a new trip
  useEffect(() => {
    if (!trip && selectedVehicle && selectedVehicle.currentOdometer > 0) {
      setStartOdometer(selectedVehicle.currentOdometer);
      setEndOdometer(selectedVehicle.currentOdometer);
    }
  }, [trip, selectedVehicle]);

  // Calculate distance when odometer readings change
  useEffect(() => {
    setDistance(endOdometer - startOdometer);
  }, [startOdometer, endOdometer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      vehicleId: selectedVehicleId,
      date,
      startTime,
      endTime,
      startLocation,
      endLocation,
      purpose,
      startOdometer,
      endOdometer,
      driverName,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <input
            type="text"
            id="driverName"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          />
        </div>
      </div>

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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700">
          Startort (mit Adresse)
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
          Zielort (mit Adresse)
        </label>
        <input
          type="text"
          id="endLocation"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          required
        />
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            min={startOdometer}
            required
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
          />
        </div>
      </div>

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

      <div className="flex justify-end space-x-3">
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
          Speichern
        </button>
      </div>
    </form>
  );
};

export default TripForm;
