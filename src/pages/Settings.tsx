import React, { useState } from 'react';
import ReminderSettings from '../components/ReminderSettings';
import ImportDialog from '../components/ImportDialog';
import { useAppContext } from '../context/AppContext';
import { tripsToCSV, createMonthlySummary, createYearlySummary } from '../utils/exportToExcel';
import { downloadExcel } from '../utils/helpers';
import { Download, Upload } from 'lucide-react';

const Settings: React.FC = () => {
  const { trips, vehicles, addTrip } = useAppContext();
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExportAllTrips = () => {
    const filename = `Fahrtenbuch_Alle_${new Date().toISOString().split('T')[0]}.csv`;
    const csvData = tripsToCSV(trips, vehicles);
    downloadExcel(csvData, filename);
  };

  const handleExportMonthlySummary = () => {
    const filename = `Fahrtenbuch_Monatszusammenfassung_${new Date().toISOString().split('T')[0]}.csv`;
    const csvData = createMonthlySummary(trips, vehicles);
    downloadExcel(csvData, filename);
  };

  const handleExportYearlySummary = () => {
    const filename = `Fahrtenbuch_Jahreszusammenfassung_${new Date().toISOString().split('T')[0]}.csv`;
    const csvData = createYearlySummary(trips, vehicles);
    downloadExcel(csvData, filename);
  };

  const handleImportTrips = (importedTrips: typeof trips) => {
    importedTrips.forEach(trip => {
      addTrip(trip);
    });
  };

  return (
    <div className="space-y-6">
      <ReminderSettings />

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Datenimport & -export</h2>
        <p className="text-gray-600 mb-4">
          Importieren Sie bestehende Fahrtenbuchdaten oder exportieren Sie Ihre Daten für steuerliche Zwecke und zur Archivierung.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setShowImportDialog(true)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Upload size={18} className="mr-2" />
            Fahrten importieren
          </button>

          <button
            onClick={handleExportAllTrips}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={trips.length === 0}
          >
            <Download size={18} className="mr-2" />
            Alle Fahrten exportieren
          </button>

          <button
            onClick={handleExportMonthlySummary}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={trips.length === 0}
          >
            <Download size={18} className="mr-2" />
            Monatszusammenfassung exportieren
          </button>

          <button
            onClick={handleExportYearlySummary}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            disabled={trips.length === 0}
          >
            <Download size={18} className="mr-2" />
            Jahreszusammenfassung exportieren
          </button>
        </div>

        {trips.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">
            Sie müssen zuerst Fahrten hinzufügen, bevor Sie Daten exportieren können.
          </p>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Datenschutz</h2>
        <p className="text-gray-600 mb-2">
          Alle Ihre Daten werden nur lokal auf Ihrem Gerät gespeichert und nie an externe Server gesendet.
        </p>
        <p className="text-gray-600">
          Sie können Ihre Daten jederzeit exportieren und sichern, um Datenverlust zu vermeiden.
        </p>
      </div>

      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportTrips}
        vehicles={vehicles}
      />
    </div>
  );
};

export default Settings;