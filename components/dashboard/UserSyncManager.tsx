"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock, Users, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase-client-simple";

interface SyncStatus {
  user_id: string;
  email: string;
  full_name: string | null;
  site_name: string;
  site_display_name: string;
  sync_status: string;
  last_synced_at: string | null;
  error_message: string | null;
}

export function UserSyncManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load on client side
    if (typeof window !== "undefined") {
      loadSyncStatus();
    }
  }, []);

  const loadSyncStatus = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Supabase client is not available. Please check your environment variables.");
        setLoading(false);
        return;
      }
      
      // Check if user_sync_status view exists, if not use user_sync_log
      const { data, error } = await supabase
        .from("user_sync_status")
        .select("*")
        .order("email", { ascending: true })
        .limit(100);

      if (error) {
        // If view doesn't exist, show helpful message
        if (error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("relation") || error.message.includes("view")) {
          setError("user_sync_status view not found. Please run user-sync-schema.sql in Supabase.");
          setSyncStatus([]);
        } else {
          setError(error.message || "Failed to load sync status");
          setSyncStatus([]);
        }
      } else {
        setSyncStatus(data || []);
        setError(null);
      }
    } catch (error: any) {
      console.error("Error loading sync status:", error);
      setError(error.message || "Failed to load sync status");
      setSyncStatus([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    if (!confirm("Sync all users to all connected sites?")) return;

    setSyncing(true);
    try {
      const response = await fetch("/api/sync/all-users", {
        method: "POST",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      alert(`Sync queued! ${result.message}`);
      await loadSyncStatus();
    } catch (error: any) {
      alert("Error syncing: " + (error.message || "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncUser = async (userId: string) => {
    setSyncing(true);
    try {
      const response = await fetch("/api/sync/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      alert("User sync queued!");
      await loadSyncStatus();
    } catch (error: any) {
      alert("Error syncing user: " + (error.message || "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Group by user
  const usersMap = new Map<string, SyncStatus[]>();
  syncStatus.forEach((status) => {
    if (!usersMap.has(status.user_id)) {
      usersMap.set(status.user_id, []);
    }
    const userStatuses = usersMap.get(status.user_id);
    if (userStatuses) {
      userStatuses.push(status);
    }
  });

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading sync status...</div>;
  }

  if (error) {
    return (
      <div className="border border-yellow-500/50 rounded-lg p-4 bg-yellow-500/10">
        <p className="text-sm text-yellow-600 mb-2">
          ⚠️ {error}
        </p>
        <p className="text-xs text-muted-foreground">
          Run <code className="bg-muted px-1 rounded">user-sync-schema.sql</code> in your Supabase SQL Editor to create the required view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            User Data Sync
          </h3>
          <p className="text-sm text-muted-foreground">
            Sync user data across all connected sites
          </p>
        </div>
        <Button
          onClick={handleSyncAll}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          Sync All Users
        </Button>
      </div>

      {Array.from(usersMap.entries()).map(([userId, statuses]) => {
        const user = statuses[0];
        const allSynced = statuses.every((s) => s.sync_status === "success");
        const anyFailed = statuses.some((s) => s.sync_status === "failed");

        return (
          <div
            key={userId}
            className="border border-border rounded-lg p-4 bg-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-foreground">
                  {user.full_name || user.email}
                </h4>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {allSynced ? (
                  <span className="text-xs text-green-600">All Synced</span>
                ) : anyFailed ? (
                  <span className="text-xs text-red-600">Some Failed</span>
                ) : (
                  <span className="text-xs text-yellow-600">Pending</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSyncUser(userId)}
                  disabled={syncing}
                  className="h-7"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {statuses.map((status) => (
                <div
                  key={`${status.user_id}-${status.site_name}`}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                >
                  {getStatusIcon(status.sync_status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {status.site_display_name || status.site_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {status.sync_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {syncStatus.length === 0 && (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            No users to sync yet. Add users first, then sync them to all sites.
          </p>
        </div>
      )}
    </div>
  );
}
