import React, { useState, useEffect } from 'react';
import { Trip } from '../types';

interface SplitTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onSplit: (originalTrip: Trip, intermediateLocation: string, intermediateTime: string, intermediateOdometer: number) => void;
}

const SplitTripDialog: React.FC<SplitTripDialogProps> = ({ isOpen, onClose, trip, onSplit }) => {
  const [intermediateLocation, setIntermediateLocation] = useState('');
  const [intermediateTime, setIntermediateTime] = useState('');
  const [intermediateOdometer, setIntermediateOdometer] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set initial values based on the trip being split
    setIntermediateLocation(''); // Start empty
    setIntermediateTime(trip.startTime); // Default to start time
    setIntermediateOdometer(trip.startOdometer); // Default to start odometer
    setError(null);
  }, [trip]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!intermediateLocation.trim()) {
      setError('Bitte geben Sie einen Zwischenstopp an.');
      return;
    }
    if (!intermediateTime) {
        setError('Bitte geben Sie eine Uhrzeit für den Zwischenstopp an.');
        return;
    }
    if (intermediateOdometer <= trip.startOdometer || intermediateOdometer >= trip.endOdometer) {
        setError(`Der Kilometerstand des Zwischenstopps (${intermediateOdometer}) muss zwischen Start (${trip.startOdometer}) und Ende (${trip.endOdometer}) liegen.`);
        return;
    }

    // Validate intermediate time is between start and end time
    const startDateTime = new Date(`${trip.date}T${trip.startTime}`).getTime();
    const endDateTime = new Date(`${trip.date}T${trip.endTime}`).getTime();
    const intermediateDateTime = new Date(`${trip.date}T${intermediateTime}`).getTime();

    if (intermediateDateTime <= startDateTime || intermediateDateTime >= endDateTime) {
        setError(`Die Uhrzeit des Zwischenstopps (${intermediateTime}) muss zwischen Startzeit (${trip.startTime}) und Endzeit (${trip.endTime}) liegen.`);
        return;
    }


    onSplit(trip, intermediateLocation, intermediateTime, intermediateOdometer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fahrt aufteilen</h2>
        <p className="text-gray-600 mb-4">
          Teilen Sie die Fahrt von "{trip.startLocation}" nach "{trip.endLocation}" in zwei separate Fahrten auf, indem Sie einen Zwischenstopp angeben.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="intermediateLocation" className="block text-sm font-medium text-gray-700">
              Zwischenstopp (Ort)
            </label>
            <input
              type="text"
              id="intermediateLocation"
              value={intermediateLocation}
              onChange={(e) => setIntermediateLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="intermediateTime" className="block text-sm font-medium text-gray-700">
              Uhrzeit am Zwischenstopp
            </label>
            <input
              type="time"
              id="intermediateTime"
              value={intermediateTime}
              onChange={(e) => setIntermediateTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="intermediateOdometer" className="block text-sm font-medium text-gray-700">
              Kilometerstand am Zwischenstopp
            </label>
            <input
              type="number"
              id="intermediateOdometer"
              value={intermediateOdometer}
              onChange={(e) => setIntermediateOdometer(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              min={trip.startOdometer + 1} // Intermediate must be greater than start
              max={trip.endOdometer - 1} // Intermediate must be less than end
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
            >
              Aufteilen
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SplitTripDialog;
