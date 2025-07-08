import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { checkFahrtenbuch } from '../utils/validation';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const FahrtenbuchCheckSection: React.FC = () => {
  const { trips, vehicles } = useAppContext();
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleRunCheck = () => {
    setIsChecking(true);
    // Run the check asynchronously to avoid blocking the UI
    setTimeout(() => {
      const result = checkFahrtenbuch(trips, vehicles);
      setValidationResult(result);
      setIsChecking(false);
    }, 50); // Small delay
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Fahrtenbuch-Prüfung</h2>
      <p className="text-gray-600 mb-4">
        Überprüfen Sie Ihr Fahrtenbuch auf Vollständigkeit und Konsistenz, um die Einhaltung der steuerlichen Anforderungen sicherzustellen.
      </p>

      <button
        onClick={handleRunCheck}
        disabled={isChecking || trips.length === 0}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isChecking ? 'Wird geprüft...' : 'Prüfung starten'}
      </button>

      {trips.length === 0 && (
         <p className="mt-3 text-sm text-gray-500">
           Es sind keine Fahrten vorhanden, die geprüft werden könnten.
         </p>
      )}

      {validationResult && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Prüfergebnis:</h3>

          {validationResult.valid ? (
            <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-md">
              <CheckCircle size={20} className="mr-2" />
              <span className="font-medium">Prüfung erfolgreich! Keine kritischen Fehler gefunden.</span>
            </div>
          ) : (
            <div className="flex items-center text-red-700 bg-red-50 p-3 rounded-md">
              <XCircle size={20} className="mr-2" />
              <span className="font-medium">Prüfung fehlgeschlagen. Es wurden Fehler gefunden.</span>
            </div>
          )}

          {validationResult.errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-2">Gefundene Fehler ({validationResult.errors.length}):</h4>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

           {validationResult.warnings.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Gefundene Hinweise ({validationResult.warnings.length}):</h4>
              <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
             <h4 className="text-sm font-medium text-blue-800 mb-1">Hinweis zur täglichen Erfassung:</h4>
             <p className="text-sm text-blue-700">
               Die Prüfung auf "jeden Tag mit Fahrzeugbewegung" kann nur eingeschränkt erfolgen, da die Anwendung nicht wissen kann, an welchen Tagen ein Fahrzeug tatsächlich bewegt wurde, wenn keine Fahrt erfasst wurde. Die Prüfung konzentriert sich stattdessen auf die Kontinuität der Kilometerstände und die Plausibilität der Zeiten zwischen aufeinanderfolgenden Fahrten für dasselbe Fahrzeug.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FahrtenbuchCheckSection;
