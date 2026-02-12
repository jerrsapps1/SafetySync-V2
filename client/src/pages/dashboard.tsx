import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useEntitlements } from "@/hooks/use-entitlements";
import { listEmployees, listTrainingRecords, listCertificates } from "@/mock/api";
import type { MockEmployee, MockTrainingRecord, MockCertificate } from "@/mock/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Award, AlertTriangle, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

const recentActivities = [
  { date: "2026-02-10", description: "New training record added for Carlos Martinez - Fall Protection" },
  { date: "2026-02-08", description: "Certificate generated for James Wilson - CERT-48272" },
  { date: "2026-02-05", description: "Document approved: scaffolding_feb2026.pdf" },
  { date: "2026-02-03", description: "Training record updated for Robert Johnson - Scaffolding Safety" },
  { date: "2026-02-01", description: "New employee onboarded: Michael Brown - Crane Operator" },
];

export default function Dashboard() {
  const { t } = useI18n();
  const { activeOrg } = useOrganization();
  const { entitlements } = useEntitlements();

  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [records, setRecords] = useState<MockTrainingRecord[]>([]);
  const [certificates, setCertificates] = useState<MockCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [emps, recs, certs] = await Promise.all([
        listEmployees(activeOrg.id),
        listTrainingRecords(activeOrg.id),
        listCertificates(activeOrg.id),
      ]);
      setEmployees(emps);
      setRecords(recs);
      setCertificates(certs);
      setLoading(false);
    };
    load();
  }, [activeOrg.id]);

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon = records.filter((r) => {
    if (!r.expirationDate) return false;
    const expDate = new Date(r.expirationDate);
    return expDate >= now && expDate <= thirtyDaysFromNow;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="dashboard-loading">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: t("dashboard.employees"),
      value: employees.length,
      icon: Users,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      testId: "stat-employees",
    },
    {
      label: t("dashboard.trainingRecords"),
      value: records.length,
      icon: FileText,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      testId: "stat-training-records",
    },
    {
      label: t("dashboard.certificates"),
      value: certificates.length,
      icon: Award,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      testId: "stat-certificates",
    },
    {
      label: t("dashboard.expiringSoon"),
      value: expiringSoon,
      icon: AlertTriangle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      testId: "stat-expiring-soon",
    },
  ];

  const trialDate = entitlements?.trialEndsAt ? new Date(entitlements.trialEndsAt) : null;
  const trialDaysLeft = trialDate ? Math.max(0, Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  const formattedTrialDate = trialDate?.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const atEmployeeLimit = entitlements ? employees.length >= entitlements.employeeLimit : false;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold" data-testid="dashboard-title">
        {t("dashboard.title")}
      </h1>

      {entitlements?.trialActive && trialDaysLeft !== null && trialDaysLeft >= 0 && (
        <Card className="border-sky-500/30 bg-sky-500/5" data-testid="trial-banner">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <Clock className="h-4 w-4 text-sky-500 flex-shrink-0" />
              <span className="text-sm">
                <Badge variant="secondary" className="mr-2">{t("trial.banner")}</Badge>
                {t("trial.bannerText")} <span className="font-semibold">{formattedTrialDate}</span>
                {" — "}{trialDaysLeft} {t("trial.daysLeft")}
              </span>
            </div>
            <Link href="/billing">
              <Button variant="outline" size="sm" data-testid="button-upgrade-from-trial">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                {t("billing.upgrade")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!entitlements?.isActive && entitlements?.billingStatus === "canceled" && (
        <Card className="border-destructive/30 bg-destructive/5" data-testid="canceled-banner">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm text-destructive">{t("billing.statusCanceled")} — {t("billing.upgradeDesc")}</span>
            <Link href="/billing">
              <Button variant="default" size="sm" data-testid="button-reactivate">
                {t("billing.upgrade")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!entitlements?.isActive && entitlements?.billingStatus === "past_due" && (
        <Card className="border-orange-500/30 bg-orange-500/5" data-testid="past-due-banner">
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm">{t("billing.statusPastDue")} — {t("billing.manageBillingDesc")}</span>
          </CardContent>
        </Card>
      )}

      {atEmployeeLimit && (
        <Card className="border-orange-500/30 bg-orange-500/5" data-testid="employee-limit-banner">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm">{t("entitlements.employeeLimitReached")}</span>
            <Link href="/billing">
              <Button variant="outline" size="sm" data-testid="button-upgrade-limit">
                {t("billing.upgrade")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.testId} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-md p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold" data-testid={`${stat.testId}-value`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-testid="compliance-status">
        <CardHeader>
          <CardTitle>{t("dashboard.complianceStatus")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {expiringSoon === 0 ? (
              <Badge
                className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 no-default-hover-elevate no-default-active-elevate"
                data-testid="badge-compliance-good"
              >
                {t("dashboard.good")}
              </Badge>
            ) : (
              <Badge
                className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 no-default-hover-elevate no-default-active-elevate"
                data-testid="badge-compliance-attention"
              >
                {t("dashboard.needsAttention")}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground" data-testid="compliance-detail">
              {expiringSoon === 0
                ? "All training records are up to date."
                : `${expiringSoon} record(s) expiring within the next 30 days.`}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="recent-activity">
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3"
                data-testid={`activity-item-${index}`}
              >
                <div className="mt-0.5 h-2 w-2 rounded-full bg-sky-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
