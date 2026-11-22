import { useEffect, useMemo, useState } from "react";

import BeritaCard from "@/components/Berita/BeritaCard";
import BeritaFilters from "@/components/Berita/BeritaFilters";
import BeritaPageHero from "@/components/Berita/BeritaPageHero";
import BeritaPagination from "@/components/Berita/BeritaPagination";
import BeritaSpotlight from "@/components/Berita/BeritaSpotlight";
import { BeritaEmpty, BeritaError, BeritaLoading } from "@/components/Berita/BeritaStates";
import {
  BERITA_PAGE_SIZE,
  countBeritaPenulis,
  filterBerita,
  sortBerita,
  type BeritaSort,
} from "@/components/Berita/beritaView";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import { useAsyncData } from "@/hooks";
import { beritaApi } from "@/lib/api/berita";
import type { Berita } from "@/lib/api/schemas";
import { CONTAINER_CLASS } from "@/lib/utils";

export default function Information() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<BeritaSort>("terbaru");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useAsyncData<Berita[]>(() => beritaApi.getPublishedBerita(), [], {
    errorMessage: "Gagal memuat berita. Silakan coba lagi nanti.",
  });

  const newest = useMemo(() => sortBerita(data, "terbaru"), [data]);
  const featured = useMemo(() => newest.slice(0, 3), [newest]);
  const sorted = useMemo(() => sortBerita(data, sort), [data, sort]);
  const filtered = useMemo(() => filterBerita(sorted, query), [sorted, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / BERITA_PAGE_SIZE));
  const paginated = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * BERITA_PAGE_SIZE,
        currentPage * BERITA_PAGE_SIZE,
      ),
    [filtered, currentPage],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, sort]);

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
        <BeritaPageHero
          total={data.length}
          penulis={countBeritaPenulis(data)}
          terbaru={newest[0]?.tanggal_terbit ?? newest[0]?.created_at ?? null}
          query={query}
          onQueryChange={setQuery}
        />

        <BeritaFilters
          sort={sort}
          onSortChange={setSort}
          resultCount={filtered.length}
        />

        {isLoading ? (
          <BeritaLoading />
        ) : error ? (
          <BeritaError message={error} onRetry={() => void refetch()} />
        ) : !data.length ? (
          <div className={`${CONTAINER_CLASS} py-16`}>
            <BeritaEmpty />
          </div>
        ) : (
          <>
            {!query && <BeritaSpotlight items={featured} />}

            <section className={`${CONTAINER_CLASS} py-12`}>
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Arsip Pemberitaan
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-on-surface md:text-3xl">
                    {query ? "Hasil Pencarian" : "Seluruh Berita"}
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant">
                  Halaman {currentPage} dari {totalPages}
                </span>
              </div>

              {paginated.length ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paginated.map((item) => (
                    <BeritaCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <BeritaEmpty query={query} />
              )}

              <BeritaPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            </section>
          </>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
