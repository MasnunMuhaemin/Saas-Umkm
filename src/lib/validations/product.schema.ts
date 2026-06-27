import { z } from "zod";

export const productStatusEnum = z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]);

/** Pengganti Form Request — validasi create/update produk. */
export const storeProductSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(255),
  categoryId: z.string().nullable().optional(),
  sku: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().int().min(0, "Harga tidak boleh negatif"),
  originalPrice: z.number().int().min(0).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  weight: z.number().int().min(0).nullable().optional(),
  mainImage: z.string().max(500).nullable().optional(),
  images: z.array(z.string().max(500)).max(8).optional(),
  status: productStatusEnum.default("ACTIVE"),
  metaTitle: z.string().max(255).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});
export type StoreProductInput = z.infer<typeof storeProductSchema>;

/** Satu baris import CSV produk. Nilai CSV string → coerce ke number. */
export const importProductRowSchema = z.object({
  name: z.string().min(1),
  sku: z.string().nullable().optional(),
  price: z.coerce.number().int().min(0).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  description: z.string().nullable().optional(),
});

export const bulkImportSchema = z.object({
  rows: z.array(importProductRowSchema).min(1).max(500),
});

/** Filter daftar produk (search + kategori + status + paginasi). */
export const listProductSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().min(1).default(1),
});
export type ListProductInput = z.infer<typeof listProductSchema>;
