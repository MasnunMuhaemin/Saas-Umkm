import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(1, "Nama toko wajib diisi").max(255),
  slug: z
    .string()
    .min(2, "Subdomain minimal 2 karakter")
    .max(63)
    .regex(/^[a-z0-9-]+$/, "Subdomain hanya huruf kecil, angka, dan strip"),
  ownerName: z.string().min(1, "Nama pemilik wajib diisi").max(255),
  ownerEmail: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  planSlug: z.enum(["basic", "plus"]),
});
export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const planUpdateSchema = z.object({
  price: z.number().int().min(0),
  maxProducts: z.number().int().min(0).nullable(),
  hasSeo: z.boolean(),
  hasPos: z.boolean(),
  hasInvoice: z.boolean(),
  hasCustomerDb: z.boolean(),
  isActive: z.boolean(),
});
export type PlanUpdateInput = z.infer<typeof planUpdateSchema>;
