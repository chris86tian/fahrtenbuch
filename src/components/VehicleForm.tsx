import React, { useState } from 'react';
import { Vehicle } from '../types';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (vehicle: Omit<Vehicle, 'id'>) => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSubmit, onCancel }) => {
  const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate || '');
  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year || new Date().getFullYear());
  const [initialOdometer, setInitialOdometer] = useState(vehicle?.initialOdometer || 0);
  const [currentOdometer, setCurrentOdometer] = useState(vehicle?.currentOdometer || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      licensePlate,
      make,
      model,
      year,
      initialOdometer,
      currentOdometer: initialOdometer > 0 ? Math.max(initialOdometer, currentOdometer) : currentOdometer,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
          Kennzeichen
        </label>
        <input
          type="text"
          id="licensePlate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          required
        />
      </div>

      <div>
        <label htmlFor="make" className="block text-sm font-medium text-gray-700">
          Marke
        </label>
        <input
          type="text"
          id="make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          required
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
          Modell
        </label>
        <input
          type="text"
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          required
        />
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700">
          Baujahr
        </label>
        <input
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          min="1900"
          max={new Date().getFullYear()}
          required
        />
      </div>

      <div>
        <label htmlFor="initialOdometer" className="block text-sm font-medium text-gray-700">
          Anfänglicher Kilometerstand
        </label>
        <input
          type="number"
          id="initialOdometer"
          value={initialOdometer}
          onChange={(e) => setInitialOdometer(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          min="0"
          required
        />
      </div>

      <div>
        <label htmlFor="currentOdometer" className="block text-sm font-medium text-gray-700">
          Aktueller Kilometerstand
        </label>
        <input
          type="number"
          id="currentOdometer"
          value={currentOdometer}
          onChange={(e) => setCurrentOdometer(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          min={initialOdometer}
          required
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

export default VehicleForm;
