import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Get table schema/columns for a specific site
 * GET /api/sites/[siteId]/table-schema?table=user_profiles
 */
export async function GET(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { siteId } = params;
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table") || "user_profiles";

    if (!siteId) {
      return NextResponse.json(
        { error: "Site ID is required" },
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

    // Try to get a sample row to detect columns
    // This is the most reliable way to detect available columns
    const { data: sampleRow, error: sampleError } = await siteSupabase
      .from(tableName)
      .select("*")
      .limit(1)
      .maybeSingle();

    if (sampleError) {
      // If table doesn't exist or has no rows, try to get schema info
      // We'll return a default schema based on site type
      const siteType = detectSiteType(site.name, site.category);
      return NextResponse.json({
        site: {
          id: site.id,
          name: site.name,
          display_name: site.display_name,
          category: site.category,
          type: siteType,
        },
        table: tableName,
        columns: getDefaultColumnsForSiteType(siteType, tableName),
        roles: getRolesForSiteType(siteType),
        has_data: false,
        error: sampleError.message,
      });
    }

    // Get columns from sample row
    const columns = sampleRow ? Object.keys(sampleRow) : [];
    
    // Detect site type for role information
    const siteType = detectSiteType(site.name, site.category);

    // Get available roles based on site type
    const roles = getRolesForSiteType(siteType);

    return NextResponse.json({
      site: {
        id: site.id,
        name: site.name,
        display_name: site.display_name,
        category: site.category,
        type: siteType,
      },
      table: tableName,
      columns: columns,
      roles: roles,
      has_data: true,
      sample_row: sampleRow, // Include sample for reference
    });
  } catch (error: any) {
    console.error("Error in GET /api/sites/[siteId]/table-schema:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

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
 * Get default columns for a site type (fallback if table is empty)
 */
function getDefaultColumnsForSiteType(siteType: string, tableName: string): string[] {
  if (tableName === 'users' && siteType === 'sales') {
    return ['id', 'email', 'full_name', 'role', 'phone', 'department', 'is_active', 'created_at', 'updated_at'];
  }
  if (tableName === 'employees' && siteType === 'hrms') {
    return ['id', 'email', 'full_name', 'role', 'department', 'employee_status', 'created_at', 'updated_at'];
  }
  if (tableName === 'hr_users' && siteType === 'cms') {
    return ['id', 'email', 'full_name', 'role', 'department', 'phone', 'created_at', 'updated_at'];
  }
  // Default user_profiles columns
  return ['id', 'clerk_user_id', 'email', 'full_name', 'avatar_url', 'role', 'team', 'department', 'phone', 'created_at', 'updated_at'];
}

/**
 * Get available roles for a site type
 */
function getRolesForSiteType(siteType: string): Array<{ value: string; label: string }> {
  switch (siteType) {
    case 'sales':
      return [
        { value: 'owner', label: 'Owner' },
        { value: 'manager', label: 'Manager' },
        { value: 'salesman', label: 'Salesman' },
      ];
    
    case 'hrms':
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'user', label: 'User' },
        { value: 'employee', label: 'Employee' },
      ];
    
    case 'cms':
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'hr', label: 'HR' },
        { value: 'editor', label: 'Editor' },
        { value: 'author', label: 'Author' },
        { value: 'user', label: 'User' },
      ];
    
    case 'garage':
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'mechanic', label: 'Mechanic' },
        { value: 'staff', label: 'Staff' },
      ];
    
    default:
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'user', label: 'User' },
      ];
  }
}
