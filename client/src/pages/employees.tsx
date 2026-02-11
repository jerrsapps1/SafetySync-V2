import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { listEmployees, createEmployee } from "@/mock/api";
import type { MockEmployee } from "@/mock/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const { t } = useI18n();
  const { activeOrg } = useOrganization();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await listEmployees(activeOrg.id);
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [activeOrg.id]);

  const filtered = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q)
    );
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createEmployee(activeOrg.id, {
        firstName: fd.get("firstName") as string,
        lastName: fd.get("lastName") as string,
        email: fd.get("email") as string,
        role: fd.get("role") as string,
        status: "active",
      });
      toast({ title: t("employees.createSuccess") });
      setDialogOpen(false);
      loadEmployees();
    } catch {
      toast({ title: t("employees.createFailed"), variant: "destructive" });
    }
  };

  return (
    <div data-testid="page-employees">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-employees-title">
            {t("employees.title")}
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-employees-subtitle">
            {t("employees.subtitle")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-add-employee">
          <Plus className="h-4 w-4 mr-2" />
          {t("employees.addEmployee")}
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-employees"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground" data-testid="text-loading">
          {t("common.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground" data-testid="text-no-employees">
          {t("employees.noEmployees")}
        </div>
      ) : (
        <Card data-testid="card-employees-table">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("employees.title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="px-4 py-2 font-medium" data-testid="th-name">{t("common.name")}</th>
                    <th className="px-4 py-2 font-medium" data-testid="th-role">{t("common.role")}</th>
                    <th className="px-4 py-2 font-medium" data-testid="th-email">{t("common.email")}</th>
                    <th className="px-4 py-2 font-medium" data-testid="th-status">{t("common.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b last:border-b-0 hover-elevate cursor-pointer"
                      data-testid={`row-employee-${emp.id}`}
                    >
                      <td className="px-4 py-2.5">
                        <Link href={`/employees/${emp.id}`} className="font-medium hover:underline" data-testid={`link-employee-${emp.id}`}>
                          {emp.firstName} {emp.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-role-${emp.id}`}>
                        {emp.role}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-email-${emp.id}`}>
                        {emp.email || "N/A"}
                      </td>
                      <td className="px-4 py-2.5" data-testid={`text-status-${emp.id}`}>
                        <Badge
                          variant={emp.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                          data-testid={`badge-status-${emp.id}`}
                        >
                          {emp.status === "active" ? t("employees.active") : t("employees.inactive")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-add-employee">
          <DialogHeader>
            <DialogTitle>{t("employees.addEmployee")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("employees.firstName")}</Label>
                <Input id="firstName" name="firstName" required data-testid="input-firstName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("employees.lastName")}</Label>
                <Input id="lastName" name="lastName" required data-testid="input-lastName" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("employees.email")}</Label>
              <Input id="email" name="email" type="email" data-testid="input-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t("employees.role")}</Label>
              <Input id="role" name="role" required placeholder="e.g. Foreman, Laborer, Electrician" data-testid="input-role" />
            </div>
            <Button type="submit" className="w-full" data-testid="button-submit-employee">
              {t("common.create")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
