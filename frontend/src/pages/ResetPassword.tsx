import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";

import AuthShell, {
  authInputClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";

const requestPasswordReset = async (email: string): Promise<unknown> => {
  try {
    return await authApi.resetPassword(email);
  } catch (err) {
    throw new Error(
      getErrorMessage(
        err,
        "Gagal mengirim permintaan reset password. Coba lagi.",
      ),
    );
  }
};

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const result = (await requestPasswordReset(email)) as {
        message?: string;
      };
      setSuccessMessage(
        result.message || "Link reset password telah dikirim ke email Anda.",
      );
      toast.success(
        "Link reset password telah dikirim ke email Anda. Silakan periksa kotak masuk Anda.",
        { duration: 5000 },
      );
      setEmail("");
    } catch (err) {
      const message = getErrorMessage(err, "Terjadi kesalahan.");
      setError(message);
      toast.error(message, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() !== "";

  return (
    <AuthShell
      eyebrow="Pemulihan Akun"
      title="Reset Password"
      description="Masukkan email Anda untuk menerima link reset password."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Kembali ke Login
        </Link>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          className="mb-5 rounded-xl bg-secondary-container px-4 py-3 text-sm text-on-secondary-container"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-5">
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
              className={`${authInputClass} pl-10`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={authPrimaryButtonClass}
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {isLoading ? "Memproses..." : "Kirim Link Reset Password"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
