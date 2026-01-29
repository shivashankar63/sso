import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Debug sync - Test writing directly to HRMS
 * POST /api/test/debug-sync
 * Body: { email: string }
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const debug: any[] = [];

    // Step 1: Get user from central
    debug.push({ step: "1. Get user from central", status: "starting" });
    const centralSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: user, error: userError } = await centralSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (userError || !user) {
      debug.push({ step: "1. Get user from central", status: "error", error: userError?.message });
      return NextResponse.json({ error: "User not found", debug }, { status: 404 });
    }
    debug.push({ step: "1. Get user from central", status: "success", data: { id: user.id, email: user.email } });

    // Step 2: Get HRMS site config
    debug.push({ step: "2. Get HRMS site config", status: "starting" });
    const { data: hrmsSite, error: siteError } = await centralSupabase
      .from("connected_sites")
      .select("id, name, supabase_url, supabase_anon_key, supabase_service_key")
      .eq("name", "hrms")
      .eq("is_active", true)
      .single();

    if (siteError || !hrmsSite) {
      debug.push({ step: "2. Get HRMS site config", status: "error", error: siteError?.message });
      return NextResponse.json({ error: "HRMS site not found", debug }, { status: 404 });
    }

    debug.push({
      step: "2. Get HRMS site config",
      status: "success",
      data: {
        url: hrmsSite.supabase_url,
        has_anon_key: !!hrmsSite.supabase_anon_key,
        has_service_key: !!hrmsSite.supabase_service_key,
      },
    });

    if (!hrmsSite.supabase_url) {
      return NextResponse.json({ error: "HRMS URL not configured", debug }, { status: 400 });
    }

    // Step 3: Create HRMS client with service key
    debug.push({ step: "3. Create HRMS client", status: "starting" });
    const supabaseKey = hrmsSite.supabase_service_key || hrmsSite.supabase_anon_key;
    if (!supabaseKey) {
      return NextResponse.json({ error: "No Supabase key configured", debug }, { status: 400 });
    }

    const hrmsSupabase = createClient(hrmsSite.supabase_url, supabaseKey);
    debug.push({
      step: "3. Create HRMS client",
      status: "success",
      using_service_key: !!hrmsSite.supabase_service_key,
    });

    // Step 4: Check if user_profiles table exists
    debug.push({ step: "4. Check user_profiles table", status: "starting" });
    const { data: tableCheck, error: tableError } = await hrmsSupabase
      .from("user_profiles")
      .select("id")
      .limit(1);

    if (tableError) {
      debug.push({
        step: "4. Check user_profiles table",
        status: "error",
        error: tableError.message,
        code: tableError.code,
      });
      if (tableError.code === "PGRST116") {
        return NextResponse.json({
          error: "user_profiles table does not exist in HRMS",
          debug,
          fix: "Run hrms-ensure-user-profiles.sql in HRMS Supabase",
        }, { status: 500 });
      }
    } else {
      debug.push({ step: "4. Check user_profiles table", status: "success", table_exists: true });
    }

    // Step 5: Write user
    debug.push({ step: "5. Write user to HRMS", status: "starting" });
    const { data: writeData, error: writeError } = await hrmsSupabase
      .from("user_profiles")
      .upsert({
        id: user.id,
        clerk_user_id: user.clerk_user_id || null,
        email: user.email,
        full_name: user.full_name || null,
        password_hash: (user as any).password_hash || null,
        role: user.role || 'user',
        department: user.department || null,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (writeError) {
      debug.push({
        step: "5. Write user to HRMS",
        status: "error",
        error: writeError.message,
        code: writeError.code,
        details: writeError,
      });
      return NextResponse.json({
        error: `Failed to write: ${writeError.message}`,
        debug,
      }, { status: 500 });
    }
    debug.push({
      step: "5. Write user to HRMS",
      status: "success",
      data: { id: writeData.id, email: writeData.email },
    });

    // Step 6: Verify write
    debug.push({ step: "6. Verify write", status: "starting" });
    const { data: verifyData, error: verifyError } = await hrmsSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (verifyError || !verifyData) {
      debug.push({
        step: "6. Verify write",
        status: "error",
        error: verifyError?.message || "User not found after write",
      });
      return NextResponse.json({
        error: "Write appeared successful but user not found",
        debug,
        warning: "RLS policies may be blocking reads",
      }, { status: 500 });
    }
    debug.push({
      step: "6. Verify write",
      status: "success",
      data: { id: verifyData.id, email: verifyData.email, hasPassword: !!verifyData.password_hash },
    });

    return NextResponse.json({
      success: true,
      message: "User successfully written and verified in HRMS",
      debug,
      user: {
        id: verifyData.id,
        email: verifyData.email,
        hasPassword: !!verifyData.password_hash,
      },
    });
  } catch (error: any) {
    console.error("Debug sync error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
