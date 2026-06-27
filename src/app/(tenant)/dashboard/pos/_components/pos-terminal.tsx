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
    <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 h-full bg-mesh">
      {/* Daftar produk */}
      <div className="flex-1 animate-fade-up">
        <div className="relative mb-5">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-soft focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => onProductClick(p)}
              disabled={p.variants.length === 0 && p.stock <= 0}
              className="group text-left bg-white border border-slate-100 rounded-2xl p-4 min-h-[44px] shadow-soft hover:shadow-float hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-soft"
            >
              <p className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">
                {p.name}
              </p>
              <p className="text-xs text-slate-400 mb-2">
                {p.category?.name ?? "Tanpa kategori"}
              </p>
              <p className="font-display font-bold text-gradient text-sm">
                {p.variants.length > 0 ? "Pilih varian" : formatRupiah(p.price)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {p.variants.length > 0
                  ? `${p.variants.length} varian`
                  : `Stok: ${p.stock}`}
              </p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full py-10 text-center">
              Tidak ada produk.
            </p>
          )}
        </div>
      </div>

      {/* Keranjang */}
      <div className="w-full lg:w-96 flex-none">
        <div className="glass-card rounded-2xl flex flex-col max-h-[calc(100vh-8rem)] sticky top-6 shadow-float">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-soft">
              <ShoppingCart size={17} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-slate-900 tracking-tight">
              Keranjang
            </h3>
            <span className="ml-auto text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
              {cart.length} item
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <ShoppingCart size={24} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">
                  Klik produk untuk menambah ke keranjang.
                </p>
              </div>
            ) : (
              cart.map((i) => (
                <div
                  key={i.key}
                  className="flex items-center gap-2 bg-slate-50/70 rounded-xl p-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {i.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatRupiah(i.price)}
                    </p>
                  </div>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-soft">
                    <button
                      onClick={() => setQty(i.key, i.quantity - 1)}
                      aria-label="Kurangi jumlah"
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-l-lg transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900">
                      {i.quantity}
                    </span>
                    <button
                      onClick={() => setQty(i.key, i.quantity + 1)}
                      aria-label="Tambah jumlah"
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-r-lg transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => setQty(i.key, 0)}
                    aria-label="Hapus item"
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100 space-y-3 bg-white/50 rounded-b-2xl">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
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
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
                    paymentMethod === pm.id
                      ? "bg-brand-600 text-white shadow-glow"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm gap-2">
              <span className="text-slate-500">Diskon</span>
              <input
                type="number"
                value={discount || ""}
                onChange={(e) =>
                  setDiscount(Math.max(0, Number(e.target.value) || 0))
                }
                placeholder="0"
                className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-display font-extrabold text-2xl text-gradient">
                {formatRupiah(total)}
              </span>
            </div>

            <button
              onClick={submit}
              disabled={checkout.isPending || cart.length === 0}
              className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-none transition-all flex items-center justify-center gap-2"
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setPickProduct(null)}
        >
          <div
            className="glass-card rounded-2xl w-full max-w-sm shadow-float p-6 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-slate-900 tracking-tight mb-1">
              {pickProduct.name}
            </h3>
            <p className="text-sm text-slate-500 mb-4">Pilih varian:</p>
            <div className="space-y-2">
              {pickProduct.variants.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock <= 0}
                  onClick={() => {
                    addLine(pickProduct, v);
                    setPickProduct(null);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand-300 hover:bg-white hover:shadow-soft transition-all active:scale-[0.98] disabled:opacity-40"
                >
                  <span className="text-sm font-semibold text-slate-900">
                    {v.name}
                  </span>
                  <span className="text-sm text-slate-600">
                    {formatRupiah(v.price)} · stok {v.stock}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setPickProduct(null)}
              className="mt-4 w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
