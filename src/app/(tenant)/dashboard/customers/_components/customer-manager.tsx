"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Edit2, Loader2, Plus, Trash2, Users, X } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { formatRupiah } from "@/lib/helpers/format";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CustomerRow = RouterOutput["customer"]["all"][number];

const FIELDS = [
  { key: "name", label: "Nama *", ph: "Ibu Sari" },
  { key: "phone", label: "Telepon", ph: "081234567890" },
  { key: "email", label: "Email", ph: "sari@email.com" },
  { key: "city", label: "Kota", ph: "Bandung" },
  { key: "province", label: "Provinsi", ph: "Jawa Barat" },
  { key: "postalCode", label: "Kode Pos", ph: "40123" },
] as const;

function CustomerModal({
  customer,
  onClose,
}: {
  customer: CustomerRow | null;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    city: customer?.city ?? "",
    province: customer?.province ?? "",
    postalCode: customer?.postalCode ?? "",
    address: customer?.address ?? "",
  });

  const done = () => {
    toast.success(customer ? "Pelanggan diperbarui" : "Pelanggan ditambahkan");
    utils.customer.all.invalidate();
    onClose();
  };
  const onError = (e: { message: string }) => toast.error(e.message);
  const create = trpc.customer.create.useMutation({ onSuccess: done, onError });
  const update = trpc.customer.update.useMutation({ onSuccess: done, onError });
  const saving = create.isPending || update.isPending;

  const save = () => {
    if (!form.name.trim()) return toast.error("Nama pelanggan wajib diisi");
    const data = {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      city: form.city || null,
      province: form.province || null,
      postalCode: form.postalCode || null,
      address: form.address || null,
    };
    if (customer) update.mutate({ id: customer.id, data });
    else create.mutate(data);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl w-full max-w-lg shadow-float animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-display font-bold tracking-tight text-slate-900">
            {customer ? "Edit Pelanggan" : "Tambah Pelanggan"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                {f.label}
              </label>
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) =>
                  setForm((s) => ({ ...s, [f.key]: e.target.value }))
                }
                placeholder={f.ph}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Alamat
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm((s) => ({ ...s, address: e.target.value }))
              }
              placeholder="Jl. Merdeka No. 10"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
            />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CustomerManager({ initial }: { initial: CustomerRow[] }) {
  const utils = trpc.useUtils();
  const { data: customers = [] } = trpc.customer.all.useQuery(undefined, {
    initialData: initial,
  });
  const [modal, setModal] = useState<{ open: boolean; editing: CustomerRow | null }>(
    { open: false, editing: null },
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const del = trpc.customer.delete.useMutation({
    onSuccess: () => {
      toast.success("Pelanggan dihapus");
      utils.customer.all.invalidate();
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold tracking-tight text-slate-900 text-xl">
            Manajemen Pelanggan
          </h2>
          <p className="text-sm text-slate-500">{customers.length} pelanggan</p>
        </div>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> Tambah Pelanggan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Users size={28} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700">Belum ada pelanggan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 bg-slate-50">
                  {["Nama", "Kontak", "Kota", "Pesanan", "Total Belanja", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 font-semibold text-slate-900 text-sm whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      <div>{c.phone || "-"}</div>
                      {c.email && (
                        <div className="text-xs text-slate-400">{c.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {c.city || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 font-bold whitespace-nowrap">
                      {c.totalOrders}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {formatRupiah(c.totalSpent)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal({ open: true, editing: c })}
                          aria-label="Edit pelanggan"
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          aria-label="Hapus pelanggan"
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <CustomerModal
          key={modal.editing?.id ?? "new"}
          customer={modal.editing}
          onClose={() => setModal({ open: false, editing: null })}
        />
      )}

      {deleteId && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="glass-card rounded-2xl p-6 w-full max-w-sm shadow-float animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-display font-bold tracking-tight text-slate-900 mb-2">
              Hapus Pelanggan?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Data pelanggan ini akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={del.isPending}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => del.mutate({ id: deleteId })}
                disabled={del.isPending}
                className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {del.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
