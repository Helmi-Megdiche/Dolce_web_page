"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing, type Locale } from "@/i18n/routing";

function LanguageSwitcherButton({
  label,
  locale,
  open,
  onToggle,
}: {
  label: string;
  locale: string;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={open}
      aria-haspopup="listbox"
      className="inline-flex items-center gap-1 rounded-full border border-dolce-secondary bg-white px-3 py-1.5 text-xs font-semibold text-dolce-text transition hover:border-dolce-accent dark:border-white/30 dark:bg-[#2a1f18] dark:text-white dark:hover:border-dolce-accent"
    >
      {locale.toUpperCase()}
      <ChevronDown
        size={12}
        className={`transition ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function LanguageSwitcherInner() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function selectLocale(next: Locale) {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: next });
    setOpen(false);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative inline-block text-sm">
      <LanguageSwitcherButton
        label={t("language")}
        locale={locale}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-full overflow-hidden rounded-xl border border-dolce-secondary bg-white py-1 shadow-lg dark:border-white/20 dark:bg-[#2a1f18]"
        >
          {routing.locales.map((loc) => {
            const active = loc === locale;
            return (
              <li key={loc} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => selectLocale(loc)}
                  className={`block w-full px-3 py-1.5 text-left text-xs font-semibold transition ${
                    active
                      ? "bg-dolce-secondary text-dolce-text dark:bg-dolce-primary dark:text-white"
                      : "text-dolce-text hover:bg-dolce-secondary/70 dark:text-white dark:hover:bg-white/10"
                  }`}
                >
                  {loc.toUpperCase()}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <Suspense
      fallback={
        <LanguageSwitcherButton label={t("language")} locale={locale} />
      }
    >
      <LanguageSwitcherInner />
    </Suspense>
  );
}
