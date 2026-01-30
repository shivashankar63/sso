import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Detect site type based on name or category
 */
function detectSiteType(siteName: string, category: string | null): 'hrms' | 'sales' | 'cms' | 'garage' | 'generic' {
  const name = siteName.toLowerCase();
  const cat = (category || '').toLowerCase();
  
  if (name.includes('hrms') || cat === 'hrms' || name.includes('hr')) {
    return 'hrms';
  }
  if (name.includes('sales') || cat === 'sales') {
    return 'sales';
  }
  if (name.includes('cms') || cat === 'cms') {
    return 'cms';
  }
  if (name.includes('garage') || cat === 'garage') {
    return 'garage';
  }
  return 'generic';
}

/**
 * Get table name for a site type (prioritize more specific tables)
 */
function getPrimaryTableForSite(siteType: string, sourceTable: string | null): string {
  // If source table is provided, use it
  if (sourceTable) {
    return sourceTable;
  }

  // Otherwise, use default based on site type
  switch (siteType) {
    case 'sales':
      return 'users';
    case 'hrms':
      return 'employees';
    case 'cms':
      return 'hr_users'; // CMS uses hr_users table
    default:
      return 'user_profiles';
  }
}

/**
 * Update user in site database
 * PATCH /api/sites/[siteId]/users/[userId]
 */
export async function PATCH(
  request: Request,
  { params }: { params: { siteId: string; userId: string } }
) {
  try {
    const { siteId, userId } = params;
    const body = await request.json();
    const { source_table, ...updateData } = body;

    if (!siteId || !userId) {
      return NextResponse.json(
        { error: "Site ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get central Supabase client
    const centralSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const centralSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!centralSupabaseUrl || !centralSupabaseAnonKey) {
      return NextResponse.json(
        { error: "Central Supabase configuration missing" },
        { status: 500 }
      );
    }

    const centralSupabase = createClient(
      centralSupabaseUrl,
      centralSupabaseAnonKey
    );

    // Get site configuration
    const { data: site, error: siteError } = await centralSupabase
      .from("connected_sites")
      .select("id, name, display_name, category, supabase_url, supabase_anon_key, supabase_service_key")
      .eq("id", siteId)
      .eq("is_active", true)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found or inactive" },
        { status: 404 }
      );
    }

    if (!site.supabase_url || (!site.supabase_anon_key && !site.supabase_service_key)) {
      return NextResponse.json(
        { error: "Site Supabase credentials not configured" },
        { status: 400 }
      );
    }

    // Create Supabase client for the site's database
    const siteSupabaseKey = site.supabase_service_key || site.supabase_anon_key!;
    const siteSupabase = createClient(site.supabase_url, siteSupabaseKey);

    // Detect site type and determine table
    const siteType = detectSiteType(site.name, site.category);
    const tableName = getPrimaryTableForSite(siteType, source_table);

    // First, fetch the existing user to see what columns are available
    let existingUser: any = null;
    
    // Try to find by ID first
    const { data: userById, error: fetchErrorById } = await siteSupabase
      .from(tableName)
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (userById) {
      existingUser = userById;
    } else {
      // Try by email if ID doesn't work
      if (updateData.email) {
        const { data: userByEmail } = await siteSupabase
          .from(tableName)
          .select("*")
          .eq("email", updateData.email)
          .maybeSingle();
        
        if (userByEmail) {
          existingUser = userByEmail;
        }
      }
    }

    if (!existingUser) {
      return NextResponse.json(
        { 
          error: "User not found in the specified table",
          details: `Could not find user with ID "${userId}" in table "${tableName}". Please verify the user exists.`
        },
        { status: 404 }
      );
    }

    // Get available columns from the existing user
    const availableColumns = Object.keys(existingUser);
    console.log(`Available columns in ${tableName}:`, availableColumns);

    // Prepare update data - only include columns that exist
    const updatePayload: any = {};

    // Map fields to correct column names based on what exists
    if (updateData.full_name !== undefined) {
      if (availableColumns.includes('full_name')) {
        updatePayload.full_name = updateData.full_name;
      } else if (availableColumns.includes('name')) {
        updatePayload.name = updateData.full_name;
      } else if (availableColumns.includes('display_name')) {
        updatePayload.display_name = updateData.full_name;
      } else if (availableColumns.includes('employee_name')) {
        updatePayload.employee_name = updateData.full_name;
      }
    }

    if (updateData.email !== undefined && availableColumns.includes('email')) {
      updatePayload.email = updateData.email;
    }

    if (updateData.role !== undefined) {
      // Map role for CMS: admin → admin, manager/user → hr
      let mappedRole = updateData.role;
      if (siteType === 'cms') {
        const roleLower = updateData.role.toLowerCase();
        if (roleLower === 'admin' || roleLower === 'administrator') {
          mappedRole = 'admin';
        } else if (roleLower === 'manager' || roleLower === 'user') {
          mappedRole = 'hr';
        }
        // Keep editor, author, hr as-is
      }
      
      if (availableColumns.includes('role')) {
        updatePayload.role = mappedRole;
      } else if (availableColumns.includes('user_role')) {
        updatePayload.user_role = mappedRole;
      } else if (availableColumns.includes('position')) {
        updatePayload.position = mappedRole;
      }
    }

    if (updateData.department !== undefined) {
      if (availableColumns.includes('department')) {
        updatePayload.department = updateData.department;
      } else if (availableColumns.includes('dept')) {
        updatePayload.dept = updateData.department;
      } else if (availableColumns.includes('department_name')) {
        updatePayload.department_name = updateData.department;
      }
    }

    if (updateData.team !== undefined) {
      if (availableColumns.includes('team')) {
        updatePayload.team = updateData.team;
      } else if (availableColumns.includes('team_name')) {
        updatePayload.team_name = updateData.team;
      }
    }

    if (updateData.phone !== undefined) {
      if (availableColumns.includes('phone')) {
        updatePayload.phone = updateData.phone;
      } else if (availableColumns.includes('phone_number')) {
        updatePayload.phone_number = updateData.phone;
      } else if (availableColumns.includes('mobile')) {
        updatePayload.mobile = updateData.phone;
      }
    }

    if (updateData.avatar_url !== undefined) {
      if (availableColumns.includes('avatar_url')) {
        updatePayload.avatar_url = updateData.avatar_url;
      } else if (availableColumns.includes('avatar')) {
        updatePayload.avatar = updateData.avatar_url;
      } else if (availableColumns.includes('profile_picture')) {
        updatePayload.profile_picture = updateData.avatar_url;
      }
    }

    // Add updated_at timestamp if column exists
    if (availableColumns.includes('updated_at')) {
      updatePayload.updated_at = new Date().toISOString();
    } else if (availableColumns.includes('modified_at')) {
      updatePayload.modified_at = new Date().toISOString();
    }

    // Check if there's anything to update
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { 
          error: "No valid columns to update",
          details: `Available columns in ${tableName}: ${availableColumns.join(", ")}`,
          available_columns: availableColumns
        },
        { status: 400 }
      );
    }

    console.log(`Updating columns in ${tableName}:`, Object.keys(updatePayload));

    // Try to update the user
    // First, try to find the user by ID
    let updateResult;
    let updateError;

    // Try update by ID (most common)
    const { data: updateData_result, error: updateError_result } = await siteSupabase
      .from(tableName)
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (!updateError_result) {
      updateResult = updateData_result;
    } else {
      // If ID doesn't work, try email
      if (updateData.email) {
        const { data: emailUpdateData, error: emailUpdateError } = await siteSupabase
          .from(tableName)
          .update(updatePayload)
          .eq("email", updateData.email)
          .select()
          .single();

        if (!emailUpdateError) {
          updateResult = emailUpdateData;
        } else {
          updateError = emailUpdateError;
        }
      } else {
        updateError = updateError_result;
      }
    }

    if (updateError || !updateResult) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        {
          error: `Failed to update user: ${updateError?.message || "Unknown error"}`,
          details: `Tried to update in table: ${tableName}`,
        },
        { status: 500 }
      );
    }

    // Update user count for the site
    try {
      const updateCountUrl = new URL(`/api/sites/${siteId}/update-count`, request.url);
      await fetch(updateCountUrl.toString(), { method: 'POST' });
    } catch (countError) {
      console.warn("Failed to update user count:", countError);
      // Don't fail the request if count update fails
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updateResult,
      table: tableName,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/sites/[siteId]/users/[userId]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Delete user from site database
 * DELETE /api/sites/[siteId]/users/[userId]
 */
export async function DELETE(
  request: Request,
  { params }: { params: { siteId: string; userId: string } }
) {
  try {
    const { siteId, userId } = params;
    let source_table: string | null = null;
    
    // Try to get source_table from request body (optional)
    try {
      const body = await request.json();
      source_table = body.source_table || null;
    } catch {
      // Request body is empty or invalid, that's okay
    }

    if (!siteId || !userId) {
      return NextResponse.json(
        { error: "Site ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get central Supabase client
    const centralSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const centralSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!centralSupabaseUrl || !centralSupabaseAnonKey) {
      return NextResponse.json(
        { error: "Central Supabase configuration missing" },
        { status: 500 }
      );
    }

    const centralSupabase = createClient(
      centralSupabaseUrl,
      centralSupabaseAnonKey
    );

    // Get site configuration
    const { data: site, error: siteError } = await centralSupabase
      .from("connected_sites")
      .select("id, name, display_name, category, supabase_url, supabase_anon_key, supabase_service_key")
      .eq("id", siteId)
      .eq("is_active", true)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found or inactive" },
        { status: 404 }
      );
    }

    if (!site.supabase_url || (!site.supabase_anon_key && !site.supabase_service_key)) {
      return NextResponse.json(
        { error: "Site Supabase credentials not configured" },
        { status: 400 }
      );
    }

    // Create Supabase client for the site's database
    // Use service key for delete operations (more permissions)
    const siteSupabaseKey = site.supabase_service_key || site.supabase_anon_key!;
    const siteSupabase = createClient(site.supabase_url, siteSupabaseKey);

    // Detect site type and determine table
    const siteType = detectSiteType(site.name, site.category);
    const tableName = getPrimaryTableForSite(siteType, source_table);

    // Try to delete the user
    // First, try to find the user to get their email (for better error messages)
    const { data: userData } = await siteSupabase
      .from(tableName)
      .select("email, id")
      .eq("id", userId)
      .maybeSingle();

    // Delete by ID
    const { error: deleteError } = await siteSupabase
      .from(tableName)
      .delete()
      .eq("id", userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json(
        {
          error: `Failed to delete user: ${deleteError.message || "Unknown error"}`,
          details: `Tried to delete from table: ${tableName}`,
        },
        { status: 500 }
      );
    }

    // If user was found in auth.users (for sites that use it), try to delete from there too
    if (site.supabase_service_key && userData) {
      try {
        // Try to delete from auth.users if it exists
        const authSupabase = createClient(site.supabase_url, site.supabase_service_key);
        const { data: authUsers } = await authSupabase.auth.admin.listUsers();
        const authUser = authUsers?.users?.find((u: any) => u.email === userData.email);
        
        if (authUser) {
          await authSupabase.auth.admin.deleteUser(authUser.id);
          console.log(`Also deleted auth user: ${authUser.id}`);
        }
      } catch (authError: any) {
        // Ignore auth deletion errors - user might not exist in auth.users
        console.log("Note: Could not delete from auth.users (might not exist):", authError.message);
      }
    }

    // Update user count for the site
    try {
      const updateCountUrl = new URL(`/api/sites/${siteId}/update-count`, request.url);
      await fetch(updateCountUrl.toString(), { method: 'POST' });
    } catch (countError) {
      console.warn("Failed to update user count:", countError);
      // Don't fail the request if count update fails
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      table: tableName,
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/sites/[siteId]/users/[userId]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
