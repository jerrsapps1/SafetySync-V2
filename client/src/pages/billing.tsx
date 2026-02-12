import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Users,
  FileText,
  Award,
  Clock,
  ArrowUpRight,
  Download,
  ExternalLink,
  Check,
  Loader2,
} from "lucide-react";

interface BillingSummary {
  plan: string;
  billingStatus: string;
  trialEndsAt: string | null;
  employeesCount: number;
  trainingRecordsCount: number;
  certificatesCount: number;
  invoices: { id: string; date: string; amount: string; status: string }[];
}

const planLabels: Record<string, string> = {
  trial: "billing.planTrial",
  starter: "billing.planStarter",
  pro: "billing.planPro",
  enterprise: "billing.planEnterprise",
};

const statusLabels: Record<string, string> = {
  trial: "billing.statusTrial",
  active: "billing.statusActive",
  past_due: "billing.statusPastDue",
  canceled: "billing.statusCanceled",
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

export default function BillingPage() {
  const { t } = useI18n();
  const { token } = useAuth();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);

  const isMockAuth = token === "mock-token";

  const mockBilling: BillingSummary = {
    plan: "trial",
    billingStatus: "trial",
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    employeesCount: 7,
    trainingRecordsCount: 6,
    certificatesCount: 3,
    invoices: [],
  };

  const { data: apiBilling, isLoading, error } = useQuery<BillingSummary>({
    queryKey: ["/api/billing/summary"],
    enabled: !!token && !isMockAuth,
  });

  const billing = isMockAuth ? mockBilling : apiBilling;

  const trialDate = billing?.trialEndsAt ? new Date(billing.trialEndsAt) : null;
  const trialDaysLeft = trialDate
    ? Math.max(0, Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const formattedTrialDate = trialDate?.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await apiRequest("POST", "/api/billing/portal", {
        returnUrl: window.location.origin + "/billing",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      const is501 = err?.message?.startsWith("501");
      toast({
        title: t("billing.manageBilling"),
        description: t("billing.stripeNotConfigured"),
        variant: is501 ? undefined : "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSelectPlan = (plan: string) => {
    toast({
      title: t("billing.upgrade"),
      description: t("billing.stripeNotConfigured"),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center text-muted-foreground" data-testid="billing-error">
        {t("billing.loadingError")}
      </div>
    );
  }

  const plans = [
    {
      key: "starter",
      name: t("billing.planStarter"),
      price: t("billing.starterPrice"),
      desc: t("billing.starterDesc"),
      limit: t("billing.upTo25Emp"),
    },
    {
      key: "pro",
      name: t("billing.planPro"),
      price: t("billing.proPrice"),
      desc: t("billing.proDesc"),
      limit: t("billing.upTo100Emp"),
    },
    {
      key: "enterprise",
      name: t("billing.planEnterprise"),
      price: t("billing.enterprisePrice"),
      desc: t("billing.enterpriseDesc"),
      limit: t("billing.unlimitedEmp"),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="billing-title">
          {t("billing.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1" data-testid="billing-subtitle">
          {t("billing.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-testid="card-current-plan">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t("billing.currentPlan")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-semibold" data-testid="text-plan-name">
                {t(planLabels[billing.plan] || "billing.planTrial")}
              </span>
              <Badge
                variant={statusVariant(billing.billingStatus)}
                data-testid="badge-billing-status"
              >
                {t(statusLabels[billing.billingStatus] || "billing.statusTrial")}
              </Badge>
            </div>

            {billing.billingStatus === "trial" && trialDaysLeft !== null && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm" data-testid="text-trial-countdown">
                  <Clock className="h-4 w-4 text-sky-500" />
                  <span className="font-medium">{trialDaysLeft}</span>{" "}
                  <span>{t("billing.trialCountdown")}</span>
                </div>
                <p className="text-xs text-muted-foreground" data-testid="text-trial-end-date">
                  {t("billing.trialEndsOn")} {formattedTrialDate}
                </p>
                {trialDaysLeft <= 3 && (
                  <p className="text-xs text-orange-500" data-testid="text-trial-expiry-notice">
                    {t("billing.trialExpiredNotice")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-usage">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t("billing.usage")}</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{t("billing.employees")}</span>
                </div>
                <span className="font-medium" data-testid="text-usage-employees">
                  {billing.employeesCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{t("billing.trainingRecords")}</span>
                </div>
                <span className="font-medium" data-testid="text-usage-records">
                  {billing.trainingRecordsCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{t("billing.certificatesGenerated")}</span>
                </div>
                <span className="font-medium" data-testid="text-usage-certs">
                  {billing.certificatesCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-upgrade">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{t("billing.upgrade")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("billing.upgradeDesc")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = billing.plan === plan.key || (billing.plan === "trial" && plan.key === "starter");
              return (
                <div
                  key={plan.key}
                  className="rounded-md border p-4 space-y-3 flex flex-col"
                  data-testid={`plan-card-${plan.key}`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium">{plan.name}</span>
                    {isCurrent && (
                      <Badge variant="outline" data-testid={`badge-current-${plan.key}`}>
                        {t("billing.currentLabel")}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xl font-semibold">{plan.price}</span>
                  <p className="text-xs text-muted-foreground">{plan.desc}</p>
                  <p className="text-xs text-muted-foreground">{plan.limit}</p>
                  <div className="mt-auto pt-2">
                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full" data-testid={`button-plan-current-${plan.key}`}>
                        <Check className="h-4 w-4 mr-1" />
                        {t("billing.currentLabel")}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleSelectPlan(plan.key)}
                        data-testid={`button-select-plan-${plan.key}`}
                      >
                        {t("billing.selectPlan")}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-invoices">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-base font-medium">{t("billing.invoices")}</CardTitle>
        </CardHeader>
        <CardContent>
          {billing.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center" data-testid="text-no-invoices">
              {t("billing.noInvoices")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">{t("billing.invoiceDate")}</th>
                    <th className="text-left py-2 font-medium">{t("billing.invoiceAmount")}</th>
                    <th className="text-left py-2 font-medium">{t("billing.invoiceStatus")}</th>
                    <th className="text-right py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {billing.invoices.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0" data-testid={`row-invoice-${inv.id}`}>
                      <td className="py-2">{inv.date}</td>
                      <td className="py-2">{inv.amount}</td>
                      <td className="py-2">
                        <Badge variant={inv.status === "paid" ? "default" : "secondary"}>
                          {inv.status === "paid" ? t("billing.invoicePaid") : t("billing.invoicePending")}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="icon" data-testid={`button-download-${inv.id}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-manage-billing">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">{t("billing.manageBilling")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{t("billing.manageBillingDesc")}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleManageBilling}
            disabled={portalLoading}
            data-testid="button-manage-billing"
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-1" />
            )}
            {t("billing.manageBilling")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
