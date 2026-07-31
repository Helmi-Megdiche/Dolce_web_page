import {
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSettings, getHours } from "@/lib/data";
import { whatsappHref } from "@/lib/whatsappLink";
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/SocialIcons";

export const dynamic = "force-dynamic";

const DAY_KEYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export default async function AboutPage() {
  const [settings, hours, t, tc] = await Promise.all([
    getSettings(),
    getHours(),
    getTranslations("about"),
    getTranslations("common"),
  ]);

  const phone = settings.phone || "42 386 082";
  const address = settings.address || "V5HH+4FX, Ariana, Tunisia";
  const wa = whatsappHref(settings.whatsapp_url, phone);
  const mapsQuery = encodeURIComponent(address);
  const mapsEmbed = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  const mapsOpen = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  const todayKey = DAY_KEYS[new Date().getDay()];

  const socials = [
    {
      href: settings.instagram_url,
      label: "Instagram",
      Icon: InstagramIcon,
    },
    {
      href: settings.tiktok_url,
      label: "TikTok",
      Icon: TikTokIcon,
    },
    {
      href: settings.facebook_url,
      label: "Facebook",
      Icon: FacebookIcon,
    },
    {
      href: wa,
      label: "WhatsApp",
      Icon: WhatsAppIcon,
      accent: true,
    },
  ].filter((s) => Boolean(s.href));

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-dolce-brand/15 blur-3xl dark:bg-dolce-brand/10" />
      <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-dolce-accent/20 blur-3xl dark:bg-dolce-accent/10" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10 text-center md:mb-14">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-dolce-accent/40 bg-white/70 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-dolce-primary backdrop-blur-sm dark:border-dolce-accent/25 dark:bg-white/5 dark:text-dolce-accent">
            <MapPin size={13} className="shrink-0" />
            {t("eyebrow")}
          </p>
          <h1 className="section-title mt-4">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-dolce-text/65 dark:text-white/55 md:text-base">
            {t("subtitle")}
          </p>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-dolce-accent to-transparent" />
        </div>

        {/* Quick contact actions — primary UX */}
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <a
            href={telHref}
            className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-dolce-secondary/60 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-dolce-accent/50 dark:bg-[#241912] dark:ring-white/10"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dolce-primary/10 text-dolce-primary transition group-hover:bg-dolce-primary group-hover:text-white dark:bg-dolce-accent/15 dark:text-dolce-accent dark:group-hover:bg-dolce-accent dark:group-hover:text-dolce-text">
              <Phone size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-wide text-dolce-text/45 dark:text-white/40">
                {t("callUs")}
              </span>
              <span className="block truncate font-medium text-dolce-text dark:text-[#f5e6d3]">
                {phone}
              </span>
            </span>
          </a>

          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl bg-[#25D366]/10 p-4 shadow-sm ring-1 ring-[#25D366]/35 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-[#25D366]/60 dark:bg-[#25D366]/15 dark:ring-[#25D366]/30"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm shadow-[#25D366]/40">
                <WhatsAppIcon size={22} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#128C7E] dark:text-[#6ef0a8]">
                  {t("whatsapp")}
                </span>
                <span className="block truncate font-medium text-dolce-text dark:text-[#f5e6d3]">
                  {t("whatsappHint")}
                </span>
              </span>
            </a>
          )}

          <a
            href={mapsOpen}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-dolce-secondary/60 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-dolce-accent/50 dark:bg-[#241912] dark:ring-white/10"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dolce-accent/20 text-dolce-primary transition group-hover:bg-dolce-accent group-hover:text-dolce-text dark:text-dolce-accent">
              <Navigation size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-wide text-dolce-text/45 dark:text-white/40">
                {t("directions")}
              </span>
              <span className="block truncate font-medium text-dolce-text dark:text-[#f5e6d3]">
                {t("openMaps")}
              </span>
            </span>
          </a>
        </div>

        {/* Map + Hours */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-dolce-secondary/50 dark:bg-[#241912] dark:ring-white/10 lg:col-span-3">
            <div className="flex items-start justify-between gap-3 border-b border-dolce-secondary/50 px-5 py-4 dark:border-white/10">
              <div className="min-w-0">
                <h2 className="font-playfair text-xl font-semibold text-dolce-text dark:text-[#f5e6d3]">
                  {t("findUs")}
                </h2>
                <p className="mt-1 flex items-start gap-2 text-sm text-dolce-text/65 dark:text-white/55">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0 text-dolce-primary dark:text-dolce-accent"
                  />
                  <span>{address}</span>
                </p>
              </div>
              <a
                href={mapsOpen}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-dolce-secondary/70 px-3 py-1.5 text-xs font-semibold text-dolce-primary transition hover:bg-dolce-accent/40 dark:bg-white/10 dark:text-dolce-accent dark:hover:bg-white/15"
              >
                {t("openMaps")}
                <ExternalLink size={12} />
              </a>
            </div>
            <iframe
              title="Dolce location map"
              src={mapsEmbed}
              className="h-[320px] w-full border-0 md:h-[400px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-dolce-secondary/50 dark:bg-[#241912] dark:ring-white/10 lg:col-span-2 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dolce-accent/20 text-dolce-primary dark:text-dolce-accent">
                <Clock size={18} />
              </span>
              <h2 className="font-playfair text-xl font-semibold text-dolce-text dark:text-[#f5e6d3]">
                {t("hours")}
              </h2>
            </div>

            <ul className="space-y-1">
              {hours.map(
                (h: {
                  day: string;
                  openTime: string;
                  closeTime: string;
                  isClosed: boolean;
                }) => {
                  const isToday = h.day === todayKey;
                  return (
                    <li
                      key={h.day}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                        isToday
                          ? "bg-dolce-accent/20 font-semibold text-dolce-text dark:bg-dolce-accent/15 dark:text-[#f5e6d3]"
                          : "text-dolce-text/80 dark:text-white/70"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {t(
                          `days.${h.day}` as
                            | "days.Monday"
                            | "days.Tuesday"
                            | "days.Wednesday"
                            | "days.Thursday"
                            | "days.Friday"
                            | "days.Saturday"
                            | "days.Sunday"
                        )}
                        {isToday && (
                          <span className="rounded-full bg-dolce-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-dolce-accent dark:text-dolce-text">
                            {t("today")}
                          </span>
                        )}
                      </span>
                      <span
                        className={
                          h.isClosed
                            ? "text-dolce-brand"
                            : isToday
                              ? "text-dolce-primary dark:text-dolce-accent"
                              : "text-dolce-text/55 dark:text-white/45"
                        }
                      >
                        {h.isClosed
                          ? tc("closed")
                          : `${h.openTime} – ${h.closeTime}`}
                      </span>
                    </li>
                  );
                }
              )}
            </ul>
          </div>
        </div>

        {/* Follow us + Glovo */}
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-dolce-secondary/50 backdrop-blur-sm dark:bg-[#241912]/80 dark:ring-white/10 md:p-6">
            <h2 className="font-playfair text-xl font-semibold text-dolce-text dark:text-[#f5e6d3]">
              {t("social")}
            </h2>
            <p className="mt-1 text-sm text-dolce-text/55 dark:text-white/45">
              {tc("followUs")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map(({ href, label, Icon, accent }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 ${
                    accent
                      ? "bg-[#25D366] text-white shadow-sm shadow-[#25D366]/30 hover:bg-[#1ebe57]"
                      : "bg-dolce-secondary text-dolce-text hover:bg-dolce-accent/40 dark:bg-white/10 dark:text-[#f5e6d3] dark:hover:bg-white/15"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {settings.glovo_url && (
            <a
              href={settings.glovo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary justify-center md:min-w-[200px]"
            >
              {t("orderGlovo")}
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
