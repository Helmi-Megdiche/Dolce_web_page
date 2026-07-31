import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getAdminFromCookies } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = getAdminFromCookies();
  if (!admin) {
    const locale = await getLocale();
    redirect(`/${locale}/admin/login`);
  }

  return <>{children}</>;
}
