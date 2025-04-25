import { createClient } from '@supabase/supabase-js';

// Default values from environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  console.error('Supabase URL oder Anon Key ist nicht gesetzt. Bitte .env Datei überprüfen.');
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
