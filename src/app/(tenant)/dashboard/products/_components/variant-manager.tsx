"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatRupiah } from "@/lib/helpers/format";

export function VariantManager({ productId }: { productId: string }) {
  const utils = trpc.useUtils();
  const { data: variants = [] } = trpc.variant.list.useQuery({ productId });

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const invalidate = () => utils.variant.list.invalidate({ productId });
  const onError = (e: { message: string }) => toast.error(e.message);

  const add = trpc.variant.add.useMutation({
    onSuccess: () => {
      toast.success("Varian ditambahkan");
      invalidate();
      setName("");
      setSku("");
      setPrice("");
      setStock("");
    },
    onError,
  });
  const del = trpc.variant.delete.useMutation({
    onSuccess: () => invalidate(),
    onError,
  });

  const submit = () => {
    if (!name.trim() || !price) return toast.error("Nama & harga varian wajib diisi");
    add.mutate({
      productId,
      data: {
        name,
        sku: sku || null,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
      },
    });
  };

  const inputCls =
    "px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-1">Varian Produk</h3>
      <p className="text-sm text-gray-500 mb-5">
        Mis. ukuran/warna dengan harga & stok berbeda.
      </p>

      {variants.length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left">
                {["Varian", "SKU", "Harga", "Stok", ""].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {variants.map((v) => (
                <tr key={v.id}>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">
                    {v.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500 font-mono">
                    {v.sku || "-"}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {formatRupiah(v.price)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{v.stock}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => del.mutate({ id: v.id })}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form tambah varian */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama (cth: Merah / XL)"
          className={`${inputCls} col-span-2 sm:col-span-1`}
        />
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU"
          className={inputCls}
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Harga"
          className={inputCls}
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stok"
          className={inputCls}
        />
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={add.isPending}
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
      >
        {add.isPending ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Plus size={15} />
        )}
        Tambah Varian
      </button>
    </div>
  );
}
