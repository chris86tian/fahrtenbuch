import React, { useState, useMemo, useEffect } from 'react'; // Import useEffect
import ReminderSettings from '../components/ReminderSettings';
import ImportDialog from '../components/ImportDialog';
import { useAppContext } from '../context/AppContext';
import { tripsToCSV, createMonthlySummary, createYearlySummary, createTaxAuthorityReport } from '../utils/exportToExcel';
import { downloadExcel } from '../utils/helpers';
import { Download, Upload, FileText, Trash2, AlertTriangle } from 'lucide-react'; // Import AlertTriangle
import ConfirmDialog from '../components/ConfirmDialog';
import { Trip } from '../types';
import FahrtenbuchCheckSection from '../components/FahrtenbuchCheckSection';

const Settings: React.FC = () => {
  const { trips, vehicles, addTrip, addTripsBatch, deleteAllTrips } = useAppContext();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null); // State to store validation result

  // Get available years from trips
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    trips.forEach(trip => {
      const year = new Date(trip.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [trips]);

  // Run validation whenever trips change
  useEffect(() => {
      // We don't need to run the full check here, just check for partial trips
      const hasPartialTrips = trips.some(trip => trip.status === 'partial');
      setValidationResult({
          valid: !hasPartialTrips, // Invalid if any partial trips exist
          errors: hasPartialTrips ? ['Es existieren unvollständige Fahrten. Bitte vervollständigen Sie diese, bevor Sie Berichte exportieren.'] : [],
          warnings: [] // Warnings are handled by the full check in FahrtenbuchCheckSection
      });
  }, [trips]);


  const handleExportAllTrips = () => {
    const filename = `Fahrtenbuch_Alle_${new Date().toISOString().split('T')[0]}.csv`;
    const csvData = tripsToCSV(trips, vehicles);
    downloadExcel(csvData, filename);
  };

  const handleExportMonthlySummary = () => {
    const filename = `Fahrtenbuch_Monatszusammenfassung_${new Date().toISOString().split('T')[0]}.csv`;
    // Filter for complete trips for reports
    const completeTrips = trips.filter(trip => trip.status === 'complete');
    const csvData = createMonthlySummary(completeTrips, vehicles);
    downloadExcel(csvData, filename);
  };

  const handleExportYearlySummary = () => {
    const filename = `Fahrtenbuch_Jahreszusammenfassung_${new Date().toISOString().split('T')[0]}.csv`;
     // Filter for complete trips for reports
    const completeTrips = trips.filter(trip => trip.status === 'complete');
    const csvData = createYearlySummary(completeTrips, vehicles);
    downloadExcel(csvData, filename);
  };

  const handleExportTaxReport = () => {
    // Check validation result before exporting
    if (validationResult && !validationResult.valid) {
        alert('Bitte vervollständigen Sie alle Fahrten, bevor Sie den Finanzamtbericht exportieren.');
        return;
    }

    const filename = `Fahrtenbuch_Finanzamt_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`;
    // Filter for complete trips for reports
    const completeTrips = trips.filter(trip => trip.status === 'complete');
    const csvData = createTaxAuthorityReport(completeTrips, vehicles, selectedYear);
    downloadExcel(csvData, filename);
  };

  const handleImportTrips = async (importedTrips: Omit<Trip, 'id' | 'user_id'>[]) => {
    setImportFeedback(null);
    setIsImporting(true);

    if (importedTrips.length === 0) {
         setImportFeedback({
            message: `Keine gültigen Fahrten zum Import gefunden.`,
            type: 'info'
        });
        setIsImporting(false);
        setTimeout(() => setImportFeedback(null), 8000);
        return;
    }

    console.log(`Settings: Attempting to import ${importedTrips.length} trips in batches.`);

    const batchSize = 500;
    let successfulImports = 0;
    let failedImports = 0;
    const totalTripsToImport = importedTrips.length;

    for (let i = 0; i < totalTripsToImport; i += batchSize) {
      const batch = importedTrips.slice(i, i + batchSize);
      console.log(`Settings: Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalTripsToImport / batchSize)} with ${batch.length} trips.`);

      setImportFeedback({
          message: `Importiere Batch ${Math.floor(i / batchSize) + 1} von ${Math.ceil(totalTripsToImport / batchSize)}...`,
          type: 'info'
      });

      const { data, error } = await addTripsBatch(batch);

      if (error) {
        console.error(`Settings: Error importing batch starting at index ${i}:`, error);
        failedImports += batch.length;
        setImportFeedback({
            message: `Fehler beim Importieren von Batch ${Math.floor(i / batchSize) + 1}. Bitte prüfen Sie die Konsole.`,
            type: 'error'
        });
      } else if (data) {
        successfulImports += data.length;
        console.log(`Settings: Successfully imported ${data.length} trips in batch.`);
      } else {
         console.warn("Settings: Add trips batch returned no data or error.");
         failedImports += batch.length;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Settings: Import finished. Successful: ${successfulImports}, Failed: ${failedImports}`);

    if (successfulImports > 0) {
        setImportFeedback({
            message: `${successfulImports} von ${totalTripsToImport} Fahrten erfolgreich importiert.`,
            type: 'success'
        });
    } else if (failedImports > 0) {
         setImportFeedback({
            message: `Import fehlgeschlagen. ${failedImports} von ${totalTripsToImport} Fahrten konnten nicht importiert werden. Bitte prüfen Sie die Konsole für Details.`,
            type: 'error'
        });
    } else {
         setImportFeedback({
            message: `Keine Fahrten zum Import gefunden oder verarbeitet.`,
            type: 'info'
        });
    }

    setIsImporting(false);
    setTimeout(() => {
      setImportFeedback(null);
    }, 8000);
  };


  const handleDeleteAllTrips = () => {
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAllTrips = async () => {
    await deleteAllTrips();
    setShowDeleteAllConfirm(false);
  };

  return (
    <div className="space-y-6">
      <ReminderSettings />

      {/* Add the new FahrtenbuchCheckSection component */}
      <FahrtenbuchCheckSection />

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Datenimport & -export</h2>
        <p className="text-gray-600 mb-4">
          Importieren Sie bestehende Fahrtenbuchdaten oder exportieren Sie Ihre Daten für steuerliche Zwecke und zur Archivierung.
        </p>

        {/* Import Feedback Message */}
        {importFeedback && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            importFeedback.type === 'success' ? 'bg-green-50 text-green-700' :
            importFeedback.type === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {importFeedback.message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => setShowImportDialog(true)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            disabled={isImporting}
          >
            <Upload size={18} className="mr-2" />
            Fahrten importieren
          </button>

          <button
            onClick={handleExportAllTrips}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={trips.length === 0 || isImporting}
          >
            <Download size={18} className="mr-2" />
            Alle Fahrten exportieren (Rohdaten)
          </button>

          <button
            onClick={handleExportMonthlySummary}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={trips.filter(trip => trip.status === 'complete').length === 0 || isImporting} // Disable if no complete trips
          >
            <Download size={18} className="mr-2" />
            Monatszusammenfassung exportieren
          </button>

          <button
            onClick={handleExportYearlySummary}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            disabled={trips.filter(trip => trip.status === 'complete').length === 0 || isImporting} // Disable if no complete trips
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Finanzamtbericht</h2>
        <p className="text-gray-600 mb-4">
          Erstellen Sie einen Jahresbericht für das Finanzamt mit allen relevanten Informationen für die Steuererklärung.
        </p>

        {/* Validation Error Message for Tax Report */}
        {validationResult && !validationResult.valid && (
             <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
                <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                <div>
                   {validationResult.errors.map((err, index) => <p key={index}>{err}</p>)}
                </div>
             </div>
        )}


        <div className="mb-4">
          <label htmlFor="tax-year" className="block text-sm font-medium text-gray-700 mb-1">
            Steuerjahr auswählen
          </label>
          <select
            id="tax-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border disabled:opacity-50"
            disabled={isImporting || (availableYears.length === 0 && trips.length === 0)} // Disable if importing or no trips at all
          >
            {availableYears.length > 0 ? (
              availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            ) : (
              // Show current year if no trips exist yet
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            )}
          </select>
        </div>

        <button
          onClick={handleExportTaxReport}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
          disabled={trips.filter(trip => trip.status === 'complete').length === 0 || isImporting || (validationResult && !validationResult.valid)} // Disable if no complete trips, importing, or validation failed
        >
          <FileText size={18} className="mr-2" />
          Finanzamtbericht {selectedYear} exportieren
        </button>

        {trips.filter(trip => trip.status === 'complete').length === 0 && (
          <p className="mt-3 text-sm text-gray-500">
            Sie müssen zuerst vollständige Fahrten hinzufügen, bevor Sie einen Finanzamtbericht erstellen können.
          </p>
        )}

        <div className="mt-4 p-4 bg-yellow-50 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">Hinweis zur Steuererklärung</h3>
          <p className="text-sm text-yellow-700">
            Der Finanzamtbericht enthält alle relevanten Informationen für Ihre Steuererklärung, einschließlich der
            Gesamtkilometer, geschäftlichen Kilometer und des geschäftlichen Anteils in Prozent. Diese Daten können
            Sie für die Berechnung der steuerlich absetzbaren Fahrzeugkosten verwenden.
            Bewahren Sie diesen Bericht zusammen mit den detaillierten Fahrtenbucheinträgen als Nachweis für das Finanzamt auf.
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Datenverwaltung</h2>
        <p className="text-gray-600 mb-4">
          Hier können Sie alle Ihre Fahrten löschen. Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <button
          onClick={handleDeleteAllTrips}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          disabled={trips.length === 0 || isImporting}
        >
          <Trash2 size={18} className="mr-2" />
          Alle Fahrten löschen
        </button>
         {trips.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">
            Es sind keine Fahrten vorhanden, die gelöscht werden könnten.
          </p>
        )}
      </div>


      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Datenschutz</h2>
        <p className="text-gray-600 mb-2">
          Ihre Fahrtenbuchdaten werden sicher in einer Datenbank gespeichert und sind mit Ihrem Benutzerkonto verknüpft.
        </p>
        <p className="text-gray-600">
          Sie können Ihre Daten jederzeit exportieren und sichern, um Datenverlust zu vermeiden.
        </p>
      </div>

      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportTrips}
        // vehicles prop is no longer strictly needed here, but keep it for context consistency
      />

      {/* Delete All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllConfirm}
        title="Alle Fahrten löschen"
        message="Sind Sie sicher, dass Sie ALLE Ihre Fahrten löchten möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Alle Fahrten löschen"
        cancelLabel="Abbrechen"
        onConfirm={confirmDeleteAllTrips}
        onCancel={() => setShowDeleteAllConfirm(false)}
        type="danger"
      />
    </div>
  );
};

export default Settings;
