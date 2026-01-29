import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Test HRMS Supabase connection
 * GET /api/test/hrms-connection
 */
export async function GET() {
  try {
    const hrmsSupabaseUrl = "https://snjtkvvmjqizdfyqbyzd.supabase.co";
    const hrmsAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuanRrdnZtanFpemRmeXFieXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzE3ODksImV4cCI6MjA2ODA0Nzc4OX0.cphGba1NoF7CqmeJqI-B9uJsLy1r18HHKFsmslT59GY";

    const supabase = createClient(hrmsSupabaseUrl, hrmsAnonKey);

    // Test connection
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({
          success: true,
          connected: true,
          message: "Connection successful, but user_profiles table doesn't exist yet",
          action: "Run site-supabase-schema.sql in HRMS Supabase",
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      connected: true,
      message: "Connection successful! HRMS Supabase is accessible",
      tableExists: true,
      userCount: data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message || "Connection failed",
      },
      { status: 500 }
    );
  }
}
