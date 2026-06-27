import { z } from "zod";

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  message: z.string().min(1, "Pesan wajib diisi"),
  type: z.enum(["info", "warning", "success", "error"]).default("info"),
});
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
