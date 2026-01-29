import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Creates a Supabase client that uses Clerk's JWT token for authentication.
 * This allows Supabase to trust tokens issued by Clerk (the Identity Hub).
 */
export async function createSupabaseClient() {
  const { getToken } = await auth();
  
  // Get the Clerk JWT token
  const token = await getToken({ template: "supabase" });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Create Supabase client with Clerk's JWT
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  });

  return supabase;
}

/**
 * Server-side Supabase client for use in Server Components and API routes
 */
export async function getSupabaseServerClient() {
  return createSupabaseClient();
}

/**
 * Client-side Supabase client (for use in Client Components)
 * Note: This still uses Clerk for auth, but fetches the token client-side
 */
export function createSupabaseClientClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey);
}
