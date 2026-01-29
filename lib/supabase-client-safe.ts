"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Safe Supabase client that caches the instance and handles errors gracefully
 */
export function getSupabaseClientSafe(): SupabaseClient | null {
  // Return cached client if available
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      });
      return null;
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch {
      console.error("Invalid Supabase URL format:", supabaseUrl);
      return null;
    }

    // Create and cache client
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    return cachedClient;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
}

/**
 * Reset cached client (useful for testing or re-initialization)
 */
export function resetSupabaseClient() {
  cachedClient = null;
}
