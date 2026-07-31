"use client";

import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Navbar({ phone }: { phone?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("common");

  const links = [
    { href: "/", label: t("home") },
    { href: "/menu", label: t("menu") },
    { href: "/reservation", label: t("reservation") },
    { href: "/reclamation", label: t("reclamation") },
    { href: "/about", label: t("about") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-dolce-secondary/60 bg-dolce-bg/90 backdrop-blur-md dark:border-white/10 dark:bg-[#1a120e]/90">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo size="sm" priority />

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-dolce-primary dark:hover:text-dolce-accent ${
                pathname === link.href
                  ? "text-dolce-primary dark:text-dolce-accent"
                  : "text-dolce-text/70 dark:text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 text-sm text-dolce-accent"
            >
              <Phone size={16} />
              {phone}
            </a>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="rounded-lg p-1 dark:text-white"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-dolce-secondary bg-dolce-bg px-4 py-4 dark:border-white/10 dark:bg-[#1a120e] md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === link.href
                    ? "bg-dolce-secondary text-dolce-primary dark:bg-white/10 dark:text-dolce-accent"
                    : "text-dolce-text/80 dark:text-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
