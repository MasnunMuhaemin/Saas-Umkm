"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Ticket } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import type { AppRouter } from "@/server/routers/_app";
import { formatRupiah } from "@/lib/helpers/format";

type Coupons = inferRouterOutputs<AppRouter>["superadmin"]["coupon"]["list"];

export function CouponManager({ initial }: { initial: Coupons }) {
  const utils = trpc.useUtils();
  const { data: coupons } = trpc.superadmin.coupon.list.useQuery(undefined, {
    initialData: initial,
  });

  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const create = trpc.superadmin.coupon.create.useMutation({
    onSuccess: () => {
      toast.success("Kupon dibuat");
      utils.superadmin.coupon.list.invalidate();
      setCode("");
      setValue("");
      setMaxRedemptions("");
      setExpiresAt("");
    },
    onError: (e) => toast.error(e.message),
  });
  const toggle = trpc.superadmin.coupon.toggle.useMutation({
    onSuccess: () => utils.superadmin.coupon.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(value);
    if (!code.trim() || !v) return toast.error("Lengkapi kode & nilai");
    create.mutate({
      code: code.trim().toUpperCase(),
      type,
      value: v,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      expiresAt: expiresAt || null,
    });
  };

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
          <Ticket size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kupon Diskon</h1>
          <p className="text-sm text-gray-500">
            Kupon untuk pembayaran langganan merchant.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-2xl border border-gray-100 p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Kode
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="HEMAT50"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Jenis
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
            className={inputCls}
          >
            <option value="PERCENT">Persen (%)</option>
            <option value="FIXED">Nominal (Rp)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Nilai
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "PERCENT" ? "50" : "25000"}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Kuota (opsional)
          </label>
          <input
            type="number"
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            placeholder="∞"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Kedaluwarsa (opsional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {create.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            Buat Kupon
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Kode</th>
              <th className="text-left px-5 py-3 font-semibold">Diskon</th>
              <th className="text-left px-5 py-3 font-semibold">Terpakai</th>
              <th className="text-left px-5 py-3 font-semibold">Kedaluwarsa</th>
              <th className="text-right px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  Belum ada kupon.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-bold text-gray-900">{c.code}</td>
                <td className="px-5 py-3 text-gray-600">
                  {c.type === "PERCENT"
                    ? `${c.value}%`
                    : formatRupiah(c.value)}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {c.redeemedCount}
                  {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {c.expiresLabel ?? "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggle.mutate({ id: c.id })}
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      c.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {c.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
