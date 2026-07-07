import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/features/auth/api/useLogin";
import { useAuthStore } from "@/stores/authStore";
import logo from "@/assets/logo.png";
import hero from "@/assets/hero.png";

const stats = [
  { value: "25.000+", label: "Pengguna Aktif" },
  { value: "8.000+", label: "Penjemputan" },
  { value: "95%", label: "Penyelesaian" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password, rememberMe },
      { onSuccess: () => navigate("/admin/dasbor", { replace: true }) },
    );
  }

  function handleDevBypass() {
    setUser({
      id: "dev-admin",
      fullName: "Admin Utama (Dev)",
      email: "dev@baliresik.go.id",
      role: "admin",
      status: "active",
    });
    navigate("/admin/dasbor", { replace: true });
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
            Platform digital untuk pengelolaan sampah terpadu, pelaporan
            lingkungan, dan manajemen operasional kebersihan berbasis
            teknologi.
          </p>

          <img
            src={hero}
            alt="Peta operasional Bali real-time"
            className="mt-8 w-full rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center"
            >
              <p className="text-lg font-bold text-brand-400">{s.value}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-center text-xl font-bold text-gray-900">
            Masuk ke Admin Portal
          </h2>
          <p className="mt-1.5 text-center text-sm text-gray-500">
            Masukkan kredensial akun Anda untuk melanjutkan.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Email
              </label>
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
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Ingat Saya
              </label>
              <a href="#" className="font-medium text-brand-700 hover:underline">
                Lupa Kata Sandi?
              </a>
            </div>

            {login.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                Email atau kata sandi salah. Silakan coba lagi.
              </p>
            )}

            <Button type="submit" disabled={login.isPending} className="w-full">
              {login.isPending ? "Memproses..." : "Masuk"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
            Koneksi Aman - Data Anda dilindungi menggunakan standar keamanan
            modern.
          </div>

          {import.meta.env.DEV && (
            <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <FlaskConical className="h-3.5 w-3.5" />
                Mode Development
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Firebase belum dikonfigurasi dengan kredensial asli. Gunakan tombol ini untuk masuk tanpa autentikasi.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDevBypass}
                className="mt-2 w-full border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Skip Login (Dev)
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 max-w-sm text-center text-xs text-gray-400">
          © 2026 Bali Resik Smart Waste Platform. Kelola lingkungan yang
          lebih bersih dan berkelanjutan.
        </p>
      </div>
    </div>
  );
}
