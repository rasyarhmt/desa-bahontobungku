import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import Bg from "@/assets/bg-bahontobungku.jpg";
import { CONTAINER_CLASS } from "@/lib/utils";
import type { HeroMetric } from "@/content/home";
import { MetricItem } from "./shared";

export default function HeroSection({ metrics }: { metrics: HeroMetric[] }) {
  return (
    <section className="relative w-full overflow-hidden bg-inverse-surface pb-20 lg:pb-32">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: `url(${Bg})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/35 to-inverse-surface/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,18,30,0.52)_0%,transparent_72%)]" />

      <div
        className={`${CONTAINER_CLASS} relative flex flex-col items-center pt-12 text-center lg:pt-20`}
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/45 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary-fixed uppercase shadow-md backdrop-blur-md">
          <span className="size-2 animate-ping rounded-full bg-primary-fixed" />
          Portal Resmi Digitalisasi Desa
          <span className="text-white/40">•</span>
          <span className="text-white/95">Bungku Tengah, Morowali</span>
        </div>

        <h1 className="max-w-5xl font-display text-4xl leading-[1.08] font-extrabold tracking-tight md:text-6xl">
          <span className="block text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]">
            DESA DIGITAL
          </span>
          <span className="mt-1 block bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent [filter:drop-shadow(0_4px_14px_rgba(0,0,0,0.85))]">
            BAHONTOBUNGKU
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed font-medium text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] md:text-lg">
          Menuju desa yang modern, transparan, dan berkelanjutan melalui
          transformasi digital dan keterbukaan layanan publik.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="group h-auto rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-on-primary shadow-[0_12px_28px_rgba(0,105,72,0.45)] hover:bg-tertiary-container"
          >
            <Link to="/ProfilDesa">
              Jelajahi Desa
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-auto rounded-full border border-white/25 bg-slate-950/45 px-7 py-3.5 text-sm font-semibold text-white shadow-md backdrop-blur-md hover:bg-slate-950/65 hover:text-white"
          >
            <Link to="/Pelayanan">
              <ShieldCheck className="size-4" />
              Layanan Desa
            </Link>
          </Button>
        </div>

        <div className="mt-14 grid w-full max-w-4xl grid-cols-2 gap-3 rounded-2xl border border-white/15 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-xl md:grid-cols-4">
          {metrics.map((metric) => (
            <MetricItem key={metric.label} {...metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
