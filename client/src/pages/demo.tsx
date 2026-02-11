import { Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Moon, Languages, ArrowLeft, Play } from "lucide-react";

export default function Demo() {
  const { t, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

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
      <main className="mx-auto max-w-4xl px-4 py-16">
        <Link href="/"><Button variant="ghost" size="sm" className="mb-6"><ArrowLeft className="h-4 w-4 mr-1" />{t("common.back")}</Button></Link>
        <h1 className="text-4xl font-semibold mb-4 text-center" data-testid="demo-title">{t("landing.seeDemo")}</h1>
        <Card className="mt-8">
          <CardContent className="p-0">
            <div className="aspect-video rounded-lg flex flex-col items-center justify-center p-12">
              <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <Play className="h-8 w-8 text-primary ml-1" />
              </div>
              <h3 className="text-lg font-semibold text-center">{t("public.demoPreviewTitle")}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
                {t("public.demoPreviewDesc")}
              </p>
              <Link href="/login">
                <Button className="mt-6" data-testid="button-demo-signup">
                  {t("landing.createAccount")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        {t("common.poweredBy")}: SyncAi
      </footer>
    </div>
  );
}
