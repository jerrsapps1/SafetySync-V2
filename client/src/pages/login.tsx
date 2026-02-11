import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import GlassCard from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Languages } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { loginAs } = useAuth();
  const { t, toggleLang, lang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleWorkspaceLogin = () => {
    loginAs("workspace");
    toast({ title: t("auth.loginSuccess"), description: t("auth.welcomeBack") });
    setLocation("/dashboard");
  };

  const handleOwnerLogin = () => {
    loginAs("owner");
    toast({ title: t("auth.loginSuccess"), description: t("auth.welcomeBack") });
    setLocation("/owner/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleLang} data-testid="button-toggle-lang-login">
          <Languages className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-toggle-theme-login">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40 mb-4" />
          <h1 className="text-3xl font-semibold">SafetySync.ai</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.signInToAccount")}
          </p>
        </div>

        <GlassCard>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-6">
              {lang === "es" ? "Elige cómo quieres entrar:" : "Choose how to sign in:"}
            </p>

            <Button
              className="w-full"
              onClick={handleWorkspaceLogin}
              data-testid="button-login-workspace"
            >
              {t("auth.signInWorkspace")}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleOwnerLogin}
              data-testid="button-login-owner"
            >
              {t("auth.signInOwner")}
            </Button>
          </div>
        </GlassCard>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("auth.dontHaveAccount")}{" "}
          <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
            <DialogTrigger asChild>
              <button className="text-foreground hover:underline" data-testid="link-create-account">
                {t("auth.createAccount")}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("auth.createAccount")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("auth.username")}</Label>
                  <Input placeholder="johndoe" data-testid="input-signup-username" />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.email")} *</Label>
                  <Input type="email" placeholder="you@company.com" data-testid="input-signup-email" />
                </div>
                <div className="space-y-2">
                  <Label>{t("auth.password")} *</Label>
                  <Input type="password" placeholder="••••••••" data-testid="input-signup-password" />
                </div>
                <div className="space-y-2">
                  <Label>{t("auth.companyName")} *</Label>
                  <Input placeholder="ACME Construction" data-testid="input-signup-company" />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    loginAs("workspace");
                    setIsSignUpOpen(false);
                    toast({ title: t("auth.accountCreated") });
                    setLocation("/dashboard");
                  }}
                  data-testid="button-signup-submit"
                >
                  {t("auth.createAccount")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </p>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              {t("common.back")}
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-center text-[10px] text-muted-foreground">
          {t("common.poweredBy")}: SyncAi
        </div>
      </div>
    </div>
  );
}
