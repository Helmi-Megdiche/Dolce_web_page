import DashboardClient from "@/components/admin/DashboardClient";
import { isTabId, type TabId } from "@/lib/adminTabs";
import { getAdminFromCookies } from "@/lib/auth";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }> | { tab?: string };
}) {
  const admin = getAdminFromCookies();
  const params = await Promise.resolve(searchParams ?? {});
  const initialTab: TabId = isTabId(params.tab) ? params.tab : "menu";

  return (
    <DashboardClient
      adminEmail={admin?.email || ""}
      initialTab={initialTab}
    />
  );
}
