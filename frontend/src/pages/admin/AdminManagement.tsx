import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Plus, ShieldCheck } from "lucide-react";
import AdminFormPopup from "@/components/admin/AdminFormPopup";
import TableAdmin from "@/components/admin/TableAdmin";
import { adminUserApi } from "@/lib/api/admin";
import { authApi } from "@/lib/api/auth";
import { type AdminUser } from "@/lib/api/schemas";
import { useAsyncData, useDisclosure } from "@/hooks";
import { getAuthState } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/lib/toast";

interface AdminUserRow extends AdminUser {
  last_login?: string | null;
}

export default function AdminManagement() {
  const { role } = getAuthState();
  const addModal = useDisclosure();
  const [transferId, setTransferId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  const {
    data: users,
    isLoading: loading,
    error,
    refetch: fetchUsers,
  } = useAsyncData<AdminUserRow[]>(
    () => adminUserApi.getAllUsers(),
    [],
    { errorMessage: "Gagal memuat data admin." },
  );

  useEffect(() => {
    if (role !== "superadmin") {
      navigate("/admin/beranda", { replace: true });
    }
  }, [navigate, role]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleDelete = async (idx: number) => {
    const user = users[idx];
    if (user.role === "superadmin") {
      toast.error("Tidak bisa menghapus superadmin.");
      return;
    }
    setConfirmDeleteId(user.id);
  };

  const confirmDelete = async () => {
    try {
      await adminUserApi.deleteUser(confirmDeleteId!);
      toast.success("User berhasil dihapus.");
      setConfirmDeleteId(null);
      fetchUsers();
    } catch (_e) {
      toast.error("Gagal menghapus user.");
    }
  };

  const handleTransfer = (idx: number) => {
    const user = users[idx];
    if (user.role === "superadmin") {
      toast.info("User ini sudah superadmin.");
      return;
    }
    setTransferId(user.id);
  };

  const confirmTransfer = async () => {
    try {
      await adminUserApi.transferSuperadmin(transferId!);
      toast.success("Superadmin berhasil dipindahkan. Anda akan logout...");
      setTransferId(null);
      setTimeout(() => {
        authApi.logout();
      }, 1200);
    } catch (_e) {
      toast.error("Gagal transfer superadmin.");
    }
  };

  const handleAddUser = async (formData: {
    nama: string;
    email: string;
    password: string;
  }) => {
    try {
      await adminUserApi.addUser(
        formData.nama,
        formData.email,
        formData.password,
      );
      addModal.close();
      toast.success("User berhasil ditambahkan.");
      fetchUsers();
    } catch (_e) {
      toast.error("Gagal menambah user. Email mungkin sudah terdaftar.");
    }
  };

  const columns = ["id", "nama", "email", "role", "last_login"];
  const data = users.map((u) => ({
    id: u.id,
    nama: u.nama,
    email: u.email,
    role: u.role,
    last_login: formatDateTime(u.last_login),
  }));

  return (
    <div
      className="min-h-screen bg-[#f6f8fb] p-6"
     
    >
      <h1 className="mb-4 flex items-center gap-3 text-2xl font-bold text-slate-900">
        <ShieldCheck aria-hidden="true" className="size-6 text-[#0b6393]" />
        Manajemen Admin
      </h1>

      <button
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-5 font-semibold text-white transition-colors hover:bg-[#0a557c]"
        onClick={() => {
          addModal.open();
        }}
      >
        <Plus aria-hidden="true" className="size-5" /> Tambah Admin
      </button>

      <AdminFormPopup
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSubmit={handleAddUser}
      />

      {loading ? (
        <div className="py-8 text-center text-base text-slate-600">
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto mb-4 size-6 animate-spin text-[#0b6393]"
          />
          Memuat data...
        </div>
      ) : (
        <TableAdmin
          columns={columns}
          data={data}
          onDelete={handleDelete}
          onTransfer={handleTransfer}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Konfirmasi Hapus
            </h2>
            <p className="mb-6 text-center text-base text-slate-600">
              Yakin ingin menghapus user ini? Aksi ini **tidak dapat
              dibatalkan**.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={confirmDelete}
                className="min-h-11 rounded-xl bg-red-700 px-5 font-semibold text-white transition-colors hover:bg-red-800"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="min-h-11 rounded-xl bg-slate-100 px-5 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {transferId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Konfirmasi Transfer
            </h2>
            <p className="mb-6 text-center text-base text-slate-600">
              Yakin ingin memindahkan superadmin ke user ini? Anda akan
              **otomatis logout**.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={confirmTransfer}
                className="min-h-11 rounded-xl bg-[#0b6393] px-5 font-semibold text-white transition-colors hover:bg-[#0a557c]"
              >
                Ya, Transfer
              </button>
              <button
                onClick={() => setTransferId(null)}
                className="min-h-11 rounded-xl bg-slate-100 px-5 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
