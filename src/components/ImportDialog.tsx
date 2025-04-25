import React, { useState, useRef } from 'react';
import { Trip, Vehicle } from '../types';
import { parseCSV, validateImportedTrips, convertImportedTrips } from '../utils/importFromExcel';
import { Download, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext'; // Import useAppContext

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (trips: Trip[]) => void;
  // vehicles prop is no longer strictly needed here, but keep it for context consistency
}

const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose, onImport }) => {
  const { vehicles } = useAppContext(); // Get vehicles from context
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetVehicle = vehicles[0]; // Get the first vehicle

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);

    // Check if a vehicle exists before processing
    if (!targetVehicle) {
        setErrors(['Kein Fahrzeug im System gefunden. Bitte legen Sie zuerst ein Fahrzeug an, um Fahrten importieren zu können.']);
        setIsProcessing(false);
        return;
    }

    try {
      const content = await file.text();
      const importedTrips = parseCSV(content);
      
      // Validate the imported data (now without license plate check)
      const validation = validateImportedTrips(importedTrips, vehicles); // Pass vehicles for the check if one exists
      
      if (!validation.valid) {
        setErrors(validation.errors);
        setIsProcessing(false); // Stop processing on validation errors
        return;
      }

      // Convert to our Trip format, assigning to the first vehicle
      const trips = convertImportedTrips(importedTrips, vehicles); 
      onImport(trips);
      onClose(); // Close dialog on successful import
    } catch (error) {
      console.error("Import Error:", error);
      setErrors([`Fehler beim Verarbeiten der Datei: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}. Bitte überprüfen Sie das Dateiformat und die Daten.`]);
    } finally {
      setIsProcessing(false);
      // Reset file input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fahrten importieren</h2>
        
        {targetVehicle && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700 flex items-start">
            <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
            <div>
              Alle importierten Fahrten werden automatisch dem Fahrzeug <strong>{targetVehicle.licensePlate} ({targetVehicle.make} {targetVehicle.model})</strong> zugeordnet. Das Kennzeichen in der CSV-Datei wird ignoriert.
            </div>
          </div>
        )}
         {!targetVehicle && (
          <div className="mb-4 p-3 bg-red-50 rounded-md text-sm text-red-700 flex items-start">
            <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0 text-red-500" />
            <div>
              <strong>Kein Fahrzeug gefunden!</strong> Bitte legen Sie zuerst ein Fahrzeug an, bevor Sie Fahrten importieren.
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Laden Sie eine CSV-Datei hoch. Die Datei sollte folgende Spalten enthalten (Reihenfolge wichtig):
          </p>
          <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
            Datum (DD.MM.YYYY),Uhrzeit (von),Uhrzeit (bis),Startort,Zielort,Zweck,Kilometerstand (Start),Kilometerstand (Ende),Gefahrene Kilometer,Fahrer,Fahrzeugkennzeichen,Fahrzeug,Notizen
          </code>
          <p className="text-xs text-gray-500 mt-1">Die Spalten "Gefahrene Kilometer" und "Fahrzeug" werden ignoriert, sind aber für die korrekte Spaltenzuordnung erforderlich.</p>
        </div>

        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isProcessing || !targetVehicle} // Disable if processing or no vehicle exists
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
           {isProcessing && <p className="text-sm text-blue-600 mt-2">Datei wird verarbeitet...</p>}
        </div>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Fehler beim Import:
            </h3>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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
