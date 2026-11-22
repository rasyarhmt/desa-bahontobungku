import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  icon: Icon,
  title,
  description,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-primary">
        {Icon && <Icon className="size-4" />}
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-on-surface md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-base">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}

export function MetricItem({ label, value, unit, highlight }: MetricProps) {
  return (
    <div className="p-3 text-left">
      <div className="text-[11px] font-medium uppercase tracking-wider text-surface-container-high">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-display text-xl font-bold text-on-primary md:text-2xl",
          highlight && "text-primary-fixed",
        )}
      >
        {value}{" "}
        <span className="text-xs font-normal text-surface-container-high">
          {unit}
        </span>
      </div>
    </div>
  );
}
