import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { useAppContext } from '../context/AppContext';
import { checkForReminder } from '../utils/helpers';
import VehicleSelector from '../components/VehicleSelector';
import StatsCard from '../components/StatsCard';
import TripList from '../components/TripList';
import TripForm from '../components/TripForm';
import ReminderModal from '../components/ReminderModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { PlusCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { vehicles, trips, reminderSettings, stats, activeVehicle, addTrip, updateTrip, deleteTrip } = useAppContext();
  
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  
  const filteredTrips = activeVehicle
    ? trips.filter(trip => trip.vehicleId === activeVehicle.id)
    : trips;

  // Handle reminder logic
  useEffect(() => {
    if (!reminderSettings.enabled) return;
    
    const lastReminderShown = localStorage.getItem('lastReminderShown');
    const shouldShowReminder = checkForReminder(
      lastReminderShown,
      reminderSettings.day,
      reminderSettings.time
    );
    
    if (shouldShowReminder) {
      setShowReminderModal(true);
      localStorage.setItem('lastReminderShown', new Date().toISOString());
    }
  }, [reminderSettings]);

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setShowTripForm(true);
  };

  const handleDeleteTrip = (id: string) => {
    setTripToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTrip = () => {
    if (tripToDelete) {
      deleteTrip(tripToDelete);
      setTripToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddTrip = (tripData: Omit<Trip, 'id'>) => {
    addTrip(tripData);
    setShowTripForm(false);
  };

  const handleUpdateTrip = (tripData: Omit<Trip, 'id'>) => {
    if (editingTrip) {
      updateTrip({ ...tripData, id: editingTrip.id });
      setEditingTrip(null);
      setShowTripForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <VehicleSelector />

      <StatsCard stats={stats} />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Fahrten</h2>
          <button
            onClick={() => {
              setEditingTrip(null);
              setShowTripForm(true);
            }}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusCircle size={18} className="mr-1" />
            Neue Fahrt
          </button>
        </div>

        <TripList
          trips={filteredTrips}
          vehicles={vehicles}
          onEdit={handleEditTrip}
          onDelete={handleDeleteTrip}
        />
      </div>

      {/* Trip Form Modal */}
      {showTripForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTrip ? 'Fahrt bearbeiten' : 'Neue Fahrt hinzufügen'}
            </h2>
            <TripForm
              trip={editingTrip || undefined}
              vehicleId={activeVehicle?.id}
              onSubmit={editingTrip ? handleUpdateTrip : handleAddTrip}
              onCancel={() => {
                setShowTripForm(false);
                setEditingTrip(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onAddTrip={() => {
          setEditingTrip(null);
          setShowTripForm(true);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Fahrt löschen"
        message="Sind Sie sicher, dass Sie diese Fahrt löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        onConfirm={confirmDeleteTrip}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
};

export default Dashboard;