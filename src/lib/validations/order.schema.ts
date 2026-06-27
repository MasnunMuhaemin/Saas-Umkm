import { z } from "zod";

/** Input transaksi POS (kasir internal merchant). Harga dihitung ulang di server. */
export const posOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Keranjang masih kosong"),
  customerId: z.string().nullable().optional(),
  paymentMethod: z.enum(["cash", "transfer", "ewallet"]).default("cash"),
  discount: z.number().int().min(0).default(0),
});
export type PosOrderInput = z.infer<typeof posOrderSchema>;
