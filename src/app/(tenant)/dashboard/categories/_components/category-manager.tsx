"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Cake,
  Coffee,
  Cookie,
  Edit2,
  Gift,
  Loader2,
  Package,
  Plus,
  Shirt,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CategoryRow = RouterOutput["category"]["all"][number];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Tag,
  Package,
  ShoppingBag,
  Coffee,
  Cookie,
  Cake,
  Utensils,
  Shirt,
  Gift,
  Sparkles,
};

function CategoryIcon({ name, size = 16 }: { name: string | null; size?: number }) {
  const Icon = (name && CATEGORY_ICONS[name]) || Tag;
  return <Icon size={size} />;
}

function CategoryModal({
  category,
  onClose,
}: {
  category: CategoryRow | null;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "Tag");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  const done = () => {
    toast.success(category ? "Kategori diperbarui" : "Kategori ditambahkan");
    utils.category.all.invalidate();
    utils.category.list.invalidate();
    onClose();
  };
  const onError = (e: { message: string }) => toast.error(e.message);
  const create = trpc.category.create.useMutation({ onSuccess: done, onError });
  const update = trpc.category.update.useMutation({ onSuccess: done, onError });
  const saving = create.isPending || update.isPending;

  const save = () => {
    if (!name.trim()) return toast.error("Nama kategori wajib diisi");
    const data = { name, description: description || null, icon, isActive };
    if (category) update.mutate({ id: category.id, data });
    else create.mutate(data);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {category ? "Edit Kategori" : "Tambah Kategori Baru"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Nama Kategori *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kue Kering"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Deskripsi singkat mengenai kategori ini"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Ikon Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CATEGORY_ICONS).map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors border",
                    icon === iconName
                      ? "bg-brand-100 border-brand-400 text-brand-600"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100",
                  )}
                >
                  <CategoryIcon name={iconName} size={18} />
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-brand-600 rounded"
            />
            <span className="text-sm font-semibold text-gray-700">
              Kategori Aktif
            </span>
          </label>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoryManager({ initial }: { initial: CategoryRow[] }) {
  const utils = trpc.useUtils();
  const { data: categories = [] } = trpc.category.all.useQuery(undefined, {
    initialData: initial,
  });

  const [modal, setModal] = useState<{ open: boolean; editing: CategoryRow | null }>({
    open: false,
    editing: null,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const del = trpc.category.delete.useMutation({
    onSuccess: () => {
      toast.success("Kategori dihapus");
      utils.category.all.invalidate();
      utils.category.list.invalidate();
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-gray-900">Manajemen Kategori</h2>
          <p className="text-sm text-gray-500">{categories.length} kategori</p>
        </div>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center">
            <Tag size={40} className="mb-3 opacity-20" />
            <p className="font-medium text-gray-500">Belum ada kategori</p>
            <p className="text-xs mt-1">
              Klik &quot;Tambah Kategori&quot; untuk mulai.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100 bg-gray-50/50">
                  {["Kategori", "Slug", "Produk", "Status", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-indigo-200 rounded-xl flex items-center justify-center shrink-0 text-brand-600">
                          <CategoryIcon name={cat.icon} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm whitespace-nowrap">
                            {cat.name}
                          </div>
                          {cat.description && (
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                              {cat.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 font-mono whitespace-nowrap">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-bold whitespace-nowrap">
                      {cat._count.products}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          cat.isActive ? "badge-success" : "badge-muted",
                        )}
                      >
                        {cat.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal({ open: true, editing: cat })}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <CategoryModal
          key={modal.editing?.id ?? "new"}
          category={modal.editing}
          onClose={() => setModal({ open: false, editing: null })}
        />
      )}

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
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Hapus Kategori?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Produk dalam kategori ini tidak ikut terhapus, hanya kehilangan
              kategorinya. Tindakan ini tidak dapat dibatalkan.
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
