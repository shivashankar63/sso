"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Simple client-side Supabase client (no authentication required)
 * Use this when authentication is disabled
 * Caches the client instance to prevent multiple initializations
 */
export function getSupabaseClient(): SupabaseClient | null {
  // Only work on client side
  if (typeof window === "undefined") {
    return null;
  }

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
        urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "undefined",
        keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "undefined",
      });
      return null;
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (urlError) {
      console.error("Invalid Supabase URL format:", supabaseUrl, urlError);
      return null;
    }

    // Create and cache client with safe defaults
    try {
      cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return cachedClient;
    } catch (createError) {
      console.error("Error in createClient:", createError);
      return null;
    }
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
}
