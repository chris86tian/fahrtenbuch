import React from 'react';
import { Vehicle } from '../types';
import { useAppContext } from '../context/AppContext';

const VehicleSelector: React.FC = () => {
  const { vehicles, activeVehicle, setActiveVehicle } = useAppContext();

  if (vehicles.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <label htmlFor="vehicle-selector" className="block text-sm font-medium text-gray-700 mb-1">
        Aktives Fahrzeug
      </label>
      <select
        id="vehicle-selector"
        value={activeVehicle?.id || ''}
        onChange={(e) => {
          const selectedVehicle = vehicles.find(v => v.id === e.target.value) || null;
          setActiveVehicle(selectedVehicle);
        }}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
      >
        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VehicleSelector;
