import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { useAppContext } from '../context/AppContext';
import { checkForReminder } from '../utils/helpers';
import VehicleSelector from '../components/VehicleSelector';
import StatsCard from '../components/StatsCard';
import YearlyStatsCard from '../components/YearlyStatsCard';
import ReminderModal from '../components/ReminderModal';
import TaxReportCard from '../components/TaxReportCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { vehicles, trips, reminderSettings, stats, activeVehicle, loading } = useAppContext();
  const navigate = useNavigate();

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showTaxReport, setShowTaxReport] = useState(false);

  // Get available years from trips
  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    trips.forEach(trip => {
      const year = new Date(trip.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [trips]);

  // Filter trips for the selected year (still needed for YearlyStatsCard and TaxReportCard)
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

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="space-y-6">
      <VehicleSelector />

      {/* Overall Stats Card */}
      <StatsCard stats={stats} title="Fahrtenstatistik gesamt" />

      {/* Year Selector for Stats and Tax Report */}
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

      {/* Link to Trips page */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-3 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-900">Fahrtenübersicht</h2>
            <p className="text-sm text-gray-600">Sehen Sie alle Ihre Fahrten im Detail</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/app/trips')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Zu den Fahrten
            </button>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onAddTrip={() => navigate('/app/record-trip')}
      />
    </div>
  );
};

export default Dashboard;
