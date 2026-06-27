const BASE = process.env.PAKASIR_BASE_URL ?? "https://app.pakasir.com";
const PROJECT = process.env.PAKASIR_PROJECT ?? "umkm-saas";
const API_KEY = process.env.PAKASIR_API_KEY ?? "";

/** Tanpa API key → MODE MOCK (dev): logic billing teruji tanpa panggil API asli. */
export const PAKASIR_MOCK = API_KEY.length === 0;

export interface CreateResult {
  payment: {
    order_id: string;
    amount: number;
    fee: number;
    total_payment: number;
    payment_method: string;
    payment_number: string; // payload QR (di-render jadi QR code)
    expired_at: string;
  };
}

export interface DetailResult {
  transaction: {
    amount: number;
    order_id: string;
    project: string;
    status: "pending" | "completed" | "cancelled";
    payment_method: string;
    completed_at: string | null;
  };
}

export const pakasir = {
  isMock: PAKASIR_MOCK,

  /** Buat transaksi QRIS — dapat payload QR untuk ditampilkan di app. */
  async createQris(orderId: string, amount: number): Promise<CreateResult> {
    if (PAKASIR_MOCK) {
      return {
        payment: {
          order_id: orderId,
          amount,
          fee: 0,
          total_payment: amount,
          payment_method: "qris",
          // payload QR palsu (cukup untuk render QR di dev)
          payment_number: `MOCK-QRIS|${PROJECT}|${orderId}|${amount}`,
          expired_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      };
    }
    const res = await fetch(`${BASE}/api/transactioncreate/qris`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: PROJECT, order_id: orderId, amount, api_key: API_KEY }),
    });
    if (!res.ok) throw new Error("Gagal membuat transaksi Pakasir");
    return res.json();
  },

  /** Cek status transaksi (sumber kebenaran — verifikasi webhook). */
  async getDetail(orderId: string, amount: number): Promise<DetailResult> {
    if (PAKASIR_MOCK) {
      // Mock: anggap pembayaran sudah selesai (untuk menguji alur konfirmasi).
      return {
        transaction: {
          amount,
          order_id: orderId,
          project: PROJECT,
          status: "completed",
          payment_method: "qris",
          completed_at: new Date().toISOString(),
        },
      };
    }
    const url = new URL(`${BASE}/api/transactiondetail`);
    url.searchParams.set("project", PROJECT);
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("order_id", orderId);
    url.searchParams.set("api_key", API_KEY);
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error("Gagal cek status Pakasir");
    return res.json();
  },

  /** Batalkan transaksi. */
  async cancel(orderId: string, amount: number) {
    if (PAKASIR_MOCK) return { cancelled: true };
    const res = await fetch(`${BASE}/api/transactioncancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: PROJECT, order_id: orderId, amount, api_key: API_KEY }),
    });
    return res.json();
  },
};
