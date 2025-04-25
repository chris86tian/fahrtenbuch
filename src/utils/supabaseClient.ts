import { createClient } from '@supabase/supabase-js';

// Versuche, Umgebungsvariablen aus verschiedenen Quellen zu laden
const getEnvVariable = (key: string): string => {
  // 1. Versuche aus window.ENV (für Docker-Deployment)
  if (window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  
  // 2. Versuche aus import.meta.env (für Vite-Entwicklung)
  if (import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  // 3. Fallback auf leeren String
  return '';
};

// Default values from environment variables
let supabaseUrl = getEnvVariable('VITE_SUPABASE_URL');
let supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY');

// Check for saved custom connection in localStorage
const savedConnection = localStorage.getItem('currentSupabaseConnection');
if (savedConnection) {
  try {
    const { url, key } = JSON.parse(savedConnection);
    if (url && key) {
      supabaseUrl = url;
      supabaseAnonKey = key;
    }
  } catch (e) {
    console.error('Failed to parse saved Supabase connection:', e);
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL oder Anon Key ist nicht gesetzt. Bitte .env Datei überprüfen oder Verbindungsassistenten verwenden.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Function to update the Supabase client with new connection details
export const updateSupabaseConnection = (url: string, key: string) => {
  // Save to localStorage
  localStorage.setItem('currentSupabaseConnection', JSON.stringify({ url, key }));
  
  // Force reload the page to reinitialize the Supabase client
  window.location.reload();
};

// Function to get current connection details
export const getCurrentSupabaseConnection = () => {
  return {
    url: supabaseUrl || '',
    key: supabaseAnonKey || ''
  };
};
