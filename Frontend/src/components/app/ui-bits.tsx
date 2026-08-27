import type { ReactNode } from "react";

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

const toneMap: Record<string, string> = {
  primary: "bg-primary-soft text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  danger: "bg-destructive/10 text-destructive",
};

export function Pill({
  children,
  tone = "primary",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap | string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneMap[tone] ?? toneMap['primary']} ${className}`}
    >
      {children}
    </span>
  );
}

export function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" }) {
  return (
    <span
      className={`flex flex-none items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary ${
        size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
      }`}
    >
      {initial}
    </span>
  );
}

export function BtnPrimary({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnOutline({
  children,
  className = "",
  tone = "default",
  ...props
}: {
  tone?: "default" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50 disabled:pointer-events-none ${
        tone === "danger"
          ? "border-destructive/40 text-destructive hover:bg-destructive/10"
          : "border-border text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabPill({
  children,
  active = false,
  ...rest
}: { children: ReactNode; active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
        active
          ? "bg-primary text-primary-foreground shadow-pop"
          : "border border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function EmojiTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-primary-soft text-xl">
      {children}
    </span>
  );
}
