import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — MayWeb",
  description: "Bagaimana MayWeb mengumpulkan dan menggunakan data.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Kebijakan Privasi</h1>
      <p className="text-gray-400">Terakhir diperbarui: 27 Juni 2026</p>

      <p>
        Kebijakan ini menjelaskan data yang dikumpulkan MayWeb
        (&quot;Layanan&quot;) dan cara penggunaannya.
      </p>

      <h2>1. Data yang Dikumpulkan</h2>
      <ul>
        <li>
          <b>Data akun Merchant:</b> nama, email, nomor telepon/WhatsApp, serta
          informasi toko yang Anda isi.
        </li>
        <li>
          <b>Data transaksi langganan:</b> riwayat pembayaran langganan ke
          platform (bukan transaksi jual beli dengan pelanggan).
        </li>
        <li>
          <b>Data analitik kunjungan:</b> kami mencatat kunjungan halaman toko
          secara anonim (halaman yang dibuka, perujuk, dan pengidentifikasi
          anonim berbasis hash) untuk menampilkan statistik. Kami{" "}
          <b>tidak menyimpan alamat IP mentah</b> maupun identitas pribadi
          pengunjung.
        </li>
      </ul>

      <h2>2. Penggunaan Data</h2>
      <ul>
        <li>Menyediakan dan mengoperasikan toko online Merchant.</li>
        <li>Menampilkan statistik kunjungan dan penjualan.</li>
        <li>Mengirim notifikasi penting (tagihan, pengingat, keamanan).</li>
      </ul>

      <h2>3. Berbagi Data</h2>
      <p>
        Kami tidak menjual data Anda. Data hanya dibagikan kepada penyedia
        layanan yang kami gunakan untuk menjalankan platform (mis. pemroses
        pembayaran langganan dan pengirim email) sebatas yang diperlukan.
      </p>

      <h2>4. Penyimpanan &amp; Keamanan</h2>
      <p>
        Kata sandi disimpan dalam bentuk ter-hash. Kami menerapkan langkah teknis
        wajar untuk melindungi data. Data disimpan selama akun aktif dan untuk
        kebutuhan hukum yang berlaku.
      </p>

      <h2>5. Hak Anda</h2>
      <p>
        Anda dapat meminta akses, perbaikan, atau penghapusan data akun dengan
        menghubungi kami. Penghapusan akun akan menghapus data toko terkait.
      </p>

      <h2>6. Kontak</h2>
      <p>
        Permintaan terkait privasi dapat dikirim ke{" "}
        <a href="mailto:privacy@tokopintar.id">privacy@tokopintar.id</a>.
      </p>
    </>
  );
}
