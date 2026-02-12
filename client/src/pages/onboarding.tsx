import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import GlassCard from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Languages, Plus, Users, FileUp, CheckCircle2, Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TempEmployee {
  name: string;
  title: string;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, trialEndDate, companyId } = useAuth();
  const { t, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [empName, setEmpName] = useState("");
  const [empTitle, setEmpTitle] = useState("");
  const [addedEmployees, setAddedEmployees] = useState<TempEmployee[]>([]);
  const [addingEmployee, setAddingEmployee] = useState(false);

  const handleAddEmployee = async () => {
    if (!empName.trim() || !empTitle.trim()) return;
    setAddingEmployee(true);
    try {
      const names = empName.trim().split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ") || "-";
      await apiRequest("POST", "/api/employees", {
        firstName,
        lastName,
        role: empTitle.trim(),
        email: null,
      });
      setAddedEmployees([...addedEmployees, { name: empName.trim(), title: empTitle.trim() }]);
      setEmpName("");
      setEmpTitle("");
    } catch {
      toast({ title: t("employees.createFailed"), variant: "destructive" });
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleFinish = async () => {
    try {
      if (companyId) {
        await apiRequest("PATCH", `/api/companies/${companyId}/onboarding`, {});
      }
    } catch {
      // non-critical
    }
    setLocation("/dashboard");
  };

  const trialDate = trialEndDate ? new Date(trialEndDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const formattedTrialDate = trialDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const stepIcons = [Users, FileUp, CheckCircle2];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleLang} data-testid="button-toggle-lang-onboarding">
          <Languages className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-toggle-theme-onboarding">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40 mb-4" />
          <h1 className="text-2xl font-semibold">SafetySync.ai</h1>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6" data-testid="progress-indicator">
          {Array.from({ length: totalSteps }, (_, i) => {
            const StepIcon = stepIcons[i];
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`h-px w-8 ${isCompleted ? "bg-sky-500" : "bg-muted-foreground/30"}`} />
                )}
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-sky-500 bg-sky-500/15 text-sky-500"
                      : isCompleted
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                  data-testid={`step-indicator-${stepNum}`}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4" data-testid="step-label">
          {t("onboarding.step")} {step} {t("onboarding.of")} {totalSteps}
        </p>

        <GlassCard>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold" data-testid="text-step1-title">{t("onboarding.step1Title")}</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-step1-desc">{t("onboarding.step1Desc")}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("onboarding.empName")}</Label>
                  <Input
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder={t("onboarding.empNamePlaceholder")}
                    data-testid="input-emp-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("onboarding.empTitle")}</Label>
                  <Input
                    value={empTitle}
                    onChange={(e) => setEmpTitle(e.target.value)}
                    placeholder={t("onboarding.empTitlePlaceholder")}
                    data-testid="input-emp-title"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleAddEmployee}
                disabled={!empName.trim() || !empTitle.trim() || addingEmployee}
                data-testid="button-add-employee"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("onboarding.addAnother")}
              </Button>

              {addedEmployees.length > 0 && (
                <div className="space-y-2" data-testid="added-employees-list">
                  <p className="text-sm text-muted-foreground">
                    {addedEmployees.length} {t("onboarding.added")}
                  </p>
                  {addedEmployees.map((emp, i) => (
                    <Card key={i}>
                      <CardContent className="p-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{emp.name}</span>
                        <Badge variant="secondary" className="text-xs">{emp.title}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="pt-2 rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground" data-testid="csv-placeholder">
                <Upload className="h-4 w-4 mx-auto mb-1" />
                {t("onboarding.csvUpload")}
                <p className="text-xs mt-1">{t("onboarding.csvComingSoon")}</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold" data-testid="text-step2-title">{t("onboarding.step2Title")}</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-step2-desc">{t("onboarding.step2Desc")}</p>
              </div>

              <div className="rounded-md border border-dashed p-8 text-center" data-testid="upload-area">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("onboarding.uploadPlaceholder")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("onboarding.supportedFormats")}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                <h2 className="text-xl font-semibold" data-testid="text-step3-title">{t("onboarding.step3Title")}</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-step3-desc">{t("onboarding.step3Desc")}</p>
              </div>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm">
                    {t("onboarding.trialEnds")}{" "}
                    <span className="font-semibold" data-testid="text-trial-end-date">{formattedTrialDate}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t("onboarding.trialInfo")}</p>
                </CardContent>
              </Card>

              <div>
                <p className="text-sm font-medium mb-2">{t("onboarding.nextSteps")}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-sky-500" />
                    {t("onboarding.nextStep1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-sky-500" />
                    {t("onboarding.nextStep2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-sky-500" />
                    {t("onboarding.nextStep3")}
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mt-6">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)} data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("onboarding.back")}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {step < totalSteps && (
                <Button variant="ghost" onClick={() => setStep(step + 1)} data-testid="button-skip">
                  {t("onboarding.skip")}
                </Button>
              )}
              {step < totalSteps ? (
                <Button onClick={() => setStep(step + 1)} data-testid="button-continue">
                  {t("onboarding.continue")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-600"
                  onClick={handleFinish}
                  data-testid="button-go-to-dashboard"
                >
                  {t("onboarding.goToDashboard")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
