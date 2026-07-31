"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  UtensilsCrossed,
  Tag,
  Clock,
  CalendarDays,
  MessageSquareWarning,
  Settings,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { tabIds, type TabId } from "@/lib/adminTabs";
import MenuTab from "./MenuTab";
import OffersTab from "./OffersTab";
import HoursTab from "./HoursTab";
import ReservationsTab from "./ReservationsTab";
import ReclamationsTab from "./ReclamationsTab";
import SettingsTab from "./SettingsTab";
import ProfileTab from "./ProfileTab";

const icons = {
  menu: UtensilsCrossed,
  offers: Tag,
  hours: Clock,
  reservations: CalendarDays,
  reclamations: MessageSquareWarning,
  settings: Settings,
  profile: User,
};

export default function DashboardClient({
  adminEmail,
  initialTab = "menu",
}: {
  adminEmail: string;
  initialTab?: TabId;
}) {
  const [active, setActive] = useState<TabId>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("admin");

  // Keep tab in sync after locale/searchParam navigations (and browser back/forward)
  useEffect(() => {
    setActive(initialTab);
  }, [initialTab]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function selectTab(id: TabId) {
    setActive(id);
    setSidebarOpen(false);
    const href = id === "menu" ? pathname : `${pathname}?tab=${id}`;
    router.replace(href, { scroll: false });
  }

  return (
    <div className="flex min-h-screen bg-dolce-bg dark:bg-[#1a120e]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-dolce-text text-white transition-transform dark:bg-[#120c09] lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Logo size="sm" href="/" />
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {tabIds.map((id) => {
            const Icon = icons[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectTab(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active === id
                    ? "bg-dolce-primary text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {t(id)}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            {t("logout")}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col text-dolce-text dark:text-[#f5e6d3]">
        <header className="flex items-center gap-3 border-b border-dolce-secondary bg-white px-4 py-4 dark:border-white/10 dark:bg-[#241912]">
          <button
            type="button"
            className="rounded-lg p-1 lg:hidden dark:hover:bg-white/10"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("openMenu")}
          >
            <MenuIcon size={22} />
          </button>
          <h1 className="font-playfair text-xl font-semibold text-dolce-text dark:text-[#f5e6d3]">
            {t(active)}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden text-sm text-dolce-text/60 dark:text-white/55 sm:inline">
              {adminEmail}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {active === "menu" && <MenuTab />}
          {active === "offers" && <OffersTab />}
          {active === "hours" && <HoursTab />}
          {active === "reservations" && <ReservationsTab />}
          {active === "reclamations" && <ReclamationsTab />}
          {active === "settings" && <SettingsTab />}
          {active === "profile" && <ProfileTab email={adminEmail} />}
        </div>
      </div>
    </div>
  );
}
