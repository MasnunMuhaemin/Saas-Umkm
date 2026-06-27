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
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Kembali ke Login
        </Link>

        <div className="glass-card rounded-3xl p-8 shadow-float">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mb-5 shadow-glow">
            <Mail size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">
            Lupa Password
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Masukkan email Anda, kami kirim link reset.
          </p>

          {sent ? (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-4 rounded-xl">
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
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={forgot.isPending}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
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
