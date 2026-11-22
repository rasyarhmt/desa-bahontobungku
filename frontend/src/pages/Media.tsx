import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import MediaCard from "@/components/Media/MediaCard";
import MediaFilters from "@/components/Media/MediaFilters";
import MediaPageHero from "@/components/Media/MediaPageHero";
import MediaSpotlight from "@/components/Media/MediaSpotlight";
import { MediaEmpty, MediaError, MediaLoading } from "@/components/Media/MediaStates";
import type { MediaFilterValue } from "@/components/Media/mediaShared";
import { useAsyncData, useSearchFilter } from "@/hooks";
import { mediaApi } from "@/lib/api/media";
import type { Media } from "@/lib/api/schemas";
import { CONTAINER_CLASS } from "@/lib/utils";

const PAGE_SIZE = 6;

export default function Media() {
  const [activeFilter, setActiveFilter] = useState<MediaFilterValue>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const {
    data: mediaData,
    isLoading,
    error,
    refetch,
  } = useAsyncData<Media[]>(() => mediaApi.getAllMedia(), [], {
    errorMessage: "Gagal memuat data media. Silakan coba lagi nanti.",
  });

  const {
    query,
    setQuery,
    filtered: filteredData,
  } = useSearchFilter(mediaData, (item, search) => {
    const q = search.toLowerCase().trim();
    const matchesFilter =
      activeFilter === "all" || item.tipe.toLowerCase() === activeFilter;
    const matchesSearch =
      !q ||
      item.nama.toLowerCase().includes(q) ||
      (item.deskripsi?.toLowerCase().includes(q) ?? false);
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter, query]);

  const stats = useMemo(
    () => ({
      total: mediaData.length,
      foto: mediaData.filter((item) => item.tipe === "foto").length,
      video: mediaData.filter((item) => item.tipe === "video").length,
      dokumen: mediaData.filter((item) => item.tipe === "dokumen").length,
    }),
    [mediaData],
  );

  const sorted = useMemo(
    () =>
      [...filteredData].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [filteredData],
  );

  const featured = sorted.find((item) => item.tipe === "video") ?? sorted[0];
  const galleryItems = featured
    ? sorted.filter((item) => item.id !== featured.id)
    : sorted;
  const visibleItems = galleryItems.slice(0, visibleCount);
  const hasMore = visibleCount < galleryItems.length;

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />
      <main className="w-full pt-28">
        <MediaPageHero stats={stats} />
        <MediaFilters
          active={activeFilter}
          onChange={setActiveFilter}
          query={query}
          onQueryChange={setQuery}
        />

        {isLoading ? (
          <MediaLoading />
        ) : error ? (
          <MediaError message={error} onRetry={() => void refetch()} />
        ) : !mediaData.length ? (
          <div className={`${CONTAINER_CLASS} py-16`}>
            <MediaEmpty />
          </div>
        ) : (
          <>
            {featured && <MediaSpotlight item={featured} />}

            <section className={`${CONTAINER_CLASS} pb-20`}>
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Arsip Dokumentasi
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-on-surface md:text-3xl">
                    Galeri Media Desa
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant">
                  Menampilkan {visibleItems.length} dari {galleryItems.length} arsip
                </span>
              </div>

              {galleryItems.length ? (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visibleItems.map((item) => (
                      <MediaCard key={item.id} item={item} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-12 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                        className="inline-flex items-center gap-2 rounded-full bg-surface-container px-8 py-3.5 text-xs font-semibold text-on-surface transition-all hover:bg-primary hover:text-on-primary"
                      >
                        Muat Lebih Banyak Galeri
                        <ChevronDown className="size-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <MediaEmpty />
              )}
            </section>
          </>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
