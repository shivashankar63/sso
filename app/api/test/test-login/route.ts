import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Test login directly to HRMS
 * POST /api/test/test-login
 * Body: { email: "user@example.com", password: "password123" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

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

    if (!hrmsSite.supabase_url || !hrmsSite.supabase_anon_key) {
      return NextResponse.json({
        error: "HRMS Supabase credentials not configured",
      }, { status: 400 });
    }

    // Create HRMS Supabase client with ANON KEY (for login test)
    const hrmsSupabase = createClient(
      hrmsSite.supabase_url,
      hrmsSite.supabase_anon_key
    );

    // Try to login
    const { data: authData, error: authError } = await hrmsSupabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    if (authError) {
      return NextResponse.json({
        success: false,
        error: authError.message,
        error_code: authError.status,
        details: {
          email_provided: email,
          email_normalized: email.toLowerCase().trim(),
          hrms_url: hrmsSite.supabase_url,
        },
        troubleshooting: {
          check_auth_users: "Visit /api/test/check-auth-users?email=" + encodeURIComponent(email),
          check_service_key: hrmsSite.supabase_service_key ? "✅ Set" : "❌ Missing",
          check_password: "Verify password matches what was set in dashboard",
        },
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed: !!authData.user.email_confirmed_at,
      },
      session: {
        access_token: authData.session?.access_token ? "✅ Present" : "❌ Missing",
        expires_at: authData.session?.expires_at,
      },
    });
  } catch (error: any) {
    console.error("Error testing login:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
