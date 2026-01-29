"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff, Key, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase-client-simple";

interface ConnectedSite {
  id: string;
  name: string;
  display_name: string;
  category: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const [sites, setSites] = useState<ConnectedSite[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "user",
    team: "",
    department: "",
    phone: "",
  });

  useEffect(() => {
    // Only load on client side
    if (isOpen && typeof window !== "undefined") {
      loadSites();
      // Auto-select all configured sites
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          supabase
            .from("connected_sites")
            .select("id, name, display_name, category, supabase_url, supabase_anon_key")
            .eq("is_active", true)
            .then(({ data, error }) => {
              if (error) {
                console.error("Error loading sites for auto-select:", error);
                return;
              }
              if (data) {
                const configuredSites = data
                  .filter((s) => s.supabase_url && s.supabase_anon_key)
                  .map((s) => s.id);
                setSelectedSites(configuredSites);
              }
            })
            .catch((error) => {
              console.error("Error in auto-select sites:", error);
            });
        }
      } catch (error) {
        console.error("Error initializing Supabase client:", error);
      }
    }
  }, [isOpen]);

  const loadSites = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error("Supabase client is null");
        return;
      }
      
      const { data, error } = await supabase
        .from("connected_sites")
        .select("id, name, display_name, category, supabase_url, supabase_anon_key")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error("Error loading sites:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client is not available. Please check your environment variables.");
      }
      
      // Generate IDs
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const clerkUserId = `clerk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Validate role - must be one of: admin, manager, user
      const validRoles = ['admin', 'manager', 'user'];
      const userRole = validRoles.includes(formData.role) ? formData.role : 'user';
      
      if (!validRoles.includes(formData.role)) {
        console.warn(`Invalid role "${formData.role}" - defaulting to "user"`);
      }

      // Create user in central database
      const { data: user, error: userError } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          clerk_user_id: clerkUserId,
          email: formData.email,
          full_name: formData.full_name || null,
          password_hash: formData.password || null,
          role: userRole, // Use validated role
          team: formData.team || null,
          department: formData.department || null,
          phone: formData.phone || null,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Sync to selected sites
      if (selectedSites.length > 0) {
        const syncPromises = selectedSites.map(async (siteId) => {
          const response = await fetch("/api/sync/user-to-site", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, siteId }),
          });
          return response.json();
        });

        const syncResults = await Promise.all(syncPromises);
        const failedSites = syncResults
          .map((result, index) => ({
            site: sites.find((s) => s.id === selectedSites[index])?.display_name || "Unknown",
            error: result.error,
          }))
          .filter((r) => r.error);

        if (failedSites.length > 0) {
          alert(
            `User created but sync failed for:\n${failedSites.map((s) => `• ${s.site}`).join("\n")}`
          );
        }
      }

      // Reset form
      setFormData({
        email: "",
        full_name: "",
        password: "",
        role: "user", // Always reset to valid default
        team: "",
        department: "",
        phone: "",
      });
      setSelectedSites([]);

      onUserAdded();
      onClose();
    } catch (error: any) {
      console.error("Error adding user:", error);
      alert("Error adding user: " + (error.message || "Unknown error"));
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

  const getRoleOptions = () => {
    // Central database only allows: admin, manager, user
    // Sales roles (owner, manager, salesman) will be mapped during sync
    return [
      { value: "admin", label: "Admin" },
      { value: "manager", label: "Manager" },
      { value: "user", label: "User" },
    ];
  };

  const getSiteSpecificFields = () => {
    const hasHRMSSite = selectedSites.some(
      (siteId) => sites.find((s) => s.id === siteId)?.category === "hrms"
    );
    const hasSalesSite = selectedSites.some(
      (siteId) => sites.find((s) => s.id === siteId)?.category === "sales"
    );

    return {
      showDepartment: hasHRMSSite || hasSalesSite,
      showPhone: hasSalesSite,
      showTeam: true,
    };
  };

  if (!isOpen) return null;

  const configuredSites = sites.filter((s) => s.supabase_url && s.supabase_anon_key);
  const siteFields = getSiteSpecificFields();
  const roleOptions = getRoleOptions();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                <Key className="h-4 w-4" />
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter password for login"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This password will be used to login to all connected sites
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => {
                  // Ensure only valid roles are set
                  const validRoles = ['admin', 'manager', 'user'];
                  const selectedRole = validRoles.includes(e.target.value) ? e.target.value : 'user';
                  setFormData({ ...formData, role: selectedRole });
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {selectedSites.some(
                (siteId) => sites.find((s) => s.id === siteId)?.category === "sales"
              ) && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  💡 <strong>Note:</strong> For Sales site, roles will be automatically mapped:
                  <br />
                  Admin → Owner, Manager → Manager, User → Salesman
                </p>
              )}
            </div>
          </div>

          {/* Site-Specific Fields */}
          {(siteFields.showDepartment || siteFields.showPhone || siteFields.showTeam) && (
            <div className="space-y-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {siteFields.showDepartment && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sales, HR, IT, etc."
                    />
                  </div>
                )}

                {siteFields.showTeam && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Team</label>
                    <input
                      type="text"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Team name"
                    />
                  </div>
                )}

                {siteFields.showPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Site Selection */}
          {configuredSites.length > 0 && (
            <div className="space-y-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Sync to Sites ({selectedSites.length} selected)
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSites([])}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                {configuredSites.map((site) => {
                  const isSelected = selectedSites.includes(site.id);
                  const siteType = site.category || "generic";
                  
                  return (
                    <label
                      key={site.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSite(site.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-2xl">{site.name === "hrms" ? "💼" : site.name === "sales" ? "💰" : "🌐"}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {site.display_name || site.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {siteType === "hrms" && "Requires: Department"}
                          {siteType === "sales" && "Requires: Phone (Role mapped: Admin→Owner, Manager→Manager, User→Salesman)"}
                          {siteType === "generic" && "Standard user profile"}
                        </p>
                      </div>
                      {isSelected && <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t-2 border-gray-200 dark:border-gray-700 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
            >
              {loading ? "Creating..." : "Create User"}
              {selectedSites.length > 0 && ` & Sync to ${selectedSites.length} Site${selectedSites.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
