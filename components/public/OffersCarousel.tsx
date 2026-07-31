"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, Gift, Sparkles, Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export interface Offer {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  discountLabel?: string;
  startDate: string;
  endDate: string;
  isHighlighted?: boolean;
  buttonText?: string;
}

function reservationHref(offerId: string) {
  return {
    pathname: "/reservation" as const,
    query: { offer: offerId },
  };
}

type Countdown = { text: string; urgent: boolean } | null;

function useCountdown(endDate: string): Countdown {
  const t = useTranslations("offers");
  return useMemo(() => {
    const end = new Date(endDate).getTime();
    if (Number.isNaN(end)) return null;
    const diff = end - Date.now();
    if (diff <= 0) return null;
    const days = Math.ceil(diff / 86_400_000);
    if (days <= 1) return { text: t("endsToday"), urgent: true };
    if (days === 2) return { text: t("endsTomorrow"), urgent: true };
    return { text: t("endsInDays", { days }), urgent: days <= 4 };
  }, [endDate, t]);
}

function MonogramFallback({ large = false }: { large?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dolce-secondary via-[#f6dcc2] to-dolce-accent/60 dark:from-[#2e2018] dark:via-[#33241a] dark:to-[#3d2b1e]">
      <span
        className={`font-playfair font-semibold text-dolce-primary/35 dark:text-dolce-accent/40 ${
          large ? "text-5xl" : "text-3xl"
        }`}
      >
        Dolce
      </span>
    </div>
  );
}

function DiscountBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-dolce-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-dolce-brand/30">
      <Tag size={12} className="shrink-0" />
      {label}
    </span>
  );
}

function HighlightedOffer({
  offer,
  locale,
  expiresLabel,
  viewLabel,
  featuredLabel,
}: {
  offer: Offer;
  locale: string;
  expiresLabel: string;
  viewLabel: string;
  featuredLabel: string;
}) {
  const countdown = useCountdown(offer.endDate);
  const cta = offer.buttonText?.trim() || viewLabel;

  const endLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }).format(new Date(offer.endDate));
    } catch {
      return offer.endDate;
    }
  }, [offer.endDate, locale]);

  return (
    <div className="group relative h-full sm:col-span-2">
      {/* soft glow behind featured card */}
      <div className="pointer-events-none absolute -inset-1 rounded-[30px] bg-gradient-to-br from-dolce-accent/50 via-dolce-brand/30 to-dolce-primary/40 opacity-80 blur-sm dark:from-dolce-accent/30 dark:via-dolce-brand/20 dark:to-dolce-primary/30" />

      <Link
        href={reservationHref(offer._id)}
        className="relative flex h-full flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_20px_50px_-20px_rgba(139,94,60,0.45)] ring-1 ring-dolce-accent/40 transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-18px_rgba(139,94,60,0.55)] dark:bg-[#241912] dark:ring-dolce-accent/35 md:flex-row"
      >
        <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:w-[52%] md:min-h-[280px]">
          {offer.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offer.imageUrl}
              alt={offer.title}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <MonogramFallback large />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#241912]/40" />

          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-dolce-accent px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-dolce-text shadow-lg">
              <Sparkles size={13} className="shrink-0" />
              {featuredLabel}
            </span>
            {offer.discountLabel && (
              <DiscountBadge label={offer.discountLabel} />
            )}
          </div>

          {countdown && (
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <Clock size={12} className="shrink-0" />
                {countdown.text}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center p-5 md:p-8">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-dolce-primary dark:text-dolce-accent">
            Dolce
          </p>
          <h3 className="font-playfair text-3xl font-semibold leading-tight text-dolce-text dark:text-[#f5e6d3] md:text-4xl">
            {offer.title}
          </h3>
          {offer.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-dolce-text/70 dark:text-white/60 md:text-base">
              {offer.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {countdown && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  countdown.urgent
                    ? "bg-dolce-brand/15 text-[#c45f4c] dark:bg-dolce-brand/20 dark:text-dolce-brand"
                    : "bg-dolce-accent/20 text-dolce-primary dark:bg-dolce-accent/20 dark:text-dolce-accent"
                }`}
              >
                <Clock size={12} />
                {countdown.text}
              </span>
            )}
            <span className="text-xs text-dolce-text/45 dark:text-white/40">
              {expiresLabel}: {endLabel}
            </span>
          </div>

          <span className="btn-primary mt-7 w-fit text-sm">
            {cta}
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </div>
  );
}

function OfferCard({
  offer,
  locale,
  expiresLabel,
  viewLabel,
}: {
  offer: Offer;
  locale: string;
  expiresLabel: string;
  viewLabel: string;
}) {
  const countdown = useCountdown(offer.endDate);
  const cta = offer.buttonText?.trim() || viewLabel;

  const endLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }).format(new Date(offer.endDate));
    } catch {
      return offer.endDate;
    }
  }, [offer.endDate, locale]);

  return (
    <Link
      href={reservationHref(offer._id)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-dolce-secondary/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dolce-primary/10 hover:ring-dolce-accent/50 dark:bg-[#241912] dark:ring-white/10 dark:hover:ring-dolce-accent/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <MonogramFallback />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {offer.discountLabel && (
          <div className="absolute left-3 top-3">
            <DiscountBadge label={offer.discountLabel} />
          </div>
        )}

        {countdown && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Clock size={11} className="shrink-0" />
              {countdown.text}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-playfair text-xl font-semibold leading-snug text-dolce-text dark:text-[#f5e6d3]">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-dolce-text/65 dark:text-white/55">
            {offer.description}
          </p>
        )}

        <div className="mt-auto border-t border-dolce-secondary/60 pt-3 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-dolce-text/45 dark:text-white/40">
              <Clock size={11} className="shrink-0" />
              {expiresLabel}: {endLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-dolce-primary dark:text-dolce-accent">
              {cta}
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function OffersCarousel() {
  const t = useTranslations("offers");
  const locale = useLocale();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOffers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || offers.length === 0) return null;

  const highlighted = offers.filter((o) => o.isHighlighted);
  const regular = offers.filter((o) => !o.isHighlighted);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-dolce-bg via-dolce-secondary/25 to-dolce-bg py-16 dark:from-[#1a120e] dark:via-[#1f1611] dark:to-[#1a120e] md:py-20">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-dolce-brand/15 blur-3xl dark:bg-dolce-brand/10" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-dolce-accent/20 blur-3xl dark:bg-dolce-accent/10" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-dolce-accent/40 bg-white/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-dolce-primary backdrop-blur-sm dark:border-dolce-accent/25 dark:bg-white/5 dark:text-dolce-accent">
            <Gift size={13} className="shrink-0" />
            {t("eyebrow")}
          </p>
          <h2 className="section-title mt-4">{t("title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-dolce-text/65 dark:text-white/55 md:text-base">
            {t("subtitle")}
          </p>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-dolce-accent to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlighted.map((offer) => (
            <HighlightedOffer
              key={offer._id}
              offer={offer}
              locale={locale}
              expiresLabel={t("expires")}
              viewLabel={t("viewOffer")}
              featuredLabel={t("featured")}
            />
          ))}

          {regular.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              locale={locale}
              expiresLabel={t("expires")}
              viewLabel={t("viewOffer")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
