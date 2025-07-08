import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../utils/env';

// Create a single, reusable Supabase client instance using our robust env utility.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
