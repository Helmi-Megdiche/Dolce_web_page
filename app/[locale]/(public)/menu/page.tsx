"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
}

const CATEGORIES = ["All", "Crêpe", "Pancakes", "Bubble", "Boxes", "Drinks"];

export default function MenuPage() {
  const t = useTranslations("menuPage");
  const tc = useTranslations("common");
  const ta = useTranslations("admin");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");
  const [error, setError] = useState("");

  function categoryLabel(category: string) {
    if (category === "All") return tc("all");
    try {
      return ta(`categories.${category}` as "categories.Drinks");
    } catch {
      return category;
    }
  }

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(
            data.filter(
              (item: MenuItem) =>
                !`${item.name} ${item.description}`
                  .toLowerCase()
                  .includes("cake")
            )
          );
        } else {
          setError(t("loadError"));
        }
      })
      .catch(() => setError(t("loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  const filtered = useMemo(() => {
    if (active === "All") return items;
    return items.filter((i) => i.category === active);
  }, [items, active]);

  const availableCategories = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    return CATEGORIES.filter((c) => c === "All" || present.has(c));
  }, [items]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-dolce-brand/15 blur-3xl dark:bg-dolce-brand/10" />
      <div className="pointer-events-none absolute -left-20 top-56 h-64 w-64 rounded-full bg-dolce-accent/20 blur-3xl dark:bg-dolce-accent/10" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 text-center md:mb-10">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-dolce-accent/40 bg-white/70 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-dolce-primary backdrop-blur-sm dark:border-dolce-accent/25 dark:bg-white/5 dark:text-dolce-accent">
            <UtensilsCrossed size={13} className="shrink-0" />
            {t("eyebrow")}
          </p>
          <h1 className="section-title mt-4">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-dolce-text/65 dark:text-white/55 md:text-base">
            {t("subtitle")}
          </p>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-dolce-accent to-transparent" />
        </div>

        {/* Category filter */}
        <div className="sticky top-[72px] z-20 -mx-4 mb-8 border-b border-dolce-secondary/40 bg-dolce-bg/85 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-[#1a120e]/85">
          <div className="flex items-center justify-between gap-3">
            <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {availableCategories.map((cat) => {
                const selected = active === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActive(cat)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "bg-dolce-primary text-white shadow-sm shadow-dolce-primary/30 dark:bg-dolce-accent dark:text-dolce-text"
                        : "bg-white text-dolce-text ring-1 ring-dolce-secondary/70 hover:ring-dolce-accent/60 dark:bg-[#241912] dark:text-[#f5e6d3] dark:ring-white/10 dark:hover:ring-dolce-accent/40"
                    }`}
                  >
                    {categoryLabel(cat)}
                  </button>
                );
              })}
            </div>
            {!loading && !error && (
              <p className="hidden shrink-0 text-xs font-medium text-dolce-text/45 dark:text-white/40 sm:block">
                {t("itemsCount", { count: filtered.length })}
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-white ring-1 ring-dolce-secondary/40 dark:bg-[#241912] dark:ring-white/10"
              >
                <div className="aspect-[4/3] animate-pulse bg-dolce-secondary/70 dark:bg-[#2e2018]" />
                <div className="space-y-2 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-dolce-secondary/70 dark:bg-white/10" />
                  <div className="h-3 w-full animate-pulse rounded bg-dolce-secondary/50 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="rounded-2xl border border-red-300/50 bg-red-50 px-4 py-8 text-center text-sm text-red-800 dark:border-red-500/30 dark:bg-red-900/25 dark:text-red-200">
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="rounded-2xl bg-white/70 px-4 py-16 text-center text-dolce-text/60 ring-1 ring-dolce-secondary/50 dark:bg-[#241912]/70 dark:text-white/50 dark:ring-white/10">
            {t("empty")}
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => (
              <article
                key={item._id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-dolce-secondary/50 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dolce-primary/10 hover:ring-dolce-accent/50 dark:bg-[#241912] dark:ring-white/10 dark:hover:ring-dolce-accent/30"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-dolce-secondary dark:bg-[#2e2018]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      priority={index < 3}
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-dolce-secondary via-[#f6dcc2] to-dolce-accent/50 font-playfair text-2xl text-dolce-primary/40 dark:from-[#2e2018] dark:via-[#33241a] dark:to-[#3d2b1e] dark:text-dolce-accent/40">
                      Dolce
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-dolce-primary shadow-sm backdrop-blur-sm dark:bg-[#241912]/90 dark:text-dolce-accent">
                    {categoryLabel(item.category)}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-dolce-primary px-3 py-1 text-sm font-bold text-white shadow-lg dark:bg-dolce-accent dark:text-dolce-text">
                    {item.price} DT
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-playfair text-xl font-semibold leading-snug text-dolce-text dark:text-[#f5e6d3]">
                    {item.name}
                  </h2>
                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-dolce-text/65 dark:text-white/55">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {t("available")}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-dolce-primary to-[#6f4a2f] p-6 text-white shadow-lg md:flex md:items-center md:justify-between md:gap-6 md:p-8">
            <div>
              <p className="font-playfair text-2xl font-semibold md:text-3xl">
                {t("bookTableHint")}
              </p>
            </div>
            <Link
              href="/reservation"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-dolce-primary transition hover:bg-dolce-secondary md:mt-0"
            >
              {t("bookTable")}
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
