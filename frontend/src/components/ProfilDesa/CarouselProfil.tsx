import { BadgeCheck, IdCard, Landmark, Phone, UsersRound } from "lucide-react";

import { aparaturApi, type AparatFormatted } from "@/lib/api/aparatur";
import { useAsyncData } from "@/hooks";

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "PD";

function AparatAvatar({
  item,
  large = false,
}: {
  item: AparatFormatted;
  large?: boolean;
}) {
  const sizeClass = large ? "size-24 md:size-28" : "size-16";

  if (item.foto) {
    return (
      <img
        src={item.foto}
        alt={item.nama}
        className={`${sizeClass} rounded-2xl border border-surface-container object-cover object-top shadow-sm`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} flex items-center justify-center rounded-2xl bg-primary-container font-display text-lg font-bold text-on-primary-container`}
    >
      {initialsOf(item.nama)}
    </span>
  );
}

function AparatCard({ item }: { item: AparatFormatted }) {
  const phoneDigits = item.telepon?.replace(/\D/g, "");

  return (
    <div className="rounded-2xl border border-surface-container bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="flex justify-center">
        <AparatAvatar item={item} />
      </div>
      <h4 className="mt-3 font-display text-sm font-bold text-on-surface">
        {item.nama || "Aparatur Desa"}
      </h4>
      <p className="mt-0.5 text-xs text-on-surface-variant">
        {item.jabatan || "Perangkat Desa"}
      </p>

      {item.status && (
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-[10px] font-semibold text-primary">
          <BadgeCheck className="size-3" />
          {item.status}
        </span>
      )}

      <div className="mt-4 space-y-1.5 border-t border-surface-container pt-3 text-left">
        {item.nip && (
          <p className="flex items-center gap-2 text-[11px] text-on-surface-variant">
            <IdCard className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{item.nip}</span>
          </p>
        )}
        {phoneDigits && (
          <a
            href={`tel:${phoneDigits}`}
            className="flex items-center gap-2 text-[11px] text-on-surface-variant transition-colors hover:text-primary"
          >
            <Phone className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{item.telepon}</span>
          </a>
        )}
      </div>
    </div>
  );
}

export default function CarouselAparatur() {
  const {
    data: aparatur,
    isLoading,
    error,
    refetch,
  } = useAsyncData<AparatFormatted[]>(
    async () => {
      const data = await aparaturApi.getAllAparat();
      return aparaturApi.formatAparatData(data);
    },
    [],
    { errorMessage: "Gagal memuat data aparatur desa." },
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl border border-surface-container bg-surface-container/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-tertiary-container"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (aparatur.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-container bg-white p-10 text-center text-sm text-on-surface-variant">
        Belum ada data aparatur yang tersedia.
      </div>
    );
  }

  const leaderIndex = aparatur.findIndex((item) =>
    item.jabatan.toLowerCase().includes("kepala desa"),
  );
  const leader = aparatur[leaderIndex >= 0 ? leaderIndex : 0];
  const staff = aparatur.filter((item) => item.id !== leader.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-sm rounded-3xl border border-primary/20 bg-[linear-gradient(180deg,#e5eeff_0%,#ffffff_100%)] p-6 text-center shadow-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-on-primary">
            <Landmark className="size-3.5" />
            Pimpinan Desa
          </span>
          <div className="mt-4 flex justify-center">
            <AparatAvatar item={leader} large />
          </div>
          <h4 className="mt-4 font-display text-lg font-bold text-on-surface">
            {leader.nama || "Kepala Desa"}
          </h4>
          <p className="mt-0.5 text-sm text-primary">
            {leader.jabatan || "Kepala Desa"}
          </p>
          {leader.nip && (
            <p className="mt-2 text-[11px] text-on-surface-variant">
              NIP/NIK: {leader.nip}
            </p>
          )}
        </div>
        <div className="h-8 w-px bg-gradient-to-b from-primary/50 to-transparent" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-[11px] font-semibold text-on-surface-variant">
          <UsersRound className="size-3.5" />
          Perangkat Desa
        </span>
      </div>

      {staff.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((item) => (
            <AparatCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-on-surface-variant">
          Belum ada perangkat desa lain yang terdaftar.
        </p>
      )}
    </div>
  );
}
