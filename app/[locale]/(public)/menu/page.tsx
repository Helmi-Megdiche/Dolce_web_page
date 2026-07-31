"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="section-title">{t("title")}</h1>
        <p className="mt-3 text-dolce-text/70 dark:text-white/60">{t("subtitle")}</p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {availableCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active === cat
                ? "bg-dolce-primary text-white"
                : "bg-dolce-secondary text-dolce-text hover:bg-dolce-accent/40 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            }`}
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </div>

      {loading && (
        <p className="py-20 text-center text-dolce-text/60">{tc("loading")}</p>
      )}
      {error && <p className="py-20 text-center text-red-600">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="py-20 text-center text-dolce-text/60">{t("empty")}</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <article
            key={item._id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-dolce-secondary/50 transition hover:shadow-md dark:bg-[#241912] dark:ring-white/10"
          >
            <div className="relative aspect-[4/3] bg-dolce-secondary dark:bg-[#2e2018]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center font-playfair text-2xl text-dolce-primary/40">
                  Dolce
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-dolce-primary">
                {categoryLabel(item.category)}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-playfair text-xl font-semibold dark:text-dolce-secondary">
                  {item.name}
                </h2>
                <span className="shrink-0 font-semibold text-dolce-primary dark:text-dolce-accent">
                  {item.price} DT
                </span>
              </div>
              {item.description && (
                <p className="mt-2 text-sm text-dolce-text/65 dark:text-white/55">
                  {item.description}
                </p>
              )}
              <span className="mt-3 inline-block text-xs font-medium text-green-700 dark:text-green-400">
                ● {t("available")}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
