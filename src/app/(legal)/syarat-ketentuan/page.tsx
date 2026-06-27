import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — MayWeb",
  description: "Syarat dan ketentuan penggunaan platform MayWeb.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Syarat &amp; Ketentuan</h1>
      <p className="text-slate-400">Terakhir diperbarui: 27 Juni 2026</p>

      <p>
        Dengan mendaftar dan menggunakan MayWeb (&quot;Layanan&quot;), Anda
        (&quot;Merchant&quot;) setuju terhadap syarat dan ketentuan berikut.
        Harap dibaca dengan saksama.
      </p>

      <h2>1. Tentang Layanan</h2>
      <p>
        MayWeb adalah platform pembuatan toko online untuk UMKM Indonesia. Setiap
        Merchant memperoleh halaman toko publik beralamat subdomain (mis.{" "}
        <span className="font-mono">namatoko.tokopintar.id</span>). Seluruh
        transaksi dengan pelanggan dilakukan langsung melalui WhatsApp Merchant —
        MayWeb tidak memproses pembayaran pelanggan dan bukan pihak dalam jual
        beli antara Merchant dan pelanggannya.
      </p>

      <h2>2. Akun &amp; Keamanan</h2>
      <ul>
        <li>Merchant bertanggung jawab menjaga kerahasiaan kata sandi akun.</li>
        <li>
          Semua aktivitas yang terjadi pada akun menjadi tanggung jawab Merchant.
        </li>
        <li>Satu akun ditujukan untuk satu badan usaha/toko.</li>
      </ul>

      <h2>3. Langganan &amp; Pembayaran</h2>
      <ul>
        <li>
          Fitur tertentu (POS, invoice, basis data pelanggan, kuota produk)
          tersedia sesuai paket langganan yang dipilih.
        </li>
        <li>
          Pembayaran langganan diproses melalui penyedia pembayaran pihak ketiga.
          Langganan diperpanjang otomatis kecuali dibatalkan sebelum jatuh tempo.
        </li>
        <li>
          Keterlambatan pembayaran dapat menyebabkan penonaktifan sementara toko
          setelah masa tenggang berakhir.
        </li>
      </ul>

      <h2>4. Konten Merchant</h2>
      <p>
        Merchant bertanggung jawab penuh atas konten yang diunggah (produk, foto,
        deskripsi). Dilarang mengunggah konten yang melanggar hukum, menyesatkan,
        atau melanggar hak pihak lain. MayWeb berhak menonaktifkan toko yang
        melanggar.
      </p>

      <h2>5. Pembatasan</h2>
      <p>
        Layanan disediakan &quot;sebagaimana adanya&quot;. MayWeb berupaya menjaga
        ketersediaan layanan namun tidak menjamin bebas gangguan. MayWeb tidak
        bertanggung jawab atas kerugian akibat sengketa Merchant dengan
        pelanggannya.
      </p>

      <h2>6. Perubahan</h2>
      <p>
        Syarat ini dapat diperbarui sewaktu-waktu. Perubahan material akan
        diberitahukan melalui email atau dashboard.
      </p>

      <h2>7. Kontak</h2>
      <p>
        Pertanyaan terkait syarat ini dapat dikirim ke{" "}
        <a href="mailto:support@tokopintar.id">support@tokopintar.id</a>.
      </p>
    </>
  );
}
