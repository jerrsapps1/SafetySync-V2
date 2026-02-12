import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
  title?: string;
  subtitle?: string;
}>;

export default function GlassCard({ className = "", title, subtitle, children }: Props) {
  return (
    <div
      className={`rounded-2xl bg-card/60 backdrop-blur-xl backdrop-saturate-150 p-6 ${className}`}
      style={{
        border: "1px solid var(--glass-border)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
        backdropFilter: "blur(12px) saturate(150%)",
        boxShadow: "var(--glass-shadow)",
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
