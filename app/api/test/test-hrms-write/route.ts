import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Test writing to HRMS database directly
 * POST /api/test/test-hrms-write
 * Body: { email: string, testData: any }
 */
export async function POST(request: Request) {
  try {
    const { email, testData } = await request.json();

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

    if (!hrmsSite.supabase_url) {
      return NextResponse.json({
        error: "HRMS Supabase URL not configured",
      }, { status: 400 });
    }

    const results: any = {
      site: hrmsSite.name,
      url: hrmsSite.supabase_url,
      tests: [],
    };

    // Test 1: Try with anon key
    if (hrmsSite.supabase_anon_key) {
      try {
        const anonSupabase = createClient(
          hrmsSite.supabase_url,
          hrmsSite.supabase_anon_key
        );

        // Try to read first
        const { data: readData, error: readError } = await anonSupabase
          .from("user_profiles")
          .select("count")
          .limit(1);

        results.tests.push({
          method: "Anon Key - Read",
          success: !readError,
          error: readError?.message,
          code: readError?.code,
        });

        // Try to write
        const testId = `test_${Date.now()}`;
        const { data: writeData, error: writeError } = await anonSupabase
          .from("user_profiles")
          .upsert({
            id: testId,
            email: `test_${email}`,
            full_name: "Test User",
            password_hash: "test123",
          }, { onConflict: 'id' })
          .select()
          .single();

        results.tests.push({
          method: "Anon Key - Write",
          success: !writeError,
          error: writeError?.message,
          code: writeError?.code,
          data: writeData,
        });

        // Clean up test data
        if (!writeError) {
          await anonSupabase.from("user_profiles").delete().eq("id", testId);
        }
      } catch (error: any) {
        results.tests.push({
          method: "Anon Key - Error",
          success: false,
          error: error.message,
        });
      }
    }

    // Test 2: Try with service key
    if (hrmsSite.supabase_service_key) {
      try {
        const serviceSupabase = createClient(
          hrmsSite.supabase_url,
          hrmsSite.supabase_service_key
        );

        const testId = `test_service_${Date.now()}`;
        const { data: writeData, error: writeError } = await serviceSupabase
          .from("user_profiles")
          .upsert({
            id: testId,
            email: `test_service_${email}`,
            full_name: "Test User (Service Key)",
            password_hash: "test123",
          }, { onConflict: 'id' })
          .select()
          .single();

        results.tests.push({
          method: "Service Key - Write",
          success: !writeError,
          error: writeError?.message,
          code: writeError?.code,
          data: writeData,
        });

        // Clean up test data
        if (!writeError) {
          await serviceSupabase.from("user_profiles").delete().eq("id", testId);
        }
      } catch (error: any) {
        results.tests.push({
          method: "Service Key - Error",
          success: false,
          error: error.message,
        });
      }
    } else {
      results.tests.push({
        method: "Service Key",
        success: false,
        error: "Service key not configured",
      });
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error testing HRMS write:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
