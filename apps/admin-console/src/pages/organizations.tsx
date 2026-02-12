import { Badge } from "@/components/ui/badge";

const mockOrgs = [
  { name: "Demo Construction Co", plan: "Pro", users: 45, status: "Active", created: "2025-06-15" },
  { name: "Acme Safety Inc", plan: "Enterprise", users: 120, status: "Active", created: "2025-03-22" },
  { name: "Metro Builders", plan: "Starter", users: 8, status: "Trial", created: "2026-01-10" },
  { name: "Pacific Contractors", plan: "Pro", users: 32, status: "Active", created: "2025-09-05" },
];

export default function Organizations() {
  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-organizations">
      <h1 className="text-2xl font-semibold" data-testid="text-organizations-title">
        Organizations
      </h1>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Users</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {mockOrgs.map((org, index) => (
              <tr key={index} className="border-b last:border-b-0" data-testid={`row-org-${index}`}>
                <td className="px-4 py-3 font-medium" data-testid={`text-org-name-${index}`}>{org.name}</td>
                <td className="px-4 py-3" data-testid={`text-org-plan-${index}`}>{org.plan}</td>
                <td className="px-4 py-3" data-testid={`text-org-users-${index}`}>{org.users}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      org.status === "Active"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 no-default-hover-elevate no-default-active-elevate"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 no-default-hover-elevate no-default-active-elevate"
                    }
                    data-testid={`badge-org-status-${index}`}
                  >
                    {org.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground" data-testid={`text-org-created-${index}`}>{org.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
