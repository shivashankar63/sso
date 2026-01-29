import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Verify if user exists in HRMS and show detailed info
 * GET /api/test/verify-hrms-user?email=user@example.com
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Get central Supabase client
    const centralSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get HRMS site configuration
    const { data: hrmsSite, error: siteError } = await centralSupabase
      .from("connected_sites")
      .select("id, name, supabase_url, supabase_anon_key")
      .eq("name", "hrms")
      .eq("is_active", true)
      .single();

    if (siteError || !hrmsSite) {
      return NextResponse.json({
        error: "HRMS site not found or not configured",
        details: siteError?.message,
      }, { status: 404 });
    }

    if (!hrmsSite.supabase_url || !hrmsSite.supabase_anon_key) {
      return NextResponse.json({
        error: "HRMS Supabase credentials not configured",
        site: hrmsSite.name,
      }, { status: 400 });
    }

    // Create HRMS Supabase client
    const hrmsSupabase = createClient(
      hrmsSite.supabase_url,
      hrmsSite.supabase_anon_key
    );

    // Check user in central database
    const { data: centralUser, error: centralError } = await centralSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    // Check user_profiles in HRMS
    const { data: hrmsProfile, error: profileError } = await hrmsSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    // Check employees in HRMS
    const { data: hrmsEmployee, error: employeeError } = await hrmsSupabase
      .from("employees")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    // Check sync logs
    const { data: syncLogs, error: logError } = await centralSupabase
      .from("user_sync_log")
      .select("*")
      .eq("target_site", "hrms")
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      email,
      central_database: {
        exists: !!centralUser,
        user: centralUser,
        error: centralError?.message,
      },
      hrms_database: {
        url: hrmsSite.supabase_url,
        user_profiles: {
          exists: !!hrmsProfile,
          data: hrmsProfile,
          error: profileError?.message,
          has_password: !!hrmsProfile?.password_hash,
        },
        employees: {
          exists: !!hrmsEmployee,
          data: hrmsEmployee,
          error: employeeError?.message,
        },
      },
      sync_logs: syncLogs || [],
      summary: {
        user_in_central: !!centralUser,
        user_in_hrms_profiles: !!hrmsProfile,
        user_in_hrms_employees: !!hrmsEmployee,
        password_set: !!hrmsProfile?.password_hash,
        can_login: !!hrmsProfile && !!hrmsProfile.password_hash,
      },
    });
  } catch (error: any) {
    console.error("Error verifying HRMS user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
