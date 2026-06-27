"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const forgot = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setSent(true),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Kembali ke Login
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Lupa Password</h1>
          <p className="text-gray-500 text-sm mb-6">
            Masukkan email Anda, kami kirim link reset.
          </p>

          {sent ? (
            <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-4 rounded-xl">
              Jika email <b>{email}</b> terdaftar, link reset password telah
              dikirim. Silakan cek kotak masuk Anda.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                forgot.mutate({ email });
              }}
              className="space-y-4"
            >
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={forgot.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
              >
                {forgot.isPending && <Loader2 size={16} className="animate-spin" />}
                {forgot.isPending ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
