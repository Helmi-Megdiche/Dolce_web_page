import DashboardClient from "@/components/admin/DashboardClient";
import { getAdminFromCookies } from "@/lib/auth";

export default function DashboardPage() {
  const admin = getAdminFromCookies();

  return <DashboardClient adminEmail={admin?.email || ""} />;
}
