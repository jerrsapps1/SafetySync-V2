import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
  title?: string;
  subtitle?: string;
}>;

export default function GlassCard({ className = "", title, subtitle, children }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl backdrop-saturate-150 p-6 ${className}`}
      style={{
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
        backdropFilter: "blur(12px) saturate(150%)",
        boxShadow: "0 0 40px rgba(88,166,255,0.15), 0 0 80px rgba(56,139,253,0.10), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-[color:var(--text-muted)]">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
