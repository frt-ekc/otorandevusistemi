import WhatsAppFab from "@/components/WhatsAppFab";
import MobileActionBar from "@/components/site/MobileActionBar";

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Telefonda alttaki sabit eylem çubuğu içeriği kapatmasın diye alt boşluk
    <div className="pb-24 text-brand-text sm:pb-0">
      {children}
      <WhatsAppFab />
      <MobileActionBar />
    </div>
  );
}
