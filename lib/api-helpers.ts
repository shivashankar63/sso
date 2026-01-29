import { createClient } from "@supabase/supabase-js";

/**
 * Get Supabase client for API routes with proper error handling
 * Throws descriptive error if environment variables are missing
 */
export function getApiSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel project settings."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
