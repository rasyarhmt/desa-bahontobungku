import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, UserRound, X } from "lucide-react";

import BahontobungkuLogo from "@/assets/ico-morowali.png";
import { useDisclosure } from "@/hooks";
import { CONTAINER_CLASS } from "@/lib/utils";
import { NAV_LINKS } from "@/components/Navbar";

export default function HomeHeader() {
  const { isOpen, toggle } = useDisclosure();
  const location = useLocation();

  const isActiveLink = (path: string) => {
    const current = location.pathname.toLowerCase();
    const target = path.toLowerCase();

    if (target === "/information") {
      return current === target || current.startsWith("/berita-detail/");
    }
    if (target === "/") return current === "/";
    return current.startsWith(target);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggle();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className={`${CONTAINER_CLASS} flex h-20 items-center justify-between gap-4`}>
        <Link to="/" className="flex min-w-0 shrink items-center gap-3">
          <img
            src={BahontobungkuLogo}
            alt="Logo Pemerintah Desa Bahontobungku"
            className="size-10 shrink-0 object-contain sm:size-11"
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-display text-xs font-bold tracking-wider text-primary uppercase">
              Pemerintah Desa Bahontobungku
            </span>
            <span className="truncate text-[10px] tracking-wide text-on-surface-variant uppercase sm:text-[11px]">
              Kabupaten Morowali • Sulawesi Tengah
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.map((link) => {
            const active = isActiveLink(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`border-b-2 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-[0_4px_12px_rgba(0,105,72,0.18)] transition-all hover:bg-tertiary-container sm:inline-flex"
          >
            <UserRound className="size-4" />
            <span>Login</span>
          </Link>

          <button
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container xl:hidden"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          aria-hidden="true"
          onClick={toggle}
          className="fixed inset-x-0 bottom-0 top-20 z-40 bg-inverse-surface/30 backdrop-blur-[2px] xl:hidden"
        />
      )}

      {isOpen && (
        <nav
          id="mobile-nav"
          aria-label="Navigasi mobile"
          className={`${CONTAINER_CLASS} relative z-50 flex flex-col gap-1 border-t border-border bg-surface py-4 shadow-lg xl:hidden`}
        >
          {NAV_LINKS.map((link) => {
            const active = isActiveLink(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={toggle}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="mt-2 border-t border-border pt-3 sm:hidden">
            <Link
              to="/login"
              onClick={toggle}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-[0_4px_12px_rgba(0,105,72,0.18)] transition-all hover:bg-tertiary-container"
            >
              <UserRound className="size-4" />
              <span>Login Admin Desa</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
