import { z } from "zod";

/** Validasi varian produk (mis. "Merah / XL"). */
export const storeVariantSchema = z.object({
  name: z.string().min(1, "Nama varian wajib diisi").max(255),
  sku: z.string().max(100).nullable().optional(),
  price: z.number().int().min(0, "Harga tidak boleh negatif"),
  stock: z.number().int().min(0).default(0),
});
export type StoreVariantInput = z.infer<typeof storeVariantSchema>;
