import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * List ALL users in central dashboard and HRMS
 * GET /api/test/list-all-users
 */
export async function GET(request: Request) {
  try {
    // Get central Supabase client
    const centralSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get all users from central dashboard
    const { data: centralUsers, error: centralError } = await centralSupabase
      .from("user_profiles")
      .select("id, email, full_name, password_hash, created_at")
      .order("created_at", { ascending: false });

    // Get HRMS site configuration
    const { data: hrmsSite, error: siteError } = await centralSupabase
      .from("connected_sites")
      .select("id, name, supabase_url, supabase_anon_key, supabase_service_key")
      .eq("name", "hrms")
      .eq("is_active", true)
      .maybeSingle();

    let hrmsUsers = null;
    let hrmsAuthUsers = null;
    let hrmsEmployees = null;
    let hrmsError = null;

    if (hrmsSite?.supabase_url && hrmsSite?.supabase_service_key) {
      // Create HRMS Supabase client with SERVICE KEY
      const hrmsSupabase = createClient(
        hrmsSite.supabase_url,
        hrmsSite.supabase_service_key
      );

      // Get users from HRMS user_profiles
      const { data: hrmsProfiles, error: hrmsProfilesError } = await hrmsSupabase
        .from("user_profiles")
        .select("id, email, full_name, password_hash, created_at")
        .order("created_at", { ascending: false });

      if (!hrmsProfilesError) {
        hrmsUsers = hrmsProfiles;
      } else {
        hrmsError = hrmsProfilesError.message;
      }

      // Get auth.users (requires service key)
      try {
        const { data: authUsersData } = await hrmsSupabase.auth.admin.listUsers();
        hrmsAuthUsers = authUsersData?.users?.map(u => ({
          id: u.id,
          email: u.email,
          email_confirmed: !!u.email_confirmed_at,
          created_at: u.created_at,
        })) || [];
      } catch (authError: any) {
        hrmsError = hrmsError || authError.message;
      }

      // Get employees
      const { data: employees, error: empError } = await hrmsSupabase
        .from("employees")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false });

      if (!empError) {
        hrmsEmployees = employees;
      }
    }

    return NextResponse.json({
      central_database: {
        total_users: centralUsers?.length || 0,
        users: centralUsers || [],
        error: centralError?.message,
      },
      hrms_database: {
        configured: !!hrmsSite,
        has_service_key: !!hrmsSite?.supabase_service_key,
        url: hrmsSite?.supabase_url,
        user_profiles: {
          total: hrmsUsers?.length || 0,
          users: hrmsUsers || [],
        },
        auth_users: {
          total: hrmsAuthUsers?.length || 0,
          users: hrmsAuthUsers || [],
        },
        employees: {
          total: hrmsEmployees?.length || 0,
          users: hrmsEmployees || [],
        },
        error: hrmsError,
      },
      comparison: {
        central_emails: centralUsers?.map(u => u.email.toLowerCase().trim()) || [],
        hrms_emails: hrmsUsers?.map(u => u.email.toLowerCase().trim()) || [],
        hrms_auth_emails: hrmsAuthUsers?.map(u => u.email?.toLowerCase().trim()).filter(Boolean) || [],
        missing_in_hrms: centralUsers?.filter(
          cu => !hrmsUsers?.some(hu => hu.email.toLowerCase().trim() === cu.email.toLowerCase().trim())
        ).map(u => u.email) || [],
      },
    });
  } catch (error: any) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
