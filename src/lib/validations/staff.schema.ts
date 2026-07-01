import { z } from "zod";

export const addStaffSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
export type AddStaffInput = z.infer<typeof addStaffSchema>;
