"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ConnectedAppCard } from "@/components/dashboard/ConnectedAppCard";
import { ConnectedSitesManager } from "@/components/dashboard/ConnectedSitesManager";
import { UserSyncManager } from "@/components/dashboard/UserSyncManager";
import { UserManager } from "@/components/dashboard/UserManager";
import { UserTable } from "@/components/dashboard/UserTable";
import { AccessPolicyCard } from "@/components/dashboard/AccessPolicyCard";
import {
  Users,
  AppWindow,
  Shield,
  Activity,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12% from last month",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Connected Apps",
    value: "24",
    change: "3 pending setup",
    changeType: "neutral" as const,
    icon: AppWindow,
  },
  {
    title: "Active Sessions",
    value: "1,429",
    change: "+8% from yesterday",
    changeType: "positive" as const,
    icon: Activity,
  },
  {
    title: "Security Score",
    value: "94%",
    change: "Excellent",
    changeType: "positive" as const,
    icon: Shield,
  },
];

const connectedApps = [
  {
    name: "Slack",
    icon: "💬",
    status: "active" as const,
    users: 2847,
    lastSync: "2 min ago",
    protocol: "SAML 2.0",
  },
  {
    name: "Google Workspace",
    icon: "🔷",
    status: "active" as const,
    users: 2650,
    lastSync: "5 min ago",
    protocol: "OAuth 2.0",
  },
  {
    name: "Notion",
    icon: "📝",
    status: "pending" as const,
    users: 1200,
    lastSync: "1 hour ago",
    protocol: "OIDC",
  },
  {
    name: "Figma",
    icon: "🎨",
    status: "active" as const,
    users: 890,
    lastSync: "10 min ago",
    protocol: "SAML 2.0",
  },
  {
    name: "GitHub",
    icon: "🐙",
    status: "active" as const,
    users: 456,
    lastSync: "Just now",
    protocol: "OAuth 2.0",
  },
  {
    name: "Jira",
    icon: "📋",
    status: "inactive" as const,
    users: 0,
    lastSync: "Never",
    protocol: "SAML 2.0",
  },
];

const recentUsers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    role: "admin" as const,
    status: "active" as const,
    apps: 12,
    lastActive: "2 min ago",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    role: "member" as const,
    status: "active" as const,
    apps: 8,
    lastActive: "15 min ago",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    role: "member" as const,
    status: "pending" as const,
    apps: 3,
    lastActive: "1 hour ago",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.wilson@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
    role: "viewer" as const,
    status: "active" as const,
    apps: 5,
    lastActive: "3 hours ago",
  },
  {
    id: "5",
    name: "Alex Thompson",
    email: "alex.thompson@company.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    role: "member" as const,
    status: "suspended" as const,
    apps: 0,
    lastActive: "2 days ago",
  },
];

const initialPolicies = [
  {
    id: "1",
    name: "Multi-Factor Authentication",
    description: "Require MFA for all user logins",
    enabled: true,
    usersAffected: 2847,
    type: "security" as const,
  },
  {
    id: "2",
    name: "IP Allowlist",
    description: "Restrict access to approved IP ranges",
    enabled: true,
    usersAffected: 2847,
    type: "access" as const,
  },
  {
    id: "3",
    name: "Session Timeout",
    description: "Auto-logout after 30 minutes of inactivity",
    enabled: false,
    usersAffected: 2847,
    type: "time" as const,
  },
  {
    id: "4",
    name: "Password Complexity",
    description: "Enforce strong password requirements",
    enabled: true,
    usersAffected: 2847,
    type: "security" as const,
  },
];

export function DashboardPageClient() {
  const [policies, setPolicies] = useState(initialPolicies);

  const handlePolicyToggle = (id: string) => {
    setPolicies((prev) =>
      prev.map((policy) =>
        policy.id === id ? { ...policy, enabled: !policy.enabled } : policy
      )
    );
  };

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
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatsCard {...stat} />
            </div>
          ))}
        </section>

        {/* Connected Applications */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Connected Applications
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {connectedApps.map((app, index) => (
              <div
                key={app.name}
                className="animate-fade-in"
                style={{ animationDelay: `${(index + 4) * 50}ms` }}
              >
                <ConnectedAppCard {...app} />
              </div>
            ))}
          </div>
          
          {/* Connected Sites Manager */}
          <div className="mt-8">
            <ConnectedSitesManager />
          </div>
        </section>

        {/* User Management Section */}
        <section>
          <UserManager />
        </section>

        {/* User Sync Section */}
        <section>
          <UserSyncManager />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Table */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Users
              </h2>
              <Button variant="link" className="text-primary p-0">
                View All Users →
              </Button>
            </div>
            <UserTable users={recentUsers} />
          </section>

          {/* Access Policies */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Access Policies
              </h2>
              <Button variant="link" className="text-primary p-0">
                Manage →
              </Button>
            </div>
            <div className="space-y-3">
              {policies.map((policy, index) => (
                <div
                  key={policy.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${(index + 10) * 50}ms` }}
                >
                  <AccessPolicyCard
                    policy={policy}
                    onToggle={handlePolicyToggle}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
