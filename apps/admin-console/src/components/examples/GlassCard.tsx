import GlassCard from "../GlassCard";

export default function GlassCardExample() {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] p-8 space-y-6">
      <GlassCard title="Example Card" subtitle="With title and subtitle">
        <p className="text-[color:var(--text-muted)]">
          This is a glassmorphic card with the signature blue ethereal glow effect.
        </p>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-2">Custom Content</h3>
        <p className="text-sm text-[color:var(--text-muted)]">
          You can use this card without title/subtitle props and add your own content.
        </p>
      </GlassCard>

      <GlassCard className="hover-elevate active-elevate-2">
        <p className="text-sm">This card has interactive hover and active states.</p>
      </GlassCard>
    </div>
  );
}
