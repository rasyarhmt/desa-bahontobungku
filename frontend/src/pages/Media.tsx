import { useState, useCallback } from "react";
import {
  FaImage,
  FaVideo,
  FaCalendarAlt,
  FaSearch,
  FaEye,
  FaDownload,
  FaPhotoVideo,
  FaPlay,
  FaSpinner,
  FaExclamationTriangle,
  FaFileAlt,
} from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mediaApi, mediaUtils } from "@/lib/api/media";
import { type Media } from "@/lib/api/schemas";
import { formatDateLong } from "@/lib/format";
import { paginate } from "@/lib/pagination";
import { useAsyncData, useDisclosure, useSearchFilter } from "@/hooks";

export default function Media() {
  const [activeTab, setActiveTab] = useState("semua");
  const {
    isOpen: showPreviewModal,
    open: openPreviewModal,
    close: closePreviewModal,
  } = useDisclosure();
  const [currentItem, setCurrentItem] = useState<Media | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const {
    data: mediaData,
    isLoading,
    error,
    refetch: fetchMediaData,
  } = useAsyncData<Media[]>(
    async () => {
      const data = await mediaApi.getAllMedia();

      if (data.length > 0) {
        const uniqueYears = [
          ...new Set(data.map((item) => mediaUtils.extractYear(item))),
        ].sort((a, b) => Number(b) - Number(a));

        setYears(uniqueYears);
        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[0]);
        }
      }

      return data;
    },
    [],
    { errorMessage: "Gagal memuat data media. Silakan coba lagi nanti." },
  );

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filtered: filteredData,
  } = useSearchFilter(mediaData, (item, query) => {
    const q = query.toLowerCase();
    const matchesYear =
      !selectedYear || mediaUtils.extractYear(item) === selectedYear;

    const matchesSearch =
      item.nama.toLowerCase().includes(q) ||
      (item.deskripsi?.toLowerCase().includes(q) ?? false);

    const matchesFilter =
      activeTab === "semua" ||
      (activeTab === "foto" && item.tipe === "foto") ||
      (activeTab === "video" && item.tipe === "video") ||
      (activeTab === "dokumen" && item.tipe === "dokumen");

    return matchesYear && matchesSearch && matchesFilter;
  });

  const paginatedData = paginate(filteredData, currentPage, itemsPerPage);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const countImages = mediaData.filter((item) => item.tipe === "foto").length;
  const countVideos = mediaData.filter((item) => item.tipe === "video").length;

  const handlePreview = (item: Media) => {
    setCurrentItem(item);
    openPreviewModal();
    setMediaLoading(true);
    setMediaError(false);
  };

  const getVideoThumbnail = useCallback((item: Media) => {
    return mediaUtils.getVideoThumbnail(item);
  }, []);

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>, fileUrl: string, filename: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = filename || "download";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh file. Silakan coba lagi.");
    }
  };

  const renderMediaContent = () => {
    if (!currentItem) return null;
    const mediaUrl = mediaUtils.getMediaUrl(currentItem.file);

    if (currentItem.tipe === "foto") {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          {mediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
              <FaSpinner className="animate-spin text-4xl text-white" />
            </div>
          )}
          <img
            src={mediaUrl || "/placeholder.svg?height=600&width=800"}
            alt={currentItem.nama}
            className="max-w-full max-h-[70vh] object-contain"
            onLoad={() => setMediaLoading(false)}
            onError={(e) => {
              setMediaLoading(false);
              setMediaError(true);
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/placeholder.svg?height=600&width=800";
            }}
          />
        </div>
      );
    } else if (currentItem.tipe === "video") {
      return (
        <div className="relative bg-black rounded-lg overflow-hidden">
          {mediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
              <FaSpinner className="animate-spin text-4xl text-white" />
            </div>
          )}
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="w-full max-h-[70vh]"
            poster={getVideoThumbnail(currentItem)}
            onLoadedData={() => setMediaLoading(false)}
            onError={() => {
              setMediaLoading(false);
              setMediaError(true);
            }}
          >
            Browser Anda tidak mendukung pemutaran video.
          </video>
          {mediaError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
              <p className="text-gray-700 mb-4">Video tidak dapat dimuat</p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(mediaUrl, "_blank")}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Buka di Tab Baru
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else if (currentItem.tipe === "dokumen") {
      return (
        <div className="relative w-full h-[75vh] bg-gray-100 rounded-xl shadow-inner overflow-hidden">
          {mediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-40 z-10">
              <FaSpinner className="animate-spin text-4xl text-white" />
            </div>
          )}
          <iframe
            src={mediaUrl}
            title={currentItem.nama}
            className="w-full h-full rounded-xl border border-gray-200 shadow-sm mt-5"
            onLoad={() => setMediaLoading(false)}
            onError={() => {
              setMediaLoading(false);
              setMediaError(true);
            }}
          />
          {mediaError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-300">
              <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
              <p className="text-gray-700 mb-4">Dokumen tidak dapat dimuat</p>
              <button
                onClick={() => window.open(mediaUrl, "_blank")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Buka di Tab Baru
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
        <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4" />
        <p className="text-gray-700">Format media tidak didukung</p>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col bg-gray-50 min-h-screen mt-20"
      style={{ fontFamily: "poppins" }}
    >
      <Navbar />

      <div className="w-full flex-grow">
        <div className="w-full px-8 md:px-18 lg:px-32 py-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[#6CABCA] to-[#315263] bg-clip-text text-transparent mb-2 py-5">
            Media Digital Desa
          </h1>
          <p className="text-gray-600 max-w-2xl text-lg md:text-xl lg:text-2xl mx-auto pt-5">
            Dokumentasi kegiatan dan momen penting desa dalam bentuk foto dan
            video
          </p>
        </div>

        <div className="w-full px-8 md:px-18 lg:px-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Total Media
                </h3>
                <div className="bg-gray-100 bg-opacity-20 p-2 rounded-lg">
                  <FaPhotoVideo className="text-[#B9FF66] text-xl" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {mediaData.length}
              </div>
              <p className="text-sm text-gray-600">Media tersedia</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Foto</h3>
                <div className="bg-gray-100 bg-opacity-20 p-2 rounded-lg">
                  <FaImage className="text-[#FE7C66] text-xl" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {countImages}
              </div>
              <p className="text-sm text-gray-600">Foto tersedia</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Video</h3>
                <div className="bg-gray-100 bg-opacity-20 p-2 rounded-lg">
                  <FaVideo className="text-[#5DE1C4] text-xl" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {countVideos}
              </div>
              <p className="text-sm text-gray-600">Video tersedia</p>
            </div>
          </div>

          <div className="w-full mb-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#6CABCA]" />
                  <span className="text-gray-700 font-medium">
                    Pilih Tahun:
                  </span>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6CABCA] focus:border-[#6CABCA]"
                    onChange={(e) => setSelectedYear(e.target.value)}
                    value={selectedYear}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6CABCA] focus:border-[#6CABCA] w-full md:w-64"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab("semua")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === "semua"
                      ? "bg-[#B9FF66] text-gray-800 font-medium shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaPhotoVideo
                    className={
                      activeTab === "semua" ? "text-gray-800" : "text-[#B9FF66]"
                    }
                  />
                  <span>Semua Media</span>
                </button>
                <button
                  onClick={() => setActiveTab("foto")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === "foto"
                      ? "bg-[#FE7C66] text-white font-medium shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaImage
                    className={
                      activeTab === "foto" ? "text-white" : "text-[#FE7C66]"
                    }
                  />
                  <span>Foto</span>
                </button>
                <button
                  onClick={() => setActiveTab("video")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === "video"
                      ? "bg-[#5DE1C4] text-white font-medium shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaVideo
                    className={
                      activeTab === "video" ? "text-white" : "text-[#5DE1C4]"
                    }
                  />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => setActiveTab("dokumen")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === "dokumen"
                      ? "bg-[#6CABCA] text-white font-medium shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaFileAlt
                    className={
                      activeTab === "dokumen" ? "text-white" : "text-[#6CABCA]"
                    }
                  />
                  <span>Dokumen</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Gallery Media {selectedYear && `Tahun ${selectedYear}`}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Dokumentasi kegiatan dan momen penting desa
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-[#6CABCA]" />
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={fetchMediaData}
                    className="mt-4 px-4 py-2 bg-[#6CABCA] text-white rounded-lg hover:bg-opacity-90 transition"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : filteredData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedData.map((media) => (
                      <div
                        key={media.id}
                        className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="p-3 border-b">
                          <h3 className="font-medium text-gray-800 truncate">
                            {media.nama}
                          </h3>
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaCalendarAlt />
                              <span>
                                {formatDateLong(media.created_at)}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-gray-500">
                              {media.tipe
                                ? media.tipe.charAt(0).toUpperCase() + media.tipe.slice(1)
                                : ""}
                            </div>
                          </div>
                        </div>

                        <div
                          className="relative w-full aspect-[16/9] bg-gray-200 overflow-hidden cursor-pointer"
                          onClick={() => handlePreview(media)}
                        >
                          {media.tipe === "foto" ? (
                            <img
                              src={
                                mediaUtils.getMediaUrl(media.file) ||
                                "/placeholder.svg?height=400&width=600"
                              }
                              alt={media.nama}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : media.tipe === "video" ? (
                            <div className="relative w-full h-full">
                              <img
                                src={
                                  getVideoThumbnail(media) ||
                                  "/placeholder-video.svg"
                                }
                                alt="Video Thumbnail"
                                className="w-full h-full object-cover opacity-80"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                  <FaPlay className="text-[#6CABCA] text-2xl" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                              <FaFileAlt className="text-5xl mb-2" />
                              <span className="text-sm">Dokumen</span>
                            </div>
                          )}
                        </div>

                        <div className="p-3 flex justify-between items-center">
                          <button
                            onClick={() => handlePreview(media)}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#6CABCA] transition"
                          >
                            <FaEye />
                            <span>Lihat</span>
                          </button>
                          <a
                            href={mediaUtils.getMediaUrl(media.file)}
                            download={media.nama}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#6CABCA] transition"
                            onClick={(e) =>
                              handleDownload(
                                e,
                                mediaUtils.getMediaUrl(media.file),
                                media.nama
                              )
                            }
                          >
                            <FaDownload />
                            <span>Unduh</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        Sebelumnya
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === i + 1
                              ? "bg-[#6CABCA] text-white border-[#6CABCA]"
                              : "bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        Berikutnya
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    Tidak ada media yang ditemukan untuk pencarian ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePreviewModal}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentItem?.nama}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <FaCalendarAlt className="text-gray-500" />
                  {currentItem && formatDateLong(currentItem.created_at)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    currentItem && window.open(
                      mediaUtils.getMediaUrl(currentItem.file),
                      "_blank"
                    )
                  }
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-600 shadow-sm transition"
                >
                  Buka Tab Baru
                </button>
                <button
                  onClick={closePreviewModal}
                  className="rounded-full p-2 hover:bg-gray-100 transition shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-center">
                <div className="w-full h-[70vh] flex items-center justify-center rounded-xl bg-gray-50 overflow-hidden">
                  {renderMediaContent()}
                </div>
              </div>

              {currentItem?.deskripsi && (
                <div className="prose prose-sm text-gray-700 leading-relaxed mt-6">
                  <p>{currentItem.deskripsi}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
