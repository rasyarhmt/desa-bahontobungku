import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { FaArrowLeft, FaExclamationTriangle, FaSearch, FaSpinner } from "react-icons/fa";

import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

export const adminCardClass =
  "rounded-3xl border border-border bg-surface-container-lowest shadow-sm";

const adminButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const adminPrimaryButtonClass = cn(
  adminButtonClass,
  "bg-primary text-on-primary hover:bg-primary/90",
);

export const adminSecondaryButtonClass = cn(
  adminButtonClass,
  "border border-border bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container",
);

export const adminDangerButtonClass = cn(
  adminButtonClass,
  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
);

export const adminFieldClass =
  "w-full rounded-xl border border-border bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

const toneClass: Record<Tone, string> = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-secondary-container text-on-secondary-container",
  neutral: "bg-surface-container text-on-surface-variant",
};

const metricIconClass: Record<Tone, string> = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-secondary-container text-on-secondary-container",
  neutral: "bg-surface-container text-on-surface-variant",
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(adminCardClass, className)}>{children}</div>;
}

export function AdminSectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function AdminMetricCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className={cn(adminCardClass, "p-5")}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl",
              metricIconClass[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-on-surface">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AdminFilterTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px]",
                  active ? "bg-white/15" : "bg-surface-container-high",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Cari data...",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(adminFieldClass, "py-2.5 pl-10 pr-3")}
      />
    </div>
  );
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return <div className={cn(adminCardClass, "p-4 sm:p-5")}>{children}</div>;
}

export function AdminTableShell({
  loading = false,
  error,
  onRetry,
  empty = false,
  emptyLabel = "Belum ada data yang tersedia.",
  children,
  footer,
  className,
}: {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(adminCardClass, "overflow-hidden", className)}>
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center gap-3 text-sm text-muted-foreground">
          <FaSpinner className="animate-spin text-primary" />
          Memuat data...
        </div>
      ) : error ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <FaExclamationTriangle />
          </span>
          <div>
            <p className="font-semibold text-on-surface">Gagal memuat data</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          {onRetry && (
            <button type="button" onClick={onRetry} className={adminSecondaryButtonClass}>
              Coba Lagi
            </button>
          )}
        </div>
      ) : empty ? (
        <div className="flex min-h-[240px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        children
      )}
      {footer}
    </div>
  );
}

export function AdminStatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClass[tone],
      )}
    >
      {label}
    </span>
  );
}

function AdminBackButton({
  onClick,
  label = "Kembali",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={adminSecondaryButtonClass}>
      <FaArrowLeft />
      {label}
    </button>
  );
}

export function AdminFormView({
  eyebrow,
  title,
  description,
  onBack,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  onBack: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className={cn(adminCardClass, "overflow-hidden")}>
        <div className="space-y-8 px-6 py-7 sm:px-8">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface-container-low px-6 py-4">
          {actions ?? (
            <>
              <button type="button" onClick={onBack} className={adminSecondaryButtonClass}>
                Batal
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminFormSection({
  number,
  title,
  description,
  children,
}: {
  number?: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-on-surface">
          {number ? `${number}. ${title}` : title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function AdminField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-on-surface-variant"
      >
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(adminFieldClass, className)} />;
}

export function AdminTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(adminFieldClass, "min-h-28 resize-y", className)} />;
}

export function AdminSelect({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(adminFieldClass, className)} />;
}

export function AdminDetailView({
  eyebrow,
  title,
  description,
  onBack,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  onBack: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2">
            <AdminBackButton onClick={onBack} />
          </div>
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className={cn(adminCardClass, "p-6 sm:p-8")}>{children}</div>
    </div>
  );
}

export function AdminDetailGrid({ children }: { children: ReactNode }) {
  return <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>;
}

export function AdminDetailItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm text-on-surface">{children}</dd>
    </div>
  );
}
