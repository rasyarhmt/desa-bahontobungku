import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUsers,
  FaMapMarkerAlt,
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
  const [kepalaKeluarga, setKepalaKeluarga] =
    useState<PendudukAdminView | null>(null);
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
        kepalaKeluargaData =
          allPenduduk.find((p) => p.id === selectedPerson.id_kepalakeluarga) ||
          null;
      }

      if (kepalaKeluargaData) {
        familyMembers = allPenduduk.filter(
          (p) =>
            p.id_kepalakeluarga === kepalaKeluargaData?.id ||
            p.id === kepalaKeluargaData?.id,
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
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaUsers className="text-blue-500" size={20} />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              Daftar Anggota Keluarga
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-600">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Nama</th>
                  <th className="px-4 py-3 text-left font-medium">Alamat</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Tempat Lahir
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Umur</th>
                  <th className="px-4 py-3 text-center font-medium">
                    Jenis Kelamin
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Agama</th>
                  <th className="px-4 py-3 text-center font-medium">
                    Pekerjaan
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {keluargaData.map((member, index) => (
                  <tr
                    key={member.id || member.nik}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                      member.nik === selectedNik
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-800 break-words">
                          {member.nama}
                        </span>
                        <span className="text-xs text-gray-500 break-all">
                          NIK: {member.nik}
                        </span>
                        <span className="text-xs text-gray-500 break-all">
                          No. KK: {member.nomor_kk || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 break-words">{member.alamat}</td>
                    <td className="px-4 py-3 break-words">
                      {member.tempatLahir || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hitungUmur(member.tanggalLahir)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.jenisKelamin}
                    </td>
                    <td className="px-4 py-3 text-center">{member.agama}</td>
                    <td className="px-4 py-3 text-center">
                      {member.pekerjaan || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === "Kepala Keluarga"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(member.nik)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(member.nik)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {keluargaData.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Tidak ada data keluarga ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailKeluarga;
