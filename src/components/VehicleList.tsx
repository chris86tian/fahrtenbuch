import React from 'react';
import { Vehicle } from '../types';
import { formatDistance } from '../utils/helpers';
import { Pencil, Trash2 } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onEdit, onDelete }) => {
  if (vehicles.length === 0) {
    return <p className="text-gray-500 text-center py-4">Keine Fahrzeuge vorhanden.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {vehicle.make} {vehicle.model}
              </h3>
              <div className="text-sm text-gray-500">{vehicle.year}</div>
            </div>
            <p className="mt-1 text-lg font-bold text-gray-900">{vehicle.licensePlate}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Anfänglicher Kilometerstand</p>
                <p className="font-medium">{formatDistance(vehicle.initialOdometer)}</p>
              </div>
              <div>
                <p className="text-gray-500">Aktueller Kilometerstand</p>
                <p className="font-medium">{formatDistance(vehicle.currentOdometer)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-2">
            <button
              onClick={() => onEdit(vehicle)}
              className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50 transition-colors"
              aria-label="Bearbeiten"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition-colors"
              aria-label="Löschen"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleList;
