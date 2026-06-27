"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  Edit2,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { formatRupiah } from "@/lib/helpers/format";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type ProductList = RouterOutput["product"]["list"];

export function ProductTable({
  initialData,
  categories,
}: {
  initialData: ProductList;
  categories: { id: string; name: string }[];
}) {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isInitial = page === 1 && !search && !category && !status;
  const { data, isFetching } = trpc.product.list.useQuery(
    {
      search: search || undefined,
      category: category || undefined,
      status: status || undefined,
      page,
    },
    {
      initialData: isInitial ? initialData : undefined,
      placeholderData: keepPreviousData,
    },
  );

  const del = trpc.product.delete.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil dihapus");
      utils.product.list.invalidate();
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const products = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.lastPage ?? 1;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-gray-900">Manajemen Produk</h2>
          <p className="text-sm text-gray-500">{total} produk total</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari produk atau SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
            <option value="OUT_OF_STOCK">Habis</option>
          </select>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Produk
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  SKU
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Kategori
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Harga
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Stok
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-indigo-200 flex items-center justify-center flex-none">
                        <Package size={16} className="text-brand-600/70" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {p.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {p.sku || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.category?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatRupiah(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-semibold ${
                        p.stock === 0
                          ? "text-red-600"
                          : p.stock <= 10
                            ? "text-orange-600"
                            : "text-gray-900"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} variant="product" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Package size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-3">
                      {isFetching ? "Memuat..." : "Belum ada produk"}
                    </p>
                    <Link
                      href="/dashboard/products/new"
                      className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors"
                    >
                      <Plus size={16} /> Tambah Produk
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan {products.length} dari {total} produk
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: lastPage }, (_, i) => i + 1)
              .slice(0, 7)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    p === page
                      ? "bg-brand-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Konfirmasi hapus */}
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
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Hapus Produk?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              dapat dibatalkan.
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
