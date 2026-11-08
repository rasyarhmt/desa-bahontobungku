import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUsers,
  FaUser,
  FaMapMarkerAlt,
  FaIdCard,
  FaUserTie,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { adminPendudukApi, type PendudukAdminView } from "@/lib/api/admin";

interface DetailKeluargaProps {
  selectedNik: string | null;
  onBack: () => void;
  onEdit: (nik: string) => void;
  onDelete: (nik: string) => void;
  pendudukData?: PendudukAdminView[];
}

const DetailKeluarga = ({
  selectedNik,
  onBack,
  onEdit,
  onDelete,
  pendudukData = [],
}: DetailKeluargaProps) => {
  const [keluargaData, setKeluargaData] = useState<PendudukAdminView[]>([]);
  const [kepalaKeluarga, setKepalaKeluarga] = useState<PendudukAdminView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedNik) {
      loadKeluargaData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNik, pendudukData]);

  const loadKeluargaData = async () => {
    if (!selectedNik) return;
    setIsLoading(true);
    try {
      const allPenduduk =
        Array.isArray(pendudukData) && pendudukData.length > 0
          ? pendudukData
          : await adminPendudukApi.getAllPenduduk();

      const selectedPerson =
        allPenduduk.find((p) => p.nik === selectedNik) ||
        (await adminPendudukApi.getPendudukByNik(selectedNik));

      if (!selectedPerson) {
        setIsLoading(false);
        return;
      }

      let familyMembers: PendudukAdminView[] = [];
      let kepalaKeluargaData: PendudukAdminView | null = null;

      if (selectedPerson.status === "Kepala Keluarga") {
        kepalaKeluargaData = selectedPerson;
      } else {
        kepalaKeluargaData = allPenduduk.find(
          (p) => p.id === selectedPerson.id_kepalakeluarga
        ) || null;
      }

      if (kepalaKeluargaData) {
        familyMembers = allPenduduk.filter(
          (p) =>
            p.id_kepalakeluarga === kepalaKeluargaData?.id ||
            p.id === kepalaKeluargaData?.id
        );
      }

      familyMembers.sort((a, b) => {
        if (a.status === "Kepala Keluarga") return -1;
        if (b.status === "Kepala Keluarga") return 1;

        const statusOrder: Record<string, number> = {
          Istri: 1,
          Anak: 2,
          Menantu: 3,
          Cucu: 4,
          Mertua: 5,
        };

        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      });

      setKeluargaData(familyMembers);
      setKepalaKeluarga(kepalaKeluargaData);
    } catch (error) {
      console.error("Error loading family data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hitungUmur = (tanggalLahir?: string | null) => {
    if (!tanggalLahir) return 0;
    const today = new Date();
    const birthDate = new Date(tanggalLahir);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Kepala Keluarga": "bg-green-100 text-green-800 border-green-200",
      Istri: "bg-pink-100 text-pink-800 border-pink-200",
      Anak: "bg-blue-100 text-blue-800 border-blue-200",
      Menantu: "bg-purple-100 text-purple-800 border-purple-200",
      Cucu: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Mertua: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Memuat data keluarga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "poppins" }}>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-white" size={20} />
              </button>
              <div className="text-white">
                <h1 className="text-2xl font-bold">Kartu Keluarga</h1>
                <p className="text-blue-100">
                  {kepalaKeluarga
                    ? `Kepala Keluarga: ${kepalaKeluarga.nama}`
                    : "Detail Keluarga"}
                </p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FaUsers className="text-white" size={24} />
            </div>
          </div>
        </div>

        {kepalaKeluarga && (
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FaUserTie className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kepala Keluarga</p>
                  <p className="font-semibold">{kepalaKeluarga.nama}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FaMapMarkerAlt className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-semibold">{kepalaKeluarga.alamat}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FaUsers className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Anggota</p>
                  <p className="font-semibold">{keluargaData.length} Orang</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaUsers className="text-blue-500" size={20} />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              Daftar Anggota Keluarga
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    #
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    Nama
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    NIK
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700">
                    JK
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700">
                    Umur
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700">
                    Agama
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {keluargaData.map((member, index) => (
                  <tr
                    key={member.nik}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      member.nik === selectedNik
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-2">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <FaUser className="text-gray-600" size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {member.nama}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaIdCard size={10} />
                            {member.nik}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-sm">
                      {member.nik}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          member.status
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.jenisKelamin === "Laki-laki"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {member.jenisKelamin === "Laki-laki"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>{hitungUmur(member.tanggalLahir)} th</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {member.agama}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(member.nik)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => onDelete(member.nik)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {keluargaData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaUsers className="mx-auto mb-4 text-4xl text-gray-300" />
              <p>Tidak ada data keluarga ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailKeluarga;
