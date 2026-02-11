import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ShieldCheck, Search } from "lucide-react";
import { listTrainingRecords, listEmployees } from "@/mock/api";
import type { MockTrainingRecord, MockEmployee } from "@/mock/db";

export default function CompliancePage() {
  const { t } = useI18n();
  const { activeOrg } = useOrganization();

  const [records, setRecords] = useState<MockTrainingRecord[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [recs, emps] = await Promise.all([
        listTrainingRecords(activeOrg.id),
        listEmployees(activeOrg.id),
      ]);
      setRecords(recs);
      const map: Record<string, string> = {};
      emps.forEach((emp) => {
        map[emp.id] = `${emp.firstName} ${emp.lastName}`;
      });
      setEmployeeMap(map);
      setLoading(false);
    };
    loadData();
  }, [activeOrg.id]);

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const getDaysRemaining = (expirationDate: string) => {
    const exp = new Date(expirationDate);
    return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredRecords = records.filter((rec) => {
    if (!search) return true;
    const empName = employeeMap[rec.employeeId] || "";
    return empName.toLowerCase().includes(search.toLowerCase());
  });

  const expiringSoon = filteredRecords.filter((rec) => {
    const exp = new Date(rec.expirationDate);
    return exp > now && exp <= in30Days;
  });

  const expired = filteredRecords.filter((rec) => {
    const exp = new Date(rec.expirationDate);
    return exp <= now;
  });

  return (
    <div className="space-y-6 p-6" data-testid="compliance-page">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-compliance-title">
          <ShieldCheck className="inline-block mr-2 h-6 w-6" />
          {t("compliance.title")}
        </h1>
        <p className="text-muted-foreground" data-testid="text-compliance-subtitle">
          {t("compliance.subtitle")}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-compliance"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground" data-testid="text-loading">{t("common.loading")}</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle data-testid="text-expiring-soon-title">{t("compliance.expiringSoon")}</CardTitle>
            </CardHeader>
            <CardContent>
              {expiringSoon.length === 0 ? (
                <p className="text-muted-foreground" data-testid="text-no-expiring">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-3">
                  {expiringSoon.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                      data-testid={`row-expiring-${rec.id}`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium" data-testid={`text-expiring-employee-${rec.id}`}>
                          {employeeMap[rec.employeeId] || rec.employeeId}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-expiring-course-${rec.id}`}>
                          {rec.courseName}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-expiring-date-${rec.id}`}>
                          {t("certificates.expirationDate")}: {rec.expirationDate}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400" data-testid={`badge-days-remaining-${rec.id}`}>
                        {getDaysRemaining(rec.expirationDate)} {t("compliance.daysRemaining")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle data-testid="text-expired-title">{t("compliance.expired")}</CardTitle>
            </CardHeader>
            <CardContent>
              {expired.length === 0 ? (
                <p className="text-muted-foreground" data-testid="text-no-expired">{t("common.noResults")}</p>
              ) : (
                <div className="space-y-3">
                  {expired.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                      data-testid={`row-expired-${rec.id}`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium" data-testid={`text-expired-employee-${rec.id}`}>
                          {employeeMap[rec.employeeId] || rec.employeeId}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-expired-course-${rec.id}`}>
                          {rec.courseName}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-expired-date-${rec.id}`}>
                          {t("certificates.expirationDate")}: {rec.expirationDate}
                        </p>
                      </div>
                      <Badge variant="destructive" data-testid={`badge-expired-${rec.id}`}>
                        {t("compliance.expired")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
