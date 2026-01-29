import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: StatsCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p
            className={cn("text-xs", {
              "text-green-600 dark:text-green-400": changeType === "positive",
              "text-red-600 dark:text-red-400": changeType === "negative",
              "text-muted-foreground": changeType === "neutral",
            })}
          >
            {change}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
