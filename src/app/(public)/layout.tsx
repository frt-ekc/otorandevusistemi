import WhatsAppFab from "@/components/WhatsAppFab";

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="text-white">
      {children}
      <WhatsAppFab />
    </div>
  );
}
