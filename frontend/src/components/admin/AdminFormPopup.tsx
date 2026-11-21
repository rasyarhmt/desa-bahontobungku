import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Lock, Mail, UserPlus, UserRound, X } from "lucide-react";
import { useDisclosure } from "@/hooks";

interface AdminFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nama: string; email: string; password: string }) => void;
}

const AdminFormPopup = ({ isOpen, onClose, onSubmit }: AdminFormPopupProps) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });

  const { isOpen: isVisible, setOpen: setIsVisible } = useDisclosure();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-6"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex min-h-11 min-w-11 font-semibold items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
          aria-label="Tutup formulir"
          title="Tutup"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 pr-12">
          <div className="rounded-xl bg-slate-100 p-3">
            <UserPlus
              className="size-5 text-[#0b6393]"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Tambah Admin Baru</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-nama"
              className="mb-2 block text-base font-semibold text-slate-900"
            >
              Nama
            </label>
            <div className="relative">
              <input
                id="admin-nama"
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                placeholder="Masukkan nama"
              />
              <UserRound
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-base font-semibold text-slate-900"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                placeholder="Masukkan email"
              />
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-base font-semibold text-slate-900"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                placeholder="Masukkan password"
              />
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-100"
            >
              <X className="size-5" aria-hidden="true" />
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75]"
            >
              <UserPlus className="size-5" aria-hidden="true" />
              Tambah Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminFormPopup;
