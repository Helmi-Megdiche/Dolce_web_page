import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = getAdminFromCookies();
  if (!admin) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
