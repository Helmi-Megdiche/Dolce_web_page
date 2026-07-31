import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col bg-dolce-bg dark:bg-[#1a120e]">
      <Navbar phone={settings.phone} />
      <main className="flex-1">{children}</main>
      <Footer
        phone={settings.phone}
        address={settings.address}
        instagram={settings.instagram_url}
        facebook={settings.facebook_url}
        tiktok={settings.tiktok_url}
      />
    </div>
  );
}
