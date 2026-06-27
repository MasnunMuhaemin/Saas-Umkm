"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  Store,
} from "lucide-react";

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightElement,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={16} />
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:bg-white focus:ring-4 ${
            error
              ? "border-red-300 focus:ring-red-100"
              : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
          }`}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

const HIGHLIGHTS = [
  "Website toko profesional tanpa coding",
  "Kasir, invoice & manajemen produk",
  "Order langsung masuk ke WhatsApp",
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      errs.email = "Format email tidak valid";
    if (!password) errs.password = "Password wajib diisi";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;
    router.push(role === "SUPERADMIN" ? "/super-admin" : "/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 glass-card rounded-3xl overflow-hidden shadow-float">
        {/* ---- Brand panel ---- */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 bg-linear-to-br from-brand-600 via-violet-600 to-pink-500 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Store size={22} className="text-white" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                MayWeb
              </span>
            </Link>
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold mb-5">
              <Sparkles size={13} /> Selamat datang kembali
            </div>
            <h2 className="font-display text-3xl font-extrabold text-white leading-tight mb-6">
              Kelola toko Anda,
              <br /> dari mana saja.
            </h2>
            <ul className="space-y-3">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-center gap-3 text-white/90">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-none">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-sm">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-white/60 text-xs">
            &copy; {new Date().getFullYear()} MayWeb · Untuk UMKM Indonesia
          </p>
        </div>

        {/* ---- Form ---- */}
        <div className="bg-white/80 p-8 sm:p-10">
          <Link
            href="/"
            className="lg:hidden inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> Beranda
          </Link>

          <div className="mb-7">
            <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">
              Masuk ke Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Belum punya toko?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="nama@email.com"
              icon={Mail}
              error={fieldErrors.email}
            />
            <InputField
              id="login-password"
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              icon={Lock}
              error={fieldErrors.password}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={
                    showPw ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <label
                  htmlFor="login-remember"
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  Ingat saya
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Lupa password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-brand-600 to-violet-600 hover:shadow-glow disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] text-sm"
            >
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
