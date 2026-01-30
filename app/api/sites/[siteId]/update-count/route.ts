import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Update the user count for a specific site
 * POST /api/sites/[siteId]/update-count
 */
export async function POST(
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

    // Get central Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const centralSupabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get site configuration
    const { data: site, error: siteError } = await centralSupabase
      .from("connected_sites")
      .select("id, name, category, supabase_url, supabase_anon_key, supabase_service_key")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    if (!site.supabase_url || !site.supabase_anon_key) {
      return NextResponse.json(
        { error: "Site Supabase configuration missing" },
        { status: 400 }
      );
    }

    // Connect to target site's Supabase
    const targetSupabase = createClient(
      site.supabase_url,
      site.supabase_service_key || site.supabase_anon_key
    );

    // Detect site type
    const siteType = site.category?.toLowerCase() || "generic";
    
    // Get list of potential user tables based on site type
    let userTables: string[] = [];
    
    switch (siteType) {
      case 'hrms':
        userTables = ['employees', 'user_profiles', 'users'];
        break;
      case 'sales':
        userTables = ['users', 'sales_managers', 'salesmen', 'user_profiles'];
        break;
      case 'cms':
        userTables = ['hr_users', 'editors', 'authors', 'cms_users', 'users', 'user_profiles'];
        break;
      default:
        userTables = ['user_profiles', 'users'];
    }

    // Count users from all potential tables
    let totalCount = 0;
    const countedEmails = new Set<string>();
    const countedIds = new Set<string>();

    for (const tableName of userTables) {
      try {
        // Try to get count from this table
        const { data, error } = await targetSupabase
          .from(tableName)
          .select("email, id");

        if (error) {
          // Check if it's a "relation does not exist" error
          if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log(`Table ${tableName} does not exist, skipping...`);
            continue;
          }
          console.warn(`Error querying table ${tableName}:`, error.message);
          continue;
        }

        if (data && Array.isArray(data)) {
          // Count unique users (by email or id)
          for (const row of data) {
            const email = row.email;
            const id = row.id;
            
            // Use email as primary identifier, fallback to id
            if (email) {
              if (!countedEmails.has(email)) {
                countedEmails.add(email);
                totalCount++;
              }
            } else if (id) {
              // If no email, use id as identifier
              const idStr = String(id);
              if (!countedIds.has(idStr)) {
                countedIds.add(idStr);
                totalCount++;
              }
            }
          }
          console.log(`Found ${data.length} rows in ${tableName}, total unique count: ${totalCount}`);
        }
      } catch (err: any) {
        // Table doesn't exist or error, skip it
        console.log(`Table ${tableName} error:`, err.message || err);
      }
    }
    
    console.log(`Total unique users counted for site ${site.name}: ${totalCount}`);

    // Update the count in central database
    const { error: updateError } = await centralSupabase
      .from("connected_sites")
      .update({ 
        total_users: totalCount,
        updated_at: new Date().toISOString()
      })
      .eq("id", siteId);

    if (updateError) {
      console.error("Error updating user count:", updateError);
      return NextResponse.json(
        { error: "Failed to update user count", details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully updated user count for site ${site.name} (${siteId}): ${totalCount} users`);

    return NextResponse.json({
      success: true,
      total_users: totalCount,
      site_id: siteId,
      site_name: site.name,
      message: `User count updated to ${totalCount}`,
    });
  } catch (error: any) {
    console.error("Error updating user count:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
