// Test script to verify HRMS Supabase connection
// You can run this in your browser console or create a test API route

import { createClient } from "@supabase/supabase-js";

const hrmsSupabaseUrl = "https://snjtkvvmjqizdfyqbyzd.supabase.co";
const hrmsAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuanRrdnZtanFpemRmeXFieXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzE3ODksImV4cCI6MjA2ODA0Nzc4OX0.cphGba1NoF7CqmeJqI-B9uJsLy1r18HHKFsmslT59GY";

async function testHRMSConnection() {
  try {
    const supabase = createClient(hrmsSupabaseUrl, hrmsAnonKey);
    
    // Test connection by checking if user_profiles table exists
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1);
    
    if (error) {
      if (error.code === "PGRST116") {
        console.log("⚠️ Connection works, but user_profiles table doesn't exist yet");
        console.log("Run site-supabase-schema.sql in HRMS Supabase");
      } else {
        throw error;
      }
    } else {
      console.log("✅ Connection successful! HRMS Supabase is accessible");
      console.log("✅ user_profiles table exists");
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Export for use in API route or call directly
export { testHRMSConnection };
