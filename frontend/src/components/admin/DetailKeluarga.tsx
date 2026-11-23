import { useState, useEffect } from "react";
import { FaEdit, FaMapMarkerAlt, FaTrash, FaUserTie, FaUsers } from "react-icons/fa";

import {
  AdminCard,
  AdminDetailGrid,
  AdminDetailItem,
  AdminDetailView,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminTableShell,
} from "@/components/admin/admin-ui";
import { adminPendudukApi, type PendudukAdminView } from "@/lib/api/admin";

interface DetailKeluargaProps {
  selectedNik: string | null;
  onBack: () => void;
  onEdit: (nik: string) => void;
  onDelete: (nik: string) => void;
  pendudukData?: PendudukAdminView[];
}

const actionButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary";

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
    if (!selectedNik) return;

    const loadKeluargaData = async () => {
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

    void loadKeluargaData();
  }, [selectedNik, pendudukData]);

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
      <AdminTableShell loading>
        <div />
      </AdminTableShell>
    );
  }

  return (
    <AdminDetailView
      eyebrow="Kartu Keluarga"
      title={kepalaKeluarga ? `Keluarga ${kepalaKeluarga.nama}` : "Detail Keluarga"}
      description="Identitas kepala keluarga dan data tiap anggota."
      onBack={onBack}
    >
      <div className="space-y-8">
        {kepalaKeluarga && (
          <AdminDetailGrid>
            <AdminDetailItem label="Kepala Keluarga">
              <span className="inline-flex items-center gap-2">
                <FaUserTie className="text-primary" />
                {kepalaKeluarga.nama}
              </span>
            </AdminDetailItem>
            <AdminDetailItem label="Alamat">
              <span className="inline-flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" />
                {kepalaKeluarga.alamat}
              </span>
            </AdminDetailItem>
            <AdminDetailItem label="Total Anggota">
              <span className="inline-flex items-center gap-2">
                <FaUsers className="text-primary" />
                {keluargaData.length} Orang
              </span>
            </AdminDetailItem>
          </AdminDetailGrid>
        )}

        <AdminCard className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <AdminSectionHeader
              icon={<FaUsers />}
              title="Daftar Anggota Keluarga"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-on-surface-variant">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Alamat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tempat Lahir
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Umur
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Jenis Kelamin
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Agama
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Pekerjaan
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {keluargaData.map((member, index) => (
                    <tr
                      key={member.id || member.nik}
                      className={`transition-colors hover:bg-surface-container-low ${
                        member.nik === selectedNik
                          ? "bg-primary-fixed/40"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-on-surface">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="break-words font-medium text-on-surface">
                            {member.nama}
                          </span>
                          <span className="break-all text-xs text-muted-foreground">
                            NIK: {member.nik}
                          </span>
                          <span className="break-all text-xs text-muted-foreground">
                            No. KK: {member.nomor_kk || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="break-words px-4 py-3">{member.alamat}</td>
                      <td className="break-words px-4 py-3">
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
                        <AdminStatusBadge
                          label={member.status}
                          tone={
                            member.status === "Kepala Keluarga"
                              ? "success"
                              : "info"
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(member.nik)}
                            className={actionButtonClass}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(member.nik)}
                            className={`${actionButtonClass} hover:text-destructive`}
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {keluargaData.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada data keluarga ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminDetailView>
  );
};

export default DetailKeluarga;
