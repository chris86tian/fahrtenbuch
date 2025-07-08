import React from 'react';
import { Vehicle } from '../types';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  onVehicleChange: (vehicle: Vehicle | null) => void;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  activeVehicle,
  onVehicleChange,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-2">
        Aktives Fahrzeug
      </label>
      <select
        id="vehicle-select"
        value={activeVehicle?.id || ''}
        onChange={(e) => {
          const selectedVehicle = vehicles.find(v => v.id === e.target.value) || null;
          onVehicleChange(selectedVehicle);
        }}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
      >
        <option value="">Alle Fahrzeuge</option>
        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.licensePlate} - {vehicle.make} {vehicle.model} ({vehicle.year})
          </option>
        ))}
      </select>
    </div>
  );
};

export default VehicleSelector;
