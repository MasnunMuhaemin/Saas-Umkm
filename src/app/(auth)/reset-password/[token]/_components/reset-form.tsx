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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Atur Password Baru
          </h1>
          <p className="text-gray-500 text-sm mb-6">
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password baru (min. 6 karakter)"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={reset.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
            >
              {reset.isPending && <Loader2 size={16} className="animate-spin" />}
              {reset.isPending ? "Menyimpan..." : "Simpan Password"}
            </button>
          </form>

          <Link
            href="/login"
            className="block text-center text-sm text-gray-500 hover:text-gray-800 mt-5"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
