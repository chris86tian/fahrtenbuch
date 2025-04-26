import React, { useState, useMemo } from 'react';
import { Trip } from '../types';
import { useAppContext } from '../context/AppContext';
import TripList from '../components/TripList';
import TripForm from '../components/TripForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { PlusCircle } from 'lucide-react';

const Trips: React.FC = () => {
  const { vehicles, trips, activeVehicle, addTrip, updateTrip, deleteTrip } = useAppContext();

  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterText, setFilterText] = useState<string>('');

  // Get available years from trips
  const availableYears = useMemo(() => {
    // First, collect all years from actual trips
    const yearsFromTrips = new Set<number>();
    trips.forEach(trip => {
      const year = new Date(trip.date).getFullYear();
      yearsFromTrips.add(year);
    });
    
    // Always include current year
    const currentYear = new Date().getFullYear();
    yearsFromTrips.add(currentYear);
    
    // Add specific years we want to always include (2022, 2023, 2024, 2025)
    const requiredYears = [2022, 2023, 2024, 2025];
    requiredYears.forEach(year => yearsFromTrips.add(year));
    
    return Array.from(yearsFromTrips).sort((a, b) => b - a); // Sort descending
  }, [trips]);

  // Filter trips based on active vehicle, selected year, and filter text
  const filteredTrips = useMemo(() => {
    let currentTrips = activeVehicle
      ? trips.filter(trip => trip.vehicleId === activeVehicle.id)
      : trips;

    // Filter by selected year
    currentTrips = currentTrips.filter(trip => new Date(trip.date).getFullYear() === selectedYear);

    // Filter by text (case-insensitive search in relevant fields)
    if (filterText) {
      const lowerCaseFilterText = filterText.toLowerCase();
      currentTrips = currentTrips.filter(trip =>
        trip.startLocation.toLowerCase().includes(lowerCaseFilterText) ||
        trip.endLocation.toLowerCase().includes(lowerCaseFilterText) ||
        trip.driverName.toLowerCase().includes(lowerCaseFilterText) ||
        trip.notes?.toLowerCase().includes(lowerCaseFilterText) ||
        trip.purpose.toLowerCase().includes(lowerCaseFilterText) // Include purpose in search
      );
    }

    return currentTrips;
  }, [trips, activeVehicle, selectedYear, filterText]);


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

  const handleAddTrip = async (tripData: Omit<Trip, 'id' | 'user_id'>) => {
    await addTrip(tripData);
    setShowTripForm(false);
  };

  const handleUpdateTrip = async (tripData: Omit<Trip, 'id' | 'user_id'>) => {
    if (editingTrip) {
      await updateTrip({ ...tripData, id: editingTrip.id, user_id: editingTrip.user_id });
      setEditingTrip(null);
      setShowTripForm(false);
    }
  };

  // Debug output to check trips and years
  console.log("All trips:", trips.length);
  console.log("Available years:", availableYears);
  console.log("Selected year:", selectedYear);
  console.log("Filtered trips:", filteredTrips.length);
  
  // Check for trips by year
  const years = [2022, 2023, 2024, 2025];
  years.forEach(year => {
    const yearTrips = trips.filter(trip => new Date(trip.date).getFullYear() === year);
    console.log(`${year} trips:`, yearTrips.length);
    if (yearTrips.length > 0) {
      console.log(`Sample ${year} trip:`, yearTrips[0]);
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-0">
             {activeVehicle
              ? `Fahrten für ${activeVehicle.licensePlate} (${selectedYear})`
              : `Alle Fahrten (${selectedYear})`}
          </h2>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
             {/* Year Selector */}
            {availableYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}
             {/* Filter Input */}
             <input
                type="text"
                placeholder="Suchen..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm w-full sm:w-40"
             />
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
        </div>

        <div className="p-0 overflow-x-auto">
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

export default Trips;
