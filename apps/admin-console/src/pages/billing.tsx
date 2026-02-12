import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from "lucide-react";
import { Link } from "wouter";

interface OrgBillingRow {
  orgId: string;
  orgName: string;
  primaryAdminEmail: string | null;
  plan: string;
  billingStatus: string;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
}

const planLabels: Record<string, string> = {
  trial: "Trial",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

function statusVariant(status: string): "secondary" | "default" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "past_due":
      return "destructive";
    case "canceled":
      return "destructive";
    default:
      return "secondary";
  }
}

const statusLabels: Record<string, string> = {
  trial: "Trial",
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
};

export default function AdminBilling() {
  const { data: orgs, isLoading, error } = useQuery<OrgBillingRow[]>({
    queryKey: ["/api/admin/organizations"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !orgs) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-muted-foreground" data-testid="billing-error">
        Failed to load billing data
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-admin-billing">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-admin-billing-title">
          Billing Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View billing status across all organizations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Organizations ({orgs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-org-billing">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Organization</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trial End</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Admin Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => {
                  const trialEnd = org.trialEndsAt
                    ? new Date(org.trialEndsAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={org.orgId}
                      className="border-b last:border-b-0"
                      data-testid={`row-org-billing-${org.orgId}`}
                    >
                      <td className="px-4 py-3 font-medium" data-testid={`text-org-name-${org.orgId}`}>
                        {org.orgName}
                      </td>
                      <td className="px-4 py-3" data-testid={`text-org-plan-${org.orgId}`}>
                        {planLabels[org.plan] || org.plan}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={statusVariant(org.billingStatus)}
                          data-testid={`badge-org-status-${org.orgId}`}
                        >
                          {statusLabels[org.billingStatus] || org.billingStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground" data-testid={`text-org-trial-${org.orgId}`}>
                        {trialEnd}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground" data-testid={`text-org-email-${org.orgId}`}>
                        {org.primaryAdminEmail || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/billing/${org.orgId}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-billing-${org.orgId}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Billing
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {orgs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No organizations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
