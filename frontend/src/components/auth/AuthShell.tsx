import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Landmark } from "lucide-react";

export const authInputClass =
  "w-full rounded-xl border border-border bg-surface-container-lowest py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20";

export const authPrimaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-14 text-on-surface">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#eef7f2_0%,#f8f9ff_45%,#e5eeff_100%)]" />
      <div className="pointer-events-none absolute -top-28 -left-24 size-96 rounded-full bg-primary-fixed/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full bg-secondary-container/70 blur-3xl" />

      <Link
        to="/"
        className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 rounded-xl border border-border bg-surface-container-lowest/90 px-3 py-2 text-sm font-medium text-on-surface-variant shadow-sm backdrop-blur transition-colors hover:bg-surface-container-lowest hover:text-on-surface"
      >
        <ArrowLeft className="size-4" />
        Beranda
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface-container-lowest p-6 shadow-xl sm:p-8">
          <div className="mb-7 text-center">
            <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
              <Landmark className="size-7" />
            </span>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          </div>

          {children}

          {footer && (
            <div className="mt-6 border-t border-border pt-5 text-center text-sm text-on-surface-variant">
              {footer}
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-on-surface-variant">
          Portal Resmi Pemerintah Desa Bahontobungku
        </p>
      </div>
    </div>
  );
}
