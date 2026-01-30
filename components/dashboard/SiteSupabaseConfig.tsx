"use client";

import { useState } from "react";
import { Database, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase-client-simple";

interface Site {
  id: string;
  name: string;
  display_name: string;
  category?: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  supabase_service_key: string | null;
}

interface SiteSupabaseConfigProps {
  site: Site;
  onUpdate: () => void;
}

export function SiteSupabaseConfig({ site, onUpdate }: SiteSupabaseConfigProps) {
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supabase_url: site.supabase_url || "",
    supabase_anon_key: site.supabase_anon_key || "",
    supabase_service_key: site.supabase_service_key || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client is not available. Please check your environment variables.");
      }
      const { error } = await supabase
        .from("connected_sites")
        .update({
          supabase_url: formData.supabase_url,
          supabase_anon_key: formData.supabase_anon_key,
          supabase_service_key: formData.supabase_service_key || null,
        })
        .eq("id", site.id);

      if (error) throw error;

      alert("Supabase credentials saved!");
      onUpdate();
    } catch (error: any) {
      alert("Error saving: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.supabase_url || !formData.supabase_anon_key) {
      alert("Please enter Supabase URL and Anon Key first");
      return;
    }

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const testClient = createClient(formData.supabase_url, formData.supabase_anon_key);
      
      // Determine which table to check based on site category
      const siteCategory = site.category || site.name?.toLowerCase() || "";
      const isSales = siteCategory === "sales" || site.name?.toLowerCase() === "sales";
      const isHRMS = siteCategory === "hrms" || site.name?.toLowerCase() === "hrms";
      const isCMS = siteCategory === "cms" || site.name?.toLowerCase() === "cms";
      
      let tableName: string;
      let schemaFile: string;
      
      if (isSales) {
        tableName = "users";
        schemaFile = "sales-supabase-schema.sql";
      } else if (isCMS) {
        tableName = "hr_users"; // CMS uses hr_users table
        schemaFile = "cms-hr-users-schema.sql";
      } else if (isHRMS) {
        tableName = "employees";
        schemaFile = "site-supabase-schema.sql";
      } else {
        tableName = "user_profiles";
        schemaFile = "site-supabase-schema.sql";
      }
      
      // Try to query the table - this will fail if table doesn't exist OR if RLS blocks it
      const { data, error, count } = await testClient
        .from(tableName)
        .select("id", { count: 'exact' })
        .limit(1);
      
      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.code === "PGRST116" || error.message.includes("does not exist") || error.message.includes("relation") || error.message.includes("schema cache")) {
          const siteName = site.display_name || site.name || "this site";
          const supabaseProjectId = formData.supabase_url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "your-project";
          alert(`✅ Connection successful!\n\n⚠️ The ${tableName} table doesn't exist yet.\n\nPlease:\n1. Go to ${siteName} Supabase: ${formData.supabase_url.replace('/rest/v1', '')}\n2. Open SQL Editor\n3. Run ${schemaFile}\n\nMake sure you're running it in the ${siteName} Supabase (${supabaseProjectId}), NOT the central dashboard Supabase!`);
          return;
        }
        // If it's a permission/RLS error, table exists but we can't access it
        if (error.code === "42501" || error.message.includes("permission") || error.message.includes("policy")) {
          alert("✅ Connection successful!\n\n⚠️ Table exists but RLS policies may be blocking access.\n\nThis is OK - the table exists and is ready. The dashboard will use service role key for syncing users.\n\n✅ Connection verified!");
          return;
        }
        // Other errors
        throw error;
      }

      // Success! Table exists and we can query it
      const rowCount = count !== null ? count : (data ? data.length : 0);
      alert(`✅ Connection successful!\n\nThe site's Supabase is accessible and ${tableName} table exists.\n\nCurrent users in table: ${rowCount}\n\nReady to sync users!`);
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error";
      const siteCategory = site.category || site.name?.toLowerCase() || "";
      const isSales = siteCategory === "sales" || site.name?.toLowerCase() === "sales";
      const isCMS = siteCategory === "cms" || site.name?.toLowerCase() === "cms";
      const isHRMS = siteCategory === "hrms" || site.name?.toLowerCase() === "hrms";
      
      let tableName: string;
      let schemaFile: string;
      
      if (isSales) {
        tableName = "users";
        schemaFile = "sales-supabase-schema.sql";
      } else if (isCMS) {
        tableName = "hr_users";
        schemaFile = "cms-hr-users-schema.sql";
      } else if (isHRMS) {
        tableName = "employees";
        schemaFile = "site-supabase-schema.sql";
      } else {
        tableName = "user_profiles";
        schemaFile = "site-supabase-schema.sql";
      }
      
      if (errorMsg.includes("does not exist") || errorMsg.includes("relation") || errorMsg.includes("schema cache")) {
        const siteName = site.display_name || site.name || "this site";
        alert(`✅ Connection works, but ${tableName} table is missing.\n\nPlease run ${schemaFile} in the ${siteName} Supabase database.`);
      } else {
        alert("❌ Connection failed: " + errorMsg);
      }
    }
  };

  return (
    <div className="space-y-4" style={{ backgroundColor: 'transparent' }}>
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <h4 className="font-semibold text-foreground">
          Supabase Configuration for {site.display_name}
        </h4>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Supabase Project URL *
          </label>
          <input
            type="url"
            value={formData.supabase_url}
            onChange={(e) => setFormData({ ...formData, supabase_url: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            placeholder="https://xxxxx.supabase.co"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get this from your site's Supabase project settings
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Supabase Anon Key *
          </label>
          <div className="relative">
            <input
              type={showAnonKey ? "text" : "password"}
              value={formData.supabase_anon_key}
              onChange={(e) => setFormData({ ...formData, supabase_anon_key: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <button
              type="button"
              onClick={() => setShowAnonKey(!showAnonKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showAnonKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Get this from your site&apos;s Supabase project settings &gt; API (anon/public key)
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Supabase Service Key (Recommended)
          </label>
          <div className="relative">
            <input
              type={showServiceKey ? "text" : "password"}
              value={formData.supabase_service_key}
              onChange={(e) => setFormData({ ...formData, supabase_service_key: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)"
            />
            <button
              type="button"
              onClick={() => setShowServiceKey(!showServiceKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showServiceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ⚠️ Service key bypasses RLS policies - required for syncing users. Get from Supabase Settings &gt; API (service_role key)
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={loading || !formData.supabase_url || !formData.supabase_anon_key}
          size="sm"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Credentials
        </Button>
        {!formData.supabase_service_key && (
          <p className="text-xs text-yellow-600 mt-2">
            ⚠️ Service key not set. Sync may fail due to RLS policies. Add service key for reliable syncing.
          </p>
        )}
        <Button
          onClick={handleTestConnection}
          variant="outline"
          size="sm"
          disabled={!formData.supabase_url || !formData.supabase_anon_key}
        >
          Test Connection
        </Button>
      </div>

      {site.supabase_url && (
        <div className="mt-4 p-3 bg-muted/30 rounded text-xs border border-border">
          <p className="font-medium mb-1 text-foreground">Current Configuration:</p>
          <p className="text-muted-foreground">
            URL: {site.supabase_url.substring(0, 40)}...
          </p>
          <p className="text-muted-foreground">
            Anon Key: {site.supabase_anon_key ? "✅ Configured" : "❌ Not set"}
          </p>
          <p className="text-muted-foreground">
            Service Key: {site.supabase_service_key ? "✅ Configured (RLS bypass enabled)" : "❌ Not set (RLS may block writes)"}
          </p>
        </div>
      )}
    </div>
  );
}
