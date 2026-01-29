"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Mail, User, Shield, RefreshCw, Eye, EyeOff, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase-client-simple";
import { SiteSyncModal } from "./SiteSyncModal";
import { AddUserModal } from "./AddUserModal";

interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  password_hash: string | null;
  role: string;
  team: string | null;
  department: string | null;
  created_at: string;
}

export function UserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    // Only load on client side
    if (typeof window !== "undefined") {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error("Supabase client is not available");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSyncUser = (userId: string) => {
    setSelectedUserId(userId);
    setSyncModalOpen(true);
  };

  const handleSyncAll = async () => {
    if (!confirm("Sync all users to all connected sites?")) return;

    setSyncing(true);
    try {
      // Sync each user individually to all sites
      const syncPromises = users.map(async (user) => {
        const response = await fetch("/api/sync/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        return response.json();
      });

      const results = await Promise.all(syncPromises);
      
      // Aggregate results
      const allResults = results.flatMap((r) => r.results || []);
      const successCount = allResults.filter((r: any) => r.status === "success").length;
      const failCount = allResults.filter((r: any) => r.status === "failed").length;
      
      let message = `Sync completed!\n\n`;
      message += `✅ Success: ${successCount}\n`;
      if (failCount > 0) {
        message += `❌ Failed: ${failCount}\n\n`;
        message += `Failed sites:\n`;
        allResults
          .filter((r: any) => r.status === "failed")
          .forEach((r: any) => {
            message += `  • ${r.site}: ${r.error || "Unknown error"}\n`;
          });
      }
      alert(message);
      
      await loadUsers();
    } catch (error: any) {
      console.error("Sync error:", error);
      alert("Error syncing users: " + (error.message || "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "manager":
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Add and manage users across all connected sites
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSyncAll}
            disabled={syncing || users.length === 0}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sync All
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>


      {users.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No users yet</p>
          <Button onClick={() => setShowAddModal(true)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First User
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Team</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Department</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {user.full_name || "No name"}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                      {user.password_hash && (
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <Key className="h-3 w-3" />
                          Password set
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm text-foreground capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.team || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.department || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSyncUser(user.id)}
                      disabled={syncing}
                      className="gap-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Sync
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={async () => {
          await loadUsers();
        }}
      />

      {selectedUserId && (
        <SiteSyncModal
          userId={selectedUserId}
          userEmail={users.find((u) => u.id === selectedUserId)?.email || ""}
          isOpen={syncModalOpen}
          onClose={() => {
            setSyncModalOpen(false);
            setSelectedUserId(null);
          }}
          onSyncComplete={async () => {
            await loadUsers();
          }}
        />
      )}
    </div>
  );
}
