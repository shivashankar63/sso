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
 * Get list of tables to query based on site type
 */
function getTablesForSiteType(siteType: string, siteName: string, category: string | null): string[] {
  const name = (siteName || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  
  switch (siteType) {
    case 'sales':
      // Sales might have: users, sales_managers, managers, sales_team, etc.
      return [
        'sales_managers',
        'managers',
        'sales_team',
        'sales_users',
        'users',
        'user_profiles',
      ];
    
    case 'hrms':
      // HRMS might have: employees, user_profiles, staff, etc.
      return [
        'employees',
        'user_profiles',
        'staff',
        'hr_users',
        'users',
      ];
    
    case 'cms':
      // CMS might have: hr_users, users, editors, authors, user_profiles, etc.
      return [
        'hr_users', // CMS specific table
        'editors',
        'authors',
        'cms_users',
        'users',
        'user_profiles',
      ];
    
    case 'garage':
      // Garage might have: mechanics, staff, users, user_profiles, etc.
      return [
        'mechanics',
        'staff',
        'garage_users',
        'users',
        'user_profiles',
      ];
    
    default:
      // Generic sites: try common table names
      return [
        'user_profiles',
        'users',
        'employees',
        'staff',
        'managers',
      ];
  }
}

/**
 * Normalize role values across different site types
 */
function normalizeRole(role: string, siteType: string): string {
  const roleLower = role.toLowerCase().trim();
  
  // Sales-specific roles
  if (siteType === 'sales') {
    if (roleLower === 'owner' || roleLower === 'admin') return 'owner';
    if (roleLower === 'manager' || roleLower === 'sales_manager') return 'manager';
    if (roleLower === 'salesman' || roleLower === 'sales_rep' || roleLower === 'user') return 'salesman';
  }
  
  // CMS-specific roles
  if (siteType === 'cms') {
    if (roleLower === 'admin' || roleLower === 'administrator') return 'admin';
    if (roleLower === 'hr') return 'hr';
    if (roleLower === 'manager' || roleLower === 'user') return 'hr'; // Map manager/user to hr
    if (roleLower === 'editor') return 'editor';
    if (roleLower === 'author') return 'author';
    return role; // Return original for CMS-specific roles
  }
  
  // Generic role mapping
  if (roleLower === 'admin' || roleLower === 'administrator' || roleLower === 'owner') return 'admin';
  if (roleLower === 'manager' || roleLower === 'supervisor' || roleLower === 'lead') return 'manager';
  if (roleLower === 'user' || roleLower === 'employee' || roleLower === 'staff' || roleLower === 'member') return 'user';
  
  // Return original if no mapping found
  return role;
}

/**
 * Get all users from a specific site's Supabase database
 * GET /api/sites/[siteId]/users
 */
export async function GET(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { siteId } = params;

    if (!siteId) {
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }

    // Get central Supabase client to fetch site configuration
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
      console.error("Site not found:", siteError);
      return NextResponse.json(
        { error: "Site not found or inactive" },
        { status: 404 }
      );
    }

    // Check if site has Supabase credentials
    if (!site.supabase_url || (!site.supabase_anon_key && !site.supabase_service_key)) {
      return NextResponse.json(
        { error: "Site Supabase credentials not configured" },
        { status: 400 }
      );
    }

    // Create Supabase client for the site's database
    // Prefer service key if available (for better access), otherwise use anon key
    const siteSupabaseKey = site.supabase_service_key || site.supabase_anon_key!;
    const siteSupabase = createClient(site.supabase_url, siteSupabaseKey);

    // Detect site type to determine which tables to query
    const siteType = detectSiteType(site.name, site.category);
    console.log(`Detected site type: ${siteType} for site: ${site.name}`);

    // Get list of potential tables to query based on site type
    const tablesToQuery = getTablesForSiteType(siteType, site.name, site.category);
    console.log(`Querying tables: ${tablesToQuery.join(", ")}`);

    // Try to fetch users from all potential tables
    const allUsers: any[] = [];
    const errors: string[] = [];

    for (const tableName of tablesToQuery) {
      try {
        const { data, error } = await siteSupabase
          .from(tableName)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000); // Limit to prevent huge queries

        if (!error && data && data.length > 0) {
          console.log(`✅ Found ${data.length} users in ${tableName} table`);
          // Add table name to each user for tracking
          const usersWithTable = data.map((user: any) => ({
            ...user,
            _source_table: tableName,
          }));
          allUsers.push(...usersWithTable);
        } else if (error) {
          // Only log if it's not a "table doesn't exist" error
          if (!error.message?.includes("does not exist") && !error.message?.includes("relation") && !error.code?.includes("PGRST")) {
            console.warn(`⚠️ Error querying ${tableName}:`, error.message);
            errors.push(`${tableName}: ${error.message}`);
          }
        }
      } catch (err: any) {
        // Ignore table not found errors
        if (!err.message?.includes("does not exist") && !err.message?.includes("relation")) {
          console.warn(`⚠️ Exception querying ${tableName}:`, err.message);
          errors.push(`${tableName}: ${err.message}`);
        }
      }
    }

    // If no users found in any table, return helpful error
    if (allUsers.length === 0) {
      return NextResponse.json(
        {
          error: "No users found in any user table",
          details: `Checked tables: ${tablesToQuery.join(", ")}. Make sure the site database has at least one of these tables configured.`,
          checked_tables: tablesToQuery,
        },
        { status: 404 }
      );
    }

    // Remove duplicates based on email (users might exist in multiple tables)
    const uniqueUsers = new Map<string, any>();
    for (const user of allUsers) {
      const email = (user.email || "").toLowerCase().trim();
      if (email && !uniqueUsers.has(email)) {
        uniqueUsers.set(email, user);
      } else if (email) {
        // If duplicate, prefer user from more specific table (e.g., sales_managers over users)
        const existing = uniqueUsers.get(email);
        const currentTable = user._source_table || "";
        const existingTable = existing?._source_table || "";
        
        // Prefer more specific tables (longer names usually mean more specific)
        if (currentTable.length > existingTable.length) {
          uniqueUsers.set(email, user);
        }
      }
    }

    const users = Array.from(uniqueUsers.values());

    // Format users to ensure consistent structure
    const formattedUsers = users.map((user) => {
      // Handle different role field names and values
      let role = user.role || user.user_role || user.position || null;
      
      // Normalize role values for different site types
      if (role) {
        role = normalizeRole(role, siteType);
      }

      return {
        id: user.id || user.user_id || user.clerk_user_id || user.employee_id || "",
        clerk_user_id: user.clerk_user_id || null,
        email: user.email || "",
        full_name: user.full_name || user.name || user.display_name || user.employee_name || null,
        role: role,
        team: user.team || user.team_name || null,
        department: user.department || user.dept || user.department_name || null,
        phone: user.phone || user.phone_number || user.mobile || null,
        avatar_url: user.avatar_url || user.avatar || user.profile_picture || null,
        created_at: user.created_at || user.created_date || new Date().toISOString(),
        updated_at: user.updated_at || user.modified_at || user.created_at || new Date().toISOString(),
        source_table: user._source_table || null, // Track which table this user came from
      };
    });

    return NextResponse.json({
      site: {
        id: site.id,
        name: site.name,
        display_name: site.display_name,
        category: site.category,
        type: siteType,
      },
      users: formattedUsers,
      count: formattedUsers.length,
      tables_queried: tablesToQuery,
      tables_found: Array.from(new Set(formattedUsers.map(u => u.source_table).filter(Boolean))),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in GET /api/sites/[siteId]/users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
