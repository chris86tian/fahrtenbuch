import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface SupabaseConnectionAssistantProps {
  onConnect: (url: string, key: string) => void;
  onCancel: () => void;
  currentUrl?: string;
  currentKey?: string;
}

const SupabaseConnectionAssistant: React.FC<SupabaseConnectionAssistantProps> = ({
  onConnect,
  onCancel,
  currentUrl = '',
  currentKey = ''
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [key, setKey] = useState(currentKey);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedConnections, setSavedConnections] = useState<Array<{ name: string; url: string; key: string }>>([]);

  // Load saved connections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('supabaseConnections');
    if (saved) {
      try {
        setSavedConnections(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved connections:', e);
      }
    }
  }, []);

  const validateConnection = async () => {
    if (!url || !key) {
      setError('URL und API-Key sind erforderlich');
      return false;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Create a temporary client to test the connection
      const supabase = createClient(url, key);
      
      // Try to fetch something simple to validate the connection
      const { error } = await supabase.from('vehicles').select('count', { count: 'exact', head: true });
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "No relations found" which is fine for validation
        // It just means the table doesn't exist, but the connection works
        setError(`Verbindungsfehler: ${error.message}`);
        setIsValidating(false);
        return false;
      }
      
      setIsValidating(false);
      return true;
    } catch (err) {
      setError(`Verbindungsfehler: ${err instanceof Error ? err.message : String(err)}`);
      setIsValidating(false);
      return false;
    }
  };

  const handleConnect = async () => {
    const isValid = await validateConnection();
    if (isValid) {
      onConnect(url, key);
      
      // Save this connection if it's not already saved
      const connectionExists = savedConnections.some(conn => conn.url === url && conn.key === key);
      if (!connectionExists) {
        const connectionName = prompt('Möchten Sie diese Verbindung speichern? Geben Sie einen Namen ein:');
        if (connectionName) {
          const newConnections = [...savedConnections, { name: connectionName, url, key }];
          localStorage.setItem('supabaseConnections', JSON.stringify(newConnections));
          setSavedConnections(newConnections);
        }
      }
    }
  };

  const selectSavedConnection = (url: string, key: string) => {
    setUrl(url);
    setKey(key);
  };

  const deleteSavedConnection = (index: number) => {
    const newConnections = [...savedConnections];
    newConnections.splice(index, 1);
    localStorage.setItem('supabaseConnections', JSON.stringify(newConnections));
    setSavedConnections(newConnections);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Supabase-Verbindung einrichten</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-700">
              Supabase URL
            </label>
            <input
              id="supabase-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
          
          <div>
            <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-700">
              Supabase Anon Key
            </label>
            <input
              id="supabase-key"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {savedConnections.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gespeicherte Verbindungen
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {savedConnections.map((conn, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                  >
                    <button
                      onClick={() => selectSavedConnection(conn.url, conn.key)}
                      className="text-left text-sm text-blue-600 hover:text-blue-800 flex-grow"
                    >
                      {conn.name}
                    </button>
                    <button
                      onClick={() => deleteSavedConnection(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Löschen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConnect}
              disabled={isValidating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors disabled:opacity-50"
            >
              {isValidating ? 'Verbindung wird geprüft...' : 'Verbinden'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConnectionAssistant;
