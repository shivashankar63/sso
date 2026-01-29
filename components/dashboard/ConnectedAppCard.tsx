import { cn } from "@/lib/utils";

interface ConnectedAppCardProps {
  name: string;
  icon: string;
  status: "active" | "pending" | "inactive";
  users: number;
  lastSync: string;
  protocol: string;
}

export function ConnectedAppCard({
  name,
  icon,
  status,
  users,
  lastSync,
  protocol,
}: ConnectedAppCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{protocol}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            {
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400":
                status === "active",
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400":
                status === "pending",
              "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400":
                status === "inactive",
            }
          )}
        >
          {status}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div>
          <p className="text-muted-foreground">Users</p>
          <p className="font-medium text-foreground">{users.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Last Sync</p>
          <p className="font-medium text-foreground">{lastSync}</p>
        </div>
      </div>
    </div>
  );
}
