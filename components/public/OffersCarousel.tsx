"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
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
  buttonLink?: string;
}

function OfferAction({
  href,
  label,
  className,
}: {
  href?: string;
  label: string;
  className: string;
}) {
  if (!href) {
    return <span className={className}>{label}</span>;
  }

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <ArrowRight size={16} />
      </a>
    );
  }

  return (
    // Dynamic admin-provided paths (e.g. /menu, /reservation)
    <Link href={href as "/"} className={className}>
      {label}
      <ArrowRight size={16} />
    </Link>
  );
}

function OfferCard({
  offer,
  expiresLabel,
  viewLabel,
  locale,
  highlighted = false,
}: {
  offer: Offer;
  expiresLabel: string;
  viewLabel: string;
  locale: string;
  highlighted?: boolean;
}) {
  const endLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(offer.endDate));
    } catch {
      return offer.endDate;
    }
  }, [offer.endDate, locale]);

  const cta = offer.buttonText?.trim() || viewLabel;
  const href = offer.buttonLink?.trim() || "";

  if (highlighted) {
    return (
      <article className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-dolce-secondary/60 dark:bg-[#241912] dark:ring-white/10">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[220px] bg-dolce-secondary dark:bg-[#2e2018] md:min-h-[280px]">
            {offer.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center font-playfair text-3xl text-dolce-primary/40 md:min-h-[280px]">
                Dolce
              </div>
            )}
            {offer.discountLabel && (
              <span className="absolute left-4 top-4 rounded-full bg-[#ff9e8d] px-3 py-1 text-sm font-bold text-white shadow">
                {offer.discountLabel}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-dolce-primary dark:text-dolce-accent">
              <Sparkles size={14} />
              Dolce
            </p>
            <h3 className="font-playfair text-3xl font-semibold text-dolce-text dark:text-[#f5e6d3]">
              {offer.title}
            </h3>
            {offer.description && (
              <p className="mt-3 text-sm leading-relaxed text-dolce-text/70 dark:text-white/60">
                {offer.description}
              </p>
            )}
            <p className="mt-4 text-xs text-dolce-text/50 dark:text-white/40">
              {expiresLabel}: {endLabel}
            </p>
            {(href || offer.buttonText) && (
              <div className="mt-6">
                <OfferAction
                  href={href || undefined}
                  label={cta}
                  className="btn-primary text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  const cardInner = (
    <>
      <div className="relative aspect-[4/3] bg-dolce-secondary dark:bg-[#2e2018]">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-playfair text-2xl text-dolce-primary/40">
            Dolce
          </div>
        )}
        {offer.discountLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-[#ff9e8d] px-2.5 py-1 text-xs font-bold text-white shadow">
            {offer.discountLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-playfair text-xl font-semibold text-dolce-text dark:text-[#f5e6d3]">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="mt-2 line-clamp-2 text-sm text-dolce-text/65 dark:text-white/55">
            {offer.description}
          </p>
        )}
        <p className="mt-auto pt-3 text-[11px] text-dolce-text/45 dark:text-white/35">
          {expiresLabel}: {endLabel}
        </p>
        {(href || offer.buttonText) && (
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-dolce-primary dark:text-dolce-accent">
            {cta}
            <ArrowRight size={14} />
          </span>
        )}
      </div>
    </>
  );

  const shellClass =
    "group flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-dolce-secondary/50 transition hover:shadow-md dark:bg-[#241912] dark:ring-white/10 sm:w-[300px]";

  if (href) {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={shellClass}
        >
          {cardInner}
        </a>
      );
    }
    return (
      <Link href={href as "/"} className={shellClass}>
        {cardInner}
      </Link>
    );
  }

  return <article className={shellClass}>{cardInner}</article>;
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
    <section className="bg-dolce-bg py-14 dark:bg-[#1a120e]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dolce-primary dark:text-dolce-accent">
            Dolce
          </p>
          <h2 className="section-title mt-2">{t("title")}</h2>
          <p className="mt-2 max-w-xl text-sm text-dolce-text/65 dark:text-white/55">
            {t("subtitle")}
          </p>
        </div>

        {highlighted.length > 0 && (
          <div className="mb-8 space-y-6">
            {highlighted.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                highlighted
                expiresLabel={t("expires")}
                viewLabel={t("viewOffer")}
                locale={locale}
              />
            ))}
          </div>
        )}

        {regular.length > 0 && (
          <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
            <div className="flex gap-4">
              {regular.map((offer) => (
                <OfferCard
                  key={offer._id}
                  offer={offer}
                  expiresLabel={t("expires")}
                  viewLabel={t("viewOffer")}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
