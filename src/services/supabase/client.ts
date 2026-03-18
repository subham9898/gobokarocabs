import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key if available, otherwise fall back to anon key
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

let supabase: any;

try {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. Database operations will fail. Please check your environment variables.");
    // Create a mock client that won't work but won't crash the app
    supabase = {
      from: () => ({
        select: () => ({ data: [], error: { message: "Supabase not configured" } }),
        insert: () => ({ error: { message: "Supabase not configured" } }),
        update: () => ({ error: { message: "Supabase not configured" } }),
        delete: () => ({ error: { message: "Supabase not configured" } }),
        order: () => ({ data: [], error: { message: "Supabase not configured" } }),
        eq: () => ({ single: () => ({ data: null, error: { message: "Supabase not configured" } }) }),
      }),
      auth: {
        signIn: () => ({ error: { message: "Supabase not configured" } }),
        signOut: () => ({ error: { message: "Supabase not configured" } }),
        getUser: () => ({ data: { user: null }, error: { message: "Supabase not configured" } }),
      },
      storage: {
        from: () => ({
          upload: () => ({ data: null, error: { message: "Supabase not configured" } }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        })
      }
    };
  } else {
    // Validate URL format before creating client
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.error("Critical error initializing Supabase client:", error);
  // Fallback mock
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: { message: "Supabase initialization failed" } }),
      insert: () => ({ error: { message: "Supabase initialization failed" } }),
      update: () => ({ error: { message: "Supabase initialization failed" } }),
      delete: () => ({ error: { message: "Supabase initialization failed" } }),
      order: () => ({ data: [], error: { message: "Supabase initialization failed" } }),
      eq: () => ({ single: () => ({ data: null, error: { message: "Supabase initialization failed" } }) }),
    }),
    auth: {
      signIn: () => ({ error: { message: "Supabase initialization failed" } }),
      signOut: () => ({ error: { message: "Supabase initialization failed" } }),
      getUser: () => ({ data: { user: null }, error: { message: "Supabase initialization failed" } }),
    },
    storage: {
      from: () => ({
        upload: () => ({ data: null, error: { message: "Supabase initialization failed" } }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      })
    }
  };
}

export { supabase };
