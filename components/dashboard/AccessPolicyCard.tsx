"use client";

import { cn } from "@/lib/utils";
import { Shield, Lock, Clock } from "lucide-react";

interface Policy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  usersAffected: number;
  type: "security" | "access" | "time";
}

interface AccessPolicyCardProps {
  policy: Policy;
  onToggle: (id: string) => void;
}

const typeIcons = {
  security: Shield,
  access: Lock,
  time: Clock,
};

export function AccessPolicyCard({ policy, onToggle }: AccessPolicyCardProps) {
  const Icon = typeIcons[policy.type];

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="rounded-full bg-primary/10 p-2 mt-0.5">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{policy.name}</h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  {
                    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400":
                      policy.enabled,
                    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400":
                      !policy.enabled,
                  }
                )}
              >
                {policy.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {policy.description}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {policy.usersAffected.toLocaleString()} users affected
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggle(policy.id)}
          className={cn(
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            {
              "bg-primary": policy.enabled,
              "bg-gray-200 dark:bg-gray-700": !policy.enabled,
            }
          )}
          role="switch"
          aria-checked={policy.enabled}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              {
                "translate-x-5": policy.enabled,
                "translate-x-0": !policy.enabled,
              }
            )}
          />
        </button>
      </div>
    </div>
  );
}
