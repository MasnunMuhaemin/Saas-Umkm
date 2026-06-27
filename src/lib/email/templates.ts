import { formatRupiah, formatDate } from "@/lib/helpers/format";

function layout(body: string) {
  return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
    <div style="font-weight:800;font-size:20px;color:#2563eb;margin-bottom:16px">MayWeb</div>
    ${body}
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">Email otomatis dari MayWeb. Mohon tidak membalas.</p>
  </div>`;
}

export function welcomeEmail(opts: { name: string; storeUrl: string }) {
  return {
    subject: "Selamat datang di MayWeb 🎉",
    html: layout(
      `<p>Halo <b>${opts.name}</b>,</p>
       <p>Toko online Anda sudah aktif! Mulai kelola produk dan bagikan toko Anda:</p>
       <p><a href="https://${opts.storeUrl}" style="color:#2563eb">${opts.storeUrl}</a></p>`,
    ),
  };
}

export function paymentSuccessEmail(opts: {
  name: string;
  planName: string;
  amount: number;
  currentEnd: Date;
}) {
  return {
    subject: "Pembayaran Berhasil — Langganan Diperpanjang",
    html: layout(
      `<p>Halo <b>${opts.name}</b>,</p>
       <p>Pembayaran langganan <b>${opts.planName}</b> sebesar <b>${formatRupiah(
         opts.amount,
       )}</b> berhasil.</p>
       <p>Langganan Anda aktif hingga <b>${formatDate(opts.currentEnd)}</b>. Terima kasih!</p>`,
    ),
  };
}

export function subscriptionReminderEmail(opts: {
  name: string;
  planName: string;
  amount: number;
  currentEnd: Date;
}) {
  return {
    subject: "Pengingat: Langganan akan jatuh tempo",
    html: layout(
      `<p>Halo <b>${opts.name}</b>,</p>
       <p>Langganan <b>${opts.planName}</b> Anda akan jatuh tempo pada <b>${formatDate(
         opts.currentEnd,
       )}</b>.</p>
       <p>Bayar <b>${formatRupiah(opts.amount)}</b> lewat menu <b>Langganan</b> di dashboard agar toko tetap aktif.</p>`,
    ),
  };
}

export function pastDueEmail(opts: { name: string; graceUntil: Date }) {
  return {
    subject: "Langganan jatuh tempo — segera bayar",
    html: layout(
      `<p>Halo <b>${opts.name}</b>,</p>
       <p>Langganan Anda telah lewat jatuh tempo. Toko masih aktif dalam masa tenggang hingga <b>${formatDate(
         opts.graceUntil,
       )}</b>.</p>
       <p>Segera bayar agar toko tidak dinonaktifkan.</p>`,
    ),
  };
}

export function suspendedEmail(opts: { name: string }) {
  return {
    subject: "Toko Anda dinonaktifkan sementara",
    html: layout(
      `<p>Halo <b>${opts.name}</b>,</p>
       <p>Toko Anda dinonaktifkan karena langganan kedaluwarsa. Lakukan pembayaran di menu <b>Langganan</b> untuk mengaktifkannya kembali.</p>`,
    ),
  };
}

export function passwordResetEmail(opts: { name: string; link: string }) {
  return {
    subject: "Reset Password MayWeb",
    html: layout(
      `<p>Halo <b>${opts.name}</b>,</p>
       <p>Klik tombol di bawah untuk mengatur ulang password (berlaku 1 jam):</p>
       <p><a href="${opts.link}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;display:inline-block">Reset Password</a></p>
       <p style="color:#6b7280;font-size:13px">Abaikan email ini jika Anda tidak meminta reset.</p>`,
    ),
  };
}
