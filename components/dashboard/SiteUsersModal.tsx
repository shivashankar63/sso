"use client";

import { useState, useEffect } from "react";
import { X, Users, Mail, User, Shield, Calendar, Loader2, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditUserModal } from "./EditUserModal";

interface ConnectedSite {
  id: string;
  name: string;
  display_name: string;
  url: string;
  icon: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  supabase_service_key: string | null;
}

interface SiteUser {
  id: string;
  clerk_user_id?: string;
  email: string;
  full_name: string | null;
  role: string | null;
  team: string | null;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  source_table?: string | null;
}

interface SiteUsersModalProps {
  site: ConnectedSite;
  onClose: () => void;
}

export function SiteUsersModal({ site, onClose }: SiteUsersModalProps) {
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<SiteUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (site) {
      loadSiteUsers();
      // Update user count when modal opens
      const updateCount = async () => {
        try {
          await fetch(`/api/sites/${site.id}/update-count`, { method: 'POST' });
        } catch (error) {
          console.warn("Failed to update user count:", error);
        }
      };
      updateCount();
    }
  }, [site]);

  const loadSiteUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if site has Supabase credentials
      if (!site.supabase_url || !site.supabase_anon_key) {
        setError("This site doesn't have Supabase credentials configured. Please configure the database first.");
        setLoading(false);
        return;
      }

      // Call API to fetch users from site's database
      const response = await fetch(`/api/sites/${site.id}/users`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to load users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error("Error loading site users:", err);
      setError(err.message || "Failed to load users from site database");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    if (!role) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    
    const roleLower = role.toLowerCase();
    
    // Admin/Owner roles
    if (roleLower === "admin" || roleLower === "owner" || roleLower === "administrator") {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    
    // Manager roles
    if (roleLower === "manager" || roleLower === "sales_manager" || roleLower === "supervisor") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
    
    // User/Employee roles
    if (roleLower === "user" || roleLower === "employee" || roleLower === "salesman" || roleLower === "staff") {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    
    // Default
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string, sourceTable: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const response = await fetch(`/api/sites/${site.id}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_table: sourceTable,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      // Remove user from local state
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully");
      
      // Update user count for the site
      try {
        await fetch(`/api/sites/${site.id}/update-count`, { method: 'POST' });
      } catch (error) {
        console.warn("Failed to update user count:", error);
      }
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert(`Failed to delete user: ${err.message}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleUserUpdated = async () => {
    // Reload users after update
    await loadSiteUsers();
    setEditingUser(null);
    // Update user count for the site
    try {
      await fetch(`/api/sites/${site.id}/update-count`, { method: 'POST' });
    } catch (error) {
      console.warn("Failed to update user count:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-background border-2 border-border rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{site.icon || "🌐"}</div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {site.display_name} - Users
              </h3>
              <p className="text-sm text-muted-foreground">{site.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading users from site database...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500 font-medium mb-2">Error Loading Users</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSiteUsers}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium mb-2">No Users Found</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              This site doesn't have any users yet. Users will appear here once they are synced to this site's database.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Users</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Admins/Owners</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => {
                    const r = u.role?.toLowerCase();
                    return r === "admin" || r === "owner" || r === "administrator";
                  }).length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Managers</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => {
                    const r = u.role?.toLowerCase();
                    return r === "manager" || r === "sales_manager" || r === "supervisor";
                  }).length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Users/Staff</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => {
                    const r = u.role?.toLowerCase();
                    return r === "user" || r === "employee" || r === "salesman" || r === "staff" || !r;
                  }).length}
                </p>
              </div>
            </div>

            {/* Users Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Team
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Source Table
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name || user.email}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-foreground">
                                {user.full_name || "No Name"}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                              {user.phone && (
                                <p className="text-xs text-muted-foreground">{user.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role || "No Role"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">
                            {user.department || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">
                            {user.team || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.source_table ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-muted text-muted-foreground">
                              {user.source_table}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingUser(user)}
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id, user.email, user.source_table || "")}
                              disabled={deletingUserId === user.id}
                              title="Delete user"
                            >
                              {deletingUserId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          site={site}
          onClose={() => setEditingUser(null)}
          onUpdate={handleUserUpdated}
        />
      )}
    </div>
  );
}
