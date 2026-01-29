import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Check if user exists in CENTRAL dashboard database
 * GET /api/test/check-central-user?email=user@example.com
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

    // Check user_profiles in CENTRAL database
    const { data: profile, error: profileError } = await centralSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({
        error: "Error checking central database",
        details: profileError.message,
      }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({
        exists: false,
        message: "User does not exist in central dashboard",
        action: "Create user in dashboard first, then sync to HRMS",
      });
    }

    // Check sync status
    const { data: syncLogs } = await centralSupabase
      .from("user_sync_log")
      .select("site_id, status, error_message, synced_at")
      .eq("user_id", profile.id)
      .order("synced_at", { ascending: false })
      .limit(5);

    // Get HRMS site info
    const { data: hrmsSite } = await centralSupabase
      .from("connected_sites")
      .select("id, name, supabase_url, supabase_service_key")
      .eq("name", "hrms")
      .eq("is_active", true)
      .maybeSingle();

    return NextResponse.json({
      exists: true,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        has_password: !!profile.password_hash,
        password_hash: profile.password_hash ? "***set***" : null,
        role: profile.role,
        department: profile.department,
        created_at: profile.created_at,
      },
      hrms_site: {
        configured: !!hrmsSite,
        has_service_key: !!hrmsSite?.supabase_service_key,
        url: hrmsSite?.supabase_url,
      },
      sync_status: {
        has_sync_logs: syncLogs && syncLogs.length > 0,
        latest_sync: syncLogs?.[0],
        all_syncs: syncLogs,
      },
      next_steps: {
        if_no_password: "Add password in dashboard, then sync",
        if_no_service_key: "Set service key for HRMS site, then sync",
        if_ready: "Click 'Sync' button in dashboard to sync user to HRMS",
      },
    });
  } catch (error: any) {
    console.error("Error checking central user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
