"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle,
  ChevronRight,
  Loader2,
  PackageX,
  XCircle,
} from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type ProductData = RouterOutput["product"]["byId"];

const TABS = [
  { id: "basic", label: "Informasi Dasar" },
  { id: "price", label: "Harga & Stok" },
  { id: "seo", label: "SEO" },
] as const;

const STATUS_OPTIONS = [
  { val: "ACTIVE", label: "Aktif", icon: CheckCircle, color: "text-green-600" },
  { val: "INACTIVE", label: "Nonaktif", icon: XCircle, color: "text-gray-500" },
  { val: "OUT_OF_STOCK", label: "Habis", icon: PackageX, color: "text-red-600" },
] as const;

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: ProductData;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("basic");

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [originalPrice, setOriginalPrice] = useState(
    product?.originalPrice ? String(product.originalPrice) : "",
  );
  const [sku, setSku] = useState(product?.sku ?? "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [weight, setWeight] = useState(
    product?.weight ? String(product.weight) : "",
  );
  const [status, setStatus] = useState<string>(product?.status ?? "ACTIVE");
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    product?.metaDescription ?? "",
  );

  const utils = trpc.useUtils();
  const onDone = () => {
    toast.success(isEdit ? "Produk berhasil diupdate" : "Produk berhasil ditambahkan");
    utils.product.list.invalidate();
    router.push("/dashboard/products");
    router.refresh();
  };
  const onError = (e: { message: string }) => toast.error(e.message);

  const create = trpc.product.create.useMutation({ onSuccess: onDone, onError });
  const update = trpc.product.update.useMutation({ onSuccess: onDone, onError });
  const loading = create.isPending || update.isPending;

  const handleSubmit = () => {
    if (!name || !price) {
      toast.error("Nama dan harga wajib diisi.");
      setTab("basic");
      return;
    }
    const payload = {
      name,
      categoryId: categoryId || null,
      sku: sku || null,
      description: description || null,
      price: Number(price) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: Number(stock) || 0,
      weight: weight ? Number(weight) : null,
      status: status as "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK",
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };
    if (isEdit && product) update.mutate({ id: product.id, data: payload });
    else create.mutate(payload);
  };

  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white transition-colors";

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/products"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronRight size={18} className="rotate-180" />
        </Link>
        <div>
          <h2 className="font-bold text-gray-900">
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <p className="text-sm text-gray-500">Isi informasi produk dengan lengkap</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "basic" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kue Nastar Premium"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Kategori
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Deskripsi Produk
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Tulis deskripsi produk yang menarik dan informatif..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}

          {tab === "price" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Harga Normal *
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-brand-400">
                    <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="65000"
                      className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Harga Coret (sebelum diskon)
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-brand-400">
                    <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="Kosongkan jika tidak ada"
                      className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="KN-001"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Stok
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Berat (gram)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="250"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "seo" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Contoh: Kue Nastar Premium Homemade - Toko Demo"
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Rekomendasi 50-60 karakter untuk pencarian Google.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  SEO Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={4}
                  placeholder="Deskripsi singkat untuk hasil pencarian..."
                  className={`${inputCls} resize-none`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Rekomendasi 150-160 karakter.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
            <Link
              href="/dashboard/products"
              className="px-6 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center"
            >
              Batal
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-72 flex-none">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">
              Status Publikasi
            </h4>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(({ val, label, icon: Icon, color }) => (
                <label
                  key={val}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="status"
                    checked={status === val}
                    onChange={() => setStatus(val)}
                    className="accent-brand-600"
                  />
                  <Icon size={16} className={color} />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
