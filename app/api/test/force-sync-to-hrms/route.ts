import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Force sync a user to HRMS with detailed logging
 * POST /api/test/force-sync-to-hrms
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

    // Get central Supabase client
    const centralSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user from central database
    const { data: user, error: userError } = await centralSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (userError || !user) {
      return NextResponse.json({
        error: "User not found in central database",
        details: userError?.message,
      }, { status: 404 });
    }

    // Get HRMS site
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

    if (!hrmsSite.supabase_url) {
      return NextResponse.json({
        error: "HRMS Supabase URL not configured",
      }, { status: 400 });
    }

    // Use service key if available, otherwise anon key
    const supabaseKey = hrmsSite.supabase_service_key || hrmsSite.supabase_anon_key;
    const usingServiceKey = !!hrmsSite.supabase_service_key;

    if (!supabaseKey) {
      return NextResponse.json({
        error: "HRMS Supabase credentials not configured",
      }, { status: 400 });
    }

    const hrmsSupabase = createClient(hrmsSite.supabase_url, supabaseKey);

    const steps: any[] = [];

    // Step 1: Check if user exists
    steps.push({ step: "1. Check existing user", status: "checking" });
    const { data: existingUser, error: checkError } = await hrmsSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (checkError) {
      steps.push({ step: "1. Check existing user", status: "error", error: checkError.message });
    } else if (existingUser) {
      steps.push({ step: "1. Check existing user", status: "found", data: { id: existingUser.id, email: existingUser.email } });
    } else {
      steps.push({ step: "1. Check existing user", status: "not_found" });
    }

    // Step 2: Write user
    steps.push({ step: "2. Write user to HRMS", status: "writing" });
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
      steps.push({ step: "2. Write user to HRMS", status: "error", error: writeError.message, code: writeError.code });
      return NextResponse.json({
        error: "Failed to write user",
        steps,
        usingServiceKey,
        hrmsUrl: hrmsSite.supabase_url,
      }, { status: 500 });
    } else {
      steps.push({ step: "2. Write user to HRMS", status: "success", data: { id: writeData.id, email: writeData.email } });
    }

    // Step 3: Verify write
    steps.push({ step: "3. Verify write", status: "verifying" });
    const { data: verifyData, error: verifyError } = await hrmsSupabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (verifyError || !verifyData) {
      steps.push({ step: "3. Verify write", status: "error", error: verifyError?.message || "User not found after write" });
      return NextResponse.json({
        error: "Write appeared successful but user not found in database",
        steps,
        usingServiceKey,
        warning: "This suggests RLS policies are blocking reads. Use service key or fix RLS policies.",
      }, { status: 500 });
    } else {
      steps.push({ step: "3. Verify write", status: "success", data: { id: verifyData.id, email: verifyData.email, hasPassword: !!verifyData.password_hash } });
    }

    return NextResponse.json({
      success: true,
      message: "User successfully synced and verified in HRMS",
      steps,
      usingServiceKey,
      user: {
        id: verifyData.id,
        email: verifyData.email,
        hasPassword: !!verifyData.password_hash,
      },
    });
  } catch (error: any) {
    console.error("Error in force sync:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
