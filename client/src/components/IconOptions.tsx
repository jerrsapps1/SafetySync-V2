import { BookOpen, Bell, CreditCard, Users, Building2, FileText } from "lucide-react";
import GlassCard from "@/components/GlassCard";

const features = [
  {
    title: "Smart training recordkeeping",
    description: "Keep every employee's OSHA 1910 & 1926 training in one place—no more scattered spreadsheets or shared drives.",
    Icon: BookOpen,
  },
  {
    title: "Automated expirations & reminders",
    description: "Track expiration dates and send proactive reminders before workers fall out of compliance.",
    Icon: Bell,
  },
  {
    title: "Instant certs & wallet cards",
    description: "Generate professional certificates and wallet cards that are always available and easy to re-issue.",
    Icon: CreditCard,
  },
  {
    title: "HR + Safety shared workspace",
    description: "Give HR and EHS teams a single source of truth for training status, roles, and locations.",
    Icon: Users,
  },
  {
    title: "Construction & general industry",
    description: "Built for both OSHA 1910 and 1926 so you can manage multiple divisions without duct-taped systems.",
    Icon: Building2,
  },
  {
    title: "Audit-ready exports in minutes",
    description: "Pull clean, inspector-ready reports by company, site, or role with just a few clicks.",
    Icon: FileText,
  },
];

export default function IconOptions() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Icon Style Options</h1>
        <p className="text-gray-400 mb-12">Choose which icon style you prefer for the features section</p>

        {/* Option 1: Gradient Background Circle */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-2">Option 1: Gradient Background</h2>
          <p className="text-sm text-gray-400 mb-6">Icons with gradient circular backgrounds and subtle glow</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <GlassCard key={feature.title} className="hover-elevate active-elevate-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/30 flex items-center justify-center">
                    <feature.Icon className="h-5 w-5 text-white" />
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

        {/* Option 2: Simple Monochrome with Glow */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-2">Option 2: Monochrome Minimal</h2>
          <p className="text-sm text-gray-400 mb-6">Clean icons with subtle blue glow, no background</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <GlassCard key={feature.title} className="hover-elevate active-elevate-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <feature.Icon className="h-6 w-6 text-sky-400" style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))' }} />
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

        {/* Option 3: Outlined Square with Border */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-2">Option 3: Outlined Box</h2>
          <p className="text-sm text-gray-400 mb-6">Icons in bordered square containers with accent color</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <GlassCard key={feature.title} className="hover-elevate active-elevate-2">
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

        {/* Option 4: Orange Accent (Matches CTA) */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-2">Option 4: Orange Accent</h2>
          <p className="text-sm text-gray-400 mb-6">Icons with orange gradient backgrounds matching your brand CTAs</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <GlassCard key={feature.title} className="hover-elevate active-elevate-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                    <feature.Icon className="h-5 w-5 text-orange-400" />
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
      </div>
    </div>
  );
}
