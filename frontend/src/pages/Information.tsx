"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaNewspaper,
} from "react-icons/fa";
import { beritaApi } from "@/lib/api/berita";
import { type Berita } from "@/lib/api/schemas";
import { formatDateLong, formatImageUrl } from "@/lib/format";
import { getPaginationNumbers } from "@/lib/pagination";
import { setSelectedBerita } from "@/lib/storage";

const getExcerpt = (text: string, length: number): string =>
  text.length > length ? text.substring(0, length) + "..." : text;

const Information = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [beritaData, setBeritaData] = useState<Berita[]>([]);
  const [featuredBerita, setFeaturedBerita] = useState<Berita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const paginatedData = await beritaApi.getPaginatedBerita(
        currentPage,
        itemsPerPage,
        "Dipublikasi"
      );
      setBeritaData(paginatedData.berita);
      setTotalPages(paginatedData.totalPages);

      const latest = await beritaApi.getLatestBerita(3);
      setFeaturedBerita(latest);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data berita. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const prevSlide = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredBerita.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredBerita.length - 1 ? 0 : prevIndex + 1
    );
  };

  const navigateToDetail = (berita: Berita) => {
    setSelectedBerita(berita);
    navigate(`/berita-detail/${berita.id}`);
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <Navbar />
      <div className="flex-grow my-4 md:mx-40 pt-20 px-4 md:px-0">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-center md:text-left">
              Informasi & Berita
            </h1>
            <p className="mt-2 text-gray-600 text-center md:text-left">
              Semua informasi dan berita tentang Desa Bahontobungku tersedia
              disini
            </p>
          </div>

          {/* Featured Slider */}
          {isLoading ? (
            <div className="flex justify-center items-center h-56 sm:h-64 md:h-96 bg-gray-100 rounded-lg">
              <FaSpinner className="animate-spin text-4xl text-gray-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-56 sm:h-64 md:h-96 bg-gray-100 rounded-lg">
              <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
              <p className="text-gray-600">{error}</p>
            </div>
          ) : featuredBerita.length > 0 ? (
            <div className="relative rounded-xl border border-gray-200 overflow-hidden shadow-lg w-full mx-auto h-full">
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] rounded-xl overflow-hidden shadow-2xl">
                {featuredBerita.map((berita, index) => (
                  <div
                    key={berita.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out cursor-pointer transform ${
                      index === currentIndex
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105 pointer-events-none"
                    }`}
                    onClick={() => navigateToDetail(berita)}
                  >
                    {berita.foto ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={formatImageUrl(berita.foto)}
                          alt={berita.judul}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative">
                        <FaNewspaper className="text-gray-500 text-6xl md:text-8xl opacity-50" />
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 sm:p-6 md:p-8">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-white/25 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
                          <FaCalendarAlt className="inline mr-1.5" />
                          {formatDateLong(berita.tanggal_terbit)}
                        </span>
                        <span className="bg-white/25 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
                          <FaUser className="inline mr-1.5" />
                          {berita.penulis}
                        </span>
                      </div>
                      <h2 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2 drop-shadow-lg line-clamp-2">
                        {berita.judul}
                      </h2>
                      <p className="text-white/90 text-sm sm:text-base md:text-lg mt-2 line-clamp-2 md:line-clamp-3 drop-shadow-sm leading-relaxed max-w-4xl">
                        {getExcerpt(berita.isi, 150)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Slider controls */}
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-3 z-40 w-8 h-8 sm:w-10 sm:h-10 bg-gray-200/50 rounded-full flex items-center justify-center hover:bg-gray-300 focus:outline-none transition"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-3 z-40 w-8 h-8 sm:w-10 sm:h-10 bg-gray-200/50 rounded-full flex items-center justify-center hover:bg-gray-300 focus:outline-none transition"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center h-56 sm:h-64 md:h-96 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Tidak ada berita terbaru</p>
            </div>
          )}
        </div>

        {/* Berita Section */}
        <div className="my-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">Berita</h1>
          </div>

          {isLoading ? (
            <div className="mt-8 flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-4xl text-gray-500" />
            </div>
          ) : error ? (
            <div className="mt-8 flex flex-col justify-center items-center py-12">
              <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
              <p className="text-gray-600">{error}</p>
            </div>
          ) : beritaData.length > 0 ? (
            <>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {beritaData.map((berita) => (
                  <div
                    key={berita.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                  >
                    {/* Gambar */}
                    <div className="relative flex-shrink-0">
                      {berita.foto ? (
                        <img
                          className="w-full h-48 sm:h-52 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                          src={formatImageUrl(berita.foto)}
                          alt={berita.judul}
                          onClick={() => navigateToDetail(berita)}
                        />
                      ) : (
                        <div
                          className="w-full h-48 sm:h-52 bg-gray-200 cursor-pointer flex items-center justify-center transition-colors duration-300 hover:bg-gray-300"
                          onClick={() => navigateToDetail(berita)}
                        >
                          <FaNewspaper className="text-gray-400 text-4xl sm:text-5xl" />
                        </div>
                      )}
                    </div>

                    {/* Konten */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                      <h3
                        className="text-base sm:text-lg lg:text-xl font-semibold line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-200 mb-2 leading-tight"
                        onClick={() => navigateToDetail(berita)}
                      >
                        {berita.judul}
                      </h3>

                      {/* Metadata - Stack on very small screens */}
                      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 xs:gap-2 mt-2 text-xs text-gray-600">
                        <p className="flex items-center flex-shrink-0">
                          <FaCalendarAlt className="mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {formatDateLong(berita.tanggal_terbit)}
                          </span>
                        </p>
                        <p className="flex items-center min-w-0">
                          <FaUser className="mr-1 flex-shrink-0" />
                          <span className="truncate">{berita.penulis}</span>
                        </p>
                      </div>

                      {/* Content excerpt - grows to fill space */}
                      <p className="text-gray-600 text-sm mt-3 line-clamp-3 flex-grow leading-relaxed">
                        {getExcerpt(berita.isi, 100)}
                      </p>

                      {/* Button - stays at bottom */}
                      <button
                        onClick={() => navigateToDetail(berita)}
                        className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 self-start"
                      >
                        Baca selengkapnya →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaChevronLeft className="text-sm" />
                    </button>

                    {getPaginationNumbers(currentPage, totalPages).map(
                      (page, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof page === "number"
                            ? handlePageChange(page)
                            : null
                        }
                        className={`px-3 py-1 rounded-md ${
                          page === currentPage
                            ? "bg-blue-600 text-white"
                            : page === "..."
                            ? "bg-gray-100 text-gray-700 cursor-default"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaChevronRight className="text-sm" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="mt-8 flex justify-center items-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Tidak ada berita tersedia</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Information;
