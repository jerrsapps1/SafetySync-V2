import { Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sun, Moon, Languages, ArrowLeft, ShieldCheck, Lock, Server, Eye } from "lucide-react";

export default function Security() {
  const { t, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const items = [
    { icon: Lock, title: t("public.dataEncryption"), desc: t("public.dataEncryptionDesc") },
    { icon: ShieldCheck, title: t("public.soc2"), desc: t("public.soc2Desc") },
    { icon: Server, title: t("public.secureInfra"), desc: t("public.secureInfraDesc") },
    { icon: Eye, title: t("public.accessControls"), desc: t("public.accessControlsDesc") },
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
        <h1 className="text-4xl font-semibold mb-4" data-testid="security-title">{t("public.security")}</h1>
        <p className="text-muted-foreground mb-12 max-w-2xl">
          {t("public.securityDesc")}
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <Card key={i} data-testid={`security-card-${i}`}>
              <CardHeader>
                <item.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        {t("common.poweredBy")}
      </footer>
    </div>
  );
}
