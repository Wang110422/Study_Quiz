import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <span className="icon-tile">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold sm:text-[28px]">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionTitle({
  icon: Icon,
  title,
  badge,
  right,
}: {
  icon?: LucideIcon;
  title: string;
  badge?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        {Icon ? <Icon className="h-[18px] w-[18px] text-primary" /> : null}
        {title}
      </h2>
      {badge ? (
        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
          {badge}
        </span>
      ) : null}
      {right ? <div className="ml-auto">{right}</div> : null}
    </div>
  );
}
