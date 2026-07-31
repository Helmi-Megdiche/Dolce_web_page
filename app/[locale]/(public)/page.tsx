import { getTranslations } from "next-intl/server";
import { Star, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const t = await getTranslations("home");

  return (
    <section className="relative min-h-[calc(100vh-73px)] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519676867240-f03562e64548?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2D1B12]/90 via-[#2D1B12]/70 to-[#2D1B12]/40" />

      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col justify-center px-4 py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-dolce-accent">
          {t("location")}
        </p>
        <h1 className="font-playfair text-5xl font-bold leading-tight text-white md:text-7xl">
          {settings.hero_title || "Dolce"}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/85 md:text-xl">
          {settings.hero_subtitle ||
            "Exploring the sweet side of life with Dolce"}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            <Star size={14} className="fill-dolce-accent text-dolce-accent" />
            {settings.rating || "4.6"}★ {t("googleRating")}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {settings.price_range || "10-20 DT"}
          </span>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/menu"
            className="btn-primary bg-dolce-accent text-dolce-text hover:bg-[#c4925f]"
          >
            {t("viewMenu")}
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/reservation"
            className="btn-secondary border-white text-white hover:bg-white/10"
          >
            {t("bookTable")}
          </Link>
        </div>
      </div>
    </section>
  );
}
