import React, { useState } from 'react';
import { Vehicle } from '../types';
import { useAppContext } from '../context/AppContext';
import VehicleList from '../components/VehicleList';
import VehicleForm from '../components/VehicleForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { PlusCircle } from 'lucide-react';

const Vehicles: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useAppContext();
  
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicleToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteVehicle = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete);
      setVehicleToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    addVehicle(vehicleData);
    setShowVehicleForm(false);
  };

  const handleUpdateVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    if (editingVehicle) {
      updateVehicle({ ...vehicleData, id: editingVehicle.id });
      setEditingVehicle(null);
      setShowVehicleForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Fahrzeuge</h2>
          <button
            onClick={() => {
              setEditingVehicle(null);
              setShowVehicleForm(true);
            }}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusCircle size={18} className="mr-1" />
            Neues Fahrzeug
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <VehicleList
            vehicles={vehicles}
            onEdit={handleEditVehicle}
            onDelete={handleDeleteVehicle}
          />
        </div>
      </div>

      {/* Vehicle Form Modal */}
      {showVehicleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingVehicle ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug hinzufügen'}
            </h2>
            <VehicleForm
              vehicle={editingVehicle || undefined}
              onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
              onCancel={() => {
                setShowVehicleForm(false);
                setEditingVehicle(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Fahrzeug löschen"
        message="Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten? Alle zugehörigen Fahrten werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        onConfirm={confirmDeleteVehicle}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
};

export default Vehicles;
