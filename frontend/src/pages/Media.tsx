import { useEffect, useMemo, useState } from "react";

import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import MediaCard from "@/components/Media/MediaCard";
import MediaFilters from "@/components/Media/MediaFilters";
import MediaPageHero from "@/components/Media/MediaPageHero";
import MediaSpotlight from "@/components/Media/MediaSpotlight";
import { MediaEmpty, MediaError, MediaLoading } from "@/components/Media/MediaStates";
import type { MediaFilterValue } from "@/components/Media/mediaShared";
import Pagination from "@/components/Pagination";
import { useAsyncData, useSearchFilter } from "@/hooks";
import { mediaApi } from "@/lib/api/media";
import type { Media } from "@/lib/api/schemas";
import { CONTAINER_CLASS, SECTION_CLASS } from "@/lib/utils";

const PAGE_SIZE = 9;

export default function Media() {
  const [activeFilter, setActiveFilter] = useState<MediaFilterValue>("all");
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1);
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
  const totalPages = Math.max(1, Math.ceil(galleryItems.length / PAGE_SIZE));
  const visibleItems = galleryItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <div className={`${SECTION_CLASS} ${CONTAINER_CLASS}`}>
            <MediaEmpty />
          </div>
        ) : (
          <>
            {featured && <MediaSpotlight item={featured} />}

            <section className={`${SECTION_CLASS} ${CONTAINER_CLASS}`}>
              <div className="mb-10 flex flex-col justify-between gap-4 md:mb-12 md:flex-row md:items-end">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Arsip Dokumentasi
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-on-surface md:text-3xl">
                    Galeri Media Desa
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant">
                  Menampilkan {visibleItems.length} dari {galleryItems.length} arsip · Halaman{" "}
                  {currentPage} dari {totalPages}
                </span>
              </div>

              {galleryItems.length ? (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visibleItems.map((item) => (
                      <MediaCard key={item.id} item={item} />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                    ariaLabel="Paginasi media"
                  />
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
