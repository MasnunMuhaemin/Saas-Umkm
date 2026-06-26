/** Format angka jadi Rupiah: 65000 → "Rp 65.000". */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/** Format tanggal: → "26 Jun 2026". */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Normalisasi nomor HP Indonesia: "08123" → "628123". */
export function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  return p;
}
