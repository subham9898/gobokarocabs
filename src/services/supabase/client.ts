import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key if available, otherwise fall back to anon key
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing. Database operations will fail. Please check your .env file.");
  // Create a mock client that won't work but won't crash the app
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: { message: "Supabase not configured" } }),
      insert: () => ({ error: { message: "Supabase not configured" } }),
      update: () => ({ error: { message: "Supabase not configured" } }),
      delete: () => ({ error: { message: "Supabase not configured" } }),
    }),
    auth: {
      signIn: () => ({ error: { message: "Supabase not configured" } }),
      signOut: () => ({ error: { message: "Supabase not configured" } }),
      getUser: () => ({ data: { user: null }, error: { message: "Supabase not configured" } }),
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
