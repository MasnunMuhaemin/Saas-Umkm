"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Loader2,
} from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { formatRupiah } from "@/lib/helpers/format";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type PosData = RouterOutput["order"]["posData"];
type PosProduct = PosData["products"][number];
type PosVariant = PosProduct["variants"][number];

type CartItem = {
  key: string; // productId + variantId (unik per varian)
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

const PAYMENTS = [
  { id: "cash", label: "Tunai" },
  { id: "transfer", label: "Transfer" },
  { id: "ewallet", label: "E-Wallet" },
] as const;

export function PosTerminal({ initial }: { initial: PosData }) {
  const utils = trpc.useUtils();
  const { data } = trpc.order.posData.useQuery(undefined, {
    initialData: initial,
  });
  const products = data?.products ?? [];
  const customers = data?.customers ?? [];

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENTS)[number]["id"]>("cash");
  const [customerId, setCustomerId] = useState("");
  const [pickProduct, setPickProduct] = useState<PosProduct | null>(null);

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  function onProductClick(p: PosProduct) {
    if (p.variants.length > 0) {
      setPickProduct(p); // pilih varian dulu
    } else {
      addLine(p, null);
    }
  }

  function addLine(p: PosProduct, variant: PosVariant | null) {
    const stock = variant ? variant.stock : p.stock;
    if (stock <= 0) return;
    const key = `${p.id}|${variant?.id ?? ""}`;
    const name = variant ? `${p.name} - ${variant.name}` : p.name;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        if (existing.quantity >= stock) {
          toast.error(`Stok "${name}" hanya ${stock}.`);
          return prev;
        }
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          key,
          productId: p.id,
          variantId: variant?.id ?? null,
          name,
          price: variant ? variant.price : p.price,
          quantity: 1,
          stock,
        },
      ];
    });
  }

  function setQty(key: string, qty: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.key === key
            ? { ...i, quantity: Math.max(0, Math.min(qty, i.stock)) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  const checkout = trpc.order.createPos.useMutation({
    onSuccess: (res) => {
      toast.success(`Transaksi ${res.orderNumber} tersimpan`);
      setCart([]);
      setDiscount(0);
      setCustomerId("");
      utils.order.posData.invalidate(); // refresh stok
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = () => {
    if (cart.length === 0) return toast.error("Keranjang masih kosong");
    checkout.mutate({
      items: cart.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      customerId: customerId || null,
      paymentMethod,
      discount,
    });
  };

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6 h-full">
      {/* Daftar produk */}
      <div className="flex-1">
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => onProductClick(p)}
              disabled={p.variants.length === 0 && p.stock <= 0}
              className="text-left bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                {p.name}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                {p.category?.name ?? "Tanpa kategori"}
              </p>
              <p className="font-bold text-brand-600 text-sm">
                {p.variants.length > 0 ? "Pilih varian" : formatRupiah(p.price)}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {p.variants.length > 0
                  ? `${p.variants.length} varian`
                  : `Stok: ${p.stock}`}
              </p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-500 col-span-full py-10 text-center">
              Tidak ada produk.
            </p>
          )}
        </div>
      </div>

      {/* Keranjang */}
      <div className="w-full lg:w-96 flex-none">
        <div className="bg-white border border-gray-100 rounded-2xl flex flex-col max-h-[calc(100vh-8rem)] sticky top-6">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <ShoppingCart size={18} className="text-brand-600" />
            <h3 className="font-bold text-gray-900">Keranjang</h3>
            <span className="ml-auto text-sm text-gray-500">
              {cart.length} item
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Klik produk untuk menambah ke keranjang.
              </p>
            ) : (
              cart.map((i) => (
                <div key={i.key} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {i.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRupiah(i.price)}
                    </p>
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQty(i.key, i.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {i.quantity}
                    </span>
                    <button
                      onClick={() => setQty(i.key, i.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => setQty(i.key, 0)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-100 space-y-3">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none"
            >
              <option value="">Pelanggan: Umum (walk-in)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-2">
              {PAYMENTS.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    paymentMethod === pm.id
                      ? "bg-brand-600 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm gap-2">
              <span className="text-gray-500">Diskon</span>
              <input
                type="number"
                value={discount || ""}
                onChange={(e) =>
                  setDiscount(Math.max(0, Number(e.target.value) || 0))
                }
                placeholder="0"
                className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-brand-400"
              />
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-black text-lg text-brand-600">
                {formatRupiah(total)}
              </span>
            </div>

            <button
              onClick={submit}
              disabled={checkout.isPending || cart.length === 0}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {checkout.isPending && (
                <Loader2 size={18} className="animate-spin" />
              )}
              {checkout.isPending ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal pilih varian */}
      {pickProduct && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setPickProduct(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-1">{pickProduct.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Pilih varian:</p>
            <div className="space-y-2">
              {pickProduct.variants.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock <= 0}
                  onClick={() => {
                    addLine(pickProduct, v);
                    setPickProduct(null);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/40 transition-colors disabled:opacity-40"
                >
                  <span className="text-sm font-semibold text-gray-900">
                    {v.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatRupiah(v.price)} · stok {v.stock}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setPickProduct(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
