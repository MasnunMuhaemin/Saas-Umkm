"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import {
  BarChart2,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Monitor,
  Package,
  Store,
  Tag,
  Users,
  X,
} from "lucide-react";

type ShellData = {
  businessName: string;
  planName: string;
  slug: string;
  storeUrl: string;
};

type NavItem =
  | { section: string }
  | { href: string; label: string; icon: React.ElementType; plus?: boolean };

const NAV: NavItem[] = [
  { section: "Utama" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/categories", label: "Kategori", icon: Tag },
  { href: "/dashboard/pos", label: "Kasir (POS)", icon: Monitor, plus: true },
  { href: "/dashboard/invoices", label: "History Invoice", icon: FileText, plus: true },
  { href: "/dashboard/customers", label: "Pelanggan", icon: Users, plus: true },
  { section: "Website" },
  { href: "/dashboard/store-builder", label: "Website Builder", icon: Globe },
  { section: "Lainnya" },
  { href: "/dashboard/notifications", label: "Notifikasi", icon: Bell },
  { href: "/dashboard/stats", label: "Statistik", icon: BarChart2 },
  { href: "/dashboard/billing", label: "Langganan", icon: CreditCard },
  { href: "/dashboard/settings", label: "Profil Bisnis", icon: Store },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardShell({
  shell,
  userName,
  children,
}: {
  shell: ShellData;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: unread = 0 } = trpc.notification.unreadCount.useQuery(
    undefined,
    { refetchInterval: 60000 },
  );
  const isBasic = shell.planName.toLowerCase() === "basic";

  const activeItem = NAV.find((i) => "href" in i && i.href === pathname);
  const activeLabel =
    activeItem && "label" in activeItem ? activeItem.label : "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${collapsed ? "md:w-16" : "md:w-56"} w-64 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed inset-y-0 left-0 z-50 md:relative flex-none bg-white/85 backdrop-blur-xl border-r border-slate-200/70 h-full flex flex-col transition-all duration-300`}
      >
        <div
          className={`flex items-center gap-3 p-4 border-b border-slate-100 ${
            collapsed ? "md:justify-center" : ""
          } justify-between md:justify-start`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-none shadow-glow">
              <Store size={17} className="text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-display font-bold text-slate-900 text-sm truncate">
                  {shell.businessName}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  Paket {shell.planName}
                </p>
              </div>
            )}
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map((item, i) => {
            if ("section" in item) {
              return collapsed ? (
                <div key={i} className="my-2 border-t border-slate-100" />
              ) : (
                <p
                  key={i}
                  className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 pt-4 pb-1"
                >
                  {item.section}
                </p>
              );
            }
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isLocked = isBasic && item.plus;
            const cls = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-brand-50 text-brand-700 font-semibold ring-1 ring-brand-100/70"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            } ${collapsed && !mobileOpen ? "justify-center" : ""} ${
              isLocked
                ? "opacity-60 cursor-not-allowed hover:bg-transparent hover:text-slate-600"
                : ""
            }`;

            const inner = (
              <>
                <Icon size={17} className={isActive ? "text-brand-600" : ""} />
                {(!collapsed || mobileOpen) && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {(!collapsed || mobileOpen) && isLocked && (
                  <Lock size={14} className="text-slate-400" />
                )}
              </>
            );

            if (isLocked) {
              return (
                <button
                  key={item.href}
                  type="button"
                  className={cls}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  onClick={() =>
                    toast.error(
                      "Fitur ini hanya tersedia untuk paket Plus. Hubungi admin untuk upgrade.",
                    )
                  }
                >
                  {inner}
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cls}
                title={collapsed && !mobileOpen ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {inner}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 flex flex-col gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden md:flex items-center gap-2.5 text-sm text-slate-500 hover:text-slate-900 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100 ${
              collapsed ? "justify-center" : "w-full"
            }`}
            title={collapsed ? "Perluas Sidebar" : undefined}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Perkecil Sidebar</span>}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`flex items-center gap-2.5 text-sm text-slate-600 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 ${
              collapsed ? "justify-center" : "w-full"
            }`}
            title={collapsed ? "Keluar" : undefined}
          >
            <LogOut size={16} />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-slate-200/70 glass sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display font-bold text-slate-900 text-lg">
              {activeLabel}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notifications"
              aria-label="Notifikasi"
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unread}
                </span>
              )}
            </Link>
            <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center shadow-soft">
              <span className="text-white text-xs font-bold">
                {initials(userName)}
              </span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
