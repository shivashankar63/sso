"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ConnectedSitesManager } from "@/components/dashboard/ConnectedSitesManager";
import { UserSyncManager } from "@/components/dashboard/UserSyncManager";
import { UserManager } from "@/components/dashboard/UserManager";
import { UserTable } from "@/components/dashboard/UserTable";
import {
  Users,
  AppWindow,
  Shield,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase-client-simple";

interface DashboardStats {
  totalUsers: number;
  connectedSites: number;
  activeSites: number;
  pendingSites: number;
  recentUsersCount: number;
}

export function DashboardPageClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    connectedSites: 0,
    activeSites: 0,
    pendingSites: 0,
    recentUsersCount: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Load stats in parallel
      const [usersResult, sitesResult, recentUsersResult] = await Promise.all([
        // Count total users
        supabase
          .from("user_profiles")
          .select("id", { count: "exact", head: true }),
        
        // Get connected sites
        supabase
          .from("connected_sites")
          .select("id, status, is_active"),
        
        // Get recent users (last 5)
        supabase
          .from("user_profiles")
          .select("id, email, full_name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Calculate stats
      const totalUsers = usersResult.count || 0;
      const allSites = sitesResult.data || [];
      const activeSites = allSites.filter((s) => s.is_active && s.status === "active").length;
      const pendingSites = allSites.filter((s) => s.status === "pending").length;
      const connectedSites = allSites.length;

      setStats({
        totalUsers,
        connectedSites,
        activeSites,
        pendingSites,
        recentUsersCount: recentUsersResult.data?.length || 0,
      });

      // Format recent users for display
      if (recentUsersResult.data) {
        const formattedUsers = recentUsersResult.data.map((user) => ({
          id: user.id,
          name: user.full_name || user.email.split("@")[0],
          email: user.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          role: user.role || "user",
          status: "active" as const,
          apps: 0, // Can be calculated from sync logs if needed
          lastActive: formatTimeAgo(user.created_at),
        }));
        setRecentUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""} ago`;
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `${stats.recentUsersCount} recent`,
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Connected Sites",
      value: stats.connectedSites.toString(),
      change: stats.pendingSites > 0 ? `${stats.pendingSites} pending setup` : "All configured",
      changeType: stats.pendingSites > 0 ? ("neutral" as const) : ("positive" as const),
      icon: AppWindow,
    },
    {
      title: "Active Sites",
      value: stats.activeSites.toString(),
      change: `${stats.connectedSites - stats.activeSites} inactive`,
      changeType: stats.activeSites > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Activity,
    },
    {
      title: "Security Status",
      value: stats.activeSites > 0 ? "Active" : "Setup",
      change: stats.activeSites > 0 ? "All systems operational" : "Configure sites",
      changeType: stats.activeSites > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Shield,
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Manage your SSO infrastructure"
    >
      {/* Background glow effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative space-y-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-muted rounded-lg p-6 h-32"
              />
            ))
          ) : (
            statsCards.map((stat, index) => (
              <div
                key={stat.title}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatsCard {...stat} />
              </div>
            ))
          )}
        </section>

        {/* Connected Sites Manager */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Connected Sites
            </h2>
          </div>
          <ConnectedSitesManager />
        </section>

        {/* User Management Section */}
        <section>
          <UserManager />
        </section>

        {/* User Sync Section */}
        <section>
          <UserSyncManager />
        </section>

        {/* Recent Users Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Users
            </h2>
            <Button variant="link" className="text-primary p-0">
              View All Users →
            </Button>
          </div>
          {loading ? (
            <div className="animate-pulse bg-muted rounded-lg p-8 h-64" />
          ) : recentUsers.length > 0 ? (
            <UserTable users={recentUsers} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users yet. Create your first user to get started.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
