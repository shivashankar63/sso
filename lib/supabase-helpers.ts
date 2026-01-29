import { getSupabaseServerClient } from "./supabase";

/**
 * Helper functions for working with user profiles and app access
 * These functions work with Clerk user IDs
 */

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "manager" | "user";
  team: string | null;
  department: string | null;
  phone: string | null;
  clerk_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AppAccess {
  id: string;
  user_id: string;
  app_name: string;
  access_granted: boolean;
  granted_at: string;
  revoked_at: string | null;
}

/**
 * Get or create user profile from Clerk user data
 */
export async function getOrCreateUserProfile(
  clerkUserId: string,
  email: string,
  fullName?: string
): Promise<UserProfile | null> {
  const supabase = await getSupabaseServerClient();

  // Check if profile exists
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existing) {
    return existing as UserProfile;
  }

  // Create new profile
  const { data: newProfile, error } = await supabase
    .from("user_profiles")
    .insert({
      id: clerkUserId,
      clerk_user_id: clerkUserId,
      email,
      full_name: fullName || email.split("@")[0],
      role: "user",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user profile:", error);
    return null;
  }

  return newProfile as UserProfile;
}

/**
 * Get user profile by Clerk user ID
 */
export async function getUserProfile(
  clerkUserId: string
): Promise<UserProfile | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}

/**
 * Check if user has access to a specific app
 */
export async function hasAppAccess(
  clerkUserId: string,
  appName: string
): Promise<boolean> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("app_access")
    .select("access_granted")
    .eq("user_id", clerkUserId)
    .eq("app_name", appName)
    .eq("access_granted", true)
    .is("revoked_at", null)
    .single();

  if (error || !data) {
    return false;
  }

  return data.access_granted === true;
}

/**
 * Get all apps a user has access to
 */
export async function getUserApps(clerkUserId: string): Promise<string[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("app_access")
    .select("app_name")
    .eq("user_id", clerkUserId)
    .eq("access_granted", true)
    .is("revoked_at", null);

  if (error || !data) {
    return [];
  }

  return data.map((item) => item.app_name);
}

/**
 * Get user role
 */
export async function getUserRole(
  clerkUserId: string
): Promise<"admin" | "manager" | "user" | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as "admin" | "manager" | "user";
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  clerkUserId: string,
  eventType: string,
  appName?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  await supabase.from("audit_logs").insert({
    user_id: clerkUserId,
    event_type: eventType,
    app_name: appName,
    metadata: metadata || {},
  });
}
