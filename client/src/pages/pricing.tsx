import { Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sun, Moon, Languages, ArrowLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  const { t, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const plans = [
    {
      name: t("landing.starter"),
      price: "$49",
      period: t("landing.month"),
      features: [t("pricing.upTo25"), t("pricing.docProcessing"), t("pricing.basicCerts"), t("pricing.emailSupport")],
    },
    {
      name: t("landing.professional"),
      price: "$149",
      period: t("landing.month"),
      popular: true,
      features: [t("pricing.upTo100"), t("pricing.aiDocProcessing"), t("pricing.walletCards"), t("pricing.complianceTracking"), t("pricing.prioritySupport")],
    },
    {
      name: t("landing.enterprise"),
      price: t("landing.createAccount"),
      period: "",
      features: [t("pricing.unlimitedEmployees"), t("pricing.customExports"), t("pricing.dedicatedOnboarding"), t("pricing.apiAccess"), t("pricing.slaGuarantee")],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40" />
              <span className="text-lg font-semibold tracking-tight">SafetySync.ai</span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleLang}><Languages className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link href="/login"><Button size="sm">{t("landing.createAccount")}</Button></Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <Link href="/"><Button variant="ghost" size="sm" className="mb-6"><ArrowLeft className="h-4 w-4 mr-1" />{t("common.back")}</Button></Link>
        <h1 className="text-4xl font-semibold mb-4 text-center" data-testid="pricing-title">{t("landing.pricingTitle")}</h1>
        <p className="text-muted-foreground mb-12 text-center max-w-xl mx-auto">
          {t("landing.pricingDesc")}
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <Card key={i} className={plan.popular ? "ring-2 ring-primary" : ""} data-testid={`pricing-card-${i}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.popular && <Badge>{t("landing.popular")}</Badge>}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
                    {t("landing.createAccount")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        {t("common.poweredBy")}: SyncAi
      </footer>
    </div>
  );
}
