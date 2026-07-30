"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UtensilsCrossed,
  Clock,
  CalendarDays,
  Settings,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import MenuTab from "./MenuTab";
import HoursTab from "./HoursTab";
import ReservationsTab from "./ReservationsTab";
import SettingsTab from "./SettingsTab";
import ProfileTab from "./ProfileTab";

const tabs = [
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "hours", label: "Hours", icon: Clock },
  { id: "reservations", label: "Reservations", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "profile", label: "Profile", icon: User },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function DashboardClient({ adminEmail }: { adminEmail: string }) {
  const [active, setActive] = useState<TabId>("menu");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function selectTab(id: TabId) {
    setActive(id);
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-dolce-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-dolce-text text-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Link href="/" className="font-playfair text-2xl font-bold">
            Dolce
          </Link>
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {tabs.map(({ id, label, icon: Icon }) => (
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
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-dolce-secondary bg-white px-4 py-4">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon size={22} />
          </button>
          <h1 className="font-playfair text-xl font-semibold capitalize">
            {active}
          </h1>
          <span className="ml-auto text-sm text-dolce-text/50">{adminEmail}</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {active === "menu" && <MenuTab />}
          {active === "hours" && <HoursTab />}
          {active === "reservations" && <ReservationsTab />}
          {active === "settings" && <SettingsTab />}
          {active === "profile" && <ProfileTab email={adminEmail} />}
        </div>
      </div>
    </div>
  );
}
