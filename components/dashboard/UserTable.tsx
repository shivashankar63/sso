import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "pending" | "suspended";
  apps: number;
  lastActive: string;
}

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Apps
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {user.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                      {
                        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400":
                          user.role === "admin",
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400":
                          user.role === "member",
                        "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400":
                          user.role === "viewer",
                      }
                    )}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                      {
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400":
                          user.status === "active",
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400":
                          user.status === "pending",
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400":
                          user.status === "suspended",
                      }
                    )}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {user.apps}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.lastActive}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
