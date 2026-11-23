import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import AuthShell, {
  authInputClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.login(email, password);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Login berhasil.");
      window.location.href = "/admin/beranda";
    } catch (err) {
      toast.error(getErrorMessage(err, "Login gagal. Coba lagi."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Portal Admin"
      title="Login Sebagai Admin"
      description="Selamat datang, silakan masukkan kredensial Anda."
      footer={
        <p>
          Butuh bantuan? Hubungi kantor desa untuk mendapatkan akses admin.
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`${authInputClass} pl-10`}
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`${authInputClass} pr-11 pl-10`}
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-border accent-primary"
            />
            Ingat email saya
          </label>
          <Link
            to="/ResetPassword"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Lupa Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={authPrimaryButtonClass}
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {isLoading ? "Memproses..." : "Login"}
        </button>
      </form>
    </AuthShell>
  );
}
