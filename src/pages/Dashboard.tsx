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
import { checkFahrtenbuch } from '../utils/validation'; // Import checkFahrtenbuch

const Dashboard: React.FC = () => {
  const { vehicles, trips, reminderSettings, stats, activeVehicle, loading } = useAppContext();
  const navigate = useNavigate();

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showTaxReport, setShowTaxReport] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null); // State to store validation result

  // Get available years from trips (only complete trips for reports)
  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    // Only consider complete trips for available years in reports
    const completeTrips = trips.filter(trip => trip.status === 'complete');
    completeTrips.forEach(trip => {
      const year = new Date(trip.date).getFullYear();
      years.add(year);
    });
     // Always include current year if no trips exist yet
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [trips]);

  // Filter trips for the selected year (only complete trips for YearlyStatsCard and TaxReportCard)
  const yearlyCompleteTrips = React.useMemo(() => {
    return trips.filter(trip => new Date(trip.date).getFullYear() === selectedYear && trip.status === 'complete');
  }, [trips, selectedYear]);

  // Run validation whenever trips or vehicles change
  useEffect(() => {
      // We only need to check for partial trips here to disable the tax report
      const hasPartialTrips = trips.some(trip => trip.status === 'partial');
      setValidationResult({
          valid: !hasPartialTrips, // Invalid if any partial trips exist
          errors: hasPartialTrips ? ['Es existieren unvollständige Fahrten. Bitte vervollständigen Sie diese, bevor Sie Berichte exportieren.'] : [],
          warnings: [] // Warnings are handled by the full check in FahrtenbuchCheckSection
      });
  }, [trips, vehicles]); // Depend on trips and vehicles


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

      {/* Overall Stats Card (uses stats from AppContext, which now only includes complete trips) */}
      <StatsCard stats={stats} title="Fahrtenstatistik gesamt" />

      {/* Year Selector for Stats and Tax Report */}
      {(availableYears.length > 0 || trips.length === 0) && ( // Show year selector even if no trips yet
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
                 {/* Add current year if not in available years and no trips exist */}
                 {trips.length === 0 && !availableYears.includes(new Date().getFullYear()) && (
                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                 )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Stats Card (uses filtered complete trips) */}
      {yearlyCompleteTrips.length > 0 && (
        <YearlyStatsCard trips={yearlyCompleteTrips} year={selectedYear} />
      )}

      {/* Tax Report Toggle */}
      {(availableYears.length > 0 || trips.length === 0) && ( // Show toggle even if no trips yet
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-3 sm:mb-0">
              <h2 className="text-lg font-medium text-gray-900">Finanzamtbericht</h2>
              <p className="text-sm text-gray-600">Steuerrelevante Auswertung Ihrer Fahrten für das Jahr {selectedYear}</p>
            </div>
            <div className="flex items-center space-x-3">
               {/* Show validation error if partial trips exist */}
               {validationResult && !validationResult.valid ? (
                   <div className="text-red-600 text-sm flex items-center">
                       <AlertTriangle size={16} className="mr-1" />
                       Bericht nicht verfügbar (unvollständige Fahrten)
                   </div>
               ) : (
                   <button
                     onClick={() => setShowTaxReport(!showTaxReport)}
                     className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                       showTaxReport
                         ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                         : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
                     }`}
                     disabled={yearlyCompleteTrips.length === 0} // Disable if no complete trips for the year
                   >
                     {showTaxReport ? 'Bericht ausblenden' : 'Bericht anzeigen'}
                   </button>
               )}
            </div>
          </div>
           {yearlyCompleteTrips.length === 0 && validationResult && validationResult.valid && (
              <p className="mt-3 text-sm text-gray-500">
                Keine vollständigen Fahrten für das Jahr {selectedYear} vorhanden, um einen Bericht zu erstellen.
              </p>
           )}
        </div>
      )}


      {/* Tax Report Card (uses filtered complete trips) */}
      {showTaxReport && yearlyCompleteTrips.length > 0 && (
        <TaxReportCard trips={yearlyCompleteTrips} vehicles={vehicles} year={selectedYear} />
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
