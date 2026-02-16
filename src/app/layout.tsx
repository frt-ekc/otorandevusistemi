import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://otorandevusistemi-y2uz.vercel.app"),
  title: "Fırat Oto Lastik | Online Randevu ve Yönetim Sistemi",
  description: "Otomotiv servisleri için geliştirilmiş, gerçek zamanlı randevu kontrolü ve stok yönetimini barındıran premium web çözümü.",
  openGraph: {
    title: "Fırat Oto Lastik - Dijital Servis Deneyimi",
    description: "Modern arayüz, anlık randevu takibi ve akıllı stok yönetimi ile geliştirilmiş otomotiv yönetim platformu.",
    images: [{ url: "/otolastik.png", width: 1200, height: 630, alt: "Fırat Oto Lastik Paylaşım Görseli" }],
    type: "website",
    locale: "tr_TR",
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} relative min-h-screen text-white antialiased`}>
        <div className="fixed inset-0 -z-10 bg-[#0f172a]">
          <Image
            src="/otolastik.png"
            alt="Fırat Oto Lastik Background"
            fill
            priority
            className="object-cover opacity-60"
          />
        </div>
        {children}
      </body>
    </html>
  );
}
