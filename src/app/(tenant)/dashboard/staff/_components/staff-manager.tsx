"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Crown, Loader2, Plus, Trash2, User } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

type Data = {
  owner: { name: string; email: string };
  staff: { id: string; name: string; email: string; joinedAt: string }[];
};

export function StaffManager({ initial }: { initial: Data }) {
  const utils = trpc.useUtils();
  const { data = initial } = trpc.staff.list.useQuery(undefined, {
    initialData: initial,
  });
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const add = trpc.staff.add.useMutation({
    onSuccess: () => {
      utils.staff.list.invalidate();
      setForm({ name: "", email: "", password: "" });
      toast.success("Staff ditambahkan");
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.staff.remove.useMutation({
    onSuccess: () => {
      utils.staff.list.invalidate();
      toast.success("Staff dihapus");
    },
    onError: (e) => toast.error(e.message),
  });

  const inputCls =
    "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all";

  return (
    <div className="max-w-3xl animate-fade-up space-y-6 p-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Kelola Staff
        </h2>
        <p className="text-sm text-slate-500">
          Tambah kasir/staff yang bisa login & mengelola toko (kecuali langganan
          & kelola staff).
        </p>
      </div>

      {/* Tambah staff */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <h3 className="mb-3 font-display font-bold text-slate-900">
          Tambah Staff
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Nama staff"
            className={inputCls}
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Email login"
            className={inputCls}
          />
          <input
            type="text"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Password (min. 6)"
            className={inputCls}
          />
        </div>
        <button
          onClick={() => {
            if (!form.name.trim() || !form.email.trim() || form.password.length < 6)
              return toast.error("Isi nama, email, dan password (min. 6)");
            add.mutate(form);
          }}
          disabled={add.isPending}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
        >
          {add.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          Tambah Staff
        </button>
      </div>

      {/* Daftar tim */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="divide-y divide-slate-100">
          {/* Owner */}
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Crown size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{data.owner.name}</p>
              <p className="truncate text-xs text-slate-400">
                {data.owner.email}
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
              Pemilik
            </span>
          </div>

          {/* Staff */}
          {data.staff.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <User size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{s.name}</p>
                <p className="truncate text-xs text-slate-400">
                  {s.email} · sejak {s.joinedAt}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                Staff
              </span>
              <button
                onClick={() => {
                  if (confirm(`Hapus staff ${s.name}? Akunnya akan dihapus.`))
                    remove.mutate({ id: s.id });
                }}
                disabled={remove.isPending}
                aria-label="Hapus staff"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {data.staff.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">
              Belum ada staff. Tambahkan kasir/staff di atas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
