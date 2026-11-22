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
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${Bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-inverse-surface/80 via-inverse-surface/65 to-inverse-surface" />
      <div className="absolute top-1/4 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />

      <div className={`${CONTAINER_CLASS} relative flex flex-col items-center pt-12 text-center lg:pt-20`}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary-fixed uppercase shadow-sm backdrop-blur-md">
          <span className="size-2 animate-ping rounded-full bg-primary-fixed" />
          Portal Resmi Digitalisasi Desa
          <span className="text-surface-container-high/40">•</span>
          <span className="text-surface-container-high">Bungku Tengah, Morowali</span>
        </div>

        <h1 className="max-w-5xl font-display text-4xl leading-none font-extrabold tracking-tight text-on-primary md:text-6xl">
          DESA DIGITAL
          <br />
          <span className="bg-gradient-to-r from-primary-fixed via-tertiary-fixed to-surface-container-lowest bg-clip-text text-transparent">
            BAHONTOBUNGKU
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-surface-container-highest/90 md:text-lg">
          Menuju desa yang modern, transparan, dan berkelanjutan melalui
          transformasi digital dan keterbukaan layanan publik.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="group h-auto rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-on-primary shadow-[0_12px_28px_rgba(0,105,72,0.35)] hover:bg-tertiary-container"
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
            className="h-auto rounded-full border border-surface-container-lowest/20 bg-surface-container-lowest/15 px-7 py-3.5 text-sm font-semibold text-surface-container-lowest backdrop-blur-md hover:bg-surface-container-lowest/25 hover:text-surface-container-lowest"
          >
            <Link to="/Pelayanan">
              <ShieldCheck className="size-4" />
              Layanan Desa
            </Link>
          </Button>
        </div>

        <div className="mt-14 grid w-full max-w-4xl grid-cols-2 gap-3 rounded-2xl bg-surface-container-lowest/10 p-4 shadow-lg backdrop-blur-xl md:grid-cols-4">
          {metrics.map((metric) => (
            <MetricItem key={metric.label} {...metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
