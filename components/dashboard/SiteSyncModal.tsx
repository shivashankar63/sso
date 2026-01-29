"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase-client-simple";

interface ConnectedSite {
  id: string;
  name: string;
  display_name: string;
  url: string;
  icon: string | null;
  status: string;
  supabase_url: string | null;
  supabase_anon_key: string | null;
}

interface SiteSyncModalProps {
  userId: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export function SiteSyncModal({
  userId,
  userEmail,
  isOpen,
  onClose,
  onSyncComplete,
}: SiteSyncModalProps) {
  const [sites, setSites] = useState<ConnectedSite[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<Record<string, { status: string; message?: string; error?: string }>>({});

  useEffect(() => {
    // Only load on client side
    if (isOpen && typeof window !== "undefined") {
      loadSites();
    }
  }, [isOpen]);

  const loadSites = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error("Supabase client is not available");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("connected_sites")
        .select("id, name, display_name, url, icon, status, supabase_url, supabase_anon_key")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error("Error loading sites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSite = (siteId: string) => {
    setSelectedSites((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSelectAll = () => {
    const configuredSites = sites
      .filter((s) => s.supabase_url && s.supabase_anon_key)
      .map((s) => s.id);
    setSelectedSites(configuredSites);
  };

  const handleDeselectAll = () => {
    setSelectedSites([]);
  };

  const handleSync = async () => {
    if (selectedSites.length === 0) {
      alert("Please select at least one site to sync to.");
      return;
    }

    setSyncing(true);
    setSyncResults({});

    try {
      // If single site, use individual sync endpoint
      if (selectedSites.length === 1) {
        const response = await fetch("/api/sync/user-to-site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            siteId: selectedSites[0],
          }),
        });

        const result = await response.json();
        const site = sites.find((s) => s.id === selectedSites[0]);
        setSyncResults({
          [selectedSites[0]]: {
            status: result.success ? "success" : "failed",
            message: result.message,
            error: result.error,
          },
        });

        if (result.success) {
          setTimeout(() => {
            onSyncComplete();
            onClose();
          }, 1500);
        }
      } else {
        // Multiple sites - use batch sync endpoint
        const response = await fetch("/api/sync/user-to-sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            siteIds: selectedSites,
          }),
        });

        const result = await response.json();
        
        // Map results by siteId
        const resultsMap: Record<string, { status: string; message?: string; error?: string }> = {};
        result.results.forEach((r: any) => {
          resultsMap[r.siteId] = {
            status: r.status,
            message: r.message,
            error: r.error,
          };
        });
        setSyncResults(resultsMap);

        if (result.successCount > 0) {
          setTimeout(() => {
            onSyncComplete();
            onClose();
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error("Sync error:", error);
      alert("Error syncing user: " + (error.message || "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  const configuredSites = sites.filter((s) => s.supabase_url && s.supabase_anon_key);
  const unconfiguredSites = sites.filter((s) => !s.supabase_url || !s.supabase_anon_key);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Sync User to Sites
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Select sites to sync <strong>{userEmail}</strong> to:
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {configuredSites.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    Available Sites ({configuredSites.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-primary hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-primary hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-lg p-2">
                  {configuredSites.map((site) => {
                    const isSelected = selectedSites.includes(site.id);
                    const result = syncResults[site.id];
                    return (
                      <label
                        key={site.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "bg-muted/30 border-border hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSite(site.id)}
                          disabled={syncing}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-2xl">{site.icon || "🌐"}</span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {site.display_name || site.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {site.url}
                          </p>
                        </div>
                        {result && (
                          <div>
                            {result.status === "success" ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {unconfiguredSites.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium mb-2">
                  ⚠️ Unconfigured Sites ({unconfiguredSites.length})
                </p>
                <p className="text-xs text-yellow-600/80">
                  These sites need Supabase credentials configured before syncing.
                </p>
                <div className="mt-2 space-y-1">
                  {unconfiguredSites.map((site) => (
                    <p key={site.id} className="text-xs text-yellow-600/60">
                      • {site.display_name || site.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {configuredSites.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No sites configured yet.</p>
                <p className="text-sm mt-2">
                  Add sites and configure their Supabase credentials first.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={onClose} disabled={syncing}>
                Cancel
              </Button>
              <Button
                onClick={handleSync}
                disabled={syncing || selectedSites.length === 0}
                className="gap-2"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    Sync to {selectedSites.length} Site{selectedSites.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>

            {Object.keys(syncResults).length > 0 && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Sync Results:
                </p>
                <div className="space-y-1">
                  {Object.entries(syncResults).map(([siteId, result]) => {
                    const site = sites.find((s) => s.id === siteId);
                    return (
                      <div
                        key={siteId}
                        className={`text-xs flex items-center gap-2 ${
                          result.status === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {result.status === "success" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>
                          {site?.display_name || site?.name}:{" "}
                          {result.message || result.error || result.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
