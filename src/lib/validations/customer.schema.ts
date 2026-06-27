import { z } from "zod";

export const storeCustomerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan wajib diisi").max(255),
  email: z.string().max(255).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  province: z.string().max(100).nullable().optional(),
  postalCode: z.string().max(10).nullable().optional(),
});
export type StoreCustomerInput = z.infer<typeof storeCustomerSchema>;
