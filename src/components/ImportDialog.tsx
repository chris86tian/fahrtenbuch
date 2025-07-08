import React, { useState } from 'react';
import { Trip } from '../types';
import { importTripsFromExcel } from '../utils/importFromExcel';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (trips: Trip[]) => void;
}

interface ConvertedTrip {
  vehicleId: string;
  date: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  purpose: 'business' | 'private' | 'commute';
  startOdometer: number;
  endOdometer: number;
  driverName: string;
  notes?: string;
  status: 'complete' | 'partial';
}

const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Bitte wählen Sie eine Datei aus.');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const convertedTrips = await importTripsFromExcel(file);
      
      // Convert ConvertedTrip to Trip format by adding required properties
      const tripsWithIds: Trip[] = convertedTrips.map((trip: ConvertedTrip) => ({
        ...trip,
        id: crypto.randomUUID(), // Generate temporary ID
        user_id: 'temp-user-id', // Will be set properly when saved
      }));
      
      onImport(tripsWithIds);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Importieren der Datei.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fahrten importieren</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Excel-Datei auswählen
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p className="mb-2">Die Excel-Datei sollte folgende Spalten enthalten:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Datum</li>
              <li>Startzeit</li>
              <li>Endzeit</li>
              <li>Von (Startort)</li>
              <li>Nach (Zielort)</li>
              <li>Zweck (geschäftlich/privat/pendeln)</li>
              <li>KM Start</li>
              <li>KM Ende</li>
              <li>Fahrer</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleImport}
            disabled={!file || isImporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors disabled:opacity-50"
          >
            {isImporting ? 'Importiere...' : 'Importieren'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;
