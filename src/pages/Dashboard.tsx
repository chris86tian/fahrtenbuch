import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { useAppContext } from '../context/AppContext';
import { checkForReminder } from '../utils/helpers';
import VehicleSelector from '../components/VehicleSelector';
import StatsCard from '../components/StatsCard';
import YearlyStatsCard from '../components/YearlyStatsCard';
import TripList from '../components/TripList';
import TripForm from '../components/TripForm';
import ReminderModal from '../components/ReminderModal';
import ConfirmDialog from '../components/ConfirmDialog';
import TaxReportCard from '../components/TaxReportCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { PlusCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { vehicles, trips, reminderSettings, stats, activeVehicle, addTrip, updateTrip, deleteTrip, loading } = useAppContext();
  
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showTaxReport, setShowTaxReport] = useState(false);
  
  const filteredTrips = activeVehicle
    ? trips.filter(trip => trip.vehicleId === activeVehicle.id)
    : trips;

  // Get available years from trips
  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    trips.forEach(trip => {
      const year = new Date(trip.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [trips]);

  // Filter trips for the selected year
  const yearlyTrips = React.useMemo(() => {
    return trips.filter(trip => new Date(trip.date).getFullYear() === selectedYear);
  }, [trips, selectedYear]);

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

  const handleAddTrip = (tripData: Omit<Trip, 'id' | 'user_id'>) => {
    addTrip(tripData);
    setShowTripForm(false);
  };

  const handleUpdateTrip = (tripData: Omit<Trip, 'id' | 'user_id'>) => {
    if (editingTrip) {
      updateTrip({ ...tripData, id: editingTrip.id, user_id: editingTrip.user_id });
      setEditingTrip(null);
      setShowTripForm(false);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="space-y-6">
      <VehicleSelector />

      {/* Overall Stats Card */}
      {/* Changed title to include "gesamt" */}
      <StatsCard stats={stats} title="Fahrtenstatistik gesamt" />

      {/* Year Selector for Stats and Tax Report - Moved below overall stats */}
      {availableYears.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-3 sm:mb-0">
              <h2 className="text-lg font-medium text-gray-900">Auswertungsjahr</h2>
              <p className="text-sm text-gray-600">Wählen Sie das Jahr für die Statistik und den Finanzamtbericht</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Stats Card */}
      {yearlyTrips.length > 0 && (
        <YearlyStatsCard trips={yearlyTrips} year={selectedYear} />
      )}

      {/* Tax Report Toggle */}
      {availableYears.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-3 sm:mb-0">
              <h2 className="text-lg font-medium text-gray-900">Finanzamtbericht</h2>
              <p className="text-sm text-gray-600">Steuerrelevante Auswertung Ihrer Fahrten für das Jahr {selectedYear}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTaxReport(!showTaxReport)}
                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  showTaxReport
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
                }`}
              >
                {showTaxReport ? 'Bericht ausblenden' : 'Bericht anzeigen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Report Card */}
      {showTaxReport && yearlyTrips.length > 0 && (
        <TaxReportCard trips={yearlyTrips} vehicles={vehicles} year={selectedYear} />
      )}

      {/* Trip List Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {activeVehicle
              ? `Fahrten für ${activeVehicle.licensePlate}`
              : 'Alle Fahrten'}
          </h2>
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

        <div className="p-0 overflow-x-auto"> {/* Added overflow-x-auto for table responsiveness */}
          <TripList
            trips={filteredTrips}
            vehicles={vehicles}
            onEdit={handleEditTrip}
            onDelete={handleDeleteTrip}
          />
        </div>
      </div>

      {/* Trip Form Modal */}
      {showTripForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
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
