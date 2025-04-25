import React, { useState, useRef } from 'react';
import { Trip, Vehicle } from '../types';
import { parseCSV, validateImportedTrips, convertImportedTrips } from '../utils/importFromExcel';
import { Download } from 'lucide-react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (trips: Trip[]) => void;
  vehicles: Vehicle[];
}

const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose, onImport, vehicles }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      const content = await file.text();
      const importedTrips = parseCSV(content);
      
      // Validate the imported data
      const validation = validateImportedTrips(importedTrips, vehicles);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      // Convert to our Trip format
      const trips = convertImportedTrips(importedTrips, vehicles);
      onImport(trips);
      onClose();
    } catch (error) {
      setErrors(['Fehler beim Verarbeiten der Datei. Bitte überprüfen Sie das Dateiformat.']);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fahrten importieren</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Laden Sie eine CSV-Datei hoch, die dem Format des Fahrtenbuch-Exports entspricht.
            Die Datei sollte folgende Spalten enthalten:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
            <li>Datum (DD.MM.YYYY)</li>
            <li>Uhrzeit (von/bis)</li>
            <li>Start- und Zielort</li>
            <li>Zweck der Fahrt</li>
            <li>Kilometerstände</li>
            <li>Fahrer</li>
            <li>Fahrzeugkennzeichen</li>
          </ul>
        </div>

        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Fehler beim Import:
            </h3>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Abbrechen
          </button>
          <a
            href="/template.csv"
            download="fahrtenbuch_vorlage.csv"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Download size={18} className="mr-2" />
            Vorlage herunterladen
          </a>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;
