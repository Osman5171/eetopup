import { createClient } from '@supabase/supabase-js';

// Apnar Supabase Project URL ebong Anon Key ekhane diben
const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);