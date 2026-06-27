"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, Check, CheckCheck, Loader2, Plus } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/routers/_app";

type Notif =
  inferRouterOutputs<AppRouter>["superadmin"]["notification"]["list"][number];

const TYPE_STYLE: Record<string, string> = {
  info: "bg-blue-50 text-blue-600",
  warning: "bg-amber-50 text-amber-600",
  success: "bg-green-50 text-green-600",
  error: "bg-red-50 text-red-600",
};

export function NotificationCenter({ initial }: { initial: Notif[] }) {
  const utils = trpc.useUtils();
  const { data: items = [] } = trpc.superadmin.notification.list.useQuery(
    undefined,
    { initialData: initial },
  );
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success" | "error">(
    "info",
  );

  const inval = () => {
    utils.superadmin.notification.list.invalidate();
    utils.superadmin.notification.unreadCount.invalidate();
  };
  const onError = (e: { message: string }) => toast.error(e.message);

  const create = trpc.superadmin.notification.create.useMutation({
    onSuccess: () => {
      toast.success("Notifikasi dibuat");
      setTitle("");
      setMessage("");
      inval();
    },
    onError,
  });
  const markRead = trpc.superadmin.notification.markRead.useMutation({
    onSuccess: inval,
    onError,
  });
  const markAll = trpc.superadmin.notification.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("Semua ditandai dibaca");
      inval();
    },
    onError,
  });

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Pusat Notifikasi</h2>
        <button
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50"
        >
          <CheckCheck size={15} /> Tandai semua dibaca
        </button>
      </div>

      {/* Buat notifikasi */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Buat Notifikasi</h3>
        <div className="grid sm:grid-cols-3 gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul"
            className="sm:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
          >
            <option value="info">Info</option>
            <option value="warning">Peringatan</option>
            <option value="success">Sukses</option>
            <option value="error">Error</option>
          </select>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Pesan..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
        />
        <button
          onClick={() => {
            if (!title.trim() || !message.trim())
              return toast.error("Judul & pesan wajib diisi");
            create.mutate({ title, message, type });
          }}
          disabled={create.isPending}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          {create.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          Kirim
        </button>
      </div>

      {/* Daftar */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell size={36} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Belum ada notifikasi.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 p-4",
                  !n.isRead && "bg-blue-50/40",
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-none",
                    TYPE_STYLE[n.type] ?? TYPE_STYLE.info,
                  )}
                >
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.dateLabel}</p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markRead.mutate({ id: n.id })}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-none"
                    title="Tandai dibaca"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
