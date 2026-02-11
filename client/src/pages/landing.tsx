import { Link } from "wouter";
import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { BookOpen, Bell, CreditCard, Users, Building2, FileText, Play, Sun, Moon, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const currentYear = new Date().getFullYear();

export default function Landing() {
  const [demoOpen, setDemoOpen] = useState(false);
  const { t, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      title: t("landing.feat1Title"),
      description: t("landing.feat1Desc"),
      Icon: BookOpen,
    },
    {
      title: t("landing.feat2Title"),
      description: t("landing.feat2Desc"),
      Icon: Bell,
    },
    {
      title: t("landing.feat3Title"),
      description: t("landing.feat3Desc"),
      Icon: CreditCard,
    },
    {
      title: t("landing.feat4Title"),
      description: t("landing.feat4Desc"),
      Icon: Users,
    },
    {
      title: t("landing.feat5Title"),
      description: t("landing.feat5Desc"),
      Icon: Building2,
    },
    {
      title: t("landing.feat6Title"),
      description: t("landing.feat6Desc"),
      Icon: FileText,
    },
  ];

  const pains = [
    { title: t("landing.pain1Title"), desc: t("landing.pain1Desc") },
    { title: t("landing.pain2Title"), desc: t("landing.pain2Desc") },
    { title: t("landing.pain3Title"), desc: t("landing.pain3Desc") },
    { title: t("landing.pain4Title"), desc: t("landing.pain4Desc") },
  ];

  const tiers = [
    {
      name: t("landing.starter"),
      blurb: t("landing.tierBlurb1"),
      bullets: [t("landing.tierBullet1a"), t("landing.tierBullet1b"), t("landing.tierBullet1c")],
    },
    {
      name: t("landing.professional"),
      blurb: t("landing.tierBlurb2"),
      bullets: [t("landing.tierBullet2a"), t("landing.tierBullet2b"), t("landing.tierBullet2c")],
    },
    {
      name: t("landing.enterprise"),
      blurb: t("landing.tierBlurb3"),
      bullets: [t("landing.tierBullet3a"), t("landing.tierBullet3b"), t("landing.tierBullet3c")],
    },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[color:var(--border-custom)]/70 bg-[color:var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40" />
            <span className="text-lg font-semibold tracking-tight">
              SafetySync.ai
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[color:var(--text-muted)] md:flex">
            <a href="#features" className="hover:text-[color:var(--text)]" data-testid="link-features">
              {t("landing.features")}
            </a>
            <a href="#for-safety" className="hover:text-[color:var(--text)]" data-testid="link-for-safety">
              {t("landing.forSafety")}
            </a>
            <a href="#pricing" className="hover:text-[color:var(--text)]" data-testid="link-pricing">
              {t("landing.pricing")}
            </a>
            <Link href="/login" className="hover:text-[color:var(--text)]" data-testid="link-login">
              {t("landing.login")}
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleLang} data-testid="button-toggle-lang">
              <Languages className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-toggle-theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link href="/login">
              <button 
                className="hover-elevate active-elevate-2 rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/30"
                data-testid="button-create-account-header"
              >
                {t("landing.createAccount")}
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero with network background */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#080c14] via-[#0a1020] to-[#0d1117]" />

          <svg className="absolute inset-0 h-full w-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="15%" x2="35%" y2="40%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="35%" y1="40%" x2="60%" y2="20%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="60%" y1="20%" x2="85%" y2="45%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="85%" y1="45%" x2="70%" y2="75%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="70%" y1="75%" x2="40%" y2="65%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="40%" y1="65%" x2="15%" y2="80%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="35%" y1="40%" x2="40%" y2="65%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="60%" y1="20%" x2="70%" y2="75%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="20%" y1="5%" x2="35%" y2="40%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="50%" y1="10%" x2="60%" y2="20%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="90%" y1="15%" x2="85%" y2="45%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="5%" y1="50%" x2="15%" y2="80%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="95%" y1="70%" x2="70%" y2="75%" stroke="#5b9cf5" strokeWidth="0.5" />
            <line x1="25%" y1="90%" x2="40%" y2="65%" stroke="#5b9cf5" strokeWidth="0.5" />
          </svg>

          <div className="absolute left-[10%] top-[15%] h-16 w-16 rounded-full border border-sky-500/15 bg-sky-500/5 blur-[1px]" />
          <div className="absolute left-[35%] top-[40%] h-5 w-5 rounded-full border border-sky-400/20 bg-sky-400/10 shadow-[0_0_15px_3px_rgba(56,189,248,0.12)]" />
          <div className="absolute left-[60%] top-[20%] h-10 w-10 rounded-full border border-indigo-400/15 bg-indigo-400/5" />
          <div className="absolute left-[85%] top-[45%] h-20 w-20 rounded-full border border-sky-500/10 bg-sky-500/[0.03]" />
          <div className="absolute left-[70%] top-[75%] h-6 w-6 rounded-full border border-sky-400/20 bg-sky-400/10 shadow-[0_0_12px_2px_rgba(56,189,248,0.1)]" />
          <div className="absolute left-[40%] top-[65%] h-4 w-4 rounded-full border border-indigo-400/20 bg-indigo-400/10" />
          <div className="absolute left-[15%] top-[80%] h-14 w-14 rounded-full border border-sky-500/10 bg-sky-500/[0.03]" />
          <div className="absolute left-[50%] top-[10%] h-8 w-8 rounded-full border border-indigo-500/10 bg-indigo-500/5" />
          <div className="absolute left-[90%] top-[15%] h-12 w-12 rounded-full border border-sky-500/10 bg-sky-500/[0.03]" />

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d1117] to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {t("landing.heroTitle")}
              </h1>
              <p className="mt-4 max-w-xl text-[color:var(--text-muted)]">
                {t("landing.heroDesc")}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/login">
                  <button 
                    className="hover-elevate active-elevate-2 rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/30"
                    data-testid="button-create-account-hero"
                  >
                    {t("landing.createAccount")}
                  </button>
                </Link>
                <button 
                  className="hover-elevate active-elevate-2 rounded-md border border-white/15 bg-transparent px-5 py-2.5 text-sm font-medium text-[color:var(--text)]"
                  data-testid="button-see-demo"
                  onClick={() => setDemoOpen(true)}
                >
                  {t("landing.seeDemo")}
                </button>
              </div>
              <p className="mt-3 text-xs text-[color:var(--text-muted)]">
                {t("landing.builtForManagers")}
              </p>
            </div>

            {/* Simple hero visual */}
            <div className="mt-8 lg:mt-0">
              <GlassCard className="p-8 text-center">
                <div className="mx-auto h-24 w-24 rounded-2xl bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-2xl shadow-sky-500/40" />
                <h3 className="mt-6 text-lg font-semibold">{t("landing.heroCardTitle")}</h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  {t("landing.heroCardDesc")}
                </p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Pain section */}
        <section
          id="problem"
          className="mt-20 border-t border-[color:var(--border-custom)] pt-12"
        >
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold">
              {t("landing.painTitle")}
            </h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              {t("landing.painDesc")}
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pains.map((pain) => (
              <GlassCard
                key={pain.title}
                className="hover-elevate active-elevate-2"
              >
                <h3 className="text-sm font-semibold">{pain.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  {pain.desc}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-20">
          <h2 className="text-2xl font-semibold">
            {t("landing.featSectionTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-[color:var(--text-muted)]">
            {t("landing.featSectionDesc")}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <GlassCard
                key={feature.title}
                className="hover-elevate active-elevate-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md border border-sky-500/30 bg-sky-500/5 flex items-center justify-center">
                    <feature.Icon className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* How It Works - Training Records View */}
        <section className="mt-20 border-t border-[color:var(--border-custom)] pt-12">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl font-semibold">
              {t("landing.howItWorks")}
            </h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              {t("landing.howItWorksDesc")}
            </p>
          </div>
          <GlassCard>
            <div className="mb-4 flex items-center justify-between text-xs text-[color:var(--text-muted)]">
              <span>{t("landing.tableOverview")}</span>
              <span>OSHA 1910 · OSHA 1926</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--canvas)]/70">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] border-b border-white/5 bg-white/5 px-3 py-2 text-[11px] text-[color:var(--text-muted)]">
                <span>{t("landing.tableEmployee")}</span>
                <span>{t("landing.tableRoleSite")}</span>
                <span>{t("landing.tableStandard")}</span>
                <span>{t("landing.tableStatus")}</span>
                <span className="text-right">{t("landing.tableExpiration")}</span>
              </div>
              {[
                {
                  name: "Maria Lopez",
                  role: `${t("landing.roleForeman")} · Site A`,
                  std: "OSHA 30 · 1926",
                  status: t("landing.statusUpToDate"),
                  badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                  exp: "2026-03-14",
                },
                {
                  name: "James Carter",
                  role: `${t("landing.roleLaborer")} · Site B`,
                  std: "OSHA 10 · 1926",
                  status: t("landing.statusExpiresIn14"),
                  badge: "bg-amber-500/15 text-amber-300 border-amber-500/40",
                  exp: "2025-12-01",
                },
                {
                  name: "Alex Nguyen",
                  role: `${t("landing.roleMaintenance")} · Plant 1`,
                  std: "LOTO · 1910",
                  status: t("landing.statusExpired"),
                  badge: "bg-rose-500/15 text-rose-300 border-rose-500/40",
                  exp: "2025-09-30",
                },
              ].map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] items-center border-t border-white/5 px-3 py-2.5 text-[11px]"
                >
                  <div className="truncate font-medium">{row.name}</div>
                  <div className="truncate text-[color:var(--text-muted)]">
                    {row.role}
                  </div>
                  <div className="truncate text-[color:var(--text-muted)]">
                    {row.std}
                  </div>
                  <div className="flex">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${row.badge}`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <div className="text-right text-[color:var(--text-muted)]">
                    {row.exp}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* For Safety */}
        <section
          id="for-safety"
          className="mt-20 grid gap-10 border-t border-[color:var(--border-custom)] pt-12 lg:grid-cols-2"
        >
          <div>
            <h2 className="text-2xl font-semibold">
              {t("landing.safetyTitle")}
            </h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              {t("landing.safetyDesc")}
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[color:var(--text-muted)]">
              <li>• {t("landing.safetyBullet1")}</li>
              <li>• {t("landing.safetyBullet2")}</li>
              <li>• {t("landing.safetyBullet3")}</li>
            </ul>
          </div>
          <GlassCard>
            <div className="mb-4">
              <h3 className="text-sm font-semibold">{t("landing.complianceOverview")}</h3>
              <p className="text-xs text-[color:var(--text-muted)]">{t("landing.complianceCurrentStatus")}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-3xl font-semibold text-emerald-400">92%</div>
                <div className="mt-1 text-xs text-[color:var(--text-muted)]">{t("landing.compliant")}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-3xl font-semibold text-amber-400">27</div>
                <div className="mt-1 text-xs text-[color:var(--text-muted)]">{t("landing.expiringSoonLabel")}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-3xl font-semibold text-rose-400">14</div>
                <div className="mt-1 text-xs text-[color:var(--text-muted)]">{t("landing.overdue")}</div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Testimonial */}
        <section className="mt-20 border-t border-[color:var(--border-custom)] pt-12">
          <GlassCard className="max-w-3xl mx-auto text-center">
            <p className="text-lg italic text-[color:var(--text)]">
              "{t("landing.testimonial")}"
            </p>
            <div className="mt-4">
              <p className="font-semibold">Sarah Mitchell</p>
              <p className="text-sm text-[color:var(--text-muted)]">{t("landing.testimonialAuthor")}</p>
            </div>
          </GlassCard>
        </section>

        {/* AI Trust & Transparency */}
        <section className="mt-20 border-t border-[color:var(--border-custom)] pt-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold">
              {t("landing.aiTitle")}
            </h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              {t("landing.aiDesc")}
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-20 border-t border-[color:var(--border-custom)] pt-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">{t("landing.pricingTitle")}</h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              {t("landing.pricingDesc")}
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <GlassCard key={tier.name} className="hover-elevate">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">{tier.blurb}</p>
                <ul className="mt-4 space-y-2 text-sm text-[color:var(--text-muted)]">
                  {tier.bullets.map((bullet) => (
                    <li key={bullet}>✓ {bullet}</li>
                  ))}
                </ul>
                <Link href="/login">
                  <button 
                    className="mt-6 w-full rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/30 hover-elevate active-elevate-2"
                    data-testid={`button-get-started-${tier.name.toLowerCase()}`}
                  >
                    {t("landing.createAccount")}
                  </button>
                </Link>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-semibold">
            {t("landing.ctaTitle")}
          </h2>
          <p className="mt-3 text-[color:var(--text-muted)]">
            {t("landing.ctaDesc")}
          </p>
          <Link href="/login">
            <button 
              className="mt-6 rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-base font-medium text-white shadow-lg shadow-orange-500/30 hover-elevate active-elevate-2"
              data-testid="button-final-cta"
            >
              {t("landing.createAccount")}
            </button>
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-white/5 bg-[#0d1117] pt-12 pb-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40" />
                <span className="text-base font-semibold">SafetySync.ai</span>
              </div>
              <p className="text-sm text-[color:var(--text-muted)]">
                AI-powered OSHA compliance for modern safety teams.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4">{t("landing.footerProduct")}</h4>
              <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
                <li>
                  <a href="#features" className="hover:text-[color:var(--text)]" data-testid="footer-link-features">
                    {t("landing.features")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[color:var(--text)]" data-testid="footer-link-pricing">
                    {t("landing.pricing")}
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[color:var(--text)]" data-testid="footer-link-login">
                    {t("landing.login")}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[color:var(--text)]" data-testid="footer-link-signup">
                    {t("landing.createAccount")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4">{t("landing.footerCompany")}</h4>
              <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
                <li>
                  <a href="#about" className="hover:text-[color:var(--text)]" data-testid="footer-link-about">
                    {t("landing.about")}
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-[color:var(--text)]" data-testid="footer-link-contact">
                    {t("landing.contact")}
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-[color:var(--text)]" data-testid="footer-link-privacy">
                    {t("landing.privacy")}
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:text-[color:var(--text)]" data-testid="footer-link-terms">
                    {t("landing.terms")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-[color:var(--text-muted)]">
            © {currentYear} SafetySync.ai. {t("landing.allRightsReserved")}
          </div>
        </footer>
      </main>

      {/* Demo Modal */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("landing.demoTitle")}</DialogTitle>
            <DialogDescription>
              {t("landing.demoSubtitle")}
            </DialogDescription>
          </DialogHeader>
          
          {/* Placeholder for future video/animation */}
          <div className="aspect-video rounded-lg border border-white/10 bg-gradient-to-br from-[#161b22] to-[#0d1117] flex flex-col items-center justify-center p-12">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-500/20 to-emerald-400/20 border border-sky-500/30 flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-sky-400 ml-1" />
            </div>
            <h3 className="text-lg font-semibold text-center">{t("landing.demoComingSoon")}</h3>
            <p className="mt-2 text-sm text-[color:var(--text-muted)] text-center max-w-md">
              {t("landing.demoDesc")}
            </p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)] text-center max-w-md">
              {t("landing.demoDesc2")}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/login">
                <button 
                  className="rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/30 hover-elevate active-elevate-2"
                  data-testid="button-demo-modal-signup"
                  onClick={() => setDemoOpen(false)}
                >
                  {t("landing.createAccount")}
                </button>
              </Link>
              <button 
                className="rounded-md border border-white/15 bg-transparent px-5 py-2.5 text-sm font-medium text-[color:var(--text)] hover-elevate active-elevate-2"
                data-testid="button-demo-modal-close"
                onClick={() => setDemoOpen(false)}
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
