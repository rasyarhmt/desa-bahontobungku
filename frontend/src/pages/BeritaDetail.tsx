import { Newspaper } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import BeritaDetailView from "@/components/Berita/BeritaDetailView";
import { BeritaError, BeritaLoading } from "@/components/Berita/BeritaStates";
import { sortBerita } from "@/components/Berita/beritaView";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import { useAsyncData } from "@/hooks";
import { beritaApi } from "@/lib/api/berita";
import type { Berita } from "@/lib/api/schemas";
import { CONTAINER_CLASS, SECTION_CLASS } from "@/lib/utils";

interface BeritaDetailPayload {
  item: Berita | null;
  related: Berita[];
}

const EMPTY_PAYLOAD: BeritaDetailPayload = { item: null, related: [] };

export default function BeritaDetail() {
  const { id } = useParams();

  const { data, isLoading, error, refetch } = useAsyncData<BeritaDetailPayload>(
    async () => {
      if (!id) return EMPTY_PAYLOAD;

      const beritaId = Number(id);
      if (!Number.isFinite(beritaId)) return EMPTY_PAYLOAD;

      const [item, published] = await Promise.all([
        beritaApi.getBeritaById(beritaId),
        beritaApi.getPublishedBerita().catch(() => []),
      ]);

      return {
        item,
        related: sortBerita(
          published.filter((berita) => berita.id !== beritaId),
          "terbaru",
        ).slice(0, 3),
      };
    },
    EMPTY_PAYLOAD,
    { errorMessage: "Gagal memuat berita. Silakan coba lagi nanti." },
  );

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />

      <main className="min-h-screen w-full pt-28">
        {isLoading ? (
          <BeritaLoading />
        ) : error ? (
          <BeritaError message={error} onRetry={() => void refetch()} />
        ) : data.item ? (
          <BeritaDetailView item={data.item} related={data.related} />
        ) : (
          <div className={`mx-auto ${SECTION_CLASS} ${CONTAINER_CLASS} max-w-3xl`}>
            <div className="rounded-3xl bg-surface-container-lowest p-12 text-center shadow-sm">
              <Newspaper className="mx-auto mb-4 size-12 text-outline-variant" />
              <p className="text-sm font-semibold text-on-surface">
                Berita tidak ditemukan.
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Tautan mungkin tidak valid atau berita sudah tidak dipublikasikan.
              </p>
              <Link
                to="/Information"
                className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary transition-colors hover:bg-tertiary-container"
              >
                Kembali ke Daftar Berita
              </Link>
            </div>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
