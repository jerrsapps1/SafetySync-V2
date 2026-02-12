import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react";

interface OrgBillingDetail {
  orgId: string;
  orgName: string;
  plan: string;
  billingStatus: string;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  invoices: {
    id: string;
    date: string;
    amount: string;
    status: string;
    hostedUrl: string | null;
  }[];
}

const planLabels: Record<string, string> = {
  trial: "Trial",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const statusLabels: Record<string, string> = {
  trial: "Trial",
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
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

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function OrgBillingDetail() {
  const [, params] = useRoute("/billing/:orgId");
  const orgId = params?.orgId;

  const { data: billing, isLoading, error } = useQuery<OrgBillingDetail>({
    queryKey: ["/api/admin/organizations", orgId, "billing"],
    enabled: !!orgId,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center text-muted-foreground" data-testid="billing-detail-error">
        Failed to load billing details
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="page-org-billing-detail">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/billing">
          <Button variant="ghost" size="sm" data-testid="button-back-to-billing">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-org-billing-title">
            {billing.orgName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Billing Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-plan">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold" data-testid="text-detail-plan">
              {planLabels[billing.plan] || billing.plan}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-status">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Billing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={statusVariant(billing.billingStatus)} data-testid="badge-detail-status">
              {statusLabels[billing.billingStatus] || billing.billingStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card data-testid="card-trial-end">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trial End</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium" data-testid="text-detail-trial-end">
              {formatDate(billing.trialEndsAt)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-period-end">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Period End</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium" data-testid="text-detail-period-end">
              {formatDate(billing.currentPeriodEnd)}
            </p>
          </CardContent>
        </Card>
      </div>

      {billing.subscriptionStatus && (
        <Card data-testid="card-subscription">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm">Status:</span>
              <Badge variant={statusVariant(billing.subscriptionStatus)} data-testid="badge-sub-status">
                {statusLabels[billing.subscriptionStatus] || billing.subscriptionStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-invoices">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Invoices ({billing.invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-invoices">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {billing.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-b-0" data-testid={`row-invoice-${inv.id}`}>
                    <td className="px-4 py-3" data-testid={`text-invoice-date-${inv.id}`}>
                      {formatDate(inv.date)}
                    </td>
                    <td className="px-4 py-3 font-medium" data-testid={`text-invoice-amount-${inv.id}`}>
                      ${inv.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={inv.status === "paid" ? "default" : "secondary"}
                        data-testid={`badge-invoice-status-${inv.id}`}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {inv.hostedUrl ? (
                        <a href={inv.hostedUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" data-testid={`button-invoice-link-${inv.id}`}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {billing.invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No invoices found
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
