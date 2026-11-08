import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaPlus } from "react-icons/fa";
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
    <div className="p-6" style={{ fontFamily: "poppins" }}>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaUserShield /> Manajemen Admin
      </h1>

      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        onClick={() => {
          addModal.open();
        }}
      >
        <FaPlus /> Tambah Admin
      </button>

      <AdminFormPopup
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        onSubmit={handleAddUser}
      />

      {loading ? (
        <div className="text-center text-gray-500">Memuat data...</div>
      ) : (
        <TableAdmin
          columns={columns}
          data={data}
          onDelete={handleDelete}
          onTransfer={handleTransfer}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 z-[100] flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <p className="mb-4 text-center">
              Yakin ingin menghapus user ini? Aksi ini **tidak dapat
              dibatalkan**.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {transferId && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 z-[100] flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <p className="mb-4 text-center">
              Yakin ingin memindahkan superadmin ke user ini? Anda akan
              **otomatis logout**.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmTransfer}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ya, Transfer
              </button>
              <button
                onClick={() => setTransferId(null)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
