import { useState, useEffect } from "react";
import {
  ArrowLeft,
  UsersRound,
  MapPin,
  UserRoundCog,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";
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
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto mb-4 size-5 animate-spin text-[#0b6393]"
          />
          <p className="text-base text-slate-600">Memuat data keluarga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                title="Kembali"
                aria-label="Kembali"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <ArrowLeft aria-hidden="true" className="size-5" />
                <span>Kembali</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Kartu Keluarga
                </h1>
                <p className="text-sm text-slate-600">
                  {kepalaKeluarga
                    ? `Kepala Keluarga: ${kepalaKeluarga.nama}`
                    : "Detail Keluarga"}
                </p>
              </div>
            </div>
            <div className="hidden rounded-xl bg-slate-100 p-2 text-[#0b6393] sm:block">
              <UsersRound aria-hidden="true" className="size-5" />
            </div>
          </div>
        </div>

        {kepalaKeluarga && (
          <div className="border-b border-slate-200 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-[#0b6393]">
                  <UserRoundCog aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Kepala Keluarga</p>
                  <p className="text-base font-semibold text-slate-900">
                    {kepalaKeluarga.nama}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-[#0b6393]">
                  <MapPin aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Alamat</p>
                  <p className="text-base font-semibold text-slate-900">
                    {kepalaKeluarga.alamat}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-[#0b6393]">
                  <UsersRound aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Anggota</p>
                  <p className="text-base font-semibold text-slate-900">
                    {keluargaData.length} Orang
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-[#0b6393]">
              <UsersRound aria-hidden="true" className="size-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Daftar Anggota Keluarga
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-base text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    #
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    Nama
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    Alamat
                  </th>
                  <th className="px-4 py-4 text-left font-bold text-slate-900">
                    Tempat Lahir
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Umur
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Jenis Kelamin
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Agama
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Pekerjaan
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center font-bold text-slate-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {keluargaData.map((member, index) => (
                  <tr
                    key={member.id || member.nik}
                    className={`transition hover:bg-slate-50 ${
                      member.nik === selectedNik
                        ? "border-l-4 border-l-[#0b6393] bg-[#0b6393]/5"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="break-words font-semibold text-slate-900">
                          {member.nama}
                        </span>
                        <span className="break-all text-sm text-slate-600">
                          NIK: {member.nik}
                        </span>
                        <span className="break-all text-sm text-slate-600">
                          No. KK: {member.nomor_kk || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="break-words px-4 py-4">{member.alamat}</td>
                    <td className="break-words px-4 py-4">
                      {member.tempatLahir || "-"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {hitungUmur(member.tanggalLahir)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {member.jenisKelamin}
                    </td>
                    <td className="px-4 py-4 text-center">{member.agama}</td>
                    <td className="px-4 py-4 text-center">
                      {member.pekerjaan || "-"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                          member.status === "Kepala Keluarga"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(member.nik)}
                          title="Edit"
                          aria-label="Edit anggota keluarga"
                          className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                        >
                          <Pencil aria-hidden="true" className="size-5" />
                          <span className="hidden xl:inline">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(member.nik)}
                          title="Hapus"
                          aria-label="Hapus anggota keluarga"
                          className="flex min-h-11 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 aria-hidden="true" className="size-5" />
                          <span className="hidden xl:inline">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {keluargaData.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-base text-slate-600"
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
