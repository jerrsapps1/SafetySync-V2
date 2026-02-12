import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, Plus, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listCertificates, listEmployees, createCertificate } from "@/mock/api";
import type { MockCertificate, MockEmployee } from "@/mock/db";

export default function CertificatesPage() {
  const { t } = useI18n();
  const { activeOrg } = useOrganization();
  const { toast } = useToast();

  const [certificates, setCertificates] = useState<MockCertificate[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formCourse, setFormCourse] = useState("");
  const [formIssueDate, setFormIssueDate] = useState("");
  const [formExpirationDate, setFormExpirationDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [certs, emps] = await Promise.all([
      listCertificates(activeOrg.id),
      listEmployees(activeOrg.id),
    ]);
    setCertificates(certs);
    setEmployees(emps);
    const map: Record<string, string> = {};
    emps.forEach((emp) => {
      map[emp.id] = `${emp.firstName} ${emp.lastName}`;
    });
    setEmployeeMap(map);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeOrg.id]);

  const filtered = certificates.filter((cert) => {
    const empName = employeeMap[cert.employeeId] || "";
    const matchesSearch =
      !search ||
      empName.toLowerCase().includes(search.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(search.toLowerCase());
    const matchesEmployee = !filterEmployee || cert.employeeId === filterEmployee;
    return matchesSearch && matchesEmployee;
  });

  const handleCreate = async () => {
    if (!formEmployeeId || !formCourse || !formIssueDate || !formExpirationDate) return;
    await createCertificate({
      orgId: activeOrg.id,
      employeeId: formEmployeeId,
      courseName: formCourse,
      issueDate: formIssueDate,
      expirationDate: formExpirationDate,
    });
    toast({ title: t("certificates.createSuccess") });
    setDialogOpen(false);
    setFormEmployeeId("");
    setFormCourse("");
    setFormIssueDate("");
    setFormExpirationDate("");
    loadData();
  };

  return (
    <div className="space-y-6 p-6" data-testid="certificates-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-certificates-title">
            <Award className="inline-block mr-2 h-6 w-6" />
            {t("certificates.title")}
          </h1>
          <p className="text-muted-foreground" data-testid="text-certificates-subtitle">
            {t("certificates.subtitle")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-create-certificate">
          <Plus className="mr-2 h-4 w-4" />
          {t("certificates.create")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-certificates"
          />
        </div>
        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          data-testid="select-filter-employee"
        >
          <option value="">{t("common.filter")}: {t("certificates.employee")}</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-certificates-table-title">{t("certificates.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground" data-testid="text-loading">{t("common.loading")}</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground" data-testid="text-no-certificates">{t("certificates.noCertificates")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-certificates">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">{t("certificates.employee")}</th>
                    <th className="pb-2 pr-4">{t("certificates.course")}</th>
                    <th className="pb-2 pr-4">{t("certificates.title")}</th>
                    <th className="pb-2 pr-4">{t("certificates.issueDate")}</th>
                    <th className="pb-2 pr-4">{t("certificates.expirationDate")}</th>
                    <th className="pb-2">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cert) => (
                    <tr key={cert.id} className="border-b last:border-0" data-testid={`row-certificate-${cert.id}`}>
                      <td className="py-3 pr-4" data-testid={`text-cert-employee-${cert.id}`}>
                        {employeeMap[cert.employeeId] || cert.employeeId}
                      </td>
                      <td className="py-3 pr-4" data-testid={`text-cert-course-${cert.id}`}>
                        {cert.courseName}
                      </td>
                      <td className="py-3 pr-4" data-testid={`text-cert-number-${cert.id}`}>
                        <Badge variant="secondary">{cert.certificateNumber}</Badge>
                      </td>
                      <td className="py-3 pr-4" data-testid={`text-cert-issue-${cert.id}`}>
                        {cert.issueDate}
                      </td>
                      <td className="py-3 pr-4" data-testid={`text-cert-expiration-${cert.id}`}>
                        {cert.expirationDate}
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon" data-testid={`button-download-cert-${cert.id}`}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-create-certificate">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">{t("certificates.createWizard")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cert-employee" data-testid="label-cert-employee">{t("certificates.employee")}</Label>
              <select
                id="cert-employee"
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                data-testid="select-cert-employee"
              >
                <option value="">{t("certificates.employee")}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-course" data-testid="label-cert-course">{t("certificates.course")}</Label>
              <Input
                id="cert-course"
                value={formCourse}
                onChange={(e) => setFormCourse(e.target.value)}
                data-testid="input-cert-course"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-issue" data-testid="label-cert-issue">{t("certificates.issueDate")}</Label>
              <Input
                id="cert-issue"
                type="date"
                value={formIssueDate}
                onChange={(e) => setFormIssueDate(e.target.value)}
                data-testid="input-cert-issue-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-expiration" data-testid="label-cert-expiration">{t("certificates.expirationDate")}</Label>
              <Input
                id="cert-expiration"
                type="date"
                value={formExpirationDate}
                onChange={(e) => setFormExpirationDate(e.target.value)}
                data-testid="input-cert-expiration-date"
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-cert">
                {t("common.cancel")}
              </Button>
              <Button onClick={handleCreate} data-testid="button-submit-cert">
                {t("common.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
