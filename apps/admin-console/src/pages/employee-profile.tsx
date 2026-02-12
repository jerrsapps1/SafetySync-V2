import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  getEmployee,
  listTrainingRecords,
  listCertificates,
  listWalletCards,
  createTrainingRecord,
  createCertificate,
  createWalletCard,
} from "@/mock/api";
import type {
  MockEmployee,
  MockTrainingRecord,
  MockCertificate,
  MockWalletCard,
} from "@/mock/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Download, FileText, Award, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeProfile() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const { activeOrg } = useOrganization();
  const { toast } = useToast();

  const [employee, setEmployee] = useState<MockEmployee | null>(null);
  const [trainingRecords, setTrainingRecords] = useState<MockTrainingRecord[]>([]);
  const [certificates, setCertificates] = useState<MockCertificate[]>([]);
  const [walletCards, setWalletCards] = useState<MockWalletCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [emp, records, certs, cards] = await Promise.all([
        getEmployee(id!),
        listTrainingRecords(activeOrg.id),
        listCertificates(activeOrg.id),
        listWalletCards(activeOrg.id),
      ]);
      setEmployee(emp ?? null);
      setTrainingRecords(records.filter((r) => r.employeeId === id));
      setCertificates(certs.filter((c) => c.employeeId === id));
      setWalletCards(cards.filter((w) => w.employeeId === id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id, activeOrg.id]);

  const handleAddTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createTrainingRecord({
        orgId: activeOrg.id,
        employeeId: id!,
        courseName: fd.get("courseName") as string,
        oshaStandard: fd.get("oshaStandard") as string,
        completionDate: fd.get("completionDate") as string,
        expirationDate: fd.get("expirationDate") as string,
        instructorName: fd.get("instructorName") as string,
      });
      toast({ title: t("employees.createSuccess") });
      setTrainingDialogOpen(false);
      loadData();
    } catch {
      toast({ title: t("employees.createFailed"), variant: "destructive" });
    }
  };

  const handleGenerateCert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createCertificate({
        orgId: activeOrg.id,
        employeeId: id!,
        courseName: fd.get("courseName") as string,
        issueDate: fd.get("issueDate") as string,
        expirationDate: fd.get("expirationDate") as string,
      });
      toast({ title: t("certificates.createSuccess") });
      setCertDialogOpen(false);
      loadData();
    } catch {
      toast({ title: t("employees.createFailed"), variant: "destructive" });
    }
  };

  const handleGenerateWallet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createWalletCard({
        orgId: activeOrg.id,
        employeeId: id!,
        courseName: fd.get("courseName") as string,
        trainingDate: fd.get("trainingDate") as string,
        expirationDate: fd.get("expirationDate") as string,
      });
      toast({ title: t("walletCards.createSuccess") });
      setWalletDialogOpen(false);
      loadData();
    } catch {
      toast({ title: t("employees.createFailed"), variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="text-loading">
        {t("common.loading")}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="text-not-found">
        {t("common.noResults")}
      </div>
    );
  }

  return (
    <div data-testid="page-employee-profile">
      <div className="mb-6">
        <Link href="/employees" data-testid="link-back-employees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Button>
        </Link>
      </div>

      <Card className="mb-6" data-testid="card-employee-info">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-employee-name">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-muted-foreground" data-testid="text-employee-role">
                {employee.role}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="text-employee-email">
                {employee.email}
              </p>
            </div>
            <Badge
              variant={employee.status === "active" ? "default" : "secondary"}
              data-testid="badge-employee-status"
            >
              {employee.status === "active" ? t("employees.active") : t("employees.inactive")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="training" data-testid="tabs-employee">
        <TabsList className="mb-4" data-testid="tabslist-employee">
          <TabsTrigger value="training" data-testid="tab-training">
            <FileText className="h-4 w-4 mr-1" />
            {t("employees.trainingHistory")}
          </TabsTrigger>
          <TabsTrigger value="certificates" data-testid="tab-certificates">
            <Award className="h-4 w-4 mr-1" />
            {t("employees.certificates")}
          </TabsTrigger>
          <TabsTrigger value="walletCards" data-testid="tab-wallet-cards">
            <CreditCard className="h-4 w-4 mr-1" />
            {t("employees.walletCards")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="training" data-testid="tabcontent-training">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-medium">{t("employees.trainingHistory")}</h2>
            <Button onClick={() => setTrainingDialogOpen(true)} data-testid="button-add-training">
              <Plus className="h-4 w-4 mr-2" />
              {t("employees.addTraining")}
            </Button>
          </div>

          {trainingRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-training">
              {t("common.noResults")}
            </div>
          ) : (
            <Card data-testid="card-training-table">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left">
                        <th className="px-4 py-2 font-medium">{t("documents.courseName")}</th>
                        <th className="px-4 py-2 font-medium">{t("documents.oshaStandard")}</th>
                        <th className="px-4 py-2 font-medium">{t("documents.completionDate")}</th>
                        <th className="px-4 py-2 font-medium">{t("certificates.expirationDate")}</th>
                        <th className="px-4 py-2 font-medium">{t("documents.instructorName")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingRecords.map((rec) => (
                        <tr key={rec.id} className="border-b last:border-b-0" data-testid={`row-training-${rec.id}`}>
                          <td className="px-4 py-2.5 font-medium" data-testid={`text-training-course-${rec.id}`}>{rec.courseName}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-training-osha-${rec.id}`}>{rec.oshaStandard}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-training-completed-${rec.id}`}>{rec.completionDate}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-training-expires-${rec.id}`}>{rec.expirationDate}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-training-instructor-${rec.id}`}>{rec.instructorName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certificates" data-testid="tabcontent-certificates">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-medium">{t("employees.certificates")}</h2>
            <Button onClick={() => setCertDialogOpen(true)} data-testid="button-generate-cert">
              <Plus className="h-4 w-4 mr-2" />
              {t("employees.generateCert")}
            </Button>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-certificates">
              {t("certificates.noCertificates")}
            </div>
          ) : (
            <Card data-testid="card-certificates-table">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left">
                        <th className="px-4 py-2 font-medium">{t("certificates.course")}</th>
                        <th className="px-4 py-2 font-medium">#</th>
                        <th className="px-4 py-2 font-medium">{t("certificates.issueDate")}</th>
                        <th className="px-4 py-2 font-medium">{t("certificates.expirationDate")}</th>
                        <th className="px-4 py-2 font-medium">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="border-b last:border-b-0" data-testid={`row-cert-${cert.id}`}>
                          <td className="px-4 py-2.5 font-medium" data-testid={`text-cert-course-${cert.id}`}>{cert.courseName}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-cert-number-${cert.id}`}>{cert.certificateNumber}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-cert-issued-${cert.id}`}>{cert.issueDate}</td>
                          <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-cert-expires-${cert.id}`}>{cert.expirationDate}</td>
                          <td className="px-4 py-2.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast({ title: t("common.download") })}
                              data-testid={`button-download-cert-${cert.id}`}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {t("common.download")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="walletCards" data-testid="tabcontent-wallet-cards">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-medium">{t("employees.walletCards")}</h2>
            <Button onClick={() => setWalletDialogOpen(true)} data-testid="button-generate-wallet">
              <Plus className="h-4 w-4 mr-2" />
              {t("employees.generateWallet")}
            </Button>
          </div>

          {walletCards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-wallet-cards">
              {t("walletCards.noCards")}
            </div>
          ) : (
            <div className="space-y-6">
              <Card data-testid="card-wallet-table">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground text-left">
                          <th className="px-4 py-2 font-medium">{t("certificates.course")}</th>
                          <th className="px-4 py-2 font-medium">#</th>
                          <th className="px-4 py-2 font-medium">{t("walletCards.trainingDate")}</th>
                          <th className="px-4 py-2 font-medium">{t("walletCards.expirationDate")}</th>
                          <th className="px-4 py-2 font-medium">{t("common.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {walletCards.map((card) => (
                          <tr key={card.id} className="border-b last:border-b-0" data-testid={`row-wallet-${card.id}`}>
                            <td className="px-4 py-2.5 font-medium" data-testid={`text-wallet-course-${card.id}`}>{card.courseName}</td>
                            <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-wallet-number-${card.id}`}>{card.cardNumber}</td>
                            <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-wallet-date-${card.id}`}>{card.trainingDate}</td>
                            <td className="px-4 py-2.5 text-muted-foreground" data-testid={`text-wallet-expires-${card.id}`}>{card.expirationDate}</td>
                            <td className="px-4 py-2.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast({ title: t("common.download") })}
                                data-testid={`button-download-wallet-${card.id}`}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {t("common.download")}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-base font-medium mb-3">{t("walletCards.preview")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {walletCards.map((card) => (
                    <div
                      key={card.id}
                      className="relative rounded-md p-[2px] bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400"
                      style={{ maxWidth: 480 }}
                      data-testid={`wallet-preview-${card.id}`}
                    >
                      <div
                        className="rounded-md bg-card p-4 flex flex-col justify-between"
                        style={{ aspectRatio: "480/280" }}
                      >
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">SafetySync.ai</p>
                          <p className="font-semibold text-sm" data-testid={`wallet-preview-name-${card.id}`}>
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1" data-testid={`wallet-preview-course-${card.id}`}>
                            {card.courseName}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-end justify-between gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="block">{t("walletCards.trainingDate")}: {card.trainingDate}</span>
                            <span className="block">{t("walletCards.expirationDate")}: {card.expirationDate}</span>
                          </div>
                          <span className="font-mono text-[11px]" data-testid={`wallet-preview-number-${card.id}`}>
                            {card.cardNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent data-testid="dialog-add-training">
          <DialogHeader>
            <DialogTitle>{t("employees.addTraining")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTraining} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tr-courseName">{t("documents.courseName")}</Label>
              <Input id="tr-courseName" name="courseName" required data-testid="input-training-courseName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-oshaStandard">{t("documents.oshaStandard")}</Label>
              <Input id="tr-oshaStandard" name="oshaStandard" required data-testid="input-training-oshaStandard" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tr-completionDate">{t("documents.completionDate")}</Label>
                <Input id="tr-completionDate" name="completionDate" type="date" required data-testid="input-training-completionDate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tr-expirationDate">{t("certificates.expirationDate")}</Label>
                <Input id="tr-expirationDate" name="expirationDate" type="date" required data-testid="input-training-expirationDate" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-instructorName">{t("documents.instructorName")}</Label>
              <Input id="tr-instructorName" name="instructorName" required data-testid="input-training-instructorName" />
            </div>
            <Button type="submit" className="w-full" data-testid="button-submit-training">
              {t("common.create")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
        <DialogContent data-testid="dialog-generate-cert">
          <DialogHeader>
            <DialogTitle>{t("employees.generateCert")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerateCert} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cert-courseName">{t("documents.courseName")}</Label>
              <Input id="cert-courseName" name="courseName" required data-testid="input-cert-courseName" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cert-issueDate">{t("certificates.issueDate")}</Label>
                <Input id="cert-issueDate" name="issueDate" type="date" required data-testid="input-cert-issueDate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-expirationDate">{t("certificates.expirationDate")}</Label>
                <Input id="cert-expirationDate" name="expirationDate" type="date" required data-testid="input-cert-expirationDate" />
              </div>
            </div>
            <Button type="submit" className="w-full" data-testid="button-submit-cert">
              {t("common.create")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent data-testid="dialog-generate-wallet">
          <DialogHeader>
            <DialogTitle>{t("employees.generateWallet")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerateWallet} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wc-courseName">{t("documents.courseName")}</Label>
              <Input id="wc-courseName" name="courseName" required data-testid="input-wallet-courseName" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wc-trainingDate">{t("walletCards.trainingDate")}</Label>
                <Input id="wc-trainingDate" name="trainingDate" type="date" required data-testid="input-wallet-trainingDate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wc-expirationDate">{t("walletCards.expirationDate")}</Label>
                <Input id="wc-expirationDate" name="expirationDate" type="date" required data-testid="input-wallet-expirationDate" />
              </div>
            </div>
            <Button type="submit" className="w-full" data-testid="button-submit-wallet">
              {t("common.create")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
