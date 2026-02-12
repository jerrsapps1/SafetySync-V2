import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listWalletCards, listEmployees, createWalletCard } from "@/mock/api";
import type { MockWalletCard, MockEmployee } from "@/mock/db";

export default function WalletCardsPage() {
  const { t } = useI18n();
  const { activeOrg } = useOrganization();
  const { toast } = useToast();

  const [walletCards, setWalletCards] = useState<MockWalletCard[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formCourse, setFormCourse] = useState("");
  const [formTrainingDate, setFormTrainingDate] = useState("");
  const [formExpirationDate, setFormExpirationDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [cards, emps] = await Promise.all([
      listWalletCards(activeOrg.id),
      listEmployees(activeOrg.id),
    ]);
    setWalletCards(cards);
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

  const handleCreate = async () => {
    if (!formEmployeeId || !formCourse || !formTrainingDate || !formExpirationDate) return;
    await createWalletCard({
      orgId: activeOrg.id,
      employeeId: formEmployeeId,
      courseName: formCourse,
      trainingDate: formTrainingDate,
      expirationDate: formExpirationDate,
    });
    toast({ title: t("walletCards.createSuccess") });
    setDialogOpen(false);
    setFormEmployeeId("");
    setFormCourse("");
    setFormTrainingDate("");
    setFormExpirationDate("");
    loadData();
  };

  return (
    <div className="space-y-6 p-6" data-testid="wallet-cards-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-wallet-cards-title">
            <CreditCard className="inline-block mr-2 h-6 w-6" />
            {t("walletCards.title")}
          </h1>
          <p className="text-muted-foreground" data-testid="text-wallet-cards-subtitle">
            {t("walletCards.subtitle")}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-create-wallet-card">
          <Plus className="mr-2 h-4 w-4" />
          {t("walletCards.create")}
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground" data-testid="text-loading">{t("common.loading")}</p>
      ) : walletCards.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground" data-testid="text-no-wallet-cards">
              {t("walletCards.noCards")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-wallet-cards">
          {walletCards.map((card) => (
            <div key={card.id} className="space-y-3" data-testid={`card-wallet-${card.id}`}>
              <div className="aspect-[48/28] rounded-md border border-border/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 p-5 flex flex-col justify-between text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/10 pointer-events-none" />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-white/60" data-testid={`text-wc-employee-label-${card.id}`}>
                      {t("certificates.employee")}
                    </p>
                    <p className="font-semibold text-sm" data-testid={`text-wc-employee-${card.id}`}>
                      {employeeMap[card.employeeId] || card.employeeId}
                    </p>
                  </div>
                  <span className="text-[10px] text-white/40 font-medium" data-testid={`text-wc-branding-${card.id}`}>
                    SafetySync.ai
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm mb-2" data-testid={`text-wc-course-${card.id}`}>
                    {card.courseName}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div>
                      <p className="text-white/60">{t("walletCards.trainingDate")}</p>
                      <p data-testid={`text-wc-training-date-${card.id}`}>{card.trainingDate}</p>
                    </div>
                    <div>
                      <p className="text-white/60">{t("walletCards.expirationDate")}</p>
                      <p data-testid={`text-wc-expiration-date-${card.id}`}>{card.expirationDate}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <p className="text-xs text-white/50 font-mono" data-testid={`text-wc-number-${card.id}`}>
                    {card.cardNumber}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" data-testid={`button-download-wc-${card.id}`}>
                <Download className="mr-2 h-4 w-4" />
                {t("common.download")}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-create-wallet-card">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">{t("walletCards.create")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wc-employee" data-testid="label-wc-employee">{t("certificates.employee")}</Label>
              <select
                id="wc-employee"
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                data-testid="select-wc-employee"
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
              <Label htmlFor="wc-course" data-testid="label-wc-course">{t("certificates.course")}</Label>
              <Input
                id="wc-course"
                value={formCourse}
                onChange={(e) => setFormCourse(e.target.value)}
                data-testid="input-wc-course"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wc-training" data-testid="label-wc-training">{t("walletCards.trainingDate")}</Label>
              <Input
                id="wc-training"
                type="date"
                value={formTrainingDate}
                onChange={(e) => setFormTrainingDate(e.target.value)}
                data-testid="input-wc-training-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wc-expiration" data-testid="label-wc-expiration">{t("walletCards.expirationDate")}</Label>
              <Input
                id="wc-expiration"
                type="date"
                value={formExpirationDate}
                onChange={(e) => setFormExpirationDate(e.target.value)}
                data-testid="input-wc-expiration-date"
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-wc">
                {t("common.cancel")}
              </Button>
              <Button onClick={handleCreate} data-testid="button-submit-wc">
                {t("common.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
