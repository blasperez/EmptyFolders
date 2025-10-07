import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://welnegwsmpoptnswjzuq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbG5lZ3dzbXBvcHRuc3dqenVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA3OTgsImV4cCI6MjA3NTM3Njc5OH0.YaszM_cJhelPr52DjJ9Yy0VMM33yL7ntDUvaNd66RTs';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
