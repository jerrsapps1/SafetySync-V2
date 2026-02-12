import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Eye } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DelinquentOrg {
  orgId: string;
  orgName: string;
  primaryAdminEmail: string | null;
  plan: string;
  billingStatus: string;
  lastInvoice: {
    date: string;
    status: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  past_due: "Past Due",
  unpaid: "Unpaid",
  canceled: "Canceled",
};

function statusVariant(status: string): "secondary" | "default" | "destructive" | "outline" {
  switch (status) {
    case "past_due":
    case "unpaid":
    case "canceled":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatDate(d: string | null): string {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PortalLinkButton({ orgId }: { orgId: string }) {
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/organizations/${orgId}/portal-link`);
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.url);
      toast({ title: "Portal link copied to clipboard" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      data-testid={`button-portal-link-${orgId}`}
    >
      {mutation.isPending ? (
        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
      ) : (
        <Copy className="h-3.5 w-3.5 mr-1" />
      )}
      Portal Link
    </Button>
  );
}

export default function Delinquent() {
  const { data: orgs, isLoading, error } = useQuery<DelinquentOrg[]>({
    queryKey: ["/api/admin/billing/delinquent"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-muted-foreground" data-testid="delinquent-error">
        Failed to load delinquent organizations
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="page-delinquent">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-delinquent-title">
          Delinquent Accounts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organizations with past due, unpaid, or canceled billing status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Delinquent Organizations ({orgs?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-delinquent">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Organization</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Invoice</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Admin Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs && orgs.map((org) => (
                  <tr
                    key={org.orgId}
                    className="border-b last:border-b-0"
                    data-testid={`row-delinquent-${org.orgId}`}
                  >
                    <td className="px-4 py-3 font-medium" data-testid={`text-delinquent-name-${org.orgId}`}>
                      {org.orgName}
                    </td>
                    <td className="px-4 py-3">{org.plan}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(org.billingStatus)} data-testid={`badge-delinquent-status-${org.orgId}`}>
                        {statusLabels[org.billingStatus] || org.billingStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {org.lastInvoice ? (
                        <span>
                          {formatDate(org.lastInvoice.date)} ({org.lastInvoice.status})
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {org.primaryAdminEmail || "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <PortalLinkButton orgId={org.orgId} />
                        <Link href={`/billing/${org.orgId}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-billing-${org.orgId}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Billing
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!orgs || orgs.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground" data-testid="text-no-delinquent">
                      No delinquent organizations found
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
