import { Link } from "wouter";
import GlassCard from "@/components/GlassCard";

const currentYear = new Date().getFullYear();

const features = [
  {
    title: "Smart training recordkeeping",
    description:
      "Keep every employee's OSHA 1910 & 1926 training in one place—no more scattered spreadsheets or shared drives.",
    icon: "📚",
  },
  {
    title: "Automated expirations & reminders",
    description:
      "Track expiration dates and send proactive reminders before workers fall out of compliance.",
    icon: "⏰",
  },
  {
    title: "Instant certs & wallet cards",
    description:
      "Generate professional certificates and wallet cards that are always available and easy to re-issue.",
    icon: "🎫",
  },
  {
    title: "HR + Safety shared workspace",
    description:
      "Give HR and EHS teams a single source of truth for training status, roles, and locations.",
    icon: "🤝",
  },
  {
    title: "Construction & general industry",
    description:
      "Built for both OSHA 1910 and 1926 so you can manage multiple divisions without duct-taped systems.",
    icon: "🏗️",
  },
  {
    title: "Audit-ready exports in minutes",
    description:
      "Pull clean, inspector-ready reports by company, site, or role with just a few clicks.",
    icon: "📄",
  },
];

const pains = [
  { title: "Spreadsheets everywhere", desc: "Multiple versions, no history, and nobody sure which sheet is the latest." },
  { title: "No single source of truth", desc: "HR, safety, and operations each keep their own copy of reality." },
  { title: "Audit prep = panic mode", desc: "Scramble for certificates, sign-in sheets, and proof of training at the worst possible time." },
  { title: "HR & safety out of sync", desc: "People data changes daily, but training records stay stuck in static files." },
];

const tiers = [
  {
    name: "Essential",
    blurb: "For small teams getting out of spreadsheets.",
    bullets: ["Core recordkeeping", "Single company", "Basic reporting"],
  },
  {
    name: "Professional",
    blurb: "For multi-site contractors and growing teams.",
    bullets: ["Multi-location support", "Advanced filters", "Team workspaces"],
  },
  {
    name: "Enterprise",
    blurb: "For complex organizations and training providers.",
    bullets: ["Multi-tenant support", "Custom exports", "Dedicated onboarding"],
  },
];

export default function Landing() {
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
              Features
            </a>
            <a href="#for-hr" className="hover:text-[color:var(--text)]" data-testid="link-for-hr">
              For HR
            </a>
            <a href="#pricing" className="hover:text-[color:var(--text)]" data-testid="link-pricing">
              Pricing
            </a>
            <Link href="/login">
              <a className="hover:text-[color:var(--text)]" data-testid="link-login">Login</a>
            </Link>
            <button 
              className="hover-elevate active-elevate-2 rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/30"
              data-testid="button-book-demo"
              onClick={() => console.log("Book demo clicked")}
            >
              Book a demo
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-[color:var(--canvas)]/80 px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              OSHA training compliance, on autopilot
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              All your OSHA training records in one smart workspace.
            </h1>
            <p className="mt-4 max-w-xl text-[color:var(--text-muted)]">
              SafetySync.ai keeps every employee's training, expirations, and
              certificates organized and audit-ready—without brittle
              spreadsheets or missing paperwork.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button 
                className="hover-elevate active-elevate-2 rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/30"
                data-testid="button-book-live-demo"
                onClick={() => console.log("Book live demo clicked")}
              >
                Book a live demo
              </button>
              <button 
                className="hover-elevate active-elevate-2 rounded-md border border-white/15 bg-transparent px-5 py-2.5 text-sm font-medium text-[color:var(--text)]"
                data-testid="button-view-sample"
                onClick={() => console.log("View sample workspace clicked")}
              >
                View sample workspace
              </button>
            </div>
            <p className="mt-3 text-xs text-[color:var(--text-muted)]">
              Built for safety teams, HR, and training providers.
            </p>
          </div>

          {/* Hero app preview */}
          <GlassCard className="mt-2 lg:mt-0">
            <div className="mb-4 flex items-center justify-between text-xs text-[color:var(--text-muted)]">
              <span>Training overview · Demo company</span>
              <span>OSHA 1910 · OSHA 1926</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--canvas)]/70">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] border-b border-white/5 bg-white/5 px-3 py-2 text-[11px] text-[color:var(--text-muted)]">
                <span>Employee</span>
                <span>Role / Site</span>
                <span>Standard</span>
                <span>Status</span>
                <span className="text-right">Expiration</span>
              </div>
              {[
                {
                  name: "Maria Lopez",
                  role: "Foreman · Site A",
                  std: "OSHA 30 · 1926",
                  status: "Up to date",
                  badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                  exp: "2026-03-14",
                },
                {
                  name: "James Carter",
                  role: "Laborer · Site B",
                  std: "OSHA 10 · 1926",
                  status: "Expires in 14 days",
                  badge: "bg-amber-500/15 text-amber-300 border-amber-500/40",
                  exp: "2025-12-01",
                },
                {
                  name: "Alex Nguyen",
                  role: "Maintenance · Plant 1",
                  std: "LOTO · 1910",
                  status: "Expired",
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

        {/* Pain section */}
        <section
          id="problem"
          className="mt-20 border-t border-[color:var(--border-custom)] pt-12"
        >
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold">
              Spreadsheets weren't built for OSHA audits.
            </h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              When training records are scattered across spreadsheets, paper
              files, and inboxes, you're always one missing certificate away
              from a bad day with an inspector. SafetySync.ai gives you a single
              source of truth for OSHA 1910 and 1926 training.
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
            Everything you need to prove training happened.
          </h2>
          <p className="mt-3 max-w-2xl text-[color:var(--text-muted)]">
            From field crews to plant operators, see who's trained, what's
            expiring, and what's missing—without digging for paperwork.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <GlassCard
                key={feature.title}
                className="hover-elevate active-elevate-2"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-xl">{feature.icon}</div>
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

        {/* For HR */}
        <section
          id="for-hr"
          className="mt-20 grid gap-10 border-t border-[color:var(--border-custom)] pt-12 lg:grid-cols-2"
        >
          <div>
            <h2 className="text-2xl font-semibold">
              Built for HR teams who secretly own compliance.
            </h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              HR is usually the one asked to "pull training records" on short
              notice. SafetySync.ai connects training data to people data so
              you're not chasing instructors or digging through old folders.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[color:var(--text-muted)]">
              <li>• See who's out of compliance by location, role, or department.</li>
              <li>
                • Keep terminations, new hires, and transfers in sync with
                required training.
              </li>
              <li>
                • Hand OSHA inspectors clean reports instead of raw spreadsheets.
              </li>
            </ul>
          </div>
          <GlassCard>
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Compliance overview</h3>
              <p className="text-xs text-[color:var(--text-muted)]">Current status across all locations</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-3xl font-semibold text-emerald-400">92%</div>
                <div className="mt-1 text-xs text-[color:var(--text-muted)]">Compliant</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-3xl font-semibold text-amber-400">27</div>
                <div className="mt-1 text-xs text-[color:var(--text-muted)]">Expiring soon</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-3xl font-semibold text-rose-400">14</div>
                <div className="mt-1 text-xs text-[color:var(--text-muted)]">Overdue</div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* For Training Providers */}
        <section className="mt-20">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold">
              For training providers & consultants managing multiple clients.
            </h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              Upload rosters, manage certifications across companies, and give
              your clients secure access to their own training records—all from
              one platform.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[color:var(--text-muted)]">
              <li>• Multi-tenant workspace for managing dozens of client companies</li>
              <li>• Bulk certificate generation and custom branding options</li>
              <li>• Client portals with read-only access to their own data</li>
            </ul>
          </div>
        </section>

        {/* Testimonial */}
        <section className="mt-20 border-t border-[color:var(--border-custom)] pt-12">
          <GlassCard className="max-w-3xl mx-auto text-center">
            <p className="text-lg italic text-[color:var(--text)]">
              "We went from three days of panic before an OSHA audit to pulling
              everything in 10 minutes. SafetySync.ai gave us confidence we
              never had with spreadsheets."
            </p>
            <div className="mt-4">
              <p className="font-semibold">Sarah Mitchell</p>
              <p className="text-sm text-[color:var(--text-muted)]">EHS Manager, Apex Construction</p>
            </div>
          </GlassCard>
        </section>

        {/* Compliance clarification */}
        <section className="mt-20 border-t border-[color:var(--border-custom)] pt-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold">
              We manage your records, not your training content.
            </h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              SafetySync.ai is a recordkeeping and documentation platform—not a
              training course provider. We help you track, organize, and prove
              that OSHA-required training happened. You still work with your
              preferred instructors and course providers.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-20 border-t border-[color:var(--border-custom)] pt-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Simple, transparent pricing</h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              Choose the plan that fits your team
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
                <button 
                  className="mt-6 w-full rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/30 hover-elevate active-elevate-2"
                  data-testid={`button-get-pricing-${tier.name.toLowerCase()}`}
                  onClick={() => console.log(`Get pricing for ${tier.name} clicked`)}
                >
                  Get pricing & book demo
                </button>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-semibold">
            Ready to get audit-ready?
          </h2>
          <p className="mt-3 text-[color:var(--text-muted)]">
            Book a 20-minute demo and see how SafetySync.ai works for your team.
          </p>
          <button 
            className="mt-6 rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-base font-medium text-white shadow-lg shadow-orange-500/30 hover-elevate active-elevate-2"
            data-testid="button-final-cta"
            onClick={() => console.log("Final CTA clicked")}
          >
            Schedule your demo
          </button>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-[color:var(--border-custom)] pt-8 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[color:var(--text-muted)]">
            <a href="#privacy" className="hover:text-[color:var(--text)]" data-testid="link-privacy">Privacy Policy</a>
            <a href="#terms" className="hover:text-[color:var(--text)]" data-testid="link-terms">Terms of Service</a>
            <a href="#contact" className="hover:text-[color:var(--text)]" data-testid="link-contact">Contact</a>
          </div>
          <p className="mt-4 text-xs text-[color:var(--text-muted)]">
            © {currentYear} SafetySync.ai. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
