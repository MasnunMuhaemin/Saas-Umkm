"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const reset = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password berhasil diubah. Silakan login.");
      router.push("/login");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 shadow-float">
          <div className="w-12 h-12 rounded-2xl bg-azure-600 flex items-center justify-center mb-5 shadow-glow">
            <Lock size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">
            Atur Password Baru
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Masukkan password baru untuk akun Anda.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length < 6)
                return toast.error("Password minimal 6 karakter");
              reset.mutate({ token, password });
            }}
            className="space-y-4"
          >
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password baru (min. 6 karakter)"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-azure-400 focus:bg-white focus:ring-4 focus:ring-azure-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={reset.isPending}
              className="w-full bg-azure-600 hover:bg-azure-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
            >
              {reset.isPending && <Loader2 size={16} className="animate-spin" />}
              {reset.isPending ? "Menyimpan..." : "Simpan Password"}
            </button>
          </form>

          <Link
            href="/login"
            className="block text-center text-sm text-slate-500 hover:text-slate-800 mt-5"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
