"use client";

import { MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/SocialIcons";
import Logo from "@/components/ui/Logo";
import { whatsappHref } from "@/lib/whatsappLink";

interface FooterProps {
  phone?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
}

export default function Footer({
  phone = "42 386 082",
  address = "V5HH+4FX, Ariana, Tunisia",
  instagram,
  facebook,
  tiktok,
  whatsapp,
}: FooterProps) {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const wa = whatsappHref(whatsapp, phone);

  const socials = [
    { href: instagram, label: "Instagram", Icon: InstagramIcon },
    { href: tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: facebook, label: "Facebook", Icon: FacebookIcon },
    { href: wa, label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="mt-auto border-t border-dolce-secondary bg-dolce-text text-dolce-secondary dark:border-white/10 dark:bg-[#120c09]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo size="sm" href="/" />
          <p className="mt-3 text-sm opacity-80">{t("tagline")}</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            {address}
          </p>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 transition hover:text-white"
          >
            <Phone size={16} />
            {phone}
          </a>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition hover:text-white"
            >
              <WhatsAppIcon size={16} />
              WhatsApp
            </a>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white">{tc("followUs")}</p>
          <div className="flex flex-wrap gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 hover:text-white"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <Link
            href="/admin/login"
            className="mt-2 text-xs opacity-40 transition hover:opacity-70"
          >
            {tc("admin")}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} {t("rights")}
      </div>
    </footer>
  );
}
