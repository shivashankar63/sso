"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ConnectedSite {
  id: string;
  name: string;
  display_name: string;
  category?: string | null;
}

interface EditUserModalProps {
  user: SiteUser;
  site: ConnectedSite;
  onClose: () => void;
  onUpdate: () => void;
}

interface TableSchema {
  columns: string[];
  roles: Array<{ value: string; label: string }>;
  table: string;
  site: {
    type: string;
    name: string;
  };
}

export function EditUserModal({ user, site, onClose, onUpdate }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email || "",
    role: user.role || "",
    department: user.department || "",
    team: user.team || "",
    phone: user.phone || "",
    avatar_url: user.avatar_url || "",
  });

  // Fetch table schema when modal opens
  useEffect(() => {
    const fetchSchema = async () => {
      setSchemaLoading(true);
      try {
        // Use source_table if available, otherwise determine based on site type
        let tableName = user.source_table;
        if (!tableName) {
          // Determine default table based on site type
          const siteType = site.category?.toLowerCase() || site.name?.toLowerCase() || "";
          if (siteType === "cms") {
            tableName = "hr_users"; // CMS uses hr_users
          } else if (siteType === "sales") {
            tableName = "users";
          } else if (siteType === "hrms") {
            tableName = "employees";
          } else {
            tableName = "user_profiles";
          }
        }
        
        const response = await fetch(`/api/sites/${site.id}/table-schema?table=${tableName}`);
        
        if (response.ok) {
          const schema = await response.json();
          setTableSchema(schema);
        } else {
          console.error("Failed to fetch table schema");
        }
      } catch (error) {
        console.error("Error fetching table schema:", error);
      } finally {
        setSchemaLoading(false);
      }
    };

    fetchSchema();
  }, [site.id, site.category, site.name, user.source_table]);

  // Check if a column exists in the table
  const hasColumn = (columnName: string): boolean => {
    if (!tableSchema) return true; // Show all fields if schema not loaded yet
    return tableSchema.columns.includes(columnName);
  };

  // Check if any of the alternative column names exist
  const hasAnyColumn = (columnNames: string[]): boolean => {
    if (!tableSchema) return true;
    return columnNames.some(name => tableSchema.columns.includes(name));
  };

  // Get the actual column name that exists
  const getColumnName = (preferred: string, alternatives: string[]): string | null => {
    if (!tableSchema) return preferred;
    if (tableSchema.columns.includes(preferred)) return preferred;
    for (const alt of alternatives) {
      if (tableSchema.columns.includes(alt)) return alt;
    }
    return null;
  };

  // Get available roles from schema
  const getAvailableRoles = () => {
    if (tableSchema?.roles) {
      return tableSchema.roles;
    }
    // Fallback
    return [
      { value: "admin", label: "Admin" },
      { value: "manager", label: "Manager" },
      { value: "user", label: "User" },
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/sites/${site.id}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source_table: user.source_table,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.error || "Failed to update user";
        
        // Add helpful details if available
        if (errorData.details) {
          errorMessage += `\n\n${errorData.details}`;
        }
        if (errorData.available_columns) {
          errorMessage += `\n\nAvailable columns: ${errorData.available_columns.join(", ")}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      alert("User updated successfully!");
      onUpdate();
    } catch (err: any) {
      console.error("Error updating user:", err);
      alert(`Failed to update user:\n\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-background border-2 border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">Edit User</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Loading Schema */}
        {schemaLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading table schema...</span>
          </div>
        )}

        {/* Form */}
        {!schemaLoading && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email - Always show (required field) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="user@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Full Name - Show if any name column exists */}
              {hasAnyColumn(['full_name', 'name', 'display_name', 'employee_name']) && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="John Doe"
                  />
                </div>
              )}

              {/* Role - Show if role column exists */}
              {hasAnyColumn(['role', 'user_role', 'position']) && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select role</option>
                    {getAvailableRoles().map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone - Show if any phone column exists */}
              {hasAnyColumn(['phone', 'phone_number', 'mobile']) && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              )}

              {/* Department - Show if any department column exists */}
              {hasAnyColumn(['department', 'dept', 'department_name']) && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="Engineering"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Team - Show if team column exists */}
              {hasAnyColumn(['team', 'team_name']) && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Team
                  </label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="Frontend Team"
                  />
                </div>
              )}

              {/* Avatar URL - Show if any avatar column exists */}
              {hasAnyColumn(['avatar_url', 'avatar', 'profile_picture']) && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              )}
            </div>

            {/* Table Info */}
            {tableSchema && (
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <div>
                  Table: <span className="font-mono">{tableSchema.table}</span>
                </div>
                <div>
                  Site Type: <span className="font-mono">{tableSchema.site.type}</span>
                </div>
                <div>
                  Available Columns: <span className="font-mono text-xs">{tableSchema.columns.join(", ")}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || schemaLoading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update User
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
