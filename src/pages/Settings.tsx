import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ReminderSettings } from '../types';
import { User, Bell, Download, Upload, LogOut, Save } from 'lucide-react';
import { exportToExcel } from '../utils/exportToExcel';
import ImportDialog from '../components/ImportDialog';

const Settings: React.FC = () => {
  const { vehicles, trips, reminderSettings, updateReminderSettings } = useAppContext();
  const { user, signOut } = useAuth();
  
  const [localReminderSettings, setLocalReminderSettings] = useState<ReminderSettings>(reminderSettings);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleReminderSettingsChange = (field: keyof ReminderSettings, value: any) => {
    setLocalReminderSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveReminderSettings = async () => {
    try {
      await updateReminderSettings(localReminderSettings);
      setMessage({ type: 'success', text: 'Erinnerungseinstellungen gespeichert' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(trips, vehicles);
      setMessage({ type: 'success', text: 'Export erfolgreich' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Export' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = async (importedTrips: any[]) => {
    try {
      // In a real app, you would process the imported trips here
      console.log('Imported trips:', importedTrips);
      setMessage({ type: 'success', text: `${importedTrips.length} Fahrten importiert` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Import' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Abmelden' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* User Profile */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-6 w-6 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Benutzerprofil</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">E-Mail</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Benutzer-ID</label>
              <p className="mt-1 text-sm text-gray-500 font-mono">{user?.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Erinnerungseinstellungen</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="reminder-enabled"
                type="checkbox"
                checked={localReminderSettings.enabled}
                onChange={(e) => handleReminderSettingsChange('enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="reminder-enabled" className="ml-2 block text-sm text-gray-900">
                Wöchentliche Erinnerungen aktivieren
              </label>
            </div>

            {localReminderSettings.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label htmlFor="reminder-day" className="block text-sm font-medium text-gray-700">
                    Wochentag
                  </label>
                  <select
                    id="reminder-day"
                    value={localReminderSettings.day}
                    onChange={(e) => handleReminderSettingsChange('day', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  >
                    <option value="monday">Montag</option>
                    <option value="tuesday">Dienstag</option>
                    <option value="wednesday">Mittwoch</option>
                    <option value="thursday">Donnerstag</option>
                    <option value="friday">Freitag</option>
                    <option value="saturday">Samstag</option>
                    <option value="sunday">Sonntag</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700">
                    Uhrzeit
                  </label>
                  <input
                    type="time"
                    id="reminder-time"
                    value={localReminderSettings.time}
                    onChange={(e) => handleReminderSettingsChange('time', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSaveReminderSettings}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Datenmanagement</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Daten exportieren</h4>
                <p className="text-sm text-gray-500">
                  Exportieren Sie alle Ihre Fahrten als Excel-Datei
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exportiere...' : 'Exportieren'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Daten importieren</h4>
                <p className="text-sm text-gray-500">
                  Importieren Sie Fahrten aus einer Excel-Datei
                </p>
              </div>
              <button
                onClick={() => setShowImportDialog(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importieren
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiken</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{vehicles.length}</div>
              <div className="text-sm text-gray-500">Fahrzeuge</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{trips.length}</div>
              <div className="text-sm text-gray-500">Fahrten</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {trips.reduce((total, trip) => total + (trip.endOdometer - trip.startOdometer), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Kilometer gesamt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Konto</h3>
          
          <div className="flex justify-end">
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Import Dialog */}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default Settings;
