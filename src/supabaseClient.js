import { createClient } from '@supabase/supabase-js';

// Apnar Supabase Project URL ebong Anon Key ekhane diben
const supabaseUrl = 'https://wyfmufeajmcavrwqhfvw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Zm11ZmVham1jYXZyd3FoZnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzE4MjgsImV4cCI6MjA5MTA0NzgyOH0.RCnzPr0IgIhZjbR2WI3BTnaNZ9SZHEhB4eArxATMVfE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);