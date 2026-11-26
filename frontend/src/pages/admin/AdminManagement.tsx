import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import AdminTablePagination from "@/components/admin/AdminTablePagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  AdminField,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminPageHeader,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import TableAdmin from "@/components/admin/TableAdmin";
import { adminUserApi } from "@/lib/api/admin";
import { authApi } from "@/lib/api/auth";
import { type AdminUser } from "@/lib/api/schemas";
import { useAsyncData, useTablePagination } from "@/hooks";
import { getAuthState } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/lib/toast";

interface AdminUserRow extends AdminUser {
  last_login?: string | null;
}

interface AdminFormState {
  nama: string;
  email: string;
  password: string;
}

const emptyForm: AdminFormState = { nama: "", email: "", password: "" };

export default function AdminManagement() {
  const { role } = getAuthState();
  const [formState, setFormState] = useState<{
    mode: "add" | "edit";
    original: AdminUserRow | null;
    values: AdminFormState;
  } | null>(null);
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

  const closeForm = () => setFormState(null);

  const openAdd = () =>
    setFormState({ mode: "add", original: null, values: { ...emptyForm } });

  const openEdit = (id: number) => {
    const user = users.find((user) => user.id === id);
    if (!user) return;
    if (user.role === "superadmin") {
      toast.warning("Gunakan halaman Pengaturan untuk mengubah akun superadmin.");
      return;
    }
    setFormState({
      mode: "edit",
      original: user,
      values: { nama: user.nama, email: user.email, password: "" },
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formState) return;
    const { mode, original, values } = formState;

    try {
      if (mode === "add") {
        await adminUserApi.addUser(values.nama, values.email, values.password);
        toast.success("User berhasil ditambahkan.");
      } else {
        const auth = getAuthState();
        const isSelf =
          (Boolean(auth.email) && original?.email === auth.email) ||
          (Boolean(auth.nama) && original?.nama === auth.nama);
        if (!isSelf) {
          toast.error("Hanya akun sendiri yang dapat diubah.");
          return;
        }
        const payload: { nama?: string; password?: string } = {};
        if (values.nama.trim()) payload.nama = values.nama.trim();
        if (values.password) payload.password = values.password;
        await adminUserApi.update(payload);
        toast.success("User berhasil diperbarui.");
      }
      closeForm();
      fetchUsers();
    } catch (_e) {
      toast.error(
        mode === "add"
          ? "Gagal menambah user. Email mungkin sudah terdaftar."
          : "Gagal memperbarui user.",
      );
    }
  };

  const handleDelete = (id: number) => {
    const user = users.find((user) => user.id === id);
    if (!user) return;
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

  const handleTransfer = (id: number) => {
    const user = users.find((user) => user.id === id);
    if (!user) return;
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

  const columns = ["id", "nama", "email", "role", "last_login"];
  const data = users.map((u) => ({
    id: u.id,
    nama: u.nama,
    email: u.email,
    role: u.role,
    last_login: formatDateTime(u.last_login),
  }));

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageItems,
    totalItems,
    totalPages,
  } = useTablePagination(data, {
    resetKey: users.map((u) => u.id).join(","),
  });

  const targetName = users.find((user) => user.id === confirmDeleteId)?.nama ?? "";
  const transferName = users.find((user) => user.id === transferId)?.nama ?? "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Pengaturan Backoffice"
        title="Manajemen Admin"
        description="Kelola akun administrator dan hak aksesnya."
        onAdd={!formState ? openAdd : undefined}
        addLabel="Tambah Admin"
      />

      {formState ? (
        <AdminFormView
          eyebrow="Manajemen Admin"
          title={formState.mode === "add" ? "Tambah Admin Baru" : "Edit Admin"}
          description={
            formState.mode === "add"
              ? "Buat kredensial administrator baru."
              : "Perbarui nama dan kata sandi akun Anda."
          }
          onBack={closeForm}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <AdminFormSection
              number={1}
              title="Identitas Admin"
              description="Email digunakan sebagai identitas login dan tidak dapat diubah."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Nama" htmlFor="admin-nama" required>
                  <AdminInput
                    id="admin-nama"
                    name="nama"
                    value={formState.values.nama}
                    onChange={(event) =>
                      setFormState((prev) =>
                        prev
                          ? {
                              ...prev,
                              values: { ...prev.values, nama: event.target.value },
                            }
                          : prev,
                      )
                    }
                    required
                    placeholder="Masukkan nama"
                  />
                </AdminField>
                <AdminField label="Email" htmlFor="admin-email" required>
                  <AdminInput
                    id="admin-email"
                    type="email"
                    name="email"
                    value={formState.values.email}
                    onChange={(event) =>
                      setFormState((prev) =>
                        prev
                          ? {
                              ...prev,
                              values: { ...prev.values, email: event.target.value },
                            }
                          : prev,
                      )
                    }
                    disabled={formState.mode === "edit"}
                    required
                    placeholder="Masukkan email"
                  />
                </AdminField>
              </div>
            </AdminFormSection>

            <AdminFormSection
              number={2}
              title="Kredensial"
              description={
                formState.mode === "add"
                  ? "Kata sandi awal untuk administrator baru."
                  : "Kosongkan jika kata sandi tidak ingin diubah."
              }
            >
              <AdminField
                label="Password"
                htmlFor="admin-password"
                required={formState.mode === "add"}
              >
                <AdminInput
                  id="admin-password"
                  type="password"
                  name="password"
                  value={formState.values.password}
                  onChange={(event) =>
                    setFormState((prev) =>
                      prev
                        ? {
                            ...prev,
                            values: {
                              ...prev.values,
                              password: event.target.value,
                            },
                          }
                        : prev,
                    )
                  }
                  required={formState.mode === "add"}
                  placeholder="Masukkan password"
                />
              </AdminField>
            </AdminFormSection>

            <div className="flex justify-end gap-2">
              <button type="submit" className={adminPrimaryButtonClass}>
                {formState.mode === "add" ? "Tambah Admin" : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </AdminFormView>
      ) : (
        <TableAdmin
          columns={columns}
          data={pageItems}
          onDelete={handleDelete}
          onEdit={openEdit}
          onTransfer={handleTransfer}
          loading={loading}
          footer={
            <AdminTablePagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              label="admin"
            />
          }
        />
      )}

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Hapus Admin"
        description={`Yakin ingin menghapus ${targetName || "user ini"}? Aksi ini tidak dapat dibatalkan.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={transferId !== null}
        title="Pindahkan Superadmin"
        description={`Yakin ingin memindahkan superadmin ke ${transferName || "user ini"}? Anda akan otomatis logout.`}
        confirmLabel="Ya, Transfer"
        onConfirm={() => void confirmTransfer()}
        onCancel={() => setTransferId(null)}
      />
    </div>
  );
}
