"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ExternalLink, Trash2, CheckCircle, XCircle, Clock, Database, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase-client-simple";
import { SiteSupabaseConfig } from "./SiteSupabaseConfig";
import { SiteUsersModal } from "./SiteUsersModal";

interface ConnectedSite {
  id: string;
  name: string;
  display_name: string;
  url: string;
  icon: string | null;
  status: "active" | "pending" | "inactive" | "error";
  protocol: string;
  category: string | null;
  total_users: number;
  active_users: number;
  last_sync_at: string | null;
  description: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  supabase_service_key: string | null;
}

export function ConnectedSitesManager() {
  const [sites, setSites] = useState<ConnectedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [configuringSite, setConfiguringSite] = useState<string | null>(null);
  const [viewingUsersSite, setViewingUsersSite] = useState<ConnectedSite | null>(null);

  // Handler for opening users modal - memoized for production builds
  const handleCardClick = useCallback((site: ConnectedSite, event?: React.MouseEvent) => {
    if (event) {
      // Prevent any default behavior
      event.preventDefault();
    }
    console.log('Card clicked for site:', site.name);
    setViewingUsersSite(site);
  }, []);
  const [newSite, setNewSite] = useState({
    name: "",
    display_name: "",
    url: "",
    icon: "🌐",
    category: "",
    description: "",
  });

  useEffect(() => {
    // Only load on client side
    if (typeof window !== "undefined") {
      loadSites();
    }
  }, []);

  const loadSites = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client is not available. Please check your environment variables.");
      }
      
      const { data, error } = await supabase
        .from("connected_sites")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Loaded sites:", data); // Debug log
      setSites(data || []);
      
      // Update counts for sites that have Supabase credentials but count is 0 or null
      // This helps initialize counts for existing sites
      if (data && data.length > 0) {
        const sitesNeedingUpdate = data.filter(
          site => site.supabase_url && 
                  site.supabase_anon_key && 
                  (!site.total_users || site.total_users === 0)
        );
        
        if (sitesNeedingUpdate.length > 0) {
          console.log(`Updating counts for ${sitesNeedingUpdate.length} site(s)...`);
          const updatePromises = sitesNeedingUpdate.map(site => 
            fetch(`/api/sites/${site.id}/update-count`, { method: 'POST' })
              .then(res => res.json())
              .then(result => {
                console.log(`Updated count for ${site.name}: ${result.total_users || 0}`);
                return result;
              })
              .catch(err => {
                console.warn(`Failed to update count for site ${site.name}:`, err);
                return null;
              })
          );
          
          // Update counts in background and reload after a short delay
          Promise.all(updatePromises).then(() => {
            // Only reload if we actually updated some counts
            setTimeout(() => {
              loadSites();
            }, 1500);
          });
        }
      }
    } catch (error) {
      console.error("Error loading sites:", error);
      // Show error to user
      alert("Error loading sites: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client is not available. Please check your environment variables.");
      }
      const { data, error } = await supabase
        .from("connected_sites")
        .insert({
          ...newSite,
          status: "pending",
          protocol: "oauth",
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSites([data, ...sites]);
      setShowAddForm(false);
      setNewSite({
        name: "",
        display_name: "",
        url: "",
        icon: "🌐",
        category: "",
        description: "",
      });
    } catch (error: any) {
      console.error("Error adding site:", error);
      alert("Error adding site: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!confirm("Are you sure you want to remove this site?")) return;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client is not available. Please check your environment variables.");
      }
      const { error } = await supabase
        .from("connected_sites")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      setSites(sites.filter((site) => site.id !== id));
    } catch (error: any) {
      console.error("Error deleting site:", error);
      alert("Error removing site: " + (error.message || "Unknown error"));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading sites...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Connected Sites</h3>
          <p className="text-sm text-muted-foreground">
            Manage your connected websites and applications
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Site
        </Button>
      </div>

      {showAddForm && (
        <div className="border border-border rounded-lg p-4 bg-card">
          <form onSubmit={handleAddSite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Site Name *</label>
                <input
                  type="text"
                  required
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="hrms"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Display Name *</label>
                <input
                  type="text"
                  required
                  value={newSite.display_name}
                  onChange={(e) => setNewSite({ ...newSite, display_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="HRMS System"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">URL *</label>
              <input
                type="url"
                required
                value={newSite.url}
                onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="https://hrms.example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Icon</label>
                <input
                  type="text"
                  value={newSite.icon}
                  onChange={(e) => setNewSite({ ...newSite, icon: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="🌐"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <input
                  type="text"
                  value={newSite.category}
                  onChange={(e) => setNewSite({ ...newSite, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="hrms, cms, sales, etc."
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={newSite.description}
                onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={2}
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Add Site</Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {sites.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground mb-4">No sites connected yet</p>
          <Button onClick={() => setShowAddForm(true)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Site
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <div
              key={site.id}
              className="border border-border rounded-lg p-4 bg-card hover:shadow-md hover:border-primary/50 transition-all cursor-pointer select-none"
              onClick={(e) => {
                // Only trigger if clicking directly on the card or non-interactive elements
                const target = e.target as HTMLElement;
                if (target.closest('a') || target.closest('button')) {
                  return; // Don't trigger card click for links/buttons
                }
                handleCardClick(site, e);
              }}
              data-site-id={site.id}
              data-site-name={site.name}
              title="Click to view users for this site"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{site.icon || "🌐"}</div>
                  <div>
                    <h4 className="font-semibold text-foreground">{site.display_name}</h4>
                    <p className="text-xs text-muted-foreground">{site.name}</p>
                  </div>
                </div>
                {getStatusIcon(site.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {site.url}
                  </a>
                </div>
                {site.category && (
                  <div className="text-xs">
                    <span className="px-2 py-1 bg-muted rounded">{site.category}</span>
                  </div>
                )}
                {site.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {site.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {site.total_users} users
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setConfiguringSite(site.id)}
                    title="Configure Supabase Database"
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDeleteSite(site.id)}
                    title="Remove site"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supabase Configuration Modal */}
      {configuringSite && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setConfiguringSite(null);
            }
          }}
        >
          <div 
            className="bg-background border-2 border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ backgroundColor: 'hsl(var(--background))' }}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Configure Supabase Database
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfiguringSite(null)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
            {sites.find((s) => s.id === configuringSite) && (
              <SiteSupabaseConfig
                site={sites.find((s) => s.id === configuringSite)!}
                onUpdate={() => {
                  loadSites();
                  setConfiguringSite(null);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Site Users Modal */}
      {viewingUsersSite && (
        <SiteUsersModal
          site={viewingUsersSite}
          onClose={() => {
            setViewingUsersSite(null);
            // Refresh sites to update user counts
            loadSites();
          }}
        />
      )}
    </div>
  );
}
