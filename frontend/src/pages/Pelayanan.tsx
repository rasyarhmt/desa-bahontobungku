import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaExclamationTriangle,
  FaFileAlt,
  FaSpinner,
} from "react-icons/fa";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import cs from "@/assets/cs.png";
import { pelayananApi } from "@/lib/api/pelayanan";
import { type Pelayanan } from "@/lib/api/schemas";
import { useAsyncData } from "@/hooks";

export default function Pelayanan() {
  const {
    data: layananData,
    isLoading,
    error,
    refetch: fetchPelayananData,
  } = useAsyncData<Pelayanan[]>(
    async () => {
      const data = await pelayananApi.getAllPelayanan();
      return data;
    },
    [],
    { errorMessage: "Gagal memuat data pelayanan. Silakan coba lagi nanti." },
  );

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col bg-gray-50 items-center"
        style={{ fontFamily: "poppins" }}
      >
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-[#6CABCA] to-white py-16 md:py-24">
          <div className="w-full mx-auto px-8 md:px-18 lg:px-32">
            <div className="flex flex-col-reverse md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-4">
                  Pusat Pelayanan
                  <br />
                  Online Desa
                </h1>
                <p className="text-white text-lg md:text-xl mb-6 opacity-90">
                  Akses layanan administrasi desa dengan mudah dan cepat melalui
                  platform online kami.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#layanan"
                    className="px-6 py-3 bg-white text-[#6CABCA] font-medium rounded-lg hover:bg-opacity-90 transition shadow-md"
                  >
                    Lihat Layanan
                  </a>
                  <a
                    href="#panduan"
                    className="px-6 py-3 bg-transparent text-white font-medium rounded-lg hover:bg-[#6CABCA] transition border border-white border-opacity-30"
                  >
                    Panduan
                  </a>
                </div>
              </div>
              <div className="md:w-2/3 flex justify-center">
                <img
                  src={cs || "/placeholder.svg"}
                  alt="Icon Infografis"
                  className="w-90 h-80 md:w-150 md:h-150 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div id="layanan" className="w-full py-14 px-8 md:px-18 lg:px-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Layanan Administrasi Desa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan berbagai layanan administrasi desa yang dapat
              diakses secara online. Pilih layanan yang Anda butuhkan dan isi
              formulir yang tersedia.
            </p>
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
                onClick={() => void fetchPelayananData()}
                className="mt-4 px-4 py-2 bg-[#6CABCA] text-white rounded-lg hover:bg-opacity-90 transition"
              >
                Coba Lagi
              </button>
            </div>
          ) : layananData.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {layananData.map((layanan, idx) => (
                <div
                  key={layanan.id || idx}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-gray-100 rounded-xl mr-4">
                        <FaFileAlt className="text-[#6CABCA] text-xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {layanan.nama_layanan}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {layanan.deskripsi || "Tidak ada deskripsi."}
                    </p>
                    {layanan.status === "nonaktif" && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                        Nonaktif
                      </span>
                    )}
                  </div>

                  {layanan.id_surat_template && layanan.status !== "nonaktif" ? (
                    <Link
                      to={`/pelayanan/surat/${layanan.id}`}
                      className="flex items-center justify-between px-6 py-4 bg-[#6CABCA] text-white font-medium text-sm hover:bg-opacity-90 transition group"
                    >
                      <span>Buat Surat Online</span>
                      <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <div className="px-6 py-4 bg-gray-100 text-sm text-gray-500 font-medium">
                      Hubungi Kantor Desa
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <p className="text-gray-600">
                Tidak ada layanan yang tersedia saat ini.
              </p>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div id="panduan" className="w-full bg-gray-100 py-8">
          <div className="w-full px-8 md:px-18 lg:px-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Cara Menggunakan Layanan
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ikuti langkah-langkah sederhana berikut untuk mengakses layanan
                administrasi desa secara online.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="w-12 h-12 bg-gray-100 bg-opacity-30 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#B9FF66] font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Pilih Layanan
                </h3>
                <p className="text-gray-600">
                  Pilih jenis layanan yang Anda butuhkan dari daftar layanan
                  yang tersedia.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="w-12 h-12 bg-gray-100 bg-opacity-30 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#FE7C66] font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Isi Formulir
                </h3>
                <p className="text-gray-600">
                  Lengkapi formulir online dengan data yang diperlukan.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="w-12 h-12 bg-gray-100 bg-opacity-30 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#5DE1C4] font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Ambil Dokumen
                </h3>
                <p className="text-gray-600">
                  Unduh surat yang dihasilkan, lalu datang ke kantor desa untuk
                  diresmikan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full px-8 md:px-18 lg:px-32 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berikut adalah beberapa pertanyaan yang sering diajukan tentang
              layanan administrasi desa online.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-[#FE7C66]">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Berapa lama proses pembuatan dokumen?
              </h3>
              <p className="text-gray-600">
                Proses pembuatan dokumen umumnya membutuhkan waktu 1 hari kerja
                setelah semua data terisi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-[#B9FF66]">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Apakah layanan ini berbayar?
              </h3>
              <p className="text-gray-600">
                Sebagian besar layanan administrasi desa tidak dipungut biaya,
                kecuali untuk beberapa layanan tertentu sesuai peraturan yang
                berlaku.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-[#5DE1C4]">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Bagaimana surat saya bisa diverifikasi?
              </h3>
              <p className="text-gray-600">
                Setiap surat memiliki kode unik dan QR yang bisa dipindai untuk
                memastikan keasliannya.{" "}
                <Link to="/verifikasi" className="text-[#6CABCA] underline">
                  Verifikasi surat di sini
                </Link>
                .
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-[#6CABCA]">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Apakah data saya aman?
              </h3>
              <p className="text-gray-600">
                Data yang Anda isikan terenkripsi dan hanya digunakan untuk
                kebutuhan pembuatan surat.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}