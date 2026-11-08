import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaNewspaper,
  FaSpinner,
  FaUser,
} from "react-icons/fa";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { beritaApi } from "@/lib/api/berita";
import { type Berita } from "@/lib/api/schemas";
import { formatDateLong, formatImageUrl } from "@/lib/format";
import { getSelectedBerita } from "@/lib/storage";

const BeritaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [berita, setBerita] = useState<Berita | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBerita = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First try to get from localStorage (if navigated from Information page)
        const storedBerita = getSelectedBerita();

        if (storedBerita) {
          if (storedBerita.id.toString() === id) {
            setBerita(storedBerita);
            setIsLoading(false);
            return;
          }
        }

        // If not in localStorage or ID doesn't match, fetch from API
        const data = await beritaApi.getBeritaById(Number(id));
        if (!data) {
          setError("Berita tidak ditemukan");
        } else {
          setBerita(data);
        }
      } catch (err) {
        console.error("Error fetching berita:", err);
        setError("Gagal memuat data berita. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBerita();
    } else {
      // If no ID is provided, try to get from localStorage
      const storedBerita = getSelectedBerita();
      if (storedBerita) {
        setBerita(storedBerita);
        setIsLoading(false);
      } else {
        setError("Berita tidak ditemukan");
        setIsLoading(false);
      }
    }
  }, [id]);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <Navbar />
      <main className="flex-grow my-4 md:mx-40 pt-20 px-4 md:px-0">
        <div className="mb-6">
          <button
            onClick={() => navigate("/Information")}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" /> Kembali ke daftar berita
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-4xl text-gray-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-20">
            <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
            <p className="text-gray-600">{error}</p>
          </div>
        ) : berita ? (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold">{berita.judul}</h1>

              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                  <FaCalendarAlt className="inline mr-2" />
                  {formatDateLong(berita.tanggal_terbit)}
                </span>
                {berita.penulis && berita.penulis.length > 0 && (
                  <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    <FaUser className="inline mr-2" />
                    {berita.penulis}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8">
              {berita.foto ? (
                <img
                  src={formatImageUrl(berita.foto)}
                  alt={berita.judul || "Gambar Berita"}
                  className="w-full h-64 md:h-96 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-64 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center">
                  <FaNewspaper className="text-gray-400 text-5xl" />
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{berita.isi}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-500">Berita tidak ditemukan</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BeritaDetail;