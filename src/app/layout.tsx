import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className={`${inter.className} text-white`}>
        {children}
      </body>
    </html>
  );
}
