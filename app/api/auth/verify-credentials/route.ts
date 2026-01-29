import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Verify user credentials for login
 * POST /api/auth/verify-credentials
 * Body: { email: string, password: string, siteName?: string }
 */
export async function POST(request: Request) {
  try {
    const { email, password, siteName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get central Supabase client
    const centralSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Find user in central database
    const { data: user, error: userError } = await centralSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid login credentials", valid: false },
        { status: 401 }
      );
    }

    // Verify password (for now, plain text comparison - hash in production!)
    // TODO: Use bcrypt or similar for password hashing in production
    if (user.password_hash !== password) {
      return NextResponse.json(
        { error: "Invalid login credentials", valid: false },
        { status: 401 }
      );
    }

    // If siteName provided, verify user is synced to that site
    if (siteName) {
      const { data: site } = await centralSupabase
        .from("connected_sites")
        .select("supabase_url, supabase_anon_key")
        .eq("name", siteName)
        .eq("is_active", true)
        .single();

      if (site && site.supabase_url && site.supabase_anon_key) {
        const siteSupabase = createClient(site.supabase_url, site.supabase_anon_key);
        const { data: siteUser } = await siteSupabase
          .from("user_profiles")
          .select("id")
          .eq("email", email.toLowerCase().trim())
          .single();

        if (!siteUser) {
          return NextResponse.json(
            { 
              error: "User not synced to this site yet", 
              valid: false,
              needsSync: true 
            },
            { status: 403 }
          );
        }
      }
    }

    // Return user data (without password)
    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        team: user.team,
        department: user.department,
      },
    });
  } catch (error: any) {
    console.error("Error verifying credentials:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", valid: false },
      { status: 500 }
    );
  }
}
