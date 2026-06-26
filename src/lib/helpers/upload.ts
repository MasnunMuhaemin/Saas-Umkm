import { MAX_UPLOAD_MB, ALLOWED_IMAGE_TYPES } from "@/lib/constants/config";

/** Validasi gambar sebelum upload (tipe + ukuran). Reusable di semua form upload. */
export function validateImage(file: File): { ok: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Format harus JPG, PNG, atau WebP." };
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return { ok: false, error: `Ukuran maksimal ${MAX_UPLOAD_MB}MB.` };
  }
  return { ok: true };
}
