import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fırat Oto Lastik | OtoRandevu",
  description: "Fırat Oto Lastik randevu ve stok sorgulama sistemi.",
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
