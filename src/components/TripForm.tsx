import React, { useState, useEffect } from 'react';
import { Trip, TripPurpose } from '../types';
import { useAppContext } from '../context/AppContext';

interface TripFormProps {
  trip?: Trip;
  vehicleId?: string;
  onSubmit: (trip: Omit<Trip, 'id' | 'user_id'>) => void;
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, vehicleId, onSubmit, onCancel }) => {
  const { vehicles } = useAppContext();

  const [formData, setFormData] = useState({
    vehicleId: vehicleId || trip?.vehicleId || '',
    date: trip?.date || new Date().toISOString().split('T')[0],
    startTime: trip?.startTime || '',
    endTime: trip?.endTime || '',
    startLocation: trip?.startLocation || '',
    endLocation: trip?.endLocation || '',
    purpose: trip?.purpose || 'business' as TripPurpose,
    startOdometer: trip?.startOdometer || 0,
    endOdometer: trip?.endOdometer || 0,
    driverName: trip?.driverName || '',
    notes: trip?.notes || '',
    status: trip?.status || 'complete' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicleId && !formData.vehicleId) {
      setFormData(prev => ({ ...prev, vehicleId }));
    }
  }, [vehicleId, formData.vehicleId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId) newErrors.vehicleId = 'Fahrzeug ist erforderlich';
    if (!formData.date) newErrors.date = 'Datum ist erforderlich';
    if (!formData.startTime) newErrors.startTime = 'Startzeit ist erforderlich';
    if (!formData.endTime) newErrors.endTime = 'Endzeit ist erforderlich';
    if (!formData.startLocation.trim()) newErrors.startLocation = 'Startort ist erforderlich';
    if (!formData.endLocation.trim()) newErrors.endLocation = 'Zielort ist erforderlich';
    if (!formData.driverName.trim()) newErrors.driverName = 'Fahrername ist erforderlich';
    if (formData.startOdometer < 0) newErrors.startOdometer = 'Start-Kilometerstand muss positiv sein';
    if (formData.endOdometer <= formData.startOdometer) {
      newErrors.endOdometer = 'End-Kilometerstand muss größer als Start-Kilometerstand sein';
    }

    // Validate time order
    if (formData.startTime && formData.endTime) {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      if (endDateTime <= startDateTime) {
        newErrors.endTime = 'Endzeit muss nach der Startzeit liegen';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
            Fahrzeug *
          </label>
          <select
            id="vehicleId"
            value={formData.vehicleId}
            onChange={(e) => handleInputChange('vehicleId', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.vehicleId ? 'border-red-500' : ''
            }`}
            required
          >
            <option value="">Fahrzeug auswählen</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
          {errors.vehicleId && <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Datum *
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.date ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Startzeit *
          </label>
          <input
            type="time"
            id="startTime"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.startTime ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            Endzeit *
          </label>
          <input
            type="time"
            id="endTime"
            value={formData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.endTime ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
        </div>

        <div>
          <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700">
            Startort *
          </label>
          <input
            type="text"
            id="startLocation"
            value={formData.startLocation}
            onChange={(e) => handleInputChange('startLocation', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.startLocation ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.startLocation && <p className="mt-1 text-sm text-red-600">{errors.startLocation}</p>}
        </div>

        <div>
          <label htmlFor="endLocation" className="block text-sm font-medium text-gray-700">
            Zielort *
          </label>
          <input
            type="text"
            id="endLocation"
            value={formData.endLocation}
            onChange={(e) => handleInputChange('endLocation', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.endLocation ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.endLocation && <p className="mt-1 text-sm text-red-600">{errors.endLocation}</p>}
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Zweck *
          </label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value as TripPurpose)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          >
            <option value="business">Geschäftlich</option>
            <option value="private">Privat</option>
            <option value="commute">Pendeln</option>
          </select>
        </div>

        <div>
          <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">
            Fahrer *
          </label>
          <input
            type="text"
            id="driverName"
            value={formData.driverName}
            onChange={(e) => handleInputChange('driverName', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.driverName ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.driverName && <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>}
        </div>

        <div>
          <label htmlFor="startOdometer" className="block text-sm font-medium text-gray-700">
            Start-Kilometerstand *
          </label>
          <input
            type="number"
            id="startOdometer"
            value={formData.startOdometer}
            onChange={(e) => handleInputChange('startOdometer', parseInt(e.target.value) || 0)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.startOdometer ? 'border-red-500' : ''
            }`}
            min="0"
            required
          />
          {errors.startOdometer && <p className="mt-1 text-sm text-red-600">{errors.startOdometer}</p>}
        </div>

        <div>
          <label htmlFor="endOdometer" className="block text-sm font-medium text-gray-700">
            End-Kilometerstand *
          </label>
          <input
            type="number"
            id="endOdometer"
            value={formData.endOdometer}
            onChange={(e) => handleInputChange('endOdometer', parseInt(e.target.value) || 0)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
              errors.endOdometer ? 'border-red-500' : ''
            }`}
            min="0"
            required
          />
          {errors.endOdometer && <p className="mt-1 text-sm text-red-600">{errors.endOdometer}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notizen
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          placeholder="Zusätzliche Informationen zur Fahrt..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
        >
          {trip ? 'Aktualisieren' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
