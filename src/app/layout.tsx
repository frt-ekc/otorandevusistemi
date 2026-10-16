import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/manrope";
import "./globals.css";

// Fontlar npm paketinden siteyle birlikte sunulur (Google'a ayrı istek yok).
// Başlıklar: geniş Archivo (otomotiv tabelası hissi). Metin: Manrope.

export const metadata: Metadata = {
  title: "Fırat Oto Lastik | Malatya Lastik Değişimi ve Randevu",
  description:
    "Anlaşmalı sendika üyelerine özel fiyatlarla lastik değişimi, balans ve lastik tamiri. Online randevu alın.",
  icons: {
    icon: "/favicon.ico"
  }
};

export const viewport: Viewport = {
  themeColor: "#141312"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="relative min-h-screen bg-brand-dark font-sans text-brand-text antialiased">
        {children}
      </body>
    </html>
  );
}
