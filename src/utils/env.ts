// Define a type for the environment variables for type safety and autocompletion.
interface Env {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

// This utility provides a single, reliable way to access environment variables.
// It merges runtime variables (from env.js in production) with build-time/dev
// variables (from import.meta.env), giving precedence to the runtime values.
const env: Env = {
  ...(import.meta.env || {}),
  ...((window as any).env || {}),
};

// Early validation to ensure the app doesn't run without critical configuration.
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  console.error("FATAL ERROR: Supabase environment variables are not defined!");
  // In a real app, you might want to render an error page instead of throwing.
  throw new Error("Supabase environment variables are not set!");
}

export const supabaseUrl = env.VITE_SUPABASE_URL;
export const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
