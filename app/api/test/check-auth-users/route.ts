import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Check if user exists in auth.users and verify login
 * GET /api/test/check-auth-users?email=user@example.com
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
      .select("id, name, supabase_url, supabase_anon_key, supabase_service_key")
      .eq("name", "hrms")
      .eq("is_active", true)
      .single();

    if (siteError || !hrmsSite) {
      return NextResponse.json({
        error: "HRMS site not found",
        details: siteError?.message,
      }, { status: 404 });
    }

    if (!hrmsSite.supabase_url || !hrmsSite.supabase_service_key) {
      return NextResponse.json({
        error: "HRMS Supabase credentials not configured (service key required)",
      }, { status: 400 });
    }

    // Create HRMS Supabase client with SERVICE KEY (to check auth.users)
    const hrmsSupabase = createClient(
      hrmsSite.supabase_url,
      hrmsSite.supabase_service_key
    );

    // Check user_profiles
    const { data: profile, error: profileError } = await hrmsSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    // Check auth.users (requires service key)
    const { data: authUsers } = await hrmsSupabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    // Check employees
    const { data: employee, error: employeeError } = await hrmsSupabase
      .from("employees")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    // Try to test login (this requires the actual password, so we'll just check if user exists)
    return NextResponse.json({
      email,
      hrms_url: hrmsSite.supabase_url,
      user_profiles: {
        exists: !!profile,
        id: profile?.id,
        has_password: !!profile?.password_hash,
        password_hash: profile?.password_hash ? "***set***" : null,
      },
      auth_users: {
        exists: !!authUser,
        id: authUser?.id,
        email: authUser?.email,
        email_confirmed: authUser?.email_confirmed_at ? true : false,
        created_at: authUser?.created_at,
      },
      employees: {
        exists: !!employee,
        id: employee?.id,
        email: employee?.email,
      },
      summary: {
        can_login_with_auth: !!authUser && !!profile?.password_hash,
        issue: !authUser 
          ? "User not in auth.users - re-sync needed" 
          : !profile?.password_hash 
            ? "Password not set in user_profiles" 
            : "User should be able to login",
      },
      fix_needed: !authUser 
        ? "Re-sync user from dashboard (creates auth.users entry)" 
        : !profile?.password_hash 
          ? "Set password in dashboard and re-sync" 
          : "User should be able to login - check password matches",
    });
  } catch (error: any) {
    console.error("Error checking auth users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
