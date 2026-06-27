import { z } from "zod";

/** Validasi create/update kategori. Slug di-generate otomatis di service. */
export const storeCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(255),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});
export type StoreCategoryInput = z.infer<typeof storeCategorySchema>;
