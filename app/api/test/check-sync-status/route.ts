import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Check sync status for a user in HRMS
 * GET /api/test/check-sync-status?email=user@example.com&siteId=xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const siteId = searchParams.get("siteId");

    if (!email || !siteId) {
      return NextResponse.json(
        { error: "Email and siteId are required" },
        { status: 400 }
      );
    }

    // Get central Supabase client
    const centralSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get site configuration
    const { data: site, error: siteError } = await centralSupabase
      .from("connected_sites")
      .select("id, name, supabase_url, supabase_anon_key")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    if (!site.supabase_url || !site.supabase_anon_key) {
      return NextResponse.json(
        { error: "Site Supabase credentials not configured" },
        { status: 400 }
      );
    }

    // Create Supabase client for HRMS
    const hrmsSupabase = createClient(
      site.supabase_url,
      site.supabase_anon_key
    );

    // Check user_profiles
    const { data: profile, error: profileError } = await hrmsSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    // Check employees
    const { data: employee, error: employeeError } = await hrmsSupabase
      .from("employees")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    return NextResponse.json({
      email,
      site: site.name,
      user_profiles: {
        exists: !!profile,
        data: profile,
        error: profileError?.message,
        has_password: !!profile?.password_hash,
      },
      employees: {
        exists: !!employee,
        data: employee,
        error: employeeError?.message,
      },
      status: {
        can_login: !!profile && !!profile.password_hash,
        needs_sync: !profile,
        needs_password: !!profile && !profile.password_hash,
      },
    });
  } catch (error: any) {
    console.error("Error checking sync status:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
