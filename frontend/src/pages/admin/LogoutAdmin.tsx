import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function LogoutAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8fb] p-4"
     
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#0b6393]/10">
          <LogOut aria-hidden="true" className="size-7 text-[#0b6393]" />
        </div>
        <h1 className="mb-4 text-2xl font-bold text-slate-900">
          Anda telah keluar
        </h1>
        <p className="mb-6 text-base text-slate-600">
          Terima kasih telah menggunakan dashboard admin. Anda telah berhasil
          keluar dari sistem.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-4 font-semibold text-white transition-colors hover:bg-[#0a557c]"
        >
          <LogOut aria-hidden="true" className="size-5" />
          Login Kembali
        </button>
      </div>
    </div>
  );
}
