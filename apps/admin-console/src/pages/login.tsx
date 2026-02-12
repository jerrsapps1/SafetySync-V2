import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import GlassCard from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Languages } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { loginAs } = useAuth();
  const { t, toggleLang, lang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (role: "owner_admin" | "csr_admin") => {
    loginAs(role);
    toast({ title: t("auth.loginSuccess"), description: t("auth.welcomeBack") });
    setLocation("/dashboard");
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
          <h1 className="text-3xl font-semibold">SyncAI Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.signInToAccount")}
          </p>
        </div>

        <GlassCard>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">{t("common.email")}</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@syncai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-admin-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">{t("auth.password")}</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleLogin("owner_admin")}
              data-testid="button-admin-login"
            >
              Sign In as Owner Admin
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleLogin("csr_admin")}
              data-testid="button-csr-login"
            >
              Sign In as CSR Admin
            </Button>
          </div>
        </GlassCard>

        <div className="mt-4 text-center text-[10px] text-muted-foreground">
          {t("common.poweredBy")}
        </div>
      </div>
    </div>
  );
}
