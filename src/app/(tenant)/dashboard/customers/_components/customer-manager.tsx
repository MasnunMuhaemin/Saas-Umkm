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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {customer ? "Edit Pelanggan" : "Tambah Pelanggan"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {f.label}
              </label>
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) =>
                  setForm((s) => ({ ...s, [f.key]: e.target.value }))
                }
                placeholder={f.ph}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Alamat
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm((s) => ({ ...s, address: e.target.value }))
              }
              placeholder="Jl. Merdeka No. 10"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-gray-900">Manajemen Pelanggan</h2>
          <p className="text-sm text-gray-500">{customers.length} pelanggan</p>
        </div>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Tambah Pelanggan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center">
            <Users size={40} className="mb-3 opacity-20" />
            <p className="font-medium text-gray-500">Belum ada pelanggan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100 bg-gray-50/50">
                  {["Nama", "Kontak", "Kota", "Pesanan", "Total Belanja", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div>{c.phone || "-"}</div>
                      {c.email && (
                        <div className="text-xs text-gray-400">{c.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {c.city || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-bold whitespace-nowrap">
                      {c.totalOrders}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatRupiah(c.totalSpent)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal({ open: true, editing: c })}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Hapus Pelanggan?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Data pelanggan ini akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={del.isPending}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => del.mutate({ id: deleteId })}
                disabled={del.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
