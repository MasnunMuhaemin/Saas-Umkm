import { formatPhone } from "./format";

/** Bangun link wa.me dengan pesan pre-filled — dipakai di card produk & detail. */
export function buildWaLink(phone: string, message: string): string {
  return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(message)}`;
}
