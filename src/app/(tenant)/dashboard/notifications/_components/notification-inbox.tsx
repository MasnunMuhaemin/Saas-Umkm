"use client";

import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

type Item = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  dateLabel: string;
};

const TYPE: Record<
  string,
  { icon: React.ElementType; ring: string; text: string; bg: string }
> = {
  info: { icon: Info, ring: "bg-blue-50", text: "text-blue-600", bg: "" },
  success: {
    icon: CheckCircle2,
    ring: "bg-emerald-50",
    text: "text-emerald-600",
    bg: "",
  },
  warning: {
    icon: AlertTriangle,
    ring: "bg-amber-50",
    text: "text-amber-600",
    bg: "",
  },
  error: { icon: XCircle, ring: "bg-red-50", text: "text-red-600", bg: "" },
};

export function NotificationInbox({ initial }: { initial: Item[] }) {
  const utils = trpc.useUtils();
  const { data: items = initial } = trpc.notification.list.useQuery(undefined, {
    initialData: initial,
  });

  const markAll = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
      toast.success("Semua notifikasi ditandai dibaca");
    },
    onError: (e) => toast.error(e.message),
  });

  const unread = items.filter((i) => !i.isRead).length;

  return (
    <div className="max-w-3xl animate-fade-up space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Notifikasi
          </h2>
          <p className="text-sm text-slate-500">
            {unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"} ·
            pengumuman dari MayWeb
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50"
          >
            <CheckCheck size={15} /> Tandai semua dibaca
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {items.map((n) => {
          const t = TYPE[n.type] ?? TYPE.info;
          const Icon = t.icon;
          return (
            <div
              key={n.id}
              className={`flex gap-3.5 rounded-2xl border p-4 transition-colors ${
                n.isRead
                  ? "border-slate-100 bg-white"
                  : "border-brand-100 bg-brand-50/40"
              }`}
            >
              <div
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${t.ring} ${t.text}`}
              >
                <Icon size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  {!n.isRead && (
                    <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-brand-500" />
                  )}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                  {n.message}
                </p>
                <p className="mt-1.5 text-xs text-slate-400">{n.dateLabel}</p>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center">
            <Bell size={28} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-400">Belum ada notifikasi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
