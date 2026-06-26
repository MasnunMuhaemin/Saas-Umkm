"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Store } from "lucide-react";

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightElement,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={16} />
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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

    // Sukses — arahkan sesuai peran user.
    const session = await getSession();
    const role = session?.user?.role;
    router.push(role === "SUPERADMIN" ? "/super-admin" : "/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Kembali ke Halaman Utama
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-8 pt-8 pb-10 relative overflow-hidden">
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 border border-white/20">
                <Store size={26} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Login UMKM Admin
              </h1>
              <p className="text-blue-200 text-sm">
                Kelola toko online Anda dengan mudah
              </p>
            </div>
          </div>

          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="login-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="nama@email.com"
                icon={Mail}
              />
              <InputField
                id="login-password"
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                icon={Lock}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="login-remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Ingat saya
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {loading ? "Memproses..." : "Masuk ke Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
