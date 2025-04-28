import React, { useState } from 'react';
import { Trip, Vehicle } from '../types';
import { formatDate, formatDistance } from '../utils/helpers';
import { Pencil, Trash2, Copy, AlertTriangle } from 'lucide-react'; // Import AlertTriangle icon

interface TripListProps {
  trips: Trip[];
  vehicles: Vehicle[];
  onEdit: (trip: Trip) => void;
  onDelete: (id: string) => void;
  onDuplicate: (trip: Trip) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, vehicles, onEdit, onDelete, onDuplicate }) => {
  const [sortField, setSortField] = useState<keyof Trip>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Map purpose to German
  const purposeMap: Record<string, string> = {
    'business': 'Geschäftlich',
    'private': 'Privat',
    'commute': 'Arbeitsweg',
  };

  const handleSort = (field: keyof Trip) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTrips = [...trips].sort((a, b) => {
    // Primary sort by date (descending)
    const dateA = new Date(`${a.date}T${a.startTime}`).getTime(); // Include time for sorting
    const dateB = new Date(`${b.date}T${b.startTime}`).getTime(); // Include time for sorting

    // Sort partial trips first (or last? Let's put them first for visibility)
    if (a.status === 'partial' && b.status !== 'partial') return -1;
    if (b.status === 'partial' && a.status !== 'partial') return 1;

    if (dateA !== dateB) {
       return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // Secondary sort by start time for trips on the same day (already included in date comparison now)

    // For other fields, use the selected sort direction
    if (sortField === 'startOdometer' || sortField === 'endOdometer') {
      return sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }

    // Handle potential null/undefined notes for sorting
    const valueA = String(a[sortField] ?? '').toLowerCase();
    const valueB = String(b[sortField] ?? '').toLowerCase();

    return sortDirection === 'asc'
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });


  if (trips.length === 0) {
    return <p className="text-gray-500 text-center py-4">Keine Fahrten vorhanden.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('date')}
            >
              Datum {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('startLocation')}
            >
              Route {sortField === 'startLocation' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('purpose')}
            >
              Zweck {sortField === 'purpose' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
             <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('notes')}
            >
              Notizen {sortField === 'notes' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('startOdometer')}
            >
              KM {sortField === 'startOdometer' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTrips.map((trip) => {
            const vehicle = vehicles.find(v => v.id === trip.vehicleId);
            // Distance is only calculated for complete trips
            const distance = trip.status === 'complete' ? trip.endOdometer - trip.startOdometer : 0;

            return (
              <tr key={trip.id} className={`hover:bg-gray-50 transition-colors ${trip.status === 'partial' ? 'bg-yellow-100 hover:bg-yellow-200' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{formatDate(trip.date)}</div>
                  <div className="text-xs text-gray-500">
                    {trip.startTime} - {trip.status === 'complete' ? trip.endTime : '...'} {/* Show ... for partial */}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{trip.startLocation}</div>
                  <div className="text-gray-500">→ {trip.status === 'complete' ? trip.endLocation : '...'} {/* Show ... for partial */}</div>
                  <div className="text-xs text-gray-500">
                    {vehicle?.licensePlate} - {trip.driverName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purposeMap[trip.purpose] || trip.purpose}
                </td>
                 <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">
                  {trip.notes || '-'} {/* Display notes or '-' if empty */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trip.status === 'complete' ? (
                    <>
                      <div className="font-medium">{formatDistance(distance)}</div>
                      <div className="text-xs text-gray-500">
                        {trip.startOdometer} → {trip.endOdometer}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center text-yellow-700">
                       <AlertTriangle size={16} className="mr-1" />
                       <span className="text-xs">{trip.startOdometer} km (unvollständig)</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   {/* Duplicate Button */}
                   <button
                    onClick={() => onDuplicate(trip)}
                    className="text-gray-600 hover:text-gray-900 mr-3"
                    aria-label="Duplizieren"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(trip)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    aria-label="Bearbeiten"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(trip.id)}
                    className="text-red-600 hover:text-red-900"
                    aria-label="Löschen"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TripList;
