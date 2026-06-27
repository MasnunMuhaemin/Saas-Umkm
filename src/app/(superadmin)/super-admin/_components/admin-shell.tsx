"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart2,
  Bell,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Shield,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const NAV = [
  { href: "/super-admin", label: "Dashboard Admin", icon: LayoutDashboard },
  { href: "/super-admin/tenants", label: "Tenant UMKM", icon: Users },
  { href: "/super-admin/plans", label: "Paket Langganan", icon: Package },
  { href: "/super-admin/coupons", label: "Kupon Diskon", icon: Ticket },
  { href: "/super-admin/stats", label: "Statistik Global", icon: BarChart2 },
  { href: "/super-admin/notifications", label: "Pusat Notifikasi", icon: Bell },
  { href: "/super-admin/domains", label: "Domain Pool", icon: Globe },
  { href: "/super-admin/settings", label: "Pengaturan", icon: Settings },
] as const;

export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel =
    NAV.find((i) => i.href === pathname)?.label ?? "Super Admin";
  const { data: unread = 0 } =
    trpc.superadmin.notification.unreadCount.useQuery(undefined, {
      refetchInterval: 60000,
    });

  return (
    <div className="flex h-screen bg-slate-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`w-64 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed inset-y-0 left-0 z-50 md:relative flex-none bg-slate-900 text-slate-300 h-full flex flex-col transition-transform`}
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-800">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-none">
            <Shield size={17} className="text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="font-bold text-white text-sm">MayWeb</p>
            <p className="text-slate-400 text-xs">Platform Admin</p>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="md:hidden ml-auto p-2 text-slate-400 hover:text-white rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2.5 text-sm text-slate-300 hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-slate-800"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-slate-900">{activeLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/notifications"
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {userName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
