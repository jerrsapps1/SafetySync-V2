import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import GlassCard from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Languages, Eye, EyeOff } from "lucide-react";

export default function CreateAccount() {
  const [, setLocation] = useLocation();
  const { setAuthFromCreateAccount } = useAuth();
  const { t, toggleLang, lang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [organizationName, setOrganizationName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("US");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!organizationName.trim()) newErrors.organizationName = "required";
    if (!fullName.trim()) newErrors.fullName = "required";
    if (!email.trim()) newErrors.email = "required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "invalid";
    if (!password) newErrors.password = "required";
    else if (password.length < 8) newErrors.password = "minLength";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName, fullName, email, password, country, state, phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "Email already in use") {
          toast({ title: t("createAccount.emailInUse"), variant: "destructive" });
        } else {
          toast({ title: t("createAccount.error"), variant: "destructive" });
        }
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      setAuthFromCreateAccount(data.token, data.user, data.company);
      toast({ title: t("createAccount.success") });
      setLocation("/onboarding");
    } catch {
      toast({ title: t("createAccount.error"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleLang} data-testid="button-toggle-lang-create">
          <Languages className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-toggle-theme-create">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40 mb-4" />
          <h1 className="text-3xl font-semibold" data-testid="text-create-account-title">SafetySync.ai</h1>
          <p className="mt-1 text-lg font-medium" data-testid="text-create-heading">
            {t("createAccount.title")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground" data-testid="text-create-subtitle">
            {t("createAccount.subtitle")}
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">{t("createAccount.orgName")} *</Label>
              <Input
                id="orgName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder={t("createAccount.orgNamePlaceholder")}
                className={errors.organizationName ? "border-destructive" : ""}
                data-testid="input-org-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">{t("createAccount.fullName")} *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("createAccount.fullNamePlaceholder")}
                className={errors.fullName ? "border-destructive" : ""}
                data-testid="input-full-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("createAccount.email")} *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("createAccount.emailPlaceholder")}
                className={errors.email ? "border-destructive" : ""}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("createAccount.password")} *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("createAccount.passwordPlaceholder")}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("createAccount.country")}</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger data-testid="select-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">{t("createAccount.unitedStates")}</SelectItem>
                    <SelectItem value="MX">{t("createAccount.mexico")}</SelectItem>
                    <SelectItem value="CA">{t("createAccount.canada")}</SelectItem>
                    <SelectItem value="OTHER">{t("createAccount.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("createAccount.state")}</Label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder={t("createAccount.statePlaceholder")}
                  data-testid="input-state"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("createAccount.phone")}</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("createAccount.phonePlaceholder")}
                data-testid="input-phone"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
              disabled={isSubmitting}
              data-testid="button-create-account"
            >
              {isSubmitting ? t("createAccount.creating") : t("createAccount.submit")}
            </Button>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("createAccount.haveAccount")}{" "}
          <Link href="/login">
            <span className="text-foreground hover:underline cursor-pointer" data-testid="link-sign-in">
              {t("createAccount.signIn")}
            </span>
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home-create">
              {t("common.back")}
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-center text-[10px] text-muted-foreground">
          {t("common.poweredBy")}
        </div>
      </div>
    </div>
  );
}
