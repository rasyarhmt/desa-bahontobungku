import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Landmark, Loader, Lock, Mail, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div
      className="flex items-center justify-center min-h-screen bg-muted p-4"
      style={{ fontFamily: "poppins" }}
    >
      <Link
        to="/"
        aria-label="Kembali ke beranda"
        className="absolute top-4 right-4 z-50 rounded-full bg-background p-3 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        <X className="size-5" />
      </Link>

      <Card className="w-full max-w-md bg-card shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Landmark className="size-7" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Login Sebagai Admin
          </CardTitle>
          <CardDescription>
            Selamat datang, silakan masukkan kredensial Anda
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="pl-9"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10 pl-9"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
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
                className="text-sm text-primary hover:underline"
              >
                Lupa Password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid || isLoading}
              className="mt-2 w-full"
            >
              {isLoading && <Loader className="animate-spin" />}
              {isLoading ? "Memproses..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}