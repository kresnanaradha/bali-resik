import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRegister } from "@/features/auth/api/useLocalAuth";
import logo from "@/assets/logo.png";
import hero from "@/assets/hero.png";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const tooShort = password.length > 0 && password.length < 8;
  const canSubmit = fullName.trim().length > 0 && email.trim().length > 0 && password.length >= 8 && password === confirmPassword;

  const errorMessage =
    register.isError && isAxiosError(register.error) && register.error.response?.data?.message
      ? register.error.response.data.message
      : register.isError
        ? "Gagal mendaftar. Silakan coba lagi."
        : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    register.mutate(
      { full_name: fullName, email, password },
      { onSuccess: () => navigate("/admin/dasbor", { replace: true }) },
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-panel-900 via-panel-800 to-panel-700 px-12 py-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Bali Resik" className="h-9 w-9" />
          <span className="text-lg font-bold">Bali Resik</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Bali Resik <span className="text-brand-400">Smart Waste</span>
            <br />
            Platform
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-300">
            Buat akun admin untuk mulai mengelola platform pengelolaan sampah
            terpadu Bali Resik.
          </p>

          <img src={hero} alt="Peta operasional Bali real-time" className="mt-8 w-full rounded-2xl" />
        </div>

        <div />
      </div>

      {/* Right register form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-center text-xl font-bold text-gray-900">Daftar Admin Portal</h2>
          <p className="mt-1.5 text-center text-sm text-gray-500">
            Buat akun untuk mengakses Bali Resik Admin Portal.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Nama Lengkap</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email admin"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {tooShort && <p className="mt-1 text-xs text-red-600">Password minimal 8 karakter.</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Konfirmasi Password</label>
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
              />
              {mismatch && <p className="mt-1 text-xs text-red-600">Password tidak cocok.</p>}
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
            )}

            <Button type="submit" disabled={!canSubmit || register.isPending} className="w-full">
              {register.isPending ? "Memproses..." : "Daftar"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-medium text-brand-700 hover:underline">
              Masuk di sini
            </Link>
          </p>

          <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
            Akun baru terdaftar dengan akses admin penuh.
          </div>
        </div>

        <p className="mt-6 max-w-sm text-center text-xs text-gray-400">
          © 2026 Bali Resik Smart Waste Platform. Kelola lingkungan yang
          lebih bersih dan berkelanjutan.
        </p>
      </div>
    </div>
  );
}
