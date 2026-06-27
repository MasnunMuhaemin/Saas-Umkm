import type { Metadata } from "next";
import { Inter, Poppins, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MayWeb — Toko Online Profesional untuk UMKM Indonesia",
    template: "%s | MayWeb",
  },
  description:
    "Buat website toko online profesional tanpa coding. Kelola produk, kasir (POS), invoice, dan website dalam hitungan menit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TRPCProvider>{children}</TRPCProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
