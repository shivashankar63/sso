"use client";

import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/**
 * Client-side Supabase client hook that uses Clerk's JWT token
 * Use this in Client Components that need to interact with Supabase
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    const initSupabase = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          fetch: async (url, options = {}) => {
            const token = await getToken({ template: "supabase" });
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: token ? `Bearer ${token}` : "",
              },
            });
          },
        },
      });

      setSupabase(client);
    };

    initSupabase();
  }, [getToken]);

  return supabase;
}
