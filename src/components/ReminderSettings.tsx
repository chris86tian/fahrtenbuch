import React, { useState } from 'react';
import { ReminderSettings as ReminderSettingsType } from '../types';
import { useAppContext } from '../context/AppContext';

const ReminderSettings: React.FC = () => {
  const { reminderSettings, updateReminderSettings } = useAppContext();
  const [settings, setSettings] = useState<ReminderSettingsType>(reminderSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateReminderSettings(settings);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Erinnerungseinstellungen</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
            Wöchentliche Erinnerungen aktivieren
          </label>
        </div>
        
        {settings.enabled && (
          <>
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                Tag
              </label>
              <select
                id="day"
                value={settings.day}
                onChange={(e) => setSettings({ ...settings, day: e.target.value as any })}
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
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Uhrzeit
              </label>
              <input
                type="time"
                id="time"
                value={settings.time}
                onChange={(e) => setSettings({ ...settings, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Speichern
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReminderSettings;
